/**
 * Sample React Native App
 *
 * adapted from App.js generated by the following command:
 *
 * react-native init example
 *
 * https://github.com/facebook/react-native
 */

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {ImSdk, ImSdkEventType} from '@byron-react-native/tencent-im';
import GroupChat from './src/pages/GroupChat';
import PrivateChat from './src/pages/PrivateChat';
import {EmitterSubscription} from 'react-native';
import {login_im_sdk, to} from './src/utils';

const Tab = createBottomTabNavigator();

const subs = [
  ImSdkEventType.Connecting,
  ImSdkEventType.ConnectFailed,
  ImSdkEventType.ConnectSuccess,
  ImSdkEventType.KickedOffline,
  ImSdkEventType.UserSigExpired,
  ImSdkEventType.SelfInfoUpdated,

  ImSdkEventType.NewMessage,
  ImSdkEventType.ConversationChanged,
  ImSdkEventType.NewConversation,
];

function App() {
  useEffect(() => {
    ImSdk.initSDK(1400665794);

    const emitters: Record<string, EmitterSubscription> = {};

    for (let sub of subs) {
      emitters[sub] = ImSdk.addListener(sub, async () => {
        console.log(' >> ', sub);
        if (
          sub === ImSdkEventType.ConnectSuccess ||
          sub === ImSdkEventType.UserSigExpired
        ) {
          const res = await login_im_sdk();
          if (res && res.id && res.sig) {
            const [err1] = await to(ImSdk.login(`${res.id}`, res.sig));
            if (err1) console.log(' >> ', sub, err1);
            const [err2] = await to(ImSdk.joinGroup(res.group_id, 'Hello'));
            if (err2) console.log(' >> ', sub, err2);
          }
        }
      });
    }

    return () => {
      for (let sub of subs) {
        emitters[sub].remove();
      }
    };
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Group" component={GroupChat} />
        <Tab.Screen name="Private" component={PrivateChat} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
