package com.enhancers.backgroundgeofence;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

public class RNBackgroundGeofenceModule extends NativeBackgroundGeofenceSpec {

    private final RNBackgroundGeofenceModuleImpl impl;

    public RNBackgroundGeofenceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        impl = new RNBackgroundGeofenceModuleImpl(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return RNBackgroundGeofenceModuleImpl.NAME;
    }

    @Override
    public void removeAll(Promise promise) {
        impl.removeAll(promise);
    }

    @Override
    public void removeGeofence(String boundaryRequestId, Promise promise) {
        impl.removeGeofence(boundaryRequestId, promise);
    }

    @Override
    public void addGeofence(ReadableMap config, Promise promise) {
        impl.addGeofence(config, promise);
    }

    @Override
    public void checkStatus(Callback success, Callback failure) {
        impl.checkStatus(success, failure);
    }

    @Override
    public void triggetTestEvent(String event) {
        impl.triggetTestEvent(event);
    }

    @Override
    public void endTask(double taskKey) {
        impl.endTask(taskKey);
    }

    @Override
    public void addListener(String eventName) {
        impl.addListener(eventName);
    }

    @Override
    public void removeListeners(double count) {
        impl.removeListeners(count);
    }
}
