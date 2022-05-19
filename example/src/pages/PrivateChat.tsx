import React, {useRef, useState, useEffect} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {ImageBackground, StyleSheet, EmitterSubscription} from 'react-native';
import {KeyboardAvoidingView, Keyboard} from 'react-native';
import {ImSdk, V2TIMMessage} from '@byron-react-native/tencent-im';
import {ImSdkEventType} from '@byron-react-native/tencent-im';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import RefreshFlatList from '../components/RefreshFlat';
import InputTools from '../components/InputTools';
import {Header} from '../components/Header';
import {to} from '../utils';
import {PrivateMessage} from '../components/Message';
import {launchImageLibrary} from 'react-native-image-picker';

type Params = {
  groupID: string;
  userID: string;
  nickName: string;
};
type Routes = {
  Home: Params;
  Group: Params;
  Private: Params;
};

function PrivateChat() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<V2TIMMessage[]>([]);
  const route = useRoute<RouteProp<Routes, 'Private'>>();
  const navigation = useNavigation<NavigationProp<Routes>>();
  const subscription = useRef<EmitterSubscription>();
  const listRef = useRef(list);

  useEffect(() => {
    listRef.current = list;
  });

  const onBlur = () => {
    subscription.current?.remove();
    console.log(' >> PrivateChat onBlur', route.params);
  };

  const onFocus = () => {
    setLoading(true);
    fetchList(true).then(() => {
      ImSdk.markC2CMessageAsRead(route.params.userID);
    });
    subscription.current = ImSdk.addListener(
      ImSdkEventType.NewMessage,
      (data: V2TIMMessage) => {
        console.log(' >> NewMessage', data);
        setList([data].concat(listRef.current));
      },
    );

    console.log(' >> PrivateChat onFocus', route.params);
  };

  const fetchList = async (isFirst = false) => {
    const [err, res] = await to(
      ImSdk.getC2CHistoryMessageList(route.params.userID, 10, isFirst),
    );
    if (err) console.log(' >> fetchList err', err);
    console.log(' >> getC2CHistoryMessageList', res);
    setLoading(false);
    if (!res) return;
    if (isFirst) {
      setList(res);
    } else {
      setList(list.concat(res));
    }
  };

  useEffect(() => {
    const sub_blur = navigation.addListener('blur', onBlur);
    const sub_focus = navigation.addListener('focus', onFocus);
    return () => {
      sub_blur();
      sub_focus();
    };
  }, [navigation]);

  const renderItem = ({item}: {item: V2TIMMessage}) => {
    return <PrivateMessage {...item} key={item.msgID} />;
  };

  const onPic = async () => {
    const res = await launchImageLibrary({mediaType: 'photo'});
    if (!res.assets) return;
    for (let image of res.assets) {
      if (!image.uri) {
        continue;
      }
      console.log(' >> image.uri', image.uri);
      console.log(' >> image.uri.split', image.uri.split('file://')[1]);
      const [err, res] = await to(
        ImSdk.sendImageMessage(route.params.userID, image.uri.split('file://')[1]),
      );
      if (err) console.log(' >> sendImageMessage', err);
      if (!res) return;
      setList([res].concat(listRef.current));
    }
  };

  const onTalk = () => {};

  const onSend = async (val: string) => {
    if (val === '123') {
      const [err, res] = await to(
        ImSdk.sendC2CCustomMessage(route.params.userID, {
          abc: '123',
        }),
      );
      if (err) console.log(' >> sendC2CTextMessage', err);
      Keyboard.dismiss();
      if (!res) return;
      setList([res].concat(listRef.current));
      return;
    }
    const [err, res] = await to(
      ImSdk.sendC2CTextMessage(val, route.params.userID),
    );
    if (err) console.log(' >> sendC2CTextMessage', err);
    Keyboard.dismiss();
    if (!res) return;
    setList([res].concat(listRef.current));
  };

  const onFooter = async () => {
    await fetchList();
  };

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
      <ImageBackground style={{flex: 1}} source={require('./images/bg1.png')}>
        <Header title={route.params.nickName} />
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size={'large'} color={'#fff'} />
          </View>
        ) : !list.length ? (
          <View style={styles.loading}>
            <Text style={{color: '#fff'}}>暂无数据</Text>
          </View>
        ) : (
          <RefreshFlatList
            data={list}
            style={{flex: 1}}
            inverted={true}
            renderItem={renderItem}
            onFooter={onFooter}
          />
        )}
        <InputTools onPic={onPic} onTalk={onTalk} onSend={onSend} />
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PrivateChat;
