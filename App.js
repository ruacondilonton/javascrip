/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
    WebView,
  View
} from 'react-native';
// const gameHTML = require('./game/khunglong/index.html');
const gameHTML = require('./game/tank1990/index.html');


export default class App extends Component<{}> {
  render() {
    return (
        <WebView
            source={gameHTML}
            style={{flex: 1}}
            bounces={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
        />
    );
  }
}


