// TencentImModule.java

package com.byronim;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.tencent.imsdk.v2.V2TIMAdvancedMsgListener;
import com.tencent.imsdk.v2.V2TIMCallback;
import com.tencent.imsdk.v2.V2TIMConversation;
import com.tencent.imsdk.v2.V2TIMConversationListener;
import com.tencent.imsdk.v2.V2TIMConversationManager;
import com.tencent.imsdk.v2.V2TIMConversationResult;
import com.tencent.imsdk.v2.V2TIMDownloadCallback;
import com.tencent.imsdk.v2.V2TIMElem;
import com.tencent.imsdk.v2.V2TIMFriendInfo;
import com.tencent.imsdk.v2.V2TIMFriendOperationResult;
import com.tencent.imsdk.v2.V2TIMFriendshipManager;
import com.tencent.imsdk.v2.V2TIMGroupListener;
import com.tencent.imsdk.v2.V2TIMGroupManager;
import com.tencent.imsdk.v2.V2TIMGroupMemberFullInfo;
import com.tencent.imsdk.v2.V2TIMGroupMemberInfo;
import com.tencent.imsdk.v2.V2TIMGroupMemberInfoResult;
import com.tencent.imsdk.v2.V2TIMImageElem;
import com.tencent.imsdk.v2.V2TIMManager;
import com.tencent.imsdk.v2.V2TIMMessage;
import com.tencent.imsdk.v2.V2TIMMessageManager;
import com.tencent.imsdk.v2.V2TIMSDKConfig;
import com.tencent.imsdk.v2.V2TIMSDKListener;
import com.tencent.imsdk.v2.V2TIMSendCallback;
import com.tencent.imsdk.v2.V2TIMSoundElem;
import com.tencent.imsdk.v2.V2TIMUserFullInfo;
import com.tencent.imsdk.v2.V2TIMValueCallback;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class TencentImModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter;
    private V2TIMManager manager;
    private V2TIMMessageManager messageManager;
    private V2TIMConversationManager conversationManager;
    private V2TIMGroupManager groupManager;
    private V2TIMFriendshipManager friendshipManager;
    private V2TIMMessage lastMsg;
    private int indexConversation = 0;
    private int indexMessage = 0;

    public TencentImModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "TencentIm";
    }

    @ReactMethod
    public void initSDK(int sdkAppID, int logLevel, Promise promise) {
        if (manager == null) {
            manager = V2TIMManager.getInstance();
            messageManager = V2TIMManager.getMessageManager();
            conversationManager = V2TIMManager.getConversationManager();
            groupManager = V2TIMManager.getGroupManager();
            friendshipManager = V2TIMManager.getFriendshipManager();
        }
        V2TIMSDKConfig config = new V2TIMSDKConfig();
        switch (logLevel) {
            case 3:
                config.setLogLevel(V2TIMSDKConfig.V2TIM_LOG_DEBUG);
                break;
            case 4:
                config.setLogLevel(V2TIMSDKConfig.V2TIM_LOG_INFO);
                break;
            case 5:
                config.setLogLevel(V2TIMSDKConfig.V2TIM_LOG_WARN);
                break;
            case 6:
                config.setLogLevel(V2TIMSDKConfig.V2TIM_LOG_ERROR);
                break;
            default:
                config.setLogLevel(V2TIMSDKConfig.V2TIM_LOG_NONE);
                break;
        }
        eventEmitter = reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
        manager.initSDK(reactContext, sdkAppID, config, v2TIMSDKListener);
        messageManager.addAdvancedMsgListener(v2TIMAdvancedMsgListener);
        conversationManager.setConversationListener(v2TIMConversationListener);
        manager.setGroupListener(v2TIMGroupListener);
        promise.resolve(null);
    }

    @ReactMethod
    public void login(String userID, String userSig, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        if (manager.getLoginStatus() != V2TIMManager.V2TIM_STATUS_LOGOUT) {
            promise.resolve(null);
            return;
        }
        manager.login(userID, userSig, new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess() {
                promise.resolve(null);
            }
        });
    }

    @ReactMethod
    public void logout(Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        manager.logout(new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess() {
                promise.resolve(null);
            }
        });
    }

    @ReactMethod
    public void setSelfInfo(ReadableMap params, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        V2TIMUserFullInfo info = new V2TIMUserFullInfo();
        if (params.getString("nickName") != null) {
            info.setNickname(params.getString("nickName"));
        }
        if (params.getString("faceURL") != null) {
            info.setFaceUrl(params.getString("faceURL"));
        }
        if (params.getString("selfSignature") != null) {
            info.setSelfSignature(params.getString("selfSignature"));
        }
        info.setGender(params.getInt("gender"));
        manager.setSelfInfo(info, new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess() {
                promise.resolve(null);
            }
        });
    }

    @ReactMethod
    public void markC2CMessageAsRead(String userID, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        messageManager.markC2CMessageAsRead(userID, new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess() {
                promise.resolve(null);
            }
        });
    }

    @ReactMethod
    public void markGroupMessageAsRead(String groupID, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        messageManager.markGroupMessageAsRead(groupID, new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess() {
                promise.resolve(null);
            }
        });
    }

    @ReactMethod
    public void addToBlackList(ReadableArray userIDList, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        List<String> list = new ArrayList<>();
        for (int i = 0; i < userIDList.size(); i++) {
            list.add(userIDList.getString(i));
        }
        friendshipManager.addToBlackList(list, new V2TIMValueCallback<List<V2TIMFriendOperationResult>>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(List<V2TIMFriendOperationResult> v2TIMFriendOperationResults) {
                promise.resolve(null);
            }
        });
    }

    @ReactMethod
    public void deleteFromBlackList(ReadableArray userIDList, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        List<String> list = new ArrayList<>();
        for (int i = 0; i < userIDList.size(); i++) {
            list.add(userIDList.getString(i));
        }
        friendshipManager.deleteFromBlackList(list, new V2TIMValueCallback<List<V2TIMFriendOperationResult>>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(List<V2TIMFriendOperationResult> v2TIMFriendOperationResults) {
                promise.resolve(null);
            }
        });
    }

    @ReactMethod
    public void getBlackList(Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        friendshipManager.getBlackList(new V2TIMValueCallback<List<V2TIMFriendInfo>>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(List<V2TIMFriendInfo> v2TIMFriendInfos) {
                WritableArray arr = Arguments.createArray();
                for (V2TIMFriendInfo item : v2TIMFriendInfos) {
                    WritableMap map = Arguments.createMap();
                    map.putString("userID", item.getUserID());
                    map.putString("nickName", item.getUserProfile().getNickName());
                    map.putString("faceURL", item.getUserProfile().getFaceUrl());
                    map.putString("friendRemark", item.getFriendRemark());
                    map.putString("selfSignature", item.getUserProfile().getSelfSignature());
                    map.putInt("gender", item.getUserProfile().getGender());
                    arr.pushMap(map);
                }
                promise.resolve(arr);
            }
        });
    }

    @ReactMethod
    public void getC2CHistoryMessageList(String userID, int size, boolean isFirst, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        if (isFirst) {
            lastMsg = null;
        }
        indexMessage = 0;
        messageManager.getC2CHistoryMessageList(userID, size, lastMsg, new V2TIMValueCallback<List<V2TIMMessage>>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(final List<V2TIMMessage> v2TIMMessages) {
                if (v2TIMMessages.size() != 0) {
                    lastMsg = v2TIMMessages.get(v2TIMMessages.size() - 1);
                }
                WritableArray msgArr = Arguments.createArray();
                for (V2TIMMessage item : v2TIMMessages) {
                    parseMessage(item, item.getMsgID() + "C2CHistoryMessageList", new MapCallback() {
                        @Override
                        public void onSuccess(WritableMap map) {
                            msgArr.pushMap(map);
                            indexMessage = indexMessage + 1;
                            if (indexMessage == v2TIMMessages.size()) {
                                indexMessage = 0;
                                promise.resolve(msgArr);
                            }
                        }
                    });
                }
            }
        });
    }

    @ReactMethod
    public void getConversationList(int page, int size, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        indexConversation = 0;
        conversationManager.getConversationList(page, size, new V2TIMValueCallback<V2TIMConversationResult>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(V2TIMConversationResult v2TIMConversationResult) {
                WritableMap body = Arguments.createMap();
                WritableArray msgArr = Arguments.createArray();
                body.putInt("page", (int) v2TIMConversationResult.getNextSeq());
                body.putBoolean("is_finished", v2TIMConversationResult.isFinished());
                if (v2TIMConversationResult.getConversationList().size() == 0) {
                    body.putArray("data", msgArr);
                    promise.resolve(body);
                    return;
                }
                for (V2TIMConversation item : v2TIMConversationResult.getConversationList()) {
                    WritableMap data = Arguments.createMap();
                    data.putInt("type", item.getType());
                    data.putString("conversationID", item.getConversationID());
                    data.putString("userID", item.getUserID());
                    data.putString("groupID", item.getGroupID());
                    data.putString("groupType", item.getGroupType());
                    data.putString("showName", item.getShowName());
                    data.putString("faceUrl", item.getFaceUrl());
                    data.putInt("unreadCount", item.getUnreadCount());
                    data.putInt("recvOpt", item.getRecvOpt());
                    parseMessage(item.getLastMessage(), item.getLastMessage().getMsgID() + "ConversationList", new MapCallback() {
                        @Override
                        public void onSuccess(WritableMap map) {
                            data.putMap("lastMessage", map);
                            msgArr.pushMap(data);
                            indexConversation = indexConversation + 1;
                            if (indexConversation == v2TIMConversationResult.getConversationList().size()) {
                                body.putArray("data", msgArr);
                                indexConversation = 0;
                                promise.resolve(body);
                            }
                        }
                    });
                }
            }
        });
    }

    @ReactMethod
    public void deleteConversation(String conversationID, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        conversationManager.deleteConversation(conversationID, new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess() {
                promise.resolve(null);
            }
        });
    }

    @ReactMethod
    public void getGroupMemberList(String groupID, int page, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        groupManager.getGroupMemberList(groupID, page, V2TIMGroupMemberFullInfo.V2TIM_GROUP_MEMBER_FILTER_ALL, new V2TIMValueCallback<V2TIMGroupMemberInfoResult>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(V2TIMGroupMemberInfoResult v2TIMGroupMemberInfoResult) {
                WritableMap body = Arguments.createMap();
                WritableArray msgArr = Arguments.createArray();
                body.putInt("page", (int) v2TIMGroupMemberInfoResult.getNextSeq());
                for (V2TIMGroupMemberFullInfo item : v2TIMGroupMemberInfoResult.getMemberInfoList()) {
                    WritableMap data = Arguments.createMap();
                    data.putInt("role", item.getRole());
                    data.putInt("muteUntil", (int) item.getMuteUntil());
                    data.putInt("joinTime", (int) item.getJoinTime());
                    data.putString("userID", item.getUserID());
                    data.putString("nickName", item.getNickName());
                    data.putString("friendRemark", item.getFriendRemark());
                    data.putString("nameCard", item.getNameCard());
                    data.putString("faceURL", item.getFaceUrl());
                    msgArr.pushMap(data);
                }
                body.putArray("data", msgArr);
                promise.resolve(body);
            }
        });
    }

    @ReactMethod
    public void sendC2CTextMessage(String text, String userID, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        manager.sendC2CTextMessage(text, userID, new V2TIMValueCallback<V2TIMMessage>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                parseMessage(v2TIMMessage, v2TIMMessage.getMsgID() + "C2CTextMessage", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        promise.resolve(map);
                    }
                });
            }
        });
    }

    @ReactMethod
    public void sendC2CCustomMessage(String userID, ReadableMap params, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        String customData = params.toString();
        if (customData.startsWith("{ NativeMap:")) {
            customData = customData.substring(12, customData.length() - 1);
        }
        manager.sendC2CCustomMessage(customData.getBytes(), userID, new V2TIMValueCallback<V2TIMMessage>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                parseMessage(v2TIMMessage, v2TIMMessage.getMsgID() + "C2CCustomMessage", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        promise.resolve(map);
                    }
                });
            }
        });
    }

    @ReactMethod
    public void sendImageMessage(String userID, String imagePath, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        messageManager.sendMessage(messageManager.createImageMessage(imagePath), userID, null, V2TIMMessage.V2TIM_PRIORITY_DEFAULT, false, null, new V2TIMSendCallback<V2TIMMessage>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                parseMessage(v2TIMMessage, v2TIMMessage.getMsgID() + "ImageMessage", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        promise.resolve(map);
                    }
                });
            }

            @Override
            public void onProgress(int progress) {
                // 上传进度（0-100）
            }
        });
    }

    @ReactMethod
    public void sendSoundMessage(String userID, String soundPath, int duration, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        messageManager.sendMessage(messageManager.createSoundMessage(soundPath, duration), userID, null, V2TIMMessage.V2TIM_PRIORITY_DEFAULT, false, null, new V2TIMSendCallback<V2TIMMessage>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                parseMessage(v2TIMMessage, v2TIMMessage.getMsgID() + "SoundMessage", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        promise.resolve(map);
                    }
                });
            }

            @Override
            public void onProgress(int progress) {
                // 上传进度（0-100）
            }
        });
    }

    @ReactMethod
    public void sendGroupTextMessage(String text, String groupID, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        manager.sendGroupTextMessage(text, groupID, V2TIMMessage.V2TIM_PRIORITY_DEFAULT, new V2TIMValueCallback<V2TIMMessage>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                parseMessage(v2TIMMessage, v2TIMMessage.getMsgID() + "GroupTextMessage", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        promise.resolve(map);
                    }
                });
            }
        });
    }

    @ReactMethod
    public void sendGroupAtTextMessage(String text, String groupID, ReadableArray userID_userName, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        List<String> atList = new ArrayList<>();
        for (int i = 0; i < userID_userName.size(); i++) {
            atList.add(userID_userName.getString(i));
        }
        messageManager.sendMessage(messageManager.createTextAtMessage(text, atList), null, groupID, V2TIMMessage.V2TIM_PRIORITY_DEFAULT, false, null, new V2TIMSendCallback<V2TIMMessage>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                parseMessage(v2TIMMessage, v2TIMMessage.getMsgID() + "GroupAtTextMessage", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        promise.resolve(map);
                    }
                });
            }

            @Override
            public void onProgress(int progress) {

            }
        });
    }

    @ReactMethod
    public void sendGroupCustomMessage(String groupID, ReadableMap params, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        String customData = params.toString();
        if (customData.startsWith("{ NativeMap:")) {
            customData = customData.substring(12, customData.length() - 1);
        }
        manager.sendGroupCustomMessage(customData.getBytes(), groupID, V2TIMMessage.V2TIM_PRIORITY_DEFAULT, new V2TIMValueCallback<V2TIMMessage>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                parseMessage(v2TIMMessage, v2TIMMessage.getMsgID() + "GroupCustomMessage", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        promise.resolve(map);
                    }
                });
            }
        });
    }

    @ReactMethod
    public void sendGroupImageMessage(String groupID, String imagePath, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        messageManager.sendMessage(messageManager.createImageMessage(imagePath), null, groupID, V2TIMMessage.V2TIM_PRIORITY_DEFAULT, false, null, new V2TIMSendCallback<V2TIMMessage>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                parseMessage(v2TIMMessage, v2TIMMessage.getMsgID() + "GroupImageMessage", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        promise.resolve(map);
                    }
                });
            }

            @Override
            public void onProgress(int progress) {

            }
        });
    }

    @ReactMethod
    public void sendGroupSoundMessage(String groupID, String soundPath, int duration, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        messageManager.sendMessage(messageManager.createSoundMessage(soundPath, duration), null, groupID, V2TIMMessage.V2TIM_PRIORITY_DEFAULT, false, null, new V2TIMSendCallback<V2TIMMessage>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                parseMessage(v2TIMMessage, v2TIMMessage.getMsgID() + "GroupSoundMessage", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        promise.resolve(map);
                    }
                });
            }

            @Override
            public void onProgress(int progress) {

            }
        });
    }

    @ReactMethod
    public void joinGroup(String groupID, String msg, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        manager.joinGroup(groupID, msg, new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess() {
                promise.resolve(null);
            }
        });
    }

    @ReactMethod
    public void quitGroup(String groupID, Promise promise) {
        if (manager == null) {
            promise.reject("404", "manager");
            return;
        }
        manager.quitGroup(groupID, new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(String.valueOf(var1), var2);
            }

            @Override
            public void onSuccess() {
                promise.resolve(null);
            }
        });
    }

    private final V2TIMSDKListener v2TIMSDKListener = new V2TIMSDKListener() {
        @Override
        public void onConnecting() {
            // 正在连接到腾讯云服务器
            eventEmitter.emit("Connecting", null);
        }

        @Override
        public void onConnectSuccess() {
            // 已经成功连接到腾讯云服务器
            eventEmitter.emit("ConnectSuccess", null);
        }

        @Override
        public void onConnectFailed(int code, String error) {
            // 连接腾讯云服务器失败
            eventEmitter.emit("ConnectFailed", null);
        }

        @Override
        public void onKickedOffline() {
            // 当前用户被踢下线
            eventEmitter.emit("KickedOffline", null);
        }

        @Override
        public void onUserSigExpired() {
            // 登录票据已经过期
            eventEmitter.emit("UserSigExpired", null);
        }

        @Override
        public void onSelfInfoUpdated(V2TIMUserFullInfo info) {
            // 当前用户的资料发生了更新
            eventEmitter.emit("SelfInfoUpdated", null);
        }
    };

    private final V2TIMConversationListener v2TIMConversationListener = new V2TIMConversationListener() {
        @Override
        public void onNewConversation(List<V2TIMConversation> conversationList) {
            if (conversationList.size() == 0) {
                return;
            }
            V2TIMConversation item = conversationList.get(0);
            WritableMap data = Arguments.createMap();
            data.putInt("type", item.getType());
            data.putString("conversationID", item.getConversationID());
            data.putString("userID", item.getUserID());
            data.putString("groupID", item.getGroupID());
            data.putString("groupType", item.getGroupType());
            data.putString("showName", item.getShowName());
            data.putString("faceUrl", item.getFaceUrl());
            data.putInt("unreadCount", item.getUnreadCount());
            data.putInt("recvOpt", item.getRecvOpt());
            if (item.getType() == V2TIMConversation.V2TIM_C2C) {
                parseMessage(item.getLastMessage(), item.getLastMessage().getMsgID() + "NewConversation", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        data.putMap("lastMessage", map);
                        eventEmitter.emit("NewConversation", data);
                    }
                });
            } else {
                parseMessage(item.getLastMessage(), item.getLastMessage().getMsgID() + "NewConversationGroup", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        data.putMap("lastMessage", map);
                        eventEmitter.emit("NewConversationGroup", data);
                    }
                });
            }
        }

        @Override
        public void onConversationChanged(List<V2TIMConversation> conversationList) {
            if (conversationList.size() == 0) {
                return;
            }
            V2TIMConversation item = conversationList.get(0);
            WritableMap data = Arguments.createMap();
            data.putInt("type", item.getType());
            data.putString("conversationID", item.getConversationID());
            data.putString("userID", item.getUserID());
            data.putString("groupID", item.getGroupID());
            data.putString("groupType", item.getGroupType());
            data.putString("showName", item.getShowName());
            data.putString("faceUrl", item.getFaceUrl());
            data.putInt("unreadCount", item.getUnreadCount());
            data.putInt("recvOpt", item.getRecvOpt());
            if (item.getType() == V2TIMConversation.V2TIM_C2C) {
                parseMessage(item.getLastMessage(), item.getLastMessage().getMsgID() + "ConversationChanged", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        data.putMap("lastMessage", map);
                        eventEmitter.emit("ConversationChanged", data);
                    }
                });
            } else {
                parseMessage(item.getLastMessage(), item.getLastMessage().getMsgID() + "ConversationChangedGroup", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        data.putMap("lastMessage", map);
                        eventEmitter.emit("ConversationChangedGroup", data);
                    }
                });
            }
        }
    };

    private final V2TIMGroupListener v2TIMGroupListener = new V2TIMGroupListener() {
        @Override
        public void onMemberEnter(String groupID, List<V2TIMGroupMemberInfo> memberList) {
            WritableArray listArr = Arguments.createArray();
            for (V2TIMGroupMemberInfo item : memberList) {
                WritableMap map = Arguments.createMap();
                map.putString("userID", item.getUserID());
                map.putString("nickName", item.getNickName());
                map.putString("friendRemark", item.getFriendRemark());
                map.putString("nameCard", item.getNameCard());
                map.putString("faceURL", item.getFaceUrl());
                listArr.pushMap(map);
            }
            WritableMap body = Arguments.createMap();
            body.putArray("data", listArr);
            eventEmitter.emit("MemberEnter", body);
        }

        @Override
        public void onMemberLeave(String groupID, V2TIMGroupMemberInfo member) {
            WritableMap map = Arguments.createMap();
            map.putString("userID", member.getUserID());
            map.putString("nickName", member.getNickName());
            map.putString("friendRemark", member.getFriendRemark());
            map.putString("nameCard", member.getNameCard());
            map.putString("faceURL", member.getFaceUrl());
            WritableMap body = Arguments.createMap();
            body.putMap("data", map);
            eventEmitter.emit("MemberLeave", body);
        }
    };

    private final V2TIMAdvancedMsgListener v2TIMAdvancedMsgListener = new V2TIMAdvancedMsgListener() {
        @Override
        public void onRecvNewMessage(V2TIMMessage msg) {
            if (msg.getGroupID() == null || msg.getGroupID().isEmpty()) {
                parseMessage(msg, msg.getMsgID() + "NewMessage", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        eventEmitter.emit("NewMessage", map);
                    }
                });
            } else {
                parseMessage(msg, msg.getMsgID() + "NewMessageGroup", new MapCallback() {
                    @Override
                    public void onSuccess(WritableMap map) {
                        eventEmitter.emit("NewMessageGroup", map);
                    }
                });
            }
        }
    };

    public void parseMessage(V2TIMMessage msg, String key, MapCallback cb) {
        WritableMap map = Arguments.createMap();

        WritableArray groupAtUserList = Arguments.createArray();
        for (String str : msg.getGroupAtUserList()) {
            groupAtUserList.pushString(str);
        }

        WritableMap textElem = Arguments.createMap();
        if (msg.getElemType() == V2TIMMessage.V2TIM_ELEM_TYPE_TEXT) {
            textElem.putString("text", msg.getTextElem().getText());
        } else {
            textElem.putString("text", "");
        }
        map.putString("msgID", msg.getMsgID());
        map.putInt("timestamp", (int) msg.getTimestamp());
        map.putString("sender", msg.getSender());
        map.putString("nickName", msg.getNickName());
        map.putString("friendRemark", msg.getFriendRemark());
        map.putString("nameCard", msg.getNameCard());
        map.putString("faceURL", msg.getFaceUrl());
        map.putString("groupID", msg.getGroupID());
        map.putString("userID", msg.getUserID());
        map.putInt("status", msg.getStatus());
        map.putBoolean("isSelf", msg.isSelf());
        map.putBoolean("isRead", msg.isRead());
        map.putBoolean("isPeerRead", msg.isPeerRead());
        map.putArray("groupAtUserList", groupAtUserList);
        map.putInt("elemType", msg.getElemType());
        map.putMap("textElem", textElem);
        if (msg.getElemType() == V2TIMMessage.V2TIM_ELEM_TYPE_CUSTOM) {
            String customElem = new String(msg.getCustomElem().getData());
            map.putString("customElem", customElem);
            cb.onSuccess(map);
        } else if (msg.getElemType() == V2TIMMessage.V2TIM_ELEM_TYPE_IMAGE) {
            int index = 0;
            for (V2TIMImageElem.V2TIMImage v2TIMImage : msg.getImageElem().getImageList()) {
                index = index + 1;
                String uuid = v2TIMImage.getUUID();
                WritableMap data = Arguments.createMap();
                String imagePath = reactContext.getFilesDir().getPath() + "/im_image/" + uuid;
                File imageFile = new File(imagePath);
                data.putString("uuid", uuid);
                data.putInt("type", v2TIMImage.getType());
                data.putInt("width", v2TIMImage.getWidth());
                data.putInt("height", v2TIMImage.getHeight());
                data.putString("url", "file://" + imagePath);
                switch (v2TIMImage.getType()) {
                    case V2TIMImageElem.V2TIM_IMAGE_TYPE_ORIGIN:
                        map.putMap("imageOriginal", data);
                        break;
                    case V2TIMImageElem.V2TIM_IMAGE_TYPE_THUMB:
                        map.putMap("imageThumb", data);
                        break;
                    case V2TIMImageElem.V2TIM_IMAGE_TYPE_LARGE:
                        map.putMap("imageLarge", data);
                        break;
                }
                File dir = imageFile.getParentFile();
                if (dir != null && !dir.exists()) {
                    if (!dir.mkdirs()) {
                        cb.onSuccess(map);
                        return;
                    }
                }
                if (!imageFile.exists()) {
                    v2TIMImage.downloadImage(imagePath, new V2TIMDownloadCallback() {
                        @Override
                        public void onProgress(V2TIMElem.V2ProgressInfo progressInfo) {

                        }

                        @Override
                        public void onError(int code, String desc) {
                            if (v2TIMImage.getType() == V2TIMImageElem.V2TIM_IMAGE_TYPE_THUMB) {
                                cb.onSuccess(map);
                            }
                        }

                        @Override
                        public void onSuccess() {
                            if (v2TIMImage.getType() == V2TIMImageElem.V2TIM_IMAGE_TYPE_THUMB) {
                                cb.onSuccess(map);
                            }
                        }
                    });
                } else {
                    if (index == msg.getImageElem().getImageList().size()) {
                        cb.onSuccess(map);
                    }
                }
            }
        } else if (msg.getElemType() == V2TIMMessage.V2TIM_ELEM_TYPE_SOUND) {
            V2TIMSoundElem v2TIMSoundElem = msg.getSoundElem();
            String uuid = v2TIMSoundElem.getUUID();
            WritableMap data = Arguments.createMap();
            String soundPath = reactContext.getFilesDir().getPath() + "/im_sound/" + uuid;
            data.putString("path", "file://" + soundPath);
            data.putString("uuid", uuid);
            data.putInt("dataSize", v2TIMSoundElem.getDataSize());
            data.putInt("duration", v2TIMSoundElem.getDuration());
            map.putMap("soundElem", data);
            File soundFile = new File(soundPath);
            if (!soundFile.exists()) {
                File dir = soundFile.getParentFile();
                if (dir != null && !dir.exists()) {
                    if (!dir.mkdirs()) {
                        cb.onSuccess(map);
                        return;
                    }
                }
                v2TIMSoundElem.downloadSound(soundPath, new V2TIMDownloadCallback() {
                    @Override
                    public void onProgress(V2TIMElem.V2ProgressInfo progressInfo) {

                    }

                    @Override
                    public void onError(int code, String desc) {
                        cb.onSuccess(map);
                    }

                    @Override
                    public void onSuccess() {
                        cb.onSuccess(map);
                    }
                });
            } else {
                cb.onSuccess(map);
            }
        } else {
            cb.onSuccess(map);
        }
    }

    public interface MapCallback {
        void onSuccess(WritableMap map);
    }
}
