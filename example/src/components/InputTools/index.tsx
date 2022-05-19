import React, {useState} from 'react';
import {Image, ImageBackground, TouchableOpacity} from 'react-native';
import {StyleSheet, Dimensions, TextInput, Text} from 'react-native';

const {width} = Dimensions.get('window');

interface InputToolsProps {
  onTalk: () => void;
  onPic: () => void;
  onSend: (value: string) => void;
}

function InputTools(props: Partial<InputToolsProps>) {
  const [value, setVlaue] = useState('');

  const onSend = () => {
    if (!value) {
      return;
    }
    props.onSend && props.onSend(value);
  };

  return (
    <ImageBackground style={styles.tools} source={require('./images/bg.png')}>
      <TouchableOpacity style={styles.talk} onPress={props.onTalk}>
        <Image style={styles.talk} source={require('./images/talk.png')} />
      </TouchableOpacity>
      <TextInput style={styles.input} onChangeText={setVlaue} value={value} />
      <TouchableOpacity style={styles.add} onPress={props.onPic}>
        <Image style={styles.add} source={require('./images/add.png')} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onSend}>
        <Text style={styles.btn_text}>Send</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

export default InputTools;

const styles = StyleSheet.create({
  tools: {
    width: width,
    height: (width / 375) * 92,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  talk: {
    width: 36,
    height: 36,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 12,
    marginHorizontal: 10,
    height: 36,
    paddingHorizontal: 5,
    paddingVertical: 5,
    color: '#fff'
  },
  add: {
    width: 36,
    height: 36,
  },
  btn: {
    marginLeft: 10,
    width: 60,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F87700',
  },
  btn_text: {
    fontSize: 14,
    color: '#fff',
  },
});
