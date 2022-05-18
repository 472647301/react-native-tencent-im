import React, {useState, useEffect} from 'react';
import {View, Image, Text, StyleSheet, Dimensions} from 'react-native';
import {TouchableOpacity, ActivityIndicator} from 'react-native';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {RouteProp, useRoute} from '@react-navigation/native';
import RefreshFlatList from '../components/RefreshFlat';
import {
  ImSdk,
  V2TIMConversation,
  V2TIMElemType,
} from '@byron-react-native/tencent-im';
import {ImageBackground} from 'react-native';
import {to} from '../utils';

const {width} = Dimensions.get('window');

// 18816468654 23714805
// 18816468651 45761328
// 18816468657 6597214

type Params = {
  groupID: string;
  userID: string;
};
type Routes = {
  Home: Params;
  Group: Params;
  Private: Params;
};

function HomeScreen() {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<V2TIMConversation[]>([]);
  const route = useRoute<RouteProp<Routes, 'Home'>>();
  const navigation = useNavigation<NavigationProp<Routes>>();

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async (initPage?: number) => {
    const [err, res] = await to(
      ImSdk.getConversationList(
        typeof initPage === 'number' ? initPage : page,
        2,
      ),
    );
    if (err) console.log(' >> fetchList err', err);
    // console.log(' >> fetchList', res?.data);
    if (res) setList(res.data);
    if (loading) setLoading(false);
  };

  const toGroupChat = () => {
    navigation.navigate('Group', route.params);
  };

  const toPrivateChat = () => {
    navigation.navigate('Private', route.params);
  };

  const onRefresh = async () => {
    await fetchList(0);
  };

  const renderItem = ({item}: {item: V2TIMConversation}) => {
    return <ChatInfo key={item.conversationID} {...item} />;
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size={'large'} color={'#000'} />
      </View>
    );
  }

  return (
    <ImageBackground style={{flex: 1}} source={require('./images/bg0.png')}>
      <ImageBackground
        style={[styles.info, {marginTop: 40}]}
        source={require('./images/info_bg.png')}>
        <TouchableOpacity style={styles.info_wrap} onPress={toGroupChat}>
          <Image
            style={styles.github}
            source={require('./images/github.png')}
          />
          <View style={styles.info_center}>
            <Text style={styles.info_center_name}>Group Chat</Text>
            <Text style={styles.info_center_desc}>© 2022 GitHub, Inc.</Text>
          </View>
        </TouchableOpacity>
      </ImageBackground>
      <RefreshFlatList
        data={list}
        style={{flex: 1}}
        renderItem={renderItem}
        onHeader={onRefresh}
      />
    </ImageBackground>
  );
}

const ChatInfo = (props: V2TIMConversation) => {
  const msg = props.lastMessage || {};
  return (
    <ImageBackground
      style={styles.info}
      source={require('./images/info_bg.png')}>
      <TouchableOpacity style={styles.info_wrap}>
        <Image style={styles.info_left} source={{uri: msg.faceURL}} />
        <View style={styles.info_center}>
          <Text style={styles.info_center_name}>{msg.nickName}</Text>
          <Text style={styles.info_center_desc}>{msg.textElem.text}</Text>
        </View>
        <View style={styles.info_right}>
          <Text style={styles.info_right_text}>刚刚</Text>
          <View style={styles.info_right_notice}>
            <Text style={styles.info_right_notice_text}>2</Text>
          </View>
        </View>
      </TouchableOpacity>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  github: {
    width: 46,
    height: 46,
    borderRadius: 46,
    marginRight: 12,
    marginTop: -5,
  },
  info: {
    marginHorizontal: (width / 375) * 20,
    width: (width / 375) * 335,
    height: (width / 375) * 79,
    marginBottom: 10,
  },
  info_wrap: {
    flexDirection: 'row',
    paddingHorizontal: (width / 375) * 18,
    paddingVertical: (width / 375) * 18,
  },
  info_left: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 48,
    marginTop: -5,
  },
  info_center: {
    flex: 1,
  },
  info_center_name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#09002F',
  },
  info_center_desc: {
    fontSize: 14,
    fontWeight: '400',
    color: '#697083',
    marginTop: 4,
  },
  info_right: {
    width: 44,
    alignItems: 'flex-end',
  },
  info_right_text: {
    fontSize: 12,
    fontWeight: '400',
    color: '#878EA1',
  },
  info_right_notice: {
    height: 12,
    borderRadius: 28,
    backgroundColor: '#FE471F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginTop: 10,
  },
  info_right_notice_text: {
    color: '#fff',
    fontSize: 8,
  },
});

export default HomeScreen;
