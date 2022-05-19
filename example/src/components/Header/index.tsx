import React from 'react';
import {Text, View, Image} from 'react-native';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

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
    height: 88,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
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
    color: '#09002F',
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
