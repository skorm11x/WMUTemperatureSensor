import React, { Fragment, Component } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Image,
  Dimensions,
  ActivityIndicator
} from "react-native";

import { Footer, FooterTab } from "native-base";
import { LineChart } from "react-native-svg-charts";

import {
  VictoryBar,
  VictoryTheme,
  VictoryChart,
  VictoryLine
} from "victory-native";

import { BleManager, ScanMode } from "react-native-ble-plx";
import { getDecFrom64 } from "./assets/utility/DecFrom64";
import { objectTypeSpreadProperty } from "@babel/types";

let DegreeComponent = require("./components/DegreeComponent");

const adcCelciusScalar = 0.0078125;
const safeSenseServiceID = "0000fff6-0000-1000-8000-00805f9b34fb";
let ScanOptions = { scanMode: ScanMode.LowLatency };

let deviceList = new Map(); //holder for all device

//Create graph component to be added into Main Component

class BLEDevice extends Component {
  constructor(device) {
    this.state = {
      name: device.name,
    };
  }
}

export default class Main extends Component {
  constructor() {
    super();
    //change state variable to seperate scanned device result and device features
    this.state = {
      permissionState: false,
      bluetoothState: "",
      orientation: "",
      deviceLIST: [],
      device: {
        name: null,
        id: null,
        rssi: null,
        adcValue: null,
        decimalVal: null,
        celciusVal: null,
        farenheitVal: null,
      }
    };
    this.manager = new BleManager();
    this.requestPermissions();
  }

  async requestPermissions() {
    try {
      const coarseGrant = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: "Bluetooth Low Energy Permissions",
          message:
            "WMUTemperatureBeacon needs access to your" +
            "coarse location in order to use Bluetooth Low Energy. " +
            "This app will not work without this permission.",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
          // eslint-disable-next-line no-undef
        }
      );

