// TencentIm.m

#import "TencentIm.h"

@implementation TencentIm {
    V2TIMManager *_manager;
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(initSDK:(int)sdkAppID
                  logLevel:(int)logLevel
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    V2TIMSDKConfig *config = [[V2TIMSDKConfig alloc] init];
    switch (logLevel) {
        case 0:
            config.logLevel = V2TIM_LOG_NONE;
            break;
        case 3:
            config.logLevel = V2TIM_LOG_DEBUG;
            break;
        case 4:
            config.logLevel = V2TIM_LOG_INFO;
            break;
        case 5:
            config.logLevel = V2TIM_LOG_WARN;
            break;
        case 6:
            config.logLevel = V2TIM_LOG_ERROR;
            break;
        default:
            config.logLevel = V2TIM_LOG_INFO;
            break;
    }
    if (!(self->_manager)) {
        self->_manager = [V2TIMManager sharedInstance];
    }
    [_manager initSDK:sdkAppID config:config listener:self];
    [_manager addAdvancedMsgListener:self];
    [_manager setConversationListener:self];
    resolve(nil);
}

RCT_EXPORT_METHOD(login:(NSString *)userID
                  userSig:(NSString *)userSig
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    if ([_manager getLoginStatus] != V2TIM_STATUS_LOGOUT) {
        resolve(nil);
        return;
    }
    [_manager login:userID userSig:userSig succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.login" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(logout:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    [_manager logout:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.logout" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(setSelfInfo:(NSDictionary *)params
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    V2TIMUserFullInfo * userInfo = [[V2TIMUserFullInfo alloc] init];
    userInfo.nickName = params[@"nickName"];
    userInfo.faceURL = params[@"faceURL"];
    [_manager setSelfInfo:userInfo succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.setSelfInfo" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(getC2CHistoryMessageList:(NSString *)userID
                  size:(int)size
                  lastMsg:(V2TIMMessage *)lastMsg
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    [_manager getC2CHistoryMessageList:userID count:size lastMsg:lastMsg succ:^(NSArray<V2TIMMessage *> *msgs) {
        resolve(msgs);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.getC2CHistoryMessageList" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(getConversationList:(uint64_t)page
                  size:(int)size
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    [_manager getConversationList:page count:size succ:^(NSArray<V2TIMConversation *> *list, uint64_t nextSeq, BOOL isFinished) {
        resolve(@{
            @"page": @(nextSeq),
            @"is_finished": @(isFinished),
            @"data": list
        });
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.getConversationList" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(sendC2CTextMessage:(NSString *)text
                  userID:(NSString *)userID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    [_manager sendC2CTextMessage:text to:userID succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendText" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(sendC2CCustomMessage:(NSString *)userID
                  params:(NSDictionary *)params
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    NSData *data= [NSJSONSerialization dataWithJSONObject:params options:NSJSONWritingPrettyPrinted error:nil];
    [_manager sendC2CCustomMessage:data to:userID succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendText" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(sendImageMessage:(NSString *)userID
                  imagePath:(NSString *)imagePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    V2TIMMessage *msg = [_manager createImageMessage:imagePath];
    [_manager sendMessage:msg receiver:userID groupID:nil priority:V2TIM_PRIORITY_DEFAULT onlineUserOnly:NO offlinePushInfo:nil progress:nil succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendImageMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(sendSoundMessage:(NSString *)userID
                  soundPath:(NSString *)soundPath
                  duration:(int)duration
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    V2TIMMessage *msg = [_manager createSoundMessage:soundPath duration:duration];
    [_manager sendMessage:msg receiver:userID groupID:nil priority:V2TIM_PRIORITY_DEFAULT onlineUserOnly:NO offlinePushInfo:nil progress:nil succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendSoundMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(sendGroupTextMessage:(NSString *)text
                  groupID:(NSString *)groupID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (self->_manager) {
        return;
    }
    [_manager sendGroupTextMessage:text to:groupID priority:V2TIM_PRIORITY_NORMAL succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendGroupTextMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(sendGroupAtTextMessage:(NSString *)text
                  groupID:(NSString *)groupID
                  userID:(NSString *)userID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (self->_manager) {
        return;
    }
    NSMutableArray * atUserList =[[NSMutableArray alloc] initWithObjects:userID ,nil];
    V2TIMMessage *atMsg = [_manager createTextAtMessage:text atUserList:atUserList];
    [_manager sendMessage:atMsg receiver:nil groupID:groupID priority:V2TIM_PRIORITY_DEFAULT onlineUserOnly:NO offlinePushInfo:nil progress:nil succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendGroupAtTextMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(sendGroupImageMessage:(NSString *)groupID
                  imagePath:(NSString *)imagePath
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    V2TIMMessage *msg = [_manager createImageMessage:imagePath];
    [_manager sendMessage:msg receiver:nil groupID:groupID priority:V2TIM_PRIORITY_DEFAULT onlineUserOnly:NO offlinePushInfo:nil progress:nil succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendImageMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(sendGroupSoundMessage:(NSString *)groupID
                  soundPath:(NSString *)soundPath
                  duration:(int)duration
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    V2TIMMessage *msg = [_manager createSoundMessage:soundPath duration:duration];
    [_manager sendMessage:msg receiver:nil groupID:groupID priority:V2TIM_PRIORITY_DEFAULT onlineUserOnly:NO offlinePushInfo:nil progress:nil succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendGroupSoundMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject(@"err", @"err", err);
    }];
}

RCT_EXPORT_METHOD(joinGroup:(NSString *)groupID
                  msg:(NSString *)msg
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (self->_manager) {
        [_manager joinGroup:groupID msg:msg succ:^{
            resolve(nil);
        } fail:^(int code, NSString *desc) {
            NSError *err = [NSError errorWithDomain:@"im.joinGroup" code:code userInfo:@{
                @"message":desc
            }];
            reject(@"err", @"err", err);
        }];
    }
}

RCT_EXPORT_METHOD(quitGroup:(NSString *)groupID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (self->_manager) {
        [_manager quitGroup:groupID succ:^{
            resolve(nil);
        } fail:^(int code, NSString *desc) {
            NSError *err = [NSError errorWithDomain:@"im.quitGroup" code:code userInfo:@{
                @"message":desc
            }];
            reject(@"err", @"err", err);
        }];
    }
}

// 监听 V2TIMSDKListener 回调
// 正在连接到腾讯云服务器
- (void)onConnecting {
    [self sendEventWithName:@"Connecting" body:nil];
}

// 已经成功连接到腾讯云服务器
- (void)onConnectSuccess {
    [self sendEventWithName:@"ConnectSuccess" body:nil];
}

// 连接腾讯云服务器失败
- (void)onConnectFailed:(int)code err:(NSString*)err {
    [self sendEventWithName:@"ConnectFailed" body:nil];
}

// 当前用户被踢下线
- (void)onKickedOffline {
    [self sendEventWithName:@"KickedOffline" body:nil];
}

// 登录票据已经过期
- (void)onUserSigExpired {
    [self sendEventWithName:@"UserSigExpired" body:nil];
}

// 当前用户的资料发生了更新
- (void)onSelfInfoUpdated {
    [self sendEventWithName:@"SelfInfoUpdated" body:nil];
}

- (void)onRecvNewMessage:(V2TIMMessage *)msg {
    NSDictionary *info = @{
        @"msg_id": msg.msgID,
        @"nickname": msg.nickName,
        @"face_url": msg.faceURL,
        @"group_id": msg.groupID,
        @"user_id": msg.userID,
        @"sender": msg.sender,
        @"at": msg.groupAtUserList
    };
    // 文本消息
    if (msg.elemType == V2TIM_ELEM_TYPE_TEXT) {
        V2TIMTextElem *textElem = msg.textElem;
        [self sendEventWithName:@"NewMessage" body:@{
            @"info": info,
            @"data": textElem.text,
            @"type": @"text",
        }];
    }
    // 自定义消息
    else if (msg.elemType == V2TIM_ELEM_TYPE_CUSTOM) {
        V2TIMCustomElem *customElem = msg.customElem;
        NSData *customData = customElem.data;
        NSDictionary *dictionary =[NSJSONSerialization JSONObjectWithData:customData options:NSJSONReadingMutableLeaves error:nil];
        [self sendEventWithName:@"NewMessage" body:@{
            @"info": info,
            @"data": dictionary,
            @"type": @"custom",
        }];
    }
    // 图片消息
    else if (msg.elemType == V2TIM_ELEM_TYPE_IMAGE) {
        V2TIMImageElem *imageElem = msg.imageElem;
        // 一个图片消息会包含三种格式大小的图片，分别为原图、大图、微缩图
        NSArray<V2TIMImage *> *imageList = imageElem.imageList;
        NSMutableArray * array =[[NSMutableArray alloc] initWithObjects:@"" ,nil];
        for (V2TIMImage *timImage in imageList) {
            // 设置图片下载路径 imagePath，这里可以用 uuid 作为标识，避免重复下载
            NSString *imagePath = [NSTemporaryDirectory() stringByAppendingPathComponent:[NSString stringWithFormat: @"imImage%@",timImage.uuid]];
                        // 判断 imagePath 下有没有已经下载过的图片文件
            if (![[NSFileManager defaultManager] fileExistsAtPath:imagePath]) {
                // 下载图片
                [timImage downloadImage:imagePath progress:^(NSInteger curSize, NSInteger totalSize) {
                    // 下载进度
                } succ:^{
                    // 下载成功
                    [array addObject:imagePath];
                } fail:^(int code, NSString *msg) {
                    // 下载失败
                }];
            } else {
                // 图片已存在
                [array addObject:imagePath];
            }
        }
        [self sendEventWithName:@"NewMessage" body:@{
            @"info": info,
            @"data": array,
            @"type": @"image",
        }];
    }
    // 语音消息
    else if (msg.elemType == V2TIM_ELEM_TYPE_SOUND) {
        V2TIMSoundElem *soundElem = msg.soundElem;
        // 设置语音文件路径 soundPath，这里可以用 uuid 作为标识，避免重复下载
        NSMutableArray * array =[[NSMutableArray alloc] initWithObjects:@"" ,nil];
        NSString *soundPath = [NSTemporaryDirectory() stringByAppendingPathComponent:[NSString stringWithFormat: @"imSound%@",soundElem.uuid]];
                // 判断 soundPath 下有没有已经下载过的语音文件
        if (![[NSFileManager defaultManager] fileExistsAtPath:soundPath]) {
            // 下载语音
            [soundElem downloadSound:soundPath progress:^(NSInteger curSize, NSInteger totalSize) {
                // 下载进度
            } succ:^{
                // 下载成功
                [array addObject:soundPath];
            } fail:^(int code, NSString *msg) {
                // 下载失败
            }];
        } else {
            // 语音已存在
            [array addObject:soundPath];
        }
        [self sendEventWithName:@"NewMessage" body:@{
            @"info": info,
            @"data": array,
            @"type": @"sound",
        }];
    }
    // 群 tips 消息
    else if (msg.elemType == V2TIM_ELEM_TYPE_GROUP_TIPS) {
        V2TIMGroupTipsElem *tipsElem = msg.groupTipsElem;
        // 当前群在线人数
        uint32_t memberCount = tipsElem.memberCount;
        [self sendEventWithName:@"NewMessage" body:@{
            @"info": info,
            @"data": @(memberCount),
            @"type": @"memberCount",
        }];
    }
}

// 收到会话新增的回调
- (void)onNewConversation:(NSArray<V2TIMConversation*> *) conversationList {
    [self sendEventWithName:@"NewConversation" body:nil];
}

// 收到会话更新的回调
- (void)onConversationChanged:(NSArray<V2TIMConversation*> *) conversationList {
    [self sendEventWithName:@"ConversationChanged" body:nil];
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
      @"Connecting",
      @"ConnectSuccess",
      @"ConnectFailed",
      @"KickedOffline",
      @"UserSigExpired",
      @"SelfInfoUpdated",
      @"NewMessage",
      @"NewConversation",
      @"ConversationChanged"
  ];
}

@end
