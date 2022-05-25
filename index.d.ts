declare module "@byron-react-native/tencent-im" {
  import { EmitterSubscription } from "react-native";

  export enum V2TIMLogLevel {
    V2TIM_LOG_NONE = 0, ///< 不输出任何 sdk log
    V2TIM_LOG_DEBUG = 3, ///< 输出 DEBUG，INFO，WARNING，ERROR 级别的 log
    V2TIM_LOG_INFO = 4, ///< 输出 INFO，WARNING，ERROR 级别的 log
    V2TIM_LOG_WARN = 5, ///< 输出 WARNING，ERROR 级别的 log
    V2TIM_LOG_ERROR = 6, ///< 输出 ERROR 级别的 log
  }

  export enum V2TIMMessageStatus {
    V2TIM_MSG_STATUS_SENDING = 1, ///< 消息发送中
    V2TIM_MSG_STATUS_SEND_SUCC = 2, ///< 消息发送成功
    V2TIM_MSG_STATUS_SEND_FAIL = 3, ///< 消息发送失败
    V2TIM_MSG_STATUS_HAS_DELETED = 4, ///< 消息被删除
    V2TIM_MSG_STATUS_LOCAL_REVOKED = 6, ///< 被撤销的消息
  }

  export enum V2TIMElemType {
    V2TIM_ELEM_TYPE_NONE = 0, ///< 未知消息
    V2TIM_ELEM_TYPE_TEXT = 1, ///< 文本消息
    V2TIM_ELEM_TYPE_CUSTOM = 2, ///< 自定义消息
    V2TIM_ELEM_TYPE_IMAGE = 3, ///< 图片消息
    V2TIM_ELEM_TYPE_SOUND = 4, ///< 语音消息
    V2TIM_ELEM_TYPE_VIDEO = 5, ///< 视频消息
    V2TIM_ELEM_TYPE_FILE = 6, ///< 文件消息
    V2TIM_ELEM_TYPE_LOCATION = 7, ///< 地理位置消息
    V2TIM_ELEM_TYPE_FACE = 8, ///< 表情消息
    V2TIM_ELEM_TYPE_GROUP_TIPS = 9, ///< 群 Tips 消息
  }

  export interface V2TIMImage {
    /// 图片 ID，内部标识，可用于外部缓存 key
    uuid: string;

    /// 图片类型
    type: number;

    /// 图片大小（type == V2TIM_IMAGE_TYPE_ORIGIN 有效）
    size: number;

    /// 图片宽度
    width: number;

    /// 图片高度
    height: number;

    /// 图片 url
    url: string;
  }

  export interface V2TIMSoundElem {
    /// 语音文件路径（只有发送方才能获取到）
    path: string;

    /// 语音消息内部 ID
    uuid: string;

    /// 语音数据大小
    dataSize: number;

    /// 语音长度（秒）
    duration: number;
  }

  export interface V2TIMMessage {
    /// 消息 ID（消息创建的时候为 nil，消息发送的时候会生成）
    msgID: string;

    /// 消息时间
    timestamp: Date;

    /// 消息发送者
    sender: string;

    /// 消息发送者昵称
    nickName: string;

    /// 消息发送者好友备注
    friendRemark: string;

    /// 如果是群组消息，nameCard 为发送者的群名片
    nameCard: string;

    /// 消息发送者头像
    /// 在 C2C 场景下，陌生人的头像不会实时更新，如需更新陌生人的头像（如在 UI 上点击陌生人头像以展示陌生人信息时），
    /// 请调用 V2TIMManager.h -> getUsersInfo 接口触发信息的拉取。待拉取成功后，SDK 会更新本地头像信息，即 faceURL 字段的内容。
    /// @note 请不要在收到每条消息后都去 getUsersInfo，会严重影响程序性能。
    faceURL: string;

    /// 如果是群组消息，groupID 为会话群组 ID，否则为 nil
    groupID: string;

    /// 如果是单聊消息，userID 为会话用户 ID，否则为 nil，
    /// 假设自己和 userA 聊天，无论是自己发给 userA 的消息还是 userA 发给自己的消息，这里的 userID 均为 userA
    userID: string;

    /// 群聊中的消息序列号云端生成，在群里是严格递增且唯一的,
    /// 单聊中的序列号是本地生成，不能保证严格递增且唯一。
    seq: number;

    /// 消息随机码
    random: number;

    /// 消息发送状态
    status: V2TIMMessageStatus;

    /// 消息发送者是否是自己
    isSelf: boolean;

    /// 消息自己是否已读
    isRead: boolean;

    /// 消息对方是否已读（只有 C2C 消息有效）
    isPeerRead: boolean;

    /// 群消息中被 @ 的用户 UserID 列表（即该消息都 @ 了哪些人）
    groupAtUserList: string[];

    /// 消息类型
    elemType: V2TIMElemType;

    /// 消息类型 为 V2TIM_ELEM_TYPE_TEXT，textElem 会存储文本消息内容
    textElem: { text: string };

    /// 消息类型 为 V2TIM_ELEM_TYPE_CUSTOM，customElem 会存储自定义消息内容
    customElem: string;

    /// 消息类型 为 V2TIM_ELEM_TYPE_IMAGE，imageElem 会存储图片消息内容
    imageOriginal: ImSdkImageElem;
    imageThumb: ImSdkImageElem;
    imageLarge: ImSdkImageElem;
    /// 消息类型 为 V2TIM_ELEM_TYPE_SOUND，soundElem 会存储语音消息内容
    soundElem: ImSdkSoundElem;

    /// 消息类型 为 V2TIM_ELEM_TYPE_VIDEO，videoElem 会存储视频消息内容
    // videoElem: V2TIMSoundElem;

    /// 消息类型 为 V2TIM_ELEM_TYPE_FILE，fileElem 会存储文件消息内容
    // @property(nonatomic,strong,readonly) V2TIMFileElem *fileElem;

    /// 消息类型 为 V2TIM_ELEM_TYPE_LOCATION，locationElem 会存储地理位置消息内容
    // @property(nonatomic,strong,readonly) V2TIMLocationElem *locationElem;

    /// 消息类型 为 V2TIM_ELEM_TYPE_FACE，faceElem 会存储表情消息内容
    // @property(nonatomic,strong,readonly) V2TIMFaceElem *faceElem;

    /// 消息类型 为 V2TIM_ELEM_TYPE_GROUP_TIPS，groupTipsElem 会存储群 tips 消息内容
    // @property(nonatomic,strong,readonly) V2TIMGroupTipsElem *groupTipsElem;

    /// 消息自定义数据（本地保存，不会发送到对端，程序卸载重装后失效）
    // @property(nonatomic,strong) NSData* localCustomData;

    /// 消息自定义数据,可以用来标记语音、视频消息是否已经播放（本地保存，不会发送到对端，程序卸载重装后失效）
    // @property(nonatomic,assign) int localCustomInt;

    /// 消息自定义数据（云端保存，会发送到对端，程序卸载重装后还能拉取到）
    // @property(nonatomic,strong) NSData* cloudCustomData;
  }

  export enum V2TIMConversationType {
    V2TIM_C2C = 1, ///< 单聊
    V2TIM_GROUP = 2, ///< 群聊
  }

  export enum V2TIMGroupReceiveMessageOpt {
    V2TIM_GROUP_RECEIVE_MESSAGE = 0, ///< 在线正常接收消息，离线时会进行 APNs 推送
    V2TIM_GROUP_NOT_RECEIVE_MESSAGE = 1, ///< 不会接收到群消息
    V2TIM_GROUP_RECEIVE_NOT_NOTIFY_MESSAGE = 2, ///< 在线正常接收消息，离线不会有推送通知
  }

  export interface V2TIMConversation {
    /// 会话类型
    type: V2TIMConversationType;

    /// 会话唯一 ID，如果是 C2C 单聊，组成方式为 c2c_userID，如果是群聊，组成方式为 group_groupID
    conversationID: string;

    /// 如果会话类型为 C2C 单聊，userID 会存储对方的用户ID，否则为 nil
    userID: string;

    /// 如果会话类型为群聊，groupID 会存储当前群的群 ID，否则为 nil
    groupID: string;

    /// 如果会话类型为群聊，groupType 为当前群类型，否则为 nil
    groupType: string;

    /// 会话展示名称（群组：群名称 >> 群 ID；C2C：对方好友备注 >> 对方昵称 >> 对方的 userID）
    showName: string;

    /// 会话展示头像（群组：群头像；C2C：对方头像）
    faceUrl: string;

    /// 会话未读消息数量,直播群（AVChatRoom）不支持未读计数，默认为 0
    unreadCount: number;

    /// 消息接收选项（群会话有效）
    recvOpt: V2TIMGroupReceiveMessageOpt;

    /// 会话最后一条消息，可以通过 lastMessage -> timestamp 对会话做排序，timestamp 越大，会话越靠前
    lastMessage: V2TIMMessage;

    /// 群会话 @ 信息列表，用于展示 “有人@我” 或 “@所有人” 这两种提醒状态
    groupAtInfolist: Array<any>;

    /// 草稿信息，设置草稿信息请调用 setConversationDraft() 接口
    draftText: string;

    /// 草稿编辑时间，草稿设置的时候自动生成
    draftTimestamp: Date;
  }

  export enum ImSdkEventType {
    /**
     * 正在连接到腾讯云服务器
     */
    "Connecting" = "Connecting",
    /**
     * 已经成功连接到腾讯云服务器
     */
    "ConnectSuccess" = "ConnectSuccess",
    /**
     * 连接腾讯云服务器失败
     */
    "ConnectFailed" = "ConnectFailed",
    /**
     * 当前用户被踢下线
     */
    "KickedOffline" = "KickedOffline",
    /**
     * 登录票据已经过期
     */
    "UserSigExpired" = "UserSigExpired",
    /**
     * 当前用户的资料发生了更新
     */
    "SelfInfoUpdated" = "SelfInfoUpdated",
    /**
     * 新消息通知
     */
    "NewMessage" = "NewMessage",
    /**
     * 新消息通知
     */
    "NewMessageGroup" = "NewMessageGroup",
    /**
     * 收到会话新增的回调
     */
    "NewConversation" = "NewConversation",
    /**
     * 收到会话新增的回调
     */
    "NewConversationGroup" = "NewConversationGroup",
    /**
     * 收到会话更新的回调
     */
    "ConversationChanged" = "ConversationChanged",
    /**
     * 收到会话更新的回调
     */
    "ConversationChangedGroup" = "ConversationChangedGroup",
    /**
     * 有新成员加入群（该群所有的成员都能收到）
     */
    "MemberEnter" = "MemberEnter",
    /**
     * 有成员离开群（该群所有的成员都能收到）
     */
    "MemberLeave" = "MemberLeave",
  }

  export interface ImSdkMember {
    faceURL: string;
    friendRemark: string;
    nameCard: string;
    nickName: string;
    userID: string;
  }

  export interface ImSdkSoundElem {
    path: string;
    uuid: string;
    dataSize: number;
    duration: number;
  }

  export interface ImSdkImageElem {
    uuid: string;
    type: number;
    width: number;
    height: number;
    url: string;
  }

  export interface V2TIMGroupMemberInfo {
    role: number;
    muteUntil: number;
    joinTime: number;
    userID: string;
    nickName: string;
    friendRemark: string;
    nameCard: string;
    faceURL: string;
  }

  export class ImSdk {
    static initSDK: (
      sdkAppID: number,
      logLevel?: V2TIMLogLevel
    ) => Promise<void>;
    static login: (userID: string, userSig: string) => Promise<void>;
    static logout: () => Promise<void>;
    static setSelfInfo: (nickName: string, faceURL: string) => Promise<void>;
    static markC2CMessageAsRead: (userID: string) => Promise<void>;
    static markGroupMessageAsRead: (groupID: string) => Promise<void>;
    static addToBlackList: (userIDList: Array<string>) => Promise<void>;
    static deleteFromBlackList: (userIDList: Array<string>) => Promise<void>;
    static getC2CHistoryMessageList: (
      userID: string,
      size: number,
      isFirst?: boolean
    ) => Promise<V2TIMMessage[]>;
    static getConversationList: (
      page: number,
      size: number
    ) => Promise<{
      page: number;
      is_finished: boolean;
      data: V2TIMConversation[];
    }>;
    static getGroupMemberList: (
      groupID: string,
      page: number
    ) => Promise<{
      page: number;
      data: V2TIMGroupMemberInfo[];
    }>;
    static deleteConversation: (conversationID: string) => Promise<void>;
    static sendC2CTextMessage: (
      text: string,
      userID: string
    ) => Promise<V2TIMMessage>;
    static sendC2CCustomMessage: (
      userID: string,
      params: Record<string, string>
    ) => Promise<V2TIMMessage>;
    static sendImageMessage: (
      userID: string,
      imagePath: string
    ) => Promise<V2TIMMessage>;
    static sendSoundMessage: (
      userID: string,
      soundPath: string,
      duration: number
    ) => Promise<V2TIMMessage>;
    static sendGroupTextMessage: (
      text: string,
      groupID: string
    ) => Promise<V2TIMMessage>;
    static sendGroupAtTextMessage: (
      text: string,
      groupID: string,
      userID_userName: Array<string>
    ) => Promise<V2TIMMessage>;
    static sendGroupCustomMessage: (
      groupID: string,
      params: Record<string, string>
    ) => Promise<V2TIMMessage>;
    static sendGroupImageMessage: (
      groupID: string,
      imagePath: string
    ) => Promise<V2TIMMessage>;
    static sendGroupSoundMessage: (
      groupID: string,
      soundPath: string,
      duration: number
    ) => Promise<V2TIMMessage>;
    static joinGroup: (groupID: string, msg: string) => Promise<void>;
    static quitGroup: (groupID: string) => Promise<void>;
    static addListener: (
      event: ImSdkEventType,
      listener: (data: any) => void
    ) => EmitterSubscription;
  }
}