      if (coarseGrant === PermissionsAndroid.RESULTS.GRANTED) {
        this.state.permissionState = true;
        //console.log("BLE coarse location permission granted.");
      } else {
        //console.log("BLE coarse location permissions denied.");
      }
    } catch (error) {
      console.warn(error);
    }
  }

  componentDidMount() {
    this.getOrientation();
    this.manager.enable();
    Dimensions.addEventListener("change", () => {
      this.getOrientation();
    });
    //requestPermissions();
    const subscription = this.manager.onStateChange(state => {
      if (state === "PoweredOn") {
        this.scanObserverValues();
      }
      if (state === "PoweredOff") {
      }
    }, true);
  }

  getOrientation = () => {
    if (this.refs.rootView) {
      if (Dimensions.get("window").width < Dimensions.get("window").height) {
        this.setState({ orientation: "portrait" });
      } else {
        this.setState({ orientation: "landscape" });
      }
    }
  };

  logMapElements(value, key, map) {
    console.log(key + value.name);
  }

  scanObserverValues() {
    this.manager.startDeviceScan(
      [safeSenseServiceID],
      ScanOptions,
      //This function is called for EVERY scanned device!
      (error, device) => {
        if (error) {
          console.log(error.message);
          return;
        }

        //TODO: update program so we can handle multiple device instances/ graph multiple etc.

        try {
          //add device to the device map with id as key, device object as value

          //console.log(device.id); //look at MAC
          let rawData = device.manufacturerData;
          //console.log(rawData);
          //get hex (ascii) values for each character
          //tx packet always only care about first 3 chars ignore = on x64
          let decOne = getDecFrom64(device.manufacturerData.charCodeAt(0));
          let decTwo = getDecFrom64(device.manufacturerData.charCodeAt(1));
          let decThree = getDecFrom64(device.manufacturerData.charCodeAt(2));

          let decVal = [decOne * 262144 + decTwo * 4096 + decThree * 64] / 256;
          let celValRaw = decVal * adcCelciusScalar;
          let celVal = celValRaw.toFixed(2);
          let farValRaw = celVal * 1.8 + 32;
          let farVal = farValRaw.toFixed(2);

          if (!deviceList.has(device.id)) {
            deviceList.set(device.id, device);
            this.setState({
              deviceLIST: this.state.deviceLIST.concat([
                {
                  name: device.name,
                  id: device.id,
                  rssi: device.rssi,
                  adcValue: rawData,
                  celciusVal: celVal,
                  farenheitVal: farVal
                },
              ])
            });
          }

          if (deviceList.has(device.id)) {
            for (var i = 0; i < this.state.deviceLIST.length; i++) {
              if (this.state.deviceLIST[i].id === device.id) {
                this.state.deviceLIST[i] = {
                  name: device.name,
                  id: device.id,
                  rssi: device.rssi,
                  adcValue: rawData,
                  celciusVal: celVal,
                  farenheitVal: farVal
                };
              }
            }
          }

          this.setState({
            device: {
              name: device.name,
              id: device.id,
              rssi: device.rssi,
              adcValue: rawData,
              celciusVal: celVal,
              farenheitVal: farVal,
            }
          });
        } catch (error) {
          console.log(error.message);
        }
      }
    );
  }

  //TODO: seperate render part so can render multiple devices
  render() {
    const { device, deviceLIST, permissionState } = this.state;

    let chartHeight;

    if (this.state.orientation === "portrait") {
      chartHeight = Dimensions.get("window").height / 2;
    }
    if (this.state.orientation === "landscape") {
      chartHeight = 300;
    }

    let deviceList = this.state.deviceLIST.map((device, i) => {
      return (
        // <Text key={i}>
        //   {device.name} , {device.celciusVal}
        // </Text>
        <View style={styles.body} key={i}>
          <View style={styles.headerRow}>
            <View style={styles.rowItemBold}>
              <Text style={{ fontWeight: "700" }}>Device Name</Text>
            </View>
            <View style={styles.rowItemBold}>
              <DegreeComponent
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  marginTop: 0,
                }}
              />
              <Text style={{ fontWeight: "700" }}>C</Text>
            </View>
            <View style={styles.rowItemBold}>
              <DegreeComponent
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  marginTop: 0,
                }}
              />
              <Text style={{ fontWeight: "700" }}>F</Text>
            </View>
          </View>
          <View style={styles.row} key={i}>
            <View style={styles.rowItem}>
              <Text key={i}>{device.name}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text key={i}>{device.celciusVal}</Text>
              <DegreeComponent
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  marginTop: 0,
                }}
              />
              <Text>C</Text>
            </View>
            <View style={styles.rowItem}>
              <Text key={i}>{device.farenheitVal}</Text>
              <DegreeComponent
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  marginTop: 0,
                }}
              />
              <Text>F</Text>
            </View>
          </View>
          <View style={styles.chartContainer} pointerEvents="none">
            <VictoryChart
              height={chartHeight}
              width={Dimensions.get("window").width * 0.9}
              domain={{ y: [10.0, 40.0] }}
              theme={VictoryTheme.material}
            >
              <VictoryBar
                barRatio={1.0}
                barWidth={150}
                style={{ data: { fill: "#4FC1E9" } }}
                alignment="middle"
                data={[
                  {
                    x: device.name,
                    y: Number(device.celciusVal),
                  },
                ]}
                labels={d => `${d.y}°C`}
              />
            </VictoryChart>
          </View>
        </View>
      );
    });

    if (deviceList.length > 0) {
      return (
        <Fragment>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}
          >
            <View style={styles.logos}>
              <Image
                source={require("./assets/resources/images/Western_Michigan_University_wordmark.svg__300x100.png")}
                style={styles.image}
              />
              <Image
                source={require("./assets/resources/images/SafeSense_Technologies_Logo_300x100.jpg")}
                style={styles.image}
              />
            </View>
            {deviceList}
            <Footer>
              <FooterTab style={styles.footer}>
                <Text>Copyright ©2019 SafeSense LLC.</Text>
              </FooterTab>
            </Footer>
          </ScrollView>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}
        >
          <View style={styles.logos}>
            <Image
              source={require("./assets/resources/images/Western_Michigan_University_wordmark.svg__300x100.png")}
              style={styles.image}
            />
            <Image
              source={require("./assets/resources/images/SafeSense_Technologies_Logo_300x100.jpg")}
              style={styles.image}
            />
          </View>
          <View style={styles.body}>
            <Text style={{ alignSelf: "center" }}>
              Searching for devices...
            </Text>
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={{ alignSelf: "center", marginTop: 50 }}
            />
          </View>
          <Footer>
            <FooterTab style={styles.footer}>
              <Text>Copyright ©2019 SafeSense LLC.</Text>
            </FooterTab>
          </Footer>
        </ScrollView>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: "#FFFFFF",
  },
  // engine: {
  //   position: 'absolute',
  //   right: 0,
  // },
  body: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "flex-start",
    flexDirection: "column",
    height: "90%",
  },
  logos: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "flex-start",
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  image: {
    flex: 1,
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  item: {
    flexDirection: "column",
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  label: {
    color: "#CBCBCB",
    flex: 1,
    fontSize: 12,
    position: "relative",
    top: 2,
  },
  bar: {
    alignSelf: "center",
    borderRadius: 5,
    height: 8,
    marginRight: 5,
  },
  celcius: {
    backgroundColor: "#F55443",
  },
  chartContainer: {
    flexDirection: "column",
    marginTop: 0,
    alignItems: "center",
  },
  data: {
    flex: 2,
    flexDirection: "row",
  },
  dataNumber: {
    color: "#CBCBCB",
    fontSize: 20,
  },
  // sectionContainer: {
  //   marginTop: 32,
  //   paddingHorizontal: 24,
  // },
  // sectionTitle: {
  //   fontSize: 24,
  //   fontWeight: '600',
  //   color: Colors.black,
  // },
  // sectionDescription: {
  //   marginTop: 8,
  //   fontSize: 18,
  //   fontWeight: '400',
  //   color: Colors.dark,
  // },
  highlight: {
    fontWeight: "700",
  },
  // footer: {
  //   color: Colors.dark,
  //   fontSize: 12,
  //   fontWeight: '600',
  //   padding: 4,
  //   paddingRight: 12,
  //   textAlign: 'right',
  // },
  headerRow: {
    flexDirection: "row",
    marginVertical: 10,
    paddingBottom: 10,
    paddingRight: 15,
    paddingLeft: 15,
    marginBottom: 5,
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 10,
  },
  row: {
    flexDirection: "row",
    marginVertical: 5,
    paddingBottom: 5,
    paddingRight: 15,
    paddingLeft: 15,
    marginBottom: 5,
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 100,
  },
  rowItem: {
    padding: 1,
    width: "33%",
    flexDirection: "row",
  },
  rowItemBold: {
    padding: 1,
    width: "33%",
    flexDirection: "row",
  },
  footerTab: {
    height: 50,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  footer: {
    backgroundColor: "#ACF7F7",
    height: 50,
    width: "100%",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
  },
});

// export default Main;
