package com.enhancers.backgroundgeofence;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.location.LocationManagerCompat;

import android.location.LocationManager;
import android.util.Log;

import com.enhancers.backgroundgeofence.receivers.BoundaryEventBroadcastReceiver;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingClient;
import com.google.android.gms.location.GeofencingRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class RNBackgroundGeofenceModuleImpl {

    public static final String NAME = "RNBackgroundGeofence";
    public static final String TAG = "RNBackgroundGeofence";
    public static final String ON_ENTER = "onEnterGeofence";
    public static final String ON_EXIT = "onExitGeofence";
    public static final String GEOFENCE_DATA_TO_EMIT = "com.enhancers.backgroundgeofence.GEOFENCE_DATA_TO_EMIT";
    public static final String PREFS_NAME = "RNBackgroundGeofencePrefs";

    private final GeofencingClient mGeofencingClient;
    private PendingIntent mBoundaryPendingIntent;
    private final ReactApplicationContext mContext;

    public RNBackgroundGeofenceModuleImpl(ReactApplicationContext context) {
        mContext = context;
        mGeofencingClient = LocationServices.getGeofencingClient(context);
    }

    public void removeAll(final Promise promise) {
        mGeofencingClient.removeGeofences(getBoundaryPendingIntent())
                .addOnSuccessListener(new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void aVoid) {
                        Log.i(TAG, "Successfully removed all geofences");
                        promise.resolve(null);
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.i(TAG, "Failed to remove all geofences");
                        promise.reject(e);
                    }
                });
    }

    public void removeGeofence(final String boundaryRequestId, Promise promise) {
        removeGeofenceInternal(promise, Collections.singletonList(boundaryRequestId));
    }

    public void removeGeofence(final ReadableArray readableArray, Promise promise) {
        final List<String> boundaryRequestIds = new ArrayList<>();
        for (int i = 0; i < readableArray.size(); ++i) {
            boundaryRequestIds.add(readableArray.getString(i));
        }
        removeGeofenceInternal(promise, boundaryRequestIds);
    }

    public void addGeofence(final ReadableMap readableMap, final Promise promise) {
        final GeofencingRequest geofencingRequest = createGeofenceRequest(createGeofence(readableMap));
        addGeofenceInternal(promise, geofencingRequest, geofencingRequest.getGeofences().get(0).getRequestId());
    }

    public void addGeofence(final ReadableArray readableArray, final Promise promise) {
        final List<Geofence> geofences = createGeofences(readableArray);
        final WritableArray geofenceRequestIds = Arguments.createArray();
        for (Geofence g : geofences) {
            geofenceRequestIds.pushString(g.getRequestId());
        }
        GeofencingRequest geofencingRequest = createGeofenceRequest(createGeofences(readableArray));
        addGeofenceInternal(promise, geofencingRequest, geofenceRequestIds);
    }

    public void checkStatus(Callback success, Callback failure) {
        Log.i(TAG, "RNBackgroundGeofence #checkStatus");
        try {
            WritableMap dict = Arguments.createMap();
            dict.putBoolean("locationServicesEnabled", isLocationEnabled(mContext));
            dict.putInt("authorization", hasPermissions() ? 1 : 0);
            success.invoke(dict);
        } catch (Exception e) {
            failure.invoke(e.getMessage());
        }
    }

    public void triggetTestEvent(String event) {
        mContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(event, "test-id");
    }

    public void endTask(double taskKey) {
        // no-op
    }

    public void addListener(String eventName) {
        // Required for NativeEventEmitter - no-op
    }

    public void removeListeners(double count) {
        // Required for NativeEventEmitter - no-op
    }

    private Geofence createGeofence(ReadableMap readableMap) {
        String id = readableMap.getString("id");
        Log.i(TAG, "Creating geofence ");
        Log.i(TAG, "ID: " + id);
        Log.i(TAG, "Lat: " + readableMap.getDouble("lat"));
        Log.i(TAG, "Lng: " + readableMap.getDouble("lng"));
        Log.i(TAG, "Radius: " + readableMap.getDouble("radius"));

        SharedPreferences prefs = mContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        if (readableMap.hasKey("enterGeofenceNotificationTitle")) {
            editor.putString("enter_title_" + id, readableMap.getString("enterGeofenceNotificationTitle"));
        }
        if (readableMap.hasKey("enterGeofenceNotificationText")) {
            editor.putString("enter_text_" + id, readableMap.getString("enterGeofenceNotificationText"));
        }
        if (readableMap.hasKey("exitGeofenceNotificationTitle")) {
            editor.putString("exit_title_" + id, readableMap.getString("exitGeofenceNotificationTitle"));
        }
        if (readableMap.hasKey("exitGeofenceNotificationText")) {
            editor.putString("exit_text_" + id, readableMap.getString("exitGeofenceNotificationText"));
        }
        editor.apply();

        return new Geofence.Builder()
                .setRequestId(id)
                .setCircularRegion(readableMap.getDouble("lat"), readableMap.getDouble("lng"), (float) readableMap.getDouble("radius"))
                .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER | Geofence.GEOFENCE_TRANSITION_EXIT)
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .build();
    }

    private List<Geofence> createGeofences(ReadableArray readableArray) {
        List<Geofence> geofences = new ArrayList<>();
        for (int i = 0; i < readableArray.size(); ++i) {
            geofences.add(createGeofence(readableArray.getMap(i)));
        }
        return geofences;
    }

    private GeofencingRequest createGeofenceRequest(List<Geofence> geofences) {
        return new GeofencingRequest.Builder()
                .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
                .addGeofences(geofences)
                .build();
    }

    private GeofencingRequest createGeofenceRequest(Geofence geofence) {
        return new GeofencingRequest.Builder()
                .addGeofence(geofence)
                .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
                .build();
    }

    private PendingIntent getBoundaryPendingIntent() {
        if (mBoundaryPendingIntent != null) {
            return mBoundaryPendingIntent;
        }
        Intent intent = new Intent(mContext, BoundaryEventBroadcastReceiver.class);
        mBoundaryPendingIntent = PendingIntent.getBroadcast(mContext, 0, intent, PendingIntent.FLAG_MUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        return mBoundaryPendingIntent;
    }

    @SuppressLint("MissingPermission")
    private void addGeofenceInternal(final Promise promise, final GeofencingRequest geofencingRequest, final WritableArray geofenceRequestIds) {
        if (!hasPermissions()) {
            promise.reject("PERM", "Access fine/background location is not permitted");
            return;
        }
        mGeofencingClient.addGeofences(geofencingRequest, getBoundaryPendingIntent())
                .addOnSuccessListener(new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void aVoid) {
                        promise.resolve(geofenceRequestIds);
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        promise.reject(e);
                    }
                });
    }

    @SuppressLint("MissingPermission")
    private void addGeofenceInternal(final Promise promise, final GeofencingRequest geofencingRequest, final String requestId) {
        if (!hasPermissions()) {
            promise.reject("PERM", "Access fine/background location is not permitted");
            return;
        }
        Log.i(TAG, "Attempting to add geofence.");
        mGeofencingClient.addGeofences(geofencingRequest, getBoundaryPendingIntent())
                .addOnSuccessListener(new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void aVoid) {
                        Log.i(TAG, "Successfully added geofence.");
                        promise.resolve(requestId);
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.i(TAG, "Failed to add geofence.");
                        promise.reject(e);
                    }
                });
    }

    private void removeGeofenceInternal(final Promise promise, final List<String> requestIds) {
        Log.i(TAG, "Attempting to remove geofence.");
        mGeofencingClient.removeGeofences(requestIds)
                .addOnSuccessListener(new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void aVoid) {
                        Log.i(TAG, "Successfully removed geofence.");
                        promise.resolve(null);
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.i(TAG, "Failed to remove geofence.");
                        promise.reject(e);
                    }
                });
    }

    private boolean hasPermissions() {
        int permissionFineLocation = ActivityCompat.checkSelfPermission(mContext, Manifest.permission.ACCESS_FINE_LOCATION);
        int permissionBackgroundLocation = 0;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            permissionBackgroundLocation = ActivityCompat.checkSelfPermission(mContext, Manifest.permission.ACCESS_BACKGROUND_LOCATION);
            return permissionFineLocation == PackageManager.PERMISSION_GRANTED && permissionBackgroundLocation == PackageManager.PERMISSION_GRANTED;
        }
        return permissionFineLocation == PackageManager.PERMISSION_GRANTED;
    }

    private boolean isLocationEnabled(Context context) {
        LocationManager locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
        return LocationManagerCompat.isLocationEnabled(locationManager);
    }

}
