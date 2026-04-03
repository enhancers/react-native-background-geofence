package com.enhancers.backgroundgeofence.services;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import androidx.core.app.JobIntentService;
import androidx.core.app.NotificationCompat;
import android.util.Log;
import androidx.annotation.NonNull;

import com.enhancers.backgroundgeofence.RNBackgroundGeofenceModuleImpl;
import com.enhancers.backgroundgeofence.errors.GeofenceErrorMessages;
import com.facebook.react.HeadlessJsTaskService;
import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingEvent;

import java.util.ArrayList;
import java.util.List;

import static com.enhancers.backgroundgeofence.RNBackgroundGeofenceModuleImpl.TAG;

public class BoundaryEventJobIntentService extends JobIntentService {

    public static final String ON_ENTER = "onEnterGeofence";
    public static final String ON_EXIT = "onExitGeofence";
    private static final String CHANNEL_ID = "rn_background_geofence_channel";

    public BoundaryEventJobIntentService() {
        super();
    }

    @Override
    protected void onHandleWork(@NonNull Intent intent) {
        Log.i(TAG, "Handling geofencing event");
        GeofencingEvent geofencingEvent = GeofencingEvent.fromIntent(intent);

        Log.i(TAG, "Geofence transition: " + geofencingEvent.getGeofenceTransition());
        if (geofencingEvent.hasError()) {
            Log.e(TAG, "Error in handling geofence " + GeofenceErrorMessages.getErrorString(geofencingEvent.getErrorCode()));
            return;
        }
        switch (geofencingEvent.getGeofenceTransition()) {
            case Geofence.GEOFENCE_TRANSITION_ENTER:
                Log.i(TAG, "Enter geofence event detected. Sending event.");
                final ArrayList<String> enteredGeofences = new ArrayList<>();
                for (Geofence geofence : geofencingEvent.getTriggeringGeofences()) {
                    enteredGeofences.add(geofence.getRequestId());
                }
                showNotifications(this.getApplicationContext(), ON_ENTER, enteredGeofences);
                sendEvent(this.getApplicationContext(), ON_ENTER, enteredGeofences);
                break;
            case Geofence.GEOFENCE_TRANSITION_EXIT:
                Log.i(TAG, "Exit geofence event detected. Sending event.");
                final ArrayList<String> exitingGeofences = new ArrayList<>();
                for (Geofence geofence : geofencingEvent.getTriggeringGeofences()) {
                    exitingGeofences.add(geofence.getRequestId());
                }
                showNotifications(this.getApplicationContext(), ON_EXIT, exitingGeofences);
                sendEvent(this.getApplicationContext(), ON_EXIT, exitingGeofences);
                break;
        }
    }

    private void showNotifications(Context context, String event, List<String> geofenceIds) {
        NotificationManager notificationManager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager == null) return;

        createNotificationChannel(notificationManager);

        SharedPreferences prefs = context.getSharedPreferences(
                RNBackgroundGeofenceModuleImpl.PREFS_NAME, Context.MODE_PRIVATE);

        boolean isEnter = ON_ENTER.equals(event);
        String titleKey = isEnter ? "enter_title_" : "exit_title_";
        String textKey = isEnter ? "enter_text_" : "exit_text_";

        for (String id : geofenceIds) {
            String title = prefs.getString(titleKey + id, null);
            String text = prefs.getString(textKey + id, null);
            if (title == null && text == null) continue;

            Notification notification = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(context.getApplicationInfo().icon)
                    .setContentTitle(title != null ? title : "")
                    .setContentText(text != null ? text : "")
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    .setAutoCancel(true)
                    .build();

            notificationManager.notify(id.hashCode(), notification);
        }
    }

    private void createNotificationChannel(NotificationManager notificationManager) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Geofence Notifications",
                    NotificationManager.IMPORTANCE_DEFAULT);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private void sendEvent(Context context, String event, ArrayList<String> params) {
        final Intent intent = new Intent(RNBackgroundGeofenceModuleImpl.GEOFENCE_DATA_TO_EMIT);
        intent.putExtra("event", event);
        intent.putExtra("params", params);

        Bundle bundle = new Bundle();
        bundle.putString("event", event);
        bundle.putStringArrayList("ids", intent.getStringArrayListExtra("params"));

        Intent headlessBoundaryIntent = new Intent(context, BoundaryEventHeadlessTaskService.class);
        headlessBoundaryIntent.putExtras(bundle);

        context.startService(headlessBoundaryIntent);
        HeadlessJsTaskService.acquireWakeLockNow(context);
    }
}