# react-native-background-geofence

background geofence

## Installation

```sh
npm install @enhancers/react-native-background-geofence
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

Call BackgroundGeofence.init() mehtod

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

