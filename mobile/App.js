/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import RNFS from "react-native-fs";
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';

//const { startExpressServer } = require('./server/app');
const ClientHtml = Platform.OS === 'ios'
    ? ""//require('../../build/index.html')
    : { uri: 'file:///android_asset/build/index.html' };

/*RNFS.readFileAssets('custom/index.html').then((res) => {
    console.log('read file res: ', res);
})*/

const App = () => {

    const [server, setServer] = React.useState();

    React.useEffect(() => {
        /*const _server = startExpressServer({ useAnotherPort: true, port: 7001 }, (options) => {
            console.log(`view more middleware running on port ${options.port}`);
            createWindow(options.url);
        });
        setServer(_server);*/
    });

    return (
        <SafeAreaView style={{ backgroundColor: "black", height: "100%" }}>
            <StatusBar barStyle={'light-content'} backgroundColor={"black"} />
            <WebView injectedJavaScript={debugging} onMessage={onWebViewMessage}
                style={{ backgroundColor: 'white' }} source={ClientHtml} />
        </SafeAreaView>
    );

    function onWebViewMessage(payload) {
        //console.log("FROM WEBVIEW", payload);
    }
};

const debugging = `
  const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
  console = {
      log: (log) => consoleLog('log', log),
      debug: (log) => consoleLog('debug', log),
      info: (log) => consoleLog('info', log),
      warn: (log) => consoleLog('warn', log),
      error: (log) => consoleLog('error', log),
    };
    console.log(document.documentElement.innerHTML);
`;

export default App;
