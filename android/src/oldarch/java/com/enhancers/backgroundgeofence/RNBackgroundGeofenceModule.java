package com.enhancers.backgroundgeofence;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

public class RNBackgroundGeofenceModule extends ReactContextBaseJavaModule implements LifecycleEventListener {

    private final RNBackgroundGeofenceModuleImpl impl;

    public RNBackgroundGeofenceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        impl = new RNBackgroundGeofenceModuleImpl(reactContext);
        reactContext.addLifecycleEventListener(this);
    }

    @NonNull
    @Override
    public String getName() {
        return RNBackgroundGeofenceModuleImpl.NAME;
    }

    @ReactMethod
    public void removeAll(Promise promise) {
        impl.removeAll(promise);
    }

    @ReactMethod
    public void removeGeofence(String boundaryRequestId, Promise promise) {
        impl.removeGeofence(boundaryRequestId, promise);
    }

    @ReactMethod
    public void removeGeofence(ReadableArray readableArray, Promise promise) {
        impl.removeGeofence(readableArray, promise);
    }

    @ReactMethod
    public void addGeofence(ReadableMap config, Promise promise) {
        impl.addGeofence(config, promise);
    }

    @ReactMethod
    public void addGeofence(ReadableArray readableArray, Promise promise) {
        impl.addGeofence(readableArray, promise);
    }

    @ReactMethod
    public void checkStatus(Callback success, Callback failure) {
        impl.checkStatus(success, failure);
    }

    @ReactMethod
    public void triggetTestEvent(String event) {
        impl.triggetTestEvent(event);
    }

    @ReactMethod
    public void endTask(double taskKey) {
        impl.endTask(taskKey);
    }

    @ReactMethod
    public void addListener(String eventName) {
        impl.addListener(eventName);
    }

    @ReactMethod
    public void removeListeners(double count) {
        impl.removeListeners(count);
    }

    @Override
    public void onHostResume() {}

    @Override
    public void onHostPause() {}

    @Override
    public void onHostDestroy() {}
}
