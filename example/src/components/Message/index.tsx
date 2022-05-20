import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {V2TIMElemType, V2TIMMessage} from '@byron-react-native/tencent-im';

interface PrivateMessageProps extends V2TIMMessage {}

export const PrivateMessage = (props: PrivateMessageProps) => {
  const TextElem = () => {
    return (
      <View style={{maxWidth: '100%'}}>
        <View
          style={[
            styles.msg,
            props.isSelf ? styles.msg_right : styles.msg_left,
          ]}>
          <Text
            selectable={true}
            style={[
              styles.msg_text,
              {fontWeight: props.isSelf ? '500' : 'normal'},
            ]}>
            {props.textElem.text}
          </Text>
        </View>
      </View>
    );
  };

  const CustomElem = () => {
    try {
      const elem = JSON.parse(props.customElem);
      return (
        <View style={styles.image}>
          <Text style={[styles.msg_text]}>自定义【abc:{elem.abc}】</Text>
        </View>
      );
    } catch (e) {
      return (
        <View style={styles.image}>
          <Text style={[styles.msg_text]}>
            自定义解析失败: {props.customElem}
          </Text>
        </View>
      );
    }
  };

  const ImageElem = () => {
    if (props.imageElem.length) {
      const elem = props.imageElem[1];
      if (!elem) {
        return (
          <View style={styles.image}>
            <Text style={[styles.msg_text, {color: 'red'}]}>
              {'缩略图解析失败'}
            </Text>
          </View>
        );
      }
      return (
        <View style={styles.image}>
          <Image
            source={{uri: elem.url}}
            defaultSource={require('./images/image_error.png')}
            style={{
              width: elem.width * 0.5,
              height: elem.height * 0.5,
              borderRadius: 8,
            }}
            onError={err => console.log(' >> Image', err.nativeEvent.error)}
          />
        </View>
      );
    } else {
      return (
        <Text style={[styles.msg_text, {color: 'red'}]}>{'图片资源为空'}</Text>
      );
    }
  };

  const SoundElem = () => {
    return <></>;
  };

  const getMessageElem = () => {
    let elem = <></>;
    switch (props.elemType) {
      case V2TIMElemType.V2TIM_ELEM_TYPE_TEXT:
        elem = <TextElem />;
        break;
      case V2TIMElemType.V2TIM_ELEM_TYPE_CUSTOM:
        elem = <CustomElem />;
        break;
      case V2TIMElemType.V2TIM_ELEM_TYPE_IMAGE:
        elem = <ImageElem />;
        break;
      case V2TIMElemType.V2TIM_ELEM_TYPE_SOUND:
        elem = <SoundElem />;
        break;
    }
    return elem;
  };

  const ItemLeft = () => {
    return (
      <>
        <Image style={styles.avatar} source={{uri: props.faceURL}} />
        <View>
          <Text style={styles.item_left_name}>{props.nickName}</Text>
          {getMessageElem()}
        </View>
      </>
    );
  };

  const ItemRight = () => {
    return (
      <>
        <View>
          <Text style={styles.item_right_name}>{props.nickName}</Text>
          {getMessageElem()}
        </View>
        <Image style={styles.avatar} source={{uri: props.faceURL}} />
      </>
    );
  };

  return (
    <View style={[props.isSelf ? styles.item_right : styles.item_left]}>
      <View style={[styles.item, props.isSelf ? styles.right : styles.left]}>
        {props.isSelf ? <ItemRight /> : <ItemLeft />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    maxWidth: '60%',
    flexDirection: 'row',
  },
  left: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  item_left: {
    marginBottom: 16,
    marginLeft: 20,
  },
  item_right: {
    marginBottom: 30,
    marginRight: 16,
  },
  item_left_name: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'left',
    marginLeft: 10,
  },
  item_right_name: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginBottom: 2,
    textAlign: 'right',
    marginRight: 10,
  },
  msg: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
  },
  msg_left: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 10,
    borderTopLeftRadius: 0,
  },
  msg_right: {
    backgroundColor: '#10EDED',
    marginRight: 10,
    borderTopRightRadius: 0,
  },
  msg_text: {
    fontSize: 13,
    lineHeight: 18,
    color: '#fff',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 100,
  },
  image: {
    marginHorizontal: 10,
    marginVertical: 6,
  },
});
