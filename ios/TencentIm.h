// TencentIm.h

#import <ImSDK/ImSDK.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface TencentIm : RCTEventEmitter <RCTBridgeModule, V2TIMSDKListener, V2TIMAdvancedMsgListener, V2TIMConversationListener>

@end
