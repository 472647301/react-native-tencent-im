import React, {useRef, useState, useEffect} from 'react';
import {View, Text, Image, ActivityIndicator} from 'react-native';
import {ImageBackground, StyleSheet} from 'react-native';
import {TouchableWithoutFeedback, Keyboard} from 'react-native';
import {ImSdk, ImSdkEventType} from '@byron-react-native/tencent-im';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import RefreshFlatList from '../components/RefreshFlat';
import InputTools from '../components/InputTools';

function GroupChat() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<string[]>([]);
  const navigation = useNavigation();
  const route = useRoute();

  const onBlur = () => {
    console.log(' >> GroupChat onBlur', route.params);
  };

  const onFocus = () => {
    console.log(' >> GroupChat onFocus', route.params);
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

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size={'large'} color={'#000'} />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ImageBackground style={{flex: 1}} source={require('./images/bg1.png')}>
        {!list.length ? (
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

export default GroupChat;
