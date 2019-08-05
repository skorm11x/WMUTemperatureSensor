import React, { Fragment, Component } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Image
} from "react-native";

import Modal from "react-native-modal";
import RNRestart from "react-native-restart";
import { LineChart } from "react-native-svg-charts";

import { BleManager, ScanMode } from "react-native-ble-plx";
import { BluetoothStatus } from "react-native-bluetooth-status";
import { getDecFrom64 } from "./assets/utility/DecFrom64";

let DegreeComponent = require("./components/DegreeComponent");

const adcCelciusScalar = 0.0078125;
const tiServiceID = "0000fff0-0000-1000-8000-00805f9b34fb";
let ScanOptions = { scanMode: ScanMode.LowLatency };

//Create graph component to be added into Main Component

export default class Main extends Component {
  constructor() {
    super();
    this.state = {
      permissionState: false,
      bluetoothState: "",
      adcValue: null,
      decimalVal: null,
      celciusVal: null,
      farenheitVal: null,
      device: null
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
          buttonPositive: "OK"
          // eslint-disable-next-line no-undef
        }
      );

      // const bleGrant = await PermissionsAndroid.request(
      //   PermissionsAndroid.PERMISSIONS.BLUETOOTH,
      //   {
      //     title: "Bluetooth Low Energy Permissions",
      //     message:
      //       "WMUTemperatureBeacon needs Bluetooth permissions",
      //     buttonNegative: "Cancel",
      //     buttonPositive: "OK",
      //   }
      // );

      if (coarseGrant === PermissionsAndroid.RESULTS.GRANTED) {
        this.state.permissionState = true;
        console.log("BLE coarse location permission granted.");
      } else {
        console.log("BLE coarse location permissions denied.");
      }
    } catch (error) {
      console.warn(error);
    }
  }

  componentDidMount() {
    //console.log("mounted!");
    //console.log(this.state.permissionState);
    this.manager.enable();
    console.log("manager enabled");
    //requestPermissions();
    const subscription = this.manager.onStateChange(state => {
      if (state === "PoweredOn") {
        this.scanObserverValues();
        //subscription.remove();
      }
      if (state === "PoweredOff") {
      }
      //this.scanObserverValues();
    }, true);
  }

  async checkInitialBluetoothState() {
    const isEnabled = await BluetoothStatus.state();
    this.setState({ bluetoothState: isEnabled ? "On" : "Off" });
  }

  async toggleBluetooth() {
    try {
      const isEnabled = await BluetoothStatus.state();
      BluetoothStatus.enable(!isEnabled);
      this.setState({ bluetoothState: isEnabled ? "Off" : "On" });
    } catch (error) {
      console.error(error);
    }
  }

  scanObserverValues() {
    //start device scan
    //@params = (UUIDs, options, listener)
    //listener function (error, device) obtain device as second param

    //pass in options to increase scan rate/ lower latency = increased device power
    this.manager.startDeviceScan(
      [tiServiceID],
      ScanOptions,
      (error, device) => {
        if (error) {
          console.log(error.message);
          return;
        }
        /*
        SW filter implementation: unique field chosen = MAC

        process: initially no MAC is stored/ configured and no data will show up..
        User clicks some button to scan and reveal all devices in vicinity that are 
        broadcast and select (via checkbox) which MAC's we want to save for display
        of values (manufacture data)

        **Also allow feature that allows user to display all raw tx data or
        potentially pick a different field to track (manufacture data, characterisitcs)
        etc.
      */
        try {
          this.setState({ deviceName: device.name });
          console.log(Date.now());

          console.log(device.id); //look at MAC
          let rawData = device.manufacturerData;
          console.log(rawData);
          //get hex (ascii) values for each character
          //tx packet always only care about first 3 chars ignore = on x64
          let decOne = getDecFrom64(device.manufacturerData.charCodeAt(0));
          let decTwo = getDecFrom64(device.manufacturerData.charCodeAt(1));
          let decThree = getDecFrom64(device.manufacturerData.charCodeAt(2));

          let decVal = [decOne * 262144 + decTwo * 4096 + decThree * 64] / 256;
          //let decVal = [819456/256];
          console.log(decVal);

          /*where 3200 = 25.00 deg celcius
          resolution is 00.0078125 per decimal increase but for display purposes
          we will round up or down to only display up to 100th degree accuracy
          */
          let celValRaw = decVal * adcCelciusScalar;
          let celVal = celValRaw.toFixed(2);
          let farValRaw = celVal * 1.8 + 32;
          let farVal = farValRaw.toFixed(2);

          this.setState({ adcValue: rawData });
          this.setState({ celciusVal: celVal });
          this.setState({ farenheitVal: farVal });
          //take the base x64 string and convert into decimal then far/cel
          // eslint-disable-next-line no-catch-shadow
        } catch (error) {
          console.log(error.message);
        }
      }
    );
  }

  //TODO: seperate render part so can render multiple devices
  render() {
    const {
      deviceName,
      adcValue,
      celciusVal,
      farenheitVal,
      permissionState
    } = this.state;
    if (adcValue != null) {
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
                      marginTop: 0
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
                      marginTop: 0
                    }}
                  />
                  <Text style={{ fontWeight: "700" }}>F</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <Text>{deviceName}</Text>
                </View>
                <View style={styles.rowItem}>
                  <Text>{celciusVal}</Text>
                  <DegreeComponent
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      marginTop: 0
                    }}
                  />
                  <Text>C</Text>
                </View>
                <View style={styles.rowItem}>
                  <Text>{farenheitVal}</Text>
                  <DegreeComponent
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      marginTop: 0
                    }}
                  />
                  <Text>F</Text>
                </View>
              </View>
              {/* <View>
              <Text>YOLO</Text>
                <LineChart
                  style={{
                    flex: 1,
                    alignSelf: "stretch",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.5)",
                    margin: 10
                  }}
                  data={ adcValue }
                  svg={{
                    strokeWidth: 2,
                    stroke: "#000000"
                  }}
                  animate
                />
              </View> */}
            </View>
          </ScrollView>
        </Fragment>
      );
    }
    return (
      //No saved MAC detected, allow user to select from list of advertising devices
      //which data to display etc.
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
          <Text>Searching for devices...</Text>
        </ScrollView>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: "#FFFFFF"
  },
  // engine: {
  //   position: 'absolute',
  //   right: 0,
  // },
  body: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "flex-start",
    flexDirection: "column"
  },
  logos: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "flex-start",
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#000000"
  },
  image: {
    flex: 1,
    width: 50,
    height: 50,
    resizeMode: "contain"
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
    fontWeight: "700"
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
    alignItems: "center"
  },
  row: {
    flexDirection: "row",
    marginVertical: 10,
    paddingBottom: 10,
    paddingRight: 15,
    paddingLeft: 15,
    marginBottom: 5,
    justifyContent: "space-between",
    alignItems: "center"
  },
  rowItem: {
    padding: 1,
    width: "33%",
    flexDirection: "row"
  },
  rowItemBold: {
    padding: 1,
    width: "33%",
    flexDirection: "row"
  }
});

// export default Main;
