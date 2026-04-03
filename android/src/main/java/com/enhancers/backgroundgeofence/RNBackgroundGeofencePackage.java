package com.enhancers.backgroundgeofence;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.HashMap;
import java.util.Map;

public class RNBackgroundGeofencePackage extends TurboReactPackage {

    @Nullable
    @Override
    public NativeModule getModule(@NonNull String name, @NonNull ReactApplicationContext reactContext) {
        if (RNBackgroundGeofenceModuleImpl.NAME.equals(name)) {
            return new RNBackgroundGeofenceModule(reactContext);
        }
        return null;
    }

    @Override
    public ReactModuleInfoProvider getReactModuleInfoProvider() {
        return () -> {
            Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
            moduleInfos.put(
                RNBackgroundGeofenceModuleImpl.NAME,
                new ReactModuleInfo(
                    RNBackgroundGeofenceModuleImpl.NAME,
                    RNBackgroundGeofenceModule.class.getName(),
                    false,  // canOverrideExistingModule
                    false,  // needsEagerInit
                    false,  // hasConstants
                    false,  // isCxxModule
                    BuildConfig.IS_NEW_ARCHITECTURE_ENABLED  // isTurboModule
                )
            );
            return moduleInfos;
        };
    }
}
