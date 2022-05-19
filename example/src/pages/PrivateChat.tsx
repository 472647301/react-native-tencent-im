import React, {useRef, useState, useEffect} from 'react';
import {View, Text, Image, ActivityIndicator} from 'react-native';
import {ImageBackground, StyleSheet} from 'react-native';
import {TouchableWithoutFeedback, Keyboard} from 'react-native';
import {ImSdk, V2TIMMessage} from '@byron-react-native/tencent-im';
import {ImSdkEventType} from '@byron-react-native/tencent-im';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import RefreshFlatList from '../components/RefreshFlat';
import InputTools from '../components/InputTools';
import {Header} from '../components/Header';
import {to} from '../utils';

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

  const onBlur = () => {
    console.log(' >> PrivateChat onBlur', route.params);
  };

  const onFocus = () => {
    setLoading(true);
    fetchList();
    console.log(' >> PrivateChat onFocus', route.params);
  };

  const fetchList = async () => {
    const [err, res] = await to(
      ImSdk.getC2CHistoryMessageList(route.params.userID, 20),
    );
    if (err) console.log(' >> fetchList err', err);
    console.log(' >> getC2CHistoryMessageList', res);
    if (loading) setLoading(false);
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

  const renderItem = () => {
    return null;
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ImageBackground style={{flex: 1}} source={require('./images/bg1.png')}>
        <Header title={route.params.nickName} />
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size={'large'} color={'#000'} />
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
        <InputTools />
      </ImageBackground>
    </TouchableWithoutFeedback>
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
