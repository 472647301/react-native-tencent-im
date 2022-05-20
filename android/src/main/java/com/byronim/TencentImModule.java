// TencentImModule.java

package com.byronim;

import android.annotation.SuppressLint;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
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
import com.tencent.imsdk.v2.V2TIMGroupListener;
import com.tencent.imsdk.v2.V2TIMGroupMemberInfo;
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
    private V2TIMMessage lastMsg;

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
            return;
        }
        if (manager.getLoginStatus() != V2TIMManager.V2TIM_STATUS_LOGOUT) {
            promise.resolve(null);
            return;
        }
        manager.login(userID, userSig, new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(var1 + "", new Exception(var2));
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
            return;
        }
        manager.logout(new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(var1 + "", new Exception(var2));
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
            return;
        }
        V2TIMUserFullInfo info = new V2TIMUserFullInfo();
        info.setNickname(params.getString("nickName"));
        info.setFaceUrl(params.getString("faceURL"));
        manager.setSelfInfo(info, new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(var1 + "", new Exception(var2));
            }
            @Override
            public void onSuccess() {
                promise.resolve(null);
            }
        });
    }

    @ReactMethod
    public void getC2CHistoryMessageList(String userID, int size, boolean isFirst, Promise promise) {
        if (manager == null) {
            return;
        }
        if (isFirst) {
            lastMsg = null;
        }
        messageManager.getC2CHistoryMessageList(userID, size, lastMsg, new V2TIMValueCallback<List<V2TIMMessage>>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(var1 + "", new Exception(var2));
            }
            @Override
            public void onSuccess(final List<V2TIMMessage> v2TIMMessages) {
                if (v2TIMMessages.size() != 0) {
                    lastMsg = v2TIMMessages.get(v2TIMMessages.size() - 1);
                }
                WritableArray msgArr = Arguments.createArray();
                for (V2TIMMessage item : v2TIMMessages) {
                    msgArr.pushMap(parseMessage(item));
                }
                promise.resolve(msgArr);
            }
        });
    }

    @ReactMethod
    public void getConversationList(int page, int size, Promise promise) {
        if (manager == null) {
            return;
        }
        conversationManager.getConversationList((long) page, size, new V2TIMValueCallback<V2TIMConversationResult>() {
            @Override
            public void onError(int code, String desc) {
                promise.reject(code + "", new Exception(desc));
            }
            @Override
            public void onSuccess(V2TIMConversationResult v2TIMConversationResult) {
                WritableArray msgArr = Arguments.createArray();
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
                    data.putMap("lastMessage", parseMessage(item.getLastMessage()));
                    msgArr.pushMap(data);
                }
                WritableMap body = Arguments.createMap();
                body.putInt("page", (int)v2TIMConversationResult.getNextSeq());
                body.putBoolean("is_finished", v2TIMConversationResult.isFinished());
                body.putArray("data", msgArr);
                promise.resolve(body);
            }
        });
    }

    @ReactMethod
    public void sendC2CTextMessage(String text, String userID, Promise promise) {
        if (manager == null) {
            return;
        }
        manager.sendC2CTextMessage(text, userID, new V2TIMValueCallback<V2TIMMessage>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(var1 + "", new Exception(var2));
            }
            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                promise.resolve(parseMessage(v2TIMMessage));
            }
        });
    }

    @ReactMethod
    public void markC2CMessageAsRead(String userID, Promise promise) {
        if (manager == null) {
            return;
        }
        messageManager.markC2CMessageAsRead(userID, new V2TIMCallback() {
            @Override
            public void onError(int i, String s) {
                promise.reject(i + "", new Exception(s));
            }

            @Override
            public void onSuccess() {
                promise.resolve(null);
            }
        });
    }

    @ReactMethod
    public void sendC2CCustomMessage(String userID, ReadableMap params, Promise promise) {
        if (manager == null) {
            return;
        }
        manager.sendC2CCustomMessage(params.toString().getBytes(), userID, new V2TIMValueCallback<V2TIMMessage>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(var1 + "", new Exception(var2));
            }
            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                promise.resolve(parseMessage(v2TIMMessage));
            }
        });
    }

    @ReactMethod
    public void sendImageMessage(String userID, String imagePath, Promise promise) {
        if (manager == null) {
            return;
        }
        messageManager.sendMessage(messageManager.createImageMessage(imagePath), userID, null, V2TIMMessage.V2TIM_PRIORITY_DEFAULT, false, null, new V2TIMSendCallback<V2TIMMessage>() {
            @Override
            public void onError(int code, String desc) {
                promise.reject(code + "", new Exception(desc));
            }
            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                promise.resolve(parseMessage(v2TIMMessage));
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
            return;
        }
        messageManager.sendMessage(messageManager.createSoundMessage(soundPath, duration), userID, null, V2TIMMessage.V2TIM_PRIORITY_DEFAULT, false, null, new V2TIMSendCallback<V2TIMMessage>() {
            @Override
            public void onError(int code, String desc) {
                promise.reject(code + "", new Exception(desc));
            }
            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                promise.resolve(parseMessage(v2TIMMessage));
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
            return;
        }
        manager.sendGroupTextMessage(text, groupID, V2TIMMessage.V2TIM_PRIORITY_NORMAL, new V2TIMValueCallback<V2TIMMessage>() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(var1 + "", new Exception(var2));
            }
            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                promise.resolve(parseMessage(v2TIMMessage));
            }
        });
    }

    @ReactMethod
    public void sendGroupAtTextMessage(String text, String groupID, String userID, Promise promise) {
        if (manager == null) {
            return;
        }
        List<String> atList = new ArrayList<>();
        atList.add(userID);
        messageManager.sendMessage(messageManager.createTextAtMessage(text, atList), null, groupID, V2TIMMessage.V2TIM_PRIORITY_DEFAULT, false, null, new V2TIMSendCallback<V2TIMMessage>() {
            @Override
            public void onError(int code, String desc) {
                promise.reject(code + "", new Exception(desc));
            }
            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                promise.resolve(parseMessage(v2TIMMessage));
            }
            @Override
            public void onProgress(int progress) {
                // 上传进度（0-100）
            }
        });
    }

    @ReactMethod
    public void sendGroupImageMessage(String groupID, String imagePath, Promise promise) {
        if (manager == null) {
            return;
        }
        messageManager.sendMessage(messageManager.createImageMessage(imagePath), null, groupID, V2TIMMessage.V2TIM_PRIORITY_DEFAULT, false, null, new V2TIMSendCallback<V2TIMMessage>() {
            @Override
            public void onError(int code, String desc) {
                promise.reject(code + "", new Exception(desc));
            }
            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                promise.resolve(parseMessage(v2TIMMessage));
            }
            @Override
            public void onProgress(int progress) {
                // 上传进度（0-100）
            }
        });
    }

    @ReactMethod
    public void sendGroupSoundMessage(String groupID, String soundPath, int duration, Promise promise) {
        if (manager == null) {
            return;
        }
        messageManager.sendMessage(messageManager.createSoundMessage(soundPath, duration), null, groupID, V2TIMMessage.V2TIM_PRIORITY_DEFAULT, false, null, new V2TIMSendCallback<V2TIMMessage>() {
            @Override
            public void onError(int code, String desc) {
                promise.reject(code + "", new Exception(desc));
            }
            @Override
            public void onSuccess(V2TIMMessage v2TIMMessage) {
                promise.resolve(parseMessage(v2TIMMessage));
            }
            @Override
            public void onProgress(int progress) {
                // 上传进度（0-100）
            }
        });
    }

    @ReactMethod
    public void joinGroup(String groupID, String msg, Promise promise) {
        if (manager == null) {
            return;
        }
        manager.joinGroup(groupID, msg, new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(var1 + "", new Exception(var2));
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
            return;
        }
        manager.quitGroup(groupID, new V2TIMCallback() {
            @Override
            public void onError(int var1, String var2) {
                promise.reject(var1 + "", new Exception(var2));
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
            eventEmitter.emit("NewConversation", null);
        }
        @Override
        public void onConversationChanged(List<V2TIMConversation> conversationList) {
            eventEmitter.emit("ConversationChanged", null);
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
            eventEmitter.emit("NewMessage", parseMessage(msg));
        }
    };

    public WritableMap parseMessage(V2TIMMessage msg) {
        WritableArray groupAtUserList = Arguments.createArray();
        for (String str : msg.getGroupAtUserList()) {
            groupAtUserList.pushString(str);
        }

        WritableArray imageElem = Arguments.createArray();
        if (msg.getElemType() == V2TIMMessage.V2TIM_ELEM_TYPE_IMAGE) {
            for (V2TIMImageElem.V2TIMImage v2TIMImage : msg.getImageElem().getImageList()) {
                String uuid = v2TIMImage.getUUID(); // 图片 ID
                WritableMap data = Arguments.createMap();
                String imagePath = reactContext.getFilesDir().getPath() + "/im_image/" + uuid;
                File imageFile = new File(imagePath);
                if (!imageFile.exists()) {
                    v2TIMImage.downloadImage(imagePath, new V2TIMDownloadCallback() {
                        @Override
                        public void onProgress(V2TIMElem.V2ProgressInfo progressInfo) {

                        }
                        @Override
                        public void onError(int code, String desc) {

                        }
                        @Override
                        public void onSuccess() {

                        }
                    });
                }
                data.putString("uuid", uuid);
                data.putInt("type", v2TIMImage.getType());
                data.putInt("width", v2TIMImage.getWidth());
                data.putInt("height", v2TIMImage.getHeight());
                data.putString("url", imageFile.exists() ? "file://" + imagePath : v2TIMImage.getUrl());
                imageElem.pushMap(data);
            }
        }

        WritableArray soundElem = Arguments.createArray();
        if (msg.getElemType() == V2TIMMessage.V2TIM_ELEM_TYPE_SOUND) {
            V2TIMSoundElem v2TIMSoundElem = msg.getSoundElem();
            String uuid = v2TIMSoundElem.getUUID();
            WritableMap data = Arguments.createMap();
            String soundPath = reactContext.getFilesDir().getPath() + "/im_sound/" + uuid;
            File soundFile = new File(soundPath);
            if (!soundFile.exists()) {
                v2TIMSoundElem.downloadSound(soundPath, new V2TIMDownloadCallback() {
                    @Override
                    public void onProgress(V2TIMElem.V2ProgressInfo progressInfo) {

                    }
                    @Override
                    public void onError(int code, String desc) {

                    }
                    @Override
                    public void onSuccess() {

                    }
                });
            }
            data.putString("path", soundFile.exists() ? "file://" + soundPath : v2TIMSoundElem.getPath());
            data.putString("uuid", uuid);
            data.putInt("dataSize", v2TIMSoundElem.getDataSize());
            data.putInt("duration", v2TIMSoundElem.getDuration());
            soundElem.pushMap(data);
        }

        WritableMap map = Arguments.createMap();
        WritableMap textElem = Arguments.createMap();
        if (msg.getElemType() == V2TIMMessage.V2TIM_ELEM_TYPE_TEXT) {
            textElem.putString("text", msg.getTextElem().getText());
        } else {
            textElem.putString("text", "");
        }
        map.putString("msgID", msg.getMsgID());
        map.putInt("timestamp", (int)msg.getTimestamp());
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
            map.putString("customElem", new String(msg.getCustomElem().getData()));
        } else {
            map.putString("customElem", "{}");
        }
        map.putArray("imageElem", imageElem);
        map.putArray("soundElem", soundElem);
        return map;
    };
}
