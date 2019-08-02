"use strict";

// eslint-disable-next-line prettier/prettier
// var React = require('react-native');

// var { View, StyleSheet } = React;
import React, {Component} from "react";
import { View, StyleSheet } from "react-native";

class DegreeComponent extends React.Component {
  render() {
    return <View style={[styles.degree, this.props.style]} />;
  }
};

var styles = StyleSheet.create({
  degree: {
    borderColor: "black",
    backgroundColor: "transparent",
    borderWidth: 1
  }
});

module.exports = DegreeComponent;