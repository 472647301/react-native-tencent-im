import React from 'react';
import {Text, View, Image, Platform} from 'react-native';
import {TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('screen');

const isIphoneX = () => {
  const scale = (height / width + '').substring(0, 4);
  const iX = Number(scale) * 100 === 216;
  return Platform.OS === 'ios' && iX;
};

interface HeaderProps {
  title: string;
}

export function Header(props: Partial<HeaderProps>) {
  const navigation = useNavigation();

  const onLeft = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.header_left} onPress={onLeft}>
        <Image
          source={require('./images/arrow.png')}
          style={styles.header_left_icon}
        />
      </TouchableOpacity>
      <View style={styles.header_center}>
        <Text numberOfLines={1} style={styles.header_center_text}>
          {props.title}
        </Text>
      </View>
      <View style={styles.header_right} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: isIphoneX() ? 88 : 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: isIphoneX() ? 44 : 22,
  },
  header_left: {
    width: 30,
    height: 30,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header_left_icon: {
    width: 10,
    height: 18,
  },
  header_center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header_center_text: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  header_right: {
    width: 30,
    height: 30,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
