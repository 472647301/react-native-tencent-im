/**
 * @format
 */
import App from './App';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import {ImSdk} from '@byron-react-native/tencent-im';

ImSdk.initSDK(1400665794);

AppRegistry.registerComponent(appName, () => App);
