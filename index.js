import { NativeModules, NativeEventEmitter } from "react-native";

const { TencentIm } = NativeModules;

const emitter = new NativeEventEmitter(TencentIm);

export const V2TIMLogLevel = {
  V2TIM_LOG_NONE: 0, ///< 不输出任何 sdk log
  V2TIM_LOG_DEBUG: 3, ///< 输出 DEBUG，INFO，WARNING，ERROR 级别的 log
  V2TIM_LOG_INFO: 4, ///< 输出 INFO，WARNING，ERROR 级别的 log
  V2TIM_LOG_WARN: 5, ///< 输出 WARNING，ERROR 级别的 log
  V2TIM_LOG_ERROR: 6, ///< 输出 ERROR 级别的 log
};

export const V2TIMMessageStatus = {
  V2TIM_MSG_STATUS_SENDING: 1, ///< 消息发送中
  V2TIM_MSG_STATUS_SEND_SUCC: 2, ///< 消息发送成功
  V2TIM_MSG_STATUS_SEND_FAIL: 3, ///< 消息发送失败
  V2TIM_MSG_STATUS_HAS_DELETED: 4, ///< 消息被删除
  V2TIM_MSG_STATUS_LOCAL_REVOKED: 6, ///< 被撤销的消息
};

export const V2TIMElemType = {
  V2TIM_ELEM_TYPE_NONE: 0, ///< 未知消息
  V2TIM_ELEM_TYPE_TEXT: 1, ///< 文本消息
  V2TIM_ELEM_TYPE_CUSTOM: 2, ///< 自定义消息
  V2TIM_ELEM_TYPE_IMAGE: 3, ///< 图片消息
  V2TIM_ELEM_TYPE_SOUND: 4, ///< 语音消息
  V2TIM_ELEM_TYPE_VIDEO: 5, ///< 视频消息
  V2TIM_ELEM_TYPE_FILE: 6, ///< 文件消息
  V2TIM_ELEM_TYPE_LOCATION: 7, ///< 地理位置消息
  V2TIM_ELEM_TYPE_FACE: 8, ///< 表情消息
  V2TIM_ELEM_TYPE_GROUP_TIPS: 9, ///< 群 Tips 消息
};

export const V2TIMConversationType = {
  V2TIM_C2C: 1, ///< 单聊
  V2TIM_GROUP: 2, ///< 群聊
};

export const V2TIMGroupReceiveMessageOpt = {
  V2TIM_GROUP_RECEIVE_MESSAGE: 0, ///< 在线正常接收消息，离线时会进行 APNs 推送
  V2TIM_GROUP_NOT_RECEIVE_MESSAGE: 1, ///< 不会接收到群消息
  V2TIM_GROUP_RECEIVE_NOT_NOTIFY_MESSAGE: 2, ///< 在线正常接收消息，离线不会有推送通知
};

export const ImSdkEventType = {
  Connecting: "Connecting",
  ConnectSuccess: "ConnectSuccess",
  ConnectFailed: "ConnectFailed",
  KickedOffline: "KickedOffline",
  UserSigExpired: "UserSigExpired",
  SelfInfoUpdated: "SelfInfoUpdated",
  NewMessage: "NewMessage",
  NewConversation: "NewConversation",
  ConversationChanged: "ConversationChanged",
  MemberEnter: "MemberEnter",
  MemberLeave: "MemberLeave",
};

export class ImSdk {
  static async initSDK(sdkAppID, logLevel = 0) {
    return TencentIm.initSDK(sdkAppID, logLevel);
  }
  static async login(userID, userSig) {
    return TencentIm.login(userID, userSig);
  }
  static async logout() {
    return TencentIm.logout();
  }
  static async setSelfInfo(nickName, faceURL) {
    return TencentIm.setSelfInfo({ nickName, faceURL });
  }
  static async markC2CMessageAsRead(userID) {
    return TencentIm.markC2CMessageAsRead(userID);
  }
  static async markGroupMessageAsRead(groupID) {
    return TencentIm.markGroupMessageAsRead(groupID);
  }
  static async getC2CHistoryMessageList(userID, size, isFirst = false) {
    return TencentIm.getC2CHistoryMessageList(userID, size, isFirst);
  }
  static async getConversationList(page, size) {
    return TencentIm.getConversationList(page, size);
  }
  static async sendC2CTextMessage(text, userID) {
    return TencentIm.sendC2CTextMessage(text, userID);
  }
  static async sendC2CCustomMessage(userID, params) {
    return TencentIm.sendC2CCustomMessage(userID, params);
  }
  static async sendImageMessage(userID, imagePath) {
    return TencentIm.sendImageMessage(userID, imagePath);
  }
  static async sendSoundMessage(userID, soundPath, duration) {
    return TencentIm.sendSoundMessage(userID, soundPath, duration);
  }
  static async sendGroupTextMessage(text, groupID) {
    return TencentIm.sendGroupTextMessage(text, groupID);
  }
  static async sendGroupAtTextMessage(text, groupID, atUserID) {
    return TencentIm.sendGroupAtTextMessage(text, groupID, atUserID);
  }
  static async sendGroupCustomMessage(groupID, params) {
    return TencentIm.sendGroupCustomMessage(groupID, params);
  }
  static async sendGroupImageMessage(groupID, imagePath) {
    return TencentIm.sendGroupImageMessage(groupID, imagePath);
  }
  static async sendGroupSoundMessage(groupID, soundPath, duration) {
    return TencentIm.sendGroupSoundMessage(groupID, soundPath, duration);
  }
  static async joinGroup(groupID, msg) {
    return TencentIm.joinGroup(groupID, msg);
  }
  static async quitGroup(groupID) {
    return TencentIm.quitGroup(groupID);
  }
  static addListener(event, listener) {
    return emitter.addListener(event, listener);
  }
}
