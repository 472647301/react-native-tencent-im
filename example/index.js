/**
 * @format
 */
import App from './App';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import {ImSdk, V2TIMLogLevel} from '@byron-react-native/tencent-im';

ImSdk.initSDK(1400665794, V2TIMLogLevel.V2TIM_LOG_DEBUG);

AppRegistry.registerComponent(appName, () => App);
