import React, {useRef, useState, useEffect} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {ImageBackground, StyleSheet, EmitterSubscription} from 'react-native';
import {TouchableWithoutFeedback, Keyboard} from 'react-native';
import {KeyboardAvoidingView} from 'react-native';
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
  const subNewMessage = useRef<EmitterSubscription>();
  const subConversation = useRef<EmitterSubscription>();

  const onBlur = () => {
    subNewMessage.current?.remove();
    subConversation.current?.remove();
    console.log(' >> PrivateChat onBlur', route.params);
  };

  const onFocus = () => {
    setLoading(true);
    fetchList(true).then(() => {
      ImSdk.markC2CMessageAsRead(route.params.userID);
    });
    subNewMessage.current = ImSdk.addListener(
      ImSdkEventType.NewMessage,
      data => {
        console.log(' >> NewMessage', data);
      },
    );

    subConversation.current = ImSdk.addListener(
      ImSdkEventType.ConversationChanged,
      data => {
        console.log(' >> ConversationChanged', data);
      },
    );

    console.log(' >> PrivateChat onFocus', route.params);
  };

  const fetchList = async (isFirst = false) => {
    const [err, res] = await to(
      ImSdk.getC2CHistoryMessageList(route.params.userID, 20, isFirst),
    );
    if (err) console.log(' >> fetchList err', err);
    console.log(' >> getC2CHistoryMessageList', res);
    setLoading(false);
    if (!res) return;
    setList(res);
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
      const [err] = await to(
        ImSdk.sendImageMessage(route.params.userID, image.uri),
      );
      if (err) console.log(' >> sendImageMessage', err);
    }
  };

  const onTalk = () => {};

  const onSend = async (val: string) => {
    const [err, _res] = await to(
      ImSdk.sendC2CTextMessage(val, route.params.userID),
    );
    if (err) console.log(' >> sendC2CTextMessage', err);
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
      <ImageBackground style={{flex: 1}} source={require('./images/bg1.png')}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{flex: 1}}>
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
                refreshing={false}
                renderItem={renderItem}
              />
            )}
            <InputTools onPic={onPic} onTalk={onTalk} onSend={onSend} />
          </View>
        </TouchableWithoutFeedback>
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
