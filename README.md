# react-native-background-geofence

background geofence

## Installation

```sh
npm install @enhancers/react-native-background-geofence
```

# Configuration

## Android
Add this to your AndroidManifest.xml file: 
```xml 
<service
android:name="com.enhancers.backgroundgeofence.services.BoundaryEventJobIntentService"
android:enabled="true"
android:exported="true"
android:permission="android.permission.BIND_JOB_SERVICE" />
<service android:name="com.enhancers.backgroundgeofence.services.BoundaryEventHeadlessTaskService" />
<receiver
android:name="com.enhancers.backgroundgeofence.receivers.BoundaryEventBroadcastReceiver"
android:enabled="true" />
```

## IOS

Add this keys to app info.plist file
```
<key>NSLocationWhenInUseUsageDescription</key>
<string>Background Geofencing</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Background Geofencing</string>
```

## Usage

# BackgroundGeofence.addGeofence

`BackgroundGeofence.addGeofence` is a method used to add a geofence with specific parameters such as latitude, longitude, radius, and notifications for entering and exiting the geofence.

## Usage
```typescript
BackgroundGeofence.addGeofence({
    id: TEST_GEOFENCE_ID,
    lat: 34.017714,
    lng: -118.499033,
    radius: 50, // in meters
    enterGeofenceNotificationTitle: 'enter-titolo',
    enterGeofenceNotificationText: 'enter-testo',
    exitGeofenceNotificationTitle: 'exit-titolo',
    exitGeofenceNotificationText: 'exit-testo',
    })
    .then((id: string) =>
        console.log('[geofence] Added geofence with id', id)
    )
    .catch((e: any) =>
        console.error('[geofence] Error in BackgroundGeofence.addGeofence', e)
    );
});
```

Parameters
- id (string): Unique identifier for the geofence.
- lat (number): Latitude of the geofence center.
- lng (number): Longitude of the geofence center.
- radius (number): Radius of the geofence in meters.
- enterGeofenceNotificationTitle (string): Title for the notification displayed when entering the geofence.
- enterGeofenceNotificationText (string): Text for the notification displayed when entering the geofence.
- exitGeofenceNotificationTitle (string): Title for the notification displayed when exiting the geofence.
- exitGeofenceNotificationText (string): Text for the notification displayed when exiting the geofence.

# Geofence Event Listeners

The following code demonstrates how to set up listeners for `ENTER` and `EXIT` geofence events using the `BackgroundGeofence.on` method. These listeners allow you to execute specific actions when a device enters or exits a geofenced area.

## Usage

```typescript
const onEnterEvent = BackgroundGeofence.on(
  GeofenceEvent.ENTER,
  (id: string) => {
    console.log(`Enter event ${id}!!`);
    setLastEventReceived(GeofenceEvent.ENTER + ' - ' + id);
  }
);

const onExitEvent = BackgroundGeofence.on(
  GeofenceEvent.EXIT,
  (id: string) => {
    console.log(`Exit event ${id}!!`);
    setLastEventReceived(GeofenceEvent.EXIT + ' - ' + id);
  }
);
```

Parameters
BackgroundGeofence.on(eventType, callback)
  -  eventType (string): Type of geofence event to listen for. It can be one of the following:
     -  GeofenceEvent.ENTER: Triggered when the device enters a geofenced area.
     -  GeofenceEvent.EXIT: Triggered when the device exits a geofenced area.
  - callback (function): The function to be executed when the specified event occurs. The callback receives the following parameter:
    - id (string): The ID of the geofence that triggered the event.