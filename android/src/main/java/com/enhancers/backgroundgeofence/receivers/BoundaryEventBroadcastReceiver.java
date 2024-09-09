package com.enhancers.backgroundgeofence.receivers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.core.app.JobIntentService;
import android.util.Log;

import com.enhancers.backgroundgeofence.services.BoundaryEventJobIntentService;

import static com.enhancers.backgroundgeofence.RNBackgroundGeofenceModule.TAG;

public class BoundaryEventBroadcastReceiver extends BroadcastReceiver {

    public BoundaryEventBroadcastReceiver() {
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.i(TAG, "Broadcasting geofence event");
        JobIntentService.enqueueWork(context, BoundaryEventJobIntentService.class, 0, intent);
    }
}
