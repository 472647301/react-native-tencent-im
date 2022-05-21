import React, {useRef, useState, useEffect} from 'react';
import {View, Text, ActivityIndicator, Platform} from 'react-native';
import {ImageBackground, StyleSheet, EmitterSubscription} from 'react-native';
import {KeyboardAvoidingView, Keyboard} from 'react-native';
import {ImSdk, V2TIMMessage} from '@byron-react-native/tencent-im';
import {ImSdkEventType} from '@byron-react-native/tencent-im';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import RefreshFlatList from '../components/RefreshFlat';
import InputTools from '../components/InputTools';
import {Header} from '../components/Header';
import {index_dating_record, to, IApiRecordItem} from '../utils';
import {PrivateMessage} from '../components/Message';
import {launchImageLibrary} from 'react-native-image-picker';
import {Player} from '@react-native-community/audio-toolkit';

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

function GroupChat() {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<IApiRecordItem[]>([]);
  const route = useRoute<RouteProp<Routes, 'Group'>>();
  const navigation = useNavigation<NavigationProp<Routes>>();
  const newMessage = useRef<EmitterSubscription>();
  const memberEnter = useRef<EmitterSubscription>();
  const memberLeave = useRef<EmitterSubscription>();
  const listRef = useRef(list);

  useEffect(() => {
    listRef.current = list;
  });

  const onBlur = () => {
    newMessage.current?.remove();
    memberEnter.current?.remove();
    memberLeave.current?.remove();
    ImSdk.quitGroup(route.params.groupID);
    console.log(' >> GroupChat onBlur', route.params);
  };

  const onFocus = () => {
    setLoading(true);
    fetchList(0).then(() => {});
    ImSdk.joinGroup(route.params.groupID, 'Hello');
    newMessage.current = ImSdk.addListener(
      ImSdkEventType.NewMessage,
      (data: V2TIMMessage) => {
        console.log(' >> NewMessage', data);
        // setList([data].concat(listRef.current));
      },
    );
    memberEnter.current = ImSdk.addListener(
      ImSdkEventType.MemberEnter,
      data => {
        console.log(' >> MemberEnter', data);
        // setList([data].concat(listRef.current));
      },
    );
    memberLeave.current = ImSdk.addListener(
      ImSdkEventType.MemberLeave,
      data => {
        console.log(' >> MemberLeave', data);
        // setList([data].concat(listRef.current));
      },
    );
    console.log(' >> GroupChat onFocus', route.params);
  };

  const fetchList = async (_page = 0) => {
    const [err, res] = await to(index_dating_record(_page + 1));
    if (err) console.log(' >> fetchList err', err);
    console.log(' >> index_dating_record', res);
    setLoading(false);
    if (!res) return;
    return res;
  };

  useEffect(() => {
    const sub_blur = navigation.addListener('blur', onBlur);
    const sub_focus = navigation.addListener('focus', onFocus);
    return () => {
      sub_blur();
      sub_focus();
    };
  }, [navigation]);

  const renderItem = ({item}: {item: IApiRecordItem}) => {
    return null;
  };

  const onPic = async () => {
    const res = await launchImageLibrary({mediaType: 'photo'});
    if (!res.assets) return;
    for (let image of res.assets) {
      if (!image.uri) {
        continue;
      }
      const [err, res] = await to(
        ImSdk.sendGroupImageMessage(
          route.params.groupID,
          image.uri.split('file://')[1],
        ),
      );
      if (err) console.log(' >> sendGroupImageMessage', err);
      if (!res) return;
      // setList([res].concat(listRef.current));
    }
  };

  const onTalk = async (path: string) => {
    const player = new Player(`file://${path}`);
    // fix AudioPlayerModule: playerId 0 not found
    if (Platform.OS === 'android') {
      player.speed = 0.0;
    }
    player.volume = 0;
    player.play(async err => {
      if (err) {
        console.log(' >> onTalk play err', err);
        return;
      }
      onSendSound(path, Math.ceil(player.duration / 1000));
      player.stop();
    });
  };

  const onSendSound = async (path: string, duration: number) => {
    const [err, res] = await to(
      ImSdk.sendGroupSoundMessage(route.params.groupID, path, duration),
    );
    if (err) console.log(' >> sendGroupSoundMessage', err);
    if (!res) return;
    // setList([res].concat(listRef.current));
  };

  const onSend = async (val: string) => {
    // if (val === '123') {
    //   const [err, res] = await to(
    //     ImSdk.sendC2CCustomMessage(route.params.userID, {
    //       abc: '123',
    //     }),
    //   );
    //   if (err) console.log(' >> sendC2CTextMessage', err);
    //   Keyboard.dismiss();
    //   if (!res) return;
    //   setList([res].concat(listRef.current));
    //   return;
    // }
    const [err, res] = await to(
      ImSdk.sendGroupTextMessage(val, route.params.groupID),
    );
    if (err) console.log(' >> sendGroupTextMessage', err);
    Keyboard.dismiss();
    if (!res) return;
    // setList([res].concat(listRef.current));
  };

  const onFooter = async () => {
    const res = await fetchList();
    if (!res) return;
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

export default GroupChat;
