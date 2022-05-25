// TencentIm.m

#import "TencentIm.h"

@implementation TencentIm {
    V2TIMManager *_manager;
    V2TIMMessage *_lastMsg;
    long indexConversation;
    long indexMessage;
}

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(initSDK:(int)sdkAppID
                  logLevel:(int)logLevel
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    V2TIMSDKConfig *config = [[V2TIMSDKConfig alloc] init];
    switch (logLevel) {
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
            config.logLevel = V2TIM_LOG_NONE;
            break;
    }
    if (!(self->_manager)) {
        self->indexConversation = 0;
        self->indexMessage = 0;
        self->_manager = [V2TIMManager sharedInstance];
    }
    [_manager initSDK:sdkAppID config:config listener:self];
    [_manager addAdvancedMsgListener:self];
    [_manager setConversationListener:self];
    [_manager setGroupListener:self];
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
        reject([@(code) stringValue], desc, err);
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
        reject([@(code) stringValue], desc, err);
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
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(markC2CMessageAsRead:(NSString *)userID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    [_manager markC2CMessageAsRead:userID succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.markC2CMessageAsRead" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(markGroupMessageAsRead:(NSString *)groupID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    [_manager markGroupMessageAsRead:groupID succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.markGroupMessageAsRead" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(addToBlackList:(NSArray *)userIDList
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    [_manager addToBlackList:userIDList succ:^(NSArray<V2TIMFriendOperationResult *> *resultList) {
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.addToBlackList" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(deleteFromBlackList:(NSArray *)userIDList
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    [_manager deleteFromBlackList:userIDList succ:^(NSArray<V2TIMFriendOperationResult *> *resultList) {
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.deleteFromBlackList" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(getBlackList:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    [_manager getBlackList:^(NSArray<V2TIMFriendInfo *> *infoList) {
        NSMutableArray *arr = [[NSMutableArray alloc] init];
        for (V2TIMFriendInfo *item in infoList) {
            [arr addObject:@{
                @"userID": item.userID ? item.userID : @"",
                @"nickName": item.userFullInfo.nickName ? item.userFullInfo.nickName : @"",
                @"faceURL": item.userFullInfo.faceURL ? item.userFullInfo.faceURL  : @"",
                @"friendRemark": item.friendRemark ? item.friendRemark : @"",
                @"selfSignature": item.userFullInfo.selfSignature ? item.userFullInfo.selfSignature : @"",
                @"gender": @(item.userFullInfo.gender),
            }];
        }
        resolve(arr);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.getBlackList" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(getC2CHistoryMessageList:(NSString *)userID
                  size:(int)size
                  isFirst:(BOOL)isFirst
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    if (isFirst) {
        _lastMsg = nil;
    }
    indexMessage = 0;
    [_manager getC2CHistoryMessageList:userID count:size lastMsg:_lastMsg ? _lastMsg : nil succ:^(NSArray<V2TIMMessage *> *msgs) {
        if ([msgs count]) {
            self->_lastMsg = [msgs lastObject];
        }
        NSMutableArray *msgArr = [[NSMutableArray alloc] init];
        for (V2TIMMessage *item in msgs) {
            [self parseMessage:item isDownload:YES key:[item.msgID stringByAppendingString: @"C2CHistoryMessageList"] succ:^(NSDictionary *map) {
                [msgArr addObject:map];
                self->indexMessage = self->indexMessage + 1;
                if (self->indexMessage == [msgs count]) {
                    self->indexMessage = 0;
                    resolve(msgArr);
                };
            }];
        }
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.getC2CHistoryMessageList" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(getConversationList:(uint64_t)page
                  size:(int)size
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    indexConversation = 0;
    [_manager getConversationList:page count:size succ:^(NSArray<V2TIMConversation *> *list, uint64_t nextSeq, BOOL isFinished) {
        NSMutableArray *msgArr = [[NSMutableArray alloc] init];
        for (V2TIMConversation *item in list) {
            [self parseMessage:item.lastMessage isDownload:YES key:[item.lastMessage.msgID stringByAppendingString: @"ConversationList"] succ:^(NSDictionary *map) {
                [msgArr addObject:@{
                    @"type": @(item.type),
                    @"conversationID": item.conversationID ? item.conversationID : @"",
                    @"userID": item.userID ? item.userID : @"",
                    @"groupID": item.groupID ? item.groupID : @"",
                    @"groupType": item.groupType ? item.groupType : @"",
                    @"showName": item.showName ? item.showName : @"",
                    @"faceUrl": item.faceUrl ? item.faceUrl : @"",
                    @"unreadCount": @(item.unreadCount),
                    @"recvOpt": @(item.recvOpt),
                    @"lastMessage": map
                }];
                self->indexConversation = self->indexConversation + 1;
                if (self->indexConversation == [list count]) {
                    self->indexConversation = 0;
                    resolve(@{
                        @"page": @(nextSeq),
                        @"is_finished": @(isFinished),
                        @"data": msgArr
                    });
                };
            }];
        }
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.getConversationList" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(deleteConversation:(NSString *)conversationID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    [_manager deleteConversation:conversationID succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.deleteConversation" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(getGroupMemberList:(NSString *)groupID
                  page:(int)page
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    [_manager getGroupMemberList:groupID filter:V2TIM_GROUP_MEMBER_FILTER_ALL nextSeq:page succ:^(uint64_t nextSeq, NSArray<V2TIMGroupMemberFullInfo *> *memberList) {
        NSMutableArray *msgArr = [[NSMutableArray alloc] init];
        for (V2TIMGroupMemberFullInfo *item in memberList) {
            [msgArr addObject:@{
                @"role": @(item.role),
                @"muteUntil": @(item.muteUntil),
                @"joinTime": @(item.joinTime),
                @"userID": item.userID ? item.userID : @"",
                @"nickName": item.nickName ? item.nickName : @"",
                @"friendRemark": item.friendRemark ? item.friendRemark : @"",
                @"nameCard": item.nameCard ? item.nameCard : @"",
                @"faceURL": item.faceURL ? item.faceURL : @""
            }];
        }
        resolve(@{@"page": @(nextSeq), @"data": msgArr});
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendC2CTextMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(sendC2CTextMessage:(NSString *)text
                  userID:(NSString *)userID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    V2TIMMessage *msg = [_manager createTextMessage:text];
    [_manager sendMessage:msg receiver:userID groupID:nil priority:V2TIM_PRIORITY_DEFAULT onlineUserOnly:NO offlinePushInfo:nil progress:nil succ:^{
        [self parseMessage:msg isDownload:NO key:[msg.msgID stringByAppendingString: @"C2CTextMessage"] succ:^(NSDictionary *map) {
            resolve(map);
        }];
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendC2CTextMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
//    [_manager sendC2CTextMessage:text to:userID succ:^{
//        resolve(nil);
//    } fail:^(int code, NSString *desc) {
//        NSError *err = [NSError errorWithDomain:@"im.sendText" code:code userInfo:@{
//            @"message":desc
//        }];
//        reject([@(code) stringValue], desc, err);
//    }];
}

RCT_EXPORT_METHOD(sendC2CCustomMessage:(NSString *)userID
                  params:(NSDictionary *)params
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    NSData *data= [NSJSONSerialization dataWithJSONObject:params options:NSJSONWritingPrettyPrinted error:nil];
    V2TIMMessage *msg = [_manager createCustomMessage:data];
    [_manager sendMessage:msg receiver:userID groupID:nil priority:V2TIM_PRIORITY_DEFAULT onlineUserOnly:NO offlinePushInfo:nil progress:nil succ:^{
        [self parseMessage:msg isDownload:NO key:[msg.msgID stringByAppendingString: @"C2CCustomMessage"] succ:^(NSDictionary *map) {
            resolve(map);
        }];
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendC2CCustomMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
//    [_manager sendC2CCustomMessage:data to:userID succ:^{
//        resolve(nil);
//    } fail:^(int code, NSString *desc) {
//        NSError *err = [NSError errorWithDomain:@"im.sendText" code:code userInfo:@{
//            @"message":desc
//        }];
//        reject([@(code) stringValue], desc, err);
//    }];
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
        [self parseMessage:msg isDownload:NO key:[msg.msgID stringByAppendingString: @"ImageMessage"] succ:^(NSDictionary *map) {
            resolve(map);
        }];
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendImageMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
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
        [self parseMessage:msg isDownload:NO key:[msg.msgID stringByAppendingString: @"SoundMessage"] succ:^(NSDictionary *map) {
            resolve(map);
        }];
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendSoundMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(sendGroupTextMessage:(NSString *)text
                  groupID:(NSString *)groupID
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    V2TIMMessage *msg = [_manager createTextMessage:text];
//    [_manager sendGroupTextMessage:text to:groupID priority:V2TIM_PRIORITY_NORMAL succ:^{
//        resolve(nil);
//    } fail:^(int code, NSString *desc) {
//        NSError *err = [NSError errorWithDomain:@"im.sendGroupTextMessage" code:code userInfo:@{
//            @"message":desc
//        }];
//        reject([@(code) stringValue], desc, err);
//    }];
    [_manager sendMessage:msg receiver:nil groupID:groupID priority:V2TIM_PRIORITY_DEFAULT onlineUserOnly:NO offlinePushInfo:nil progress:nil succ:^{
        [self parseMessage:msg isDownload:NO key:[msg.msgID stringByAppendingString: @"GroupTextMessage"] succ:^(NSDictionary *map) {
            resolve(map);
        }];
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendGroupTextMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(sendGroupAtTextMessage:(NSString *)text
                  groupID:(NSString *)groupID
                  userID_userNmae:(NSArray *)userID_userNmae
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    NSMutableArray * atUserList =[[NSMutableArray alloc] init];
    for (int i=0; i<userID_userNmae.count; i++) {
        [atUserList addObject:userID_userNmae[i]];
    }
    V2TIMMessage *atMsg = [_manager createTextAtMessage:text atUserList:atUserList];
    [_manager sendMessage:atMsg receiver:nil groupID:groupID priority:V2TIM_PRIORITY_DEFAULT onlineUserOnly:NO offlinePushInfo:nil progress:nil succ:^{
        [self parseMessage:atMsg isDownload:NO key:[atMsg.msgID stringByAppendingString: @"GroupAtTextMessage"] succ:^(NSDictionary *map) {
            resolve(map);
        }];
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendGroupAtTextMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(sendGroupCustomMessage:(NSString *)groupID
                  params:(NSDictionary *)params
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    NSData *data= [NSJSONSerialization dataWithJSONObject:params options:NSJSONWritingPrettyPrinted error:nil];
    V2TIMMessage *msg = [_manager createCustomMessage:data];
    [_manager sendMessage:msg receiver:nil groupID:groupID priority:V2TIM_PRIORITY_DEFAULT onlineUserOnly:NO offlinePushInfo:nil progress:nil succ:^{
        [self parseMessage:msg isDownload:NO key:[msg.msgID stringByAppendingString: @"GroupCustomMessage"] succ:^(NSDictionary *map) {
            resolve(map);
        }];
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendGroupCustomMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
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
        [self parseMessage:msg isDownload:NO key:[msg.msgID stringByAppendingString: @"GroupImageMessage"] succ:^(NSDictionary *map) {
            resolve(map);
        }];
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendImageMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
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
        [self parseMessage:msg isDownload:NO key:[msg.msgID stringByAppendingString: @"GroupSoundMessage"] succ:^(NSDictionary *map) {
            resolve(map);
        }];
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.sendGroupSoundMessage" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
}

RCT_EXPORT_METHOD(joinGroup:(NSString *)groupID
                  msg:(NSString *)msg
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
    if (!(self->_manager)) {
        return;
    }
    [_manager joinGroup:groupID msg:msg succ:^{
        resolve(nil);
    } fail:^(int code, NSString *desc) {
        NSError *err = [NSError errorWithDomain:@"im.joinGroup" code:code userInfo:@{
            @"message":desc
        }];
        reject([@(code) stringValue], desc, err);
    }];
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
            reject([@(code) stringValue], desc, err);
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
    if (msg.groupID) {
        [self parseMessage:msg isDownload:YES key:[msg.msgID stringByAppendingString: @"NewMessageGroup"] succ:^(NSDictionary *map) {
            [self sendEventWithName:@"NewMessageGroup" body:map];
        }];
    } else {
        [self parseMessage:msg isDownload:YES key:[msg.msgID stringByAppendingString: @"NewMessage"] succ:^(NSDictionary *map) {
            [self sendEventWithName:@"NewMessage" body:map];
        }];
    }
}

// 收到会话新增的回调
- (void)onNewConversation:(NSArray<V2TIMConversation*> *) conversationList {
    if ([conversationList count] == 0) {
        return;
    }
    V2TIMConversation *item = conversationList[0];
    if (item.type == V2TIM_C2C) {
        [self parseMessage:item.lastMessage isDownload:YES key:[item.lastMessage.msgID stringByAppendingString: @"NewConversation"] succ:^(NSDictionary *map) {
            [self sendEventWithName:@"NewConversation" body:@{
                @"type": @(item.type),
                @"conversationID": item.conversationID ? item.conversationID : @"",
                @"userID": item.userID ? item.userID : @"",
                @"groupID": item.groupID ? item.groupID : @"",
                @"groupType": item.groupType ? item.groupType : @"",
                @"showName": item.showName ? item.showName : @"",
                @"faceUrl": item.faceUrl ? item.faceUrl : @"",
                @"unreadCount": @(item.unreadCount),
                @"recvOpt": @(item.recvOpt),
                @"lastMessage": map
            }];
        }];
    } else {
        [self parseMessage:item.lastMessage isDownload:YES key:[item.lastMessage.msgID stringByAppendingString: @"NewConversationGroup"] succ:^(NSDictionary *map) {
            [self sendEventWithName:@"NewConversationGroup" body:@{
                @"type": @(item.type),
                @"conversationID": item.conversationID ? item.conversationID : @"",
                @"userID": item.userID ? item.userID : @"",
                @"groupID": item.groupID ? item.groupID : @"",
                @"groupType": item.groupType ? item.groupType : @"",
                @"showName": item.showName ? item.showName : @"",
                @"faceUrl": item.faceUrl ? item.faceUrl : @"",
                @"unreadCount": @(item.unreadCount),
                @"recvOpt": @(item.recvOpt),
                @"lastMessage": map
            }];
        }];
    }
}

// 收到会话更新的回调
- (void)onConversationChanged:(NSArray<V2TIMConversation*> *) conversationList {
    if ([conversationList count] == 0) {
        return;
    }
    V2TIMConversation *item = conversationList[0];
    if (item.type == V2TIM_C2C) {
        [self parseMessage:item.lastMessage isDownload:YES key:[item.lastMessage.msgID stringByAppendingString: @"ConversationChanged"] succ:^(NSDictionary *map) {
            [self sendEventWithName:@"ConversationChanged" body:@{
                @"type": @(item.type),
                @"conversationID": item.conversationID ? item.conversationID : @"",
                @"userID": item.userID ? item.userID : @"",
                @"groupID": item.groupID ? item.groupID : @"",
                @"groupType": item.groupType ? item.groupType : @"",
                @"showName": item.showName ? item.showName : @"",
                @"faceUrl": item.faceUrl ? item.faceUrl : @"",
                @"unreadCount": @(item.unreadCount),
                @"recvOpt": @(item.recvOpt),
                @"lastMessage": map
            }];
        }];
    } else {
        [self parseMessage:item.lastMessage isDownload:YES key:[item.lastMessage.msgID stringByAppendingString: @"ConversationChangedGroup"] succ:^(NSDictionary *map) {
            [self sendEventWithName:@"ConversationChangedGroup" body:@{
                @"type": @(item.type),
                @"conversationID": item.conversationID ? item.conversationID : @"",
                @"userID": item.userID ? item.userID : @"",
                @"groupID": item.groupID ? item.groupID : @"",
                @"groupType": item.groupType ? item.groupType : @"",
                @"showName": item.showName ? item.showName : @"",
                @"faceUrl": item.faceUrl ? item.faceUrl : @"",
                @"unreadCount": @(item.unreadCount),
                @"recvOpt": @(item.recvOpt),
                @"lastMessage": map
            }];
        }];
    }
}

/////////////////////////////////////////////////////////////////////////////////
//        群成员相关通知
/////////////////////////////////////////////////////////////////////////////////

/// 有新成员加入群（该群所有的成员都能收到）
- (void)onMemberEnter:(NSString *)groupID memberList:(NSArray<V2TIMGroupMemberInfo *>*)memberList {
    NSMutableArray *dictArr = [[NSMutableArray alloc] init];
    for(V2TIMGroupMemberInfo *item in memberList) {
        [dictArr addObject:@{
            @"userID": item.userID ? item.userID : @"",
            @"nickName": item.nickName ? item.nickName : @"",
            @"friendRemark": item.friendRemark ? item.friendRemark : @"",
            @"nameCard": item.nameCard ? item.nameCard : @"",
            @"faceURL": item.faceURL ? item.faceURL : @""
        }];
    }
    [self sendEventWithName:@"MemberEnter" body:@{@"data": dictArr}];
}

/// 有成员离开群（该群所有的成员都能收到）
- (void)onMemberLeave:(NSString *)groupID member:(V2TIMGroupMemberInfo *)member {
    [self sendEventWithName:@"MemberLeave" body:@{@"data": @{
        @"userID": member.userID ? member.userID : @"",
        @"nickName": member.nickName ? member.nickName : @"",
        @"friendRemark": member.friendRemark ? member.friendRemark : @"",
        @"nameCard": member.nameCard ? member.nameCard : @"",
        @"faceURL": member.faceURL ? member.faceURL : @""
    }}];
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
      @"NewMessageGroup",
      @"NewConversation",
      @"NewConversationGroup",
      @"ConversationChanged",
      @"ConversationChangedGroup",
      @"MemberEnter",
      @"MemberLeave"
  ];
}

-(void)parseMessage:(V2TIMMessage *)msg isDownload:(BOOL)isDownload key:(NSString*)key succ:(MapCallback)succ {
    NSMutableDictionary *dict = [NSMutableDictionary dictionary];
    NSTimeInterval interval = [msg.timestamp timeIntervalSince1970] * 1000;
    NSInteger time = interval;
    [dict setValue:msg.msgID ? msg.msgID : @"" forKey:@"msgID"];
    [dict setValue:@(time) forKey:@"timestamp"];
    [dict setValue:msg.sender ? msg.sender : @"" forKey:@"sender"];
    [dict setValue:msg.nickName ? msg.nickName : @"" forKey:@"nickName"];
    [dict setValue:msg.friendRemark ? msg.friendRemark : @"" forKey:@"friendRemark"];
    [dict setValue:msg.nameCard ? msg.nameCard : @"" forKey:@"nameCard"];
    [dict setValue:msg.faceURL ? msg.faceURL : @"" forKey:@"faceURL"];
    [dict setValue:msg.groupID ? msg.groupID : @"" forKey:@"groupID"];
    [dict setValue:msg.userID ? msg.userID : @"" forKey:@"userID"];
    [dict setValue:@(msg.status) forKey:@"status"];
    [dict setValue:@(msg.isSelf) forKey:@"isSelf"];
    [dict setValue:@(msg.isRead) forKey:@"isRead"];
    [dict setValue:@(msg.isPeerRead) forKey:@"isPeerRead"];
    [dict setValue:@(msg.elemType) forKey:@"elemType"];
    [dict setValue:msg.groupAtUserList ? msg.groupAtUserList : @[] forKey:@"groupAtUserList"];
    if (msg.elemType == V2TIM_ELEM_TYPE_TEXT) {
        [dict setValue:@{@"text": msg.textElem.text} forKey:@"textElem"];
        NSDictionary *result = [dict copy];
        succ(result);
    } else if (msg.elemType == V2TIM_ELEM_TYPE_CUSTOM) {
        NSString *customElem = [[NSString alloc] initWithData:msg.customElem.data encoding:NSUTF8StringEncoding];
        if ([customElem hasPrefix:@"{ NativeMap:"]) {
            customElem = [customElem substringFromIndex: 12];
            customElem = [customElem substringToIndex:customElem.length - 1];
        }
        [dict setValue:customElem forKey:@"customElem"];
        NSDictionary *result = [dict copy];
        succ(result);
    } else if (msg.elemType == V2TIM_ELEM_TYPE_IMAGE) {
        int index = 0;
        for (V2TIMImage *imageElem in msg.imageElem.imageList) {
            index = index + 1;
            NSString *imagePath = [NSTemporaryDirectory() stringByAppendingPathComponent:[NSString stringWithFormat: @"im_image%@",imageElem.uuid]];
            if (![[NSFileManager defaultManager] fileExistsAtPath:imagePath]) {
                if (isDownload == NO && msg.imageElem.path) {
                    switch (imageElem.type) {
                        case V2TIM_IMAGE_TYPE_ORIGIN:
                            [dict setValue:[self parseMessageImage:imageElem imagePath:msg.imageElem.path] forKey:@"imageOriginal"];
                            break;
                        case V2TIM_IMAGE_TYPE_THUMB:
                            [dict setValue:[self parseMessageImage:imageElem imagePath:msg.imageElem.path] forKey:@"imageThumb"];
                            break;
                        case V2TIM_IMAGE_TYPE_LARGE:
                            [dict setValue:[self parseMessageImage:imageElem imagePath:msg.imageElem.path] forKey:@"imageLarge"];
                            break;
                    }
                    if (index == [msg.imageElem.imageList count]) {
                        NSDictionary *result = [dict copy];
                        succ(result);
                    }
                } else {
                    switch (imageElem.type) {
                        case V2TIM_IMAGE_TYPE_ORIGIN:
                            [dict setValue:[self parseMessageImage:imageElem imagePath:imagePath] forKey:@"imageOriginal"];
                            break;
                        case V2TIM_IMAGE_TYPE_THUMB:
                            
                            break;
                        case V2TIM_IMAGE_TYPE_LARGE:
                            [dict setValue:[self parseMessageImage:imageElem imagePath:imagePath] forKey:@"imageLarge"];
                            break;
                    }
                    [imageElem downloadImage:imagePath progress:^(NSInteger curSize, NSInteger totalSize) {
                        
                    } succ:^{
                        if (imageElem.type == V2TIM_IMAGE_TYPE_THUMB) {
                            [dict setValue:[self parseMessageImage:imageElem imagePath:imagePath] forKey:@"imageThumb"];
                            NSDictionary *result = [dict copy];
                            succ(result);
                        }
                    } fail:^(int code, NSString *desc) {
                        NSDictionary *result = [dict copy];
                        succ(result);
                    }];
                }
            } else {
                switch (imageElem.type) {
                    case V2TIM_IMAGE_TYPE_ORIGIN:
                        [dict setValue:[self parseMessageImage:imageElem imagePath:imagePath] forKey:@"imageOriginal"];
                        break;
                    case V2TIM_IMAGE_TYPE_THUMB:
                        [dict setValue:[self parseMessageImage:imageElem imagePath:imagePath] forKey:@"imageThumb"];
                        break;
                    case V2TIM_IMAGE_TYPE_LARGE:
                        [dict setValue:[self parseMessageImage:imageElem imagePath:imagePath] forKey:@"imageLarge"];
                        break;
                }
                if (index == [msg.imageElem.imageList count]) {
                    NSDictionary *result = [dict copy];
                    succ(result);
                }
            }
        }
    } else if (msg.elemType == V2TIM_ELEM_TYPE_SOUND) {
        V2TIMSoundElem *soundElem = msg.soundElem;
        NSString *soundPath = [NSTemporaryDirectory() stringByAppendingPathComponent:[NSString stringWithFormat: @"im_sound%@",soundElem.uuid]];
        if (![[NSFileManager defaultManager] fileExistsAtPath:soundPath]) {
            if (isDownload == NO && msg.soundElem.path) {
                [dict setValue:[self parseMessageSound:soundElem soundPath:[@"file://" stringByAppendingString:msg.soundElem.path]] forKey:@"soundElem"];
                NSDictionary *result = [dict copy];
                succ(result);
            } else {
                [soundElem downloadSound:soundPath progress:^(NSInteger curSize, NSInteger totalSize) {
                    
                } succ:^{
                    [dict setValue:[self parseMessageSound:soundElem soundPath:[@"file://" stringByAppendingString:soundPath]] forKey:@"soundElem"];
                    NSDictionary *result = [dict copy];
                    succ(result);
                } fail:^(int code, NSString *desc) {
                    NSDictionary *result = [dict copy];
                    succ(result);
                }];
            }
        } else {
            [dict setValue:[self parseMessageSound:soundElem soundPath:[@"file://" stringByAppendingString:soundPath]] forKey:@"soundElem"];
            NSDictionary *result = [dict copy];
            succ(result);
        }
    }
}

-(NSDictionary *)parseMessageImage:(V2TIMImage *)imageElem imagePath:(NSString*)imagePath {
    return @{
        @"uuid": imageElem.uuid,
        @"type": @(imageElem.type),
        @"width": @(imageElem.width),
        @"height": @(imageElem.height),
        @"url": imagePath
    };
}

-(NSDictionary *)parseMessageSound:(V2TIMSoundElem *)soundElem soundPath:(NSString*)soundPath {
    return @{
        @"path": soundPath,
        @"uuid": soundElem.uuid,
        @"dataSize": @(soundElem.dataSize),
        @"duration": @(soundElem.duration)
    };
}

@end
