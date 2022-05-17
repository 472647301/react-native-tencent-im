// TencentImModule.java

package com.byronim;

import android.annotation.SuppressLint;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.tencent.imsdk.v2.V2TIMAdvancedMsgListener;
import com.tencent.imsdk.v2.V2TIMDownloadCallback;
import com.tencent.imsdk.v2.V2TIMElem;
import com.tencent.imsdk.v2.V2TIMImageElem;
import com.tencent.imsdk.v2.V2TIMManager;
import com.tencent.imsdk.v2.V2TIMMessage;
import com.tencent.imsdk.v2.V2TIMMessageManager;
import com.tencent.imsdk.v2.V2TIMSDKConfig;
import com.tencent.imsdk.v2.V2TIMSDKListener;
import com.tencent.imsdk.v2.V2TIMUserFullInfo;

import java.io.File;
import java.util.List;

public class TencentImModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter;
    private V2TIMManager manager;
    private V2TIMMessageManager messageManager;

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
        }
        V2TIMSDKConfig config = new V2TIMSDKConfig();
        switch (logLevel) {
            case 0:
                config.setLogLevel(V2TIMSDKConfig.V2TIM_LOG_NONE);
                break;
            case 3:
                config.setLogLevel(V2TIMSDKConfig.V2TIM_LOG_DEBUG);
                break;
            case 5:
                config.setLogLevel(V2TIMSDKConfig.V2TIM_LOG_WARN);
                break;
            case 6:
                config.setLogLevel(V2TIMSDKConfig.V2TIM_LOG_ERROR);
                break;
            default:
                config.setLogLevel(V2TIMSDKConfig.V2TIM_LOG_INFO);
                break;
        }
        eventEmitter = reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
        manager.initSDK(reactContext, sdkAppID, config, v2TIMSDKListener);
        messageManager.addAdvancedMsgListener(v2TIMAdvancedMsgListener);
        promise.resolve(null);
    }

    private final V2TIMSDKListener v2TIMSDKListener = new V2TIMSDKListener() {
        // 5. 监听 V2TIMSDKListener 回调
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

    private final V2TIMAdvancedMsgListener v2TIMAdvancedMsgListener = new V2TIMAdvancedMsgListener() {
        @Override
        public void onRecvNewMessage(V2TIMMessage msg) {
            int elemType = msg.getElemType();
            WritableMap map = Arguments.createMap();
            map.putString("msg_id", msg.getMsgID());
            map.putString("nickname", msg.getNickName());
            map.putString("face_url", msg.getFaceUrl());
            map.putString("group_id", msg.getGroupID());
            map.putString("user_id", msg.getUserID());
            map.putString("sender", msg.getSender());
            WritableArray atArray = Arguments.createArray();
            for (String atUser : msg.getGroupAtUserList()) {
                atArray.pushString(atUser);
            }
            map.putArray("at", atArray);
            // 文本消息
            if (elemType == V2TIMMessage.V2TIM_ELEM_TYPE_TEXT) {
                WritableMap data = Arguments.createMap();
                data.putMap("info", map);
                data.putString("data", msg.getTextElem().getText());
                data.putString("type", "text");
                eventEmitter.emit("SelfInfoUpdated", data);
            }
            else if (elemType == V2TIMMessage.V2TIM_ELEM_TYPE_IMAGE) {
                V2TIMImageElem v2TIMImageElem = msg.getImageElem();
                List<V2TIMImageElem.V2TIMImage> imageList = v2TIMImageElem.getImageList();
                WritableArray imageArray = Arguments.createArray();
                for (V2TIMImageElem.V2TIMImage v2TIMImage : imageList) {
                    String uuid = v2TIMImage.getUUID(); // 图片 ID
                    @SuppressLint("SdCardPath") String imagePath = "/sdcard/im/image/" + uuid;
                    File imageFile = new File(imagePath);
                    if (imageFile.exists()) {
                        v2TIMImage.downloadImage(imagePath, new V2TIMDownloadCallback() {
                            @Override
                            public void onProgress(V2TIMElem.V2ProgressInfo progressInfo) {

                            }
                            @Override
                            public void onError(int code, String desc) {

                            }
                            @Override
                            public void onSuccess() {
                                imageArray.pushString(imagePath);
                            }
                        });
                    } else {
                        imageArray.pushString(imagePath);
                    }
                }
                WritableMap data = Arguments.createMap();
                data.putMap("info", map);
                data.putArray("data", imageArray);
                data.putString("type", "text");
                eventEmitter.emit("SelfInfoUpdated", data);
            }
        }
    };
}
