# react-native-background-geofence

A React Native library for background geofencing on iOS and Android. Monitor circular geographic regions and receive events when a device enters or exits them, even when the app is in the background.

Supports both the **old React Native architecture** (Bridge) and the **new architecture** (TurboModules).

---

## Installation

```sh
npm install @enhancers/react-native-background-geofence
```

```sh
yarn add @enhancers/react-native-background-geofence
```

```sh
pnpm add @enhancers/react-native-background-geofence
```

---

## Configuration

### Android

Add the following entries inside the `<application>` tag of your `AndroidManifest.xml`:

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

The following permissions are declared automatically by the library manifest:

- `ACCESS_FINE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`
- `WAKE_LOCK`
- `POST_NOTIFICATIONS`

> **Note:** On Android 10+ you must explicitly request `ACCESS_BACKGROUND_LOCATION` at runtime. On Android 13+ you must also request `POST_NOTIFICATIONS`.

### iOS

Add the following keys to your `Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app uses your location to monitor geofenced areas.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app uses your location in the background to monitor geofenced areas.</string>
```

Enable **Background Modes → Location updates** in your Xcode project's Signing & Capabilities tab.

---

## Requesting Permissions

Before adding geofences, request the necessary location permissions from the user.

```typescript
import { Platform, PermissionsAndroid } from 'react-native';

async function requestPermissions() {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (Platform.Version >= 29) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      );
    }

    if (Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
    }
  } else {
    // iOS: use a library like react-native-permissions to request
    // 'always' location authorization
  }
}
```

---

## Usage

### Adding a Geofence

```typescript
import BackgroundGeofence from '@enhancers/react-native-background-geofence';

BackgroundGeofence.addGeofence({
  id: 'my-geofence-1',
  lat: 45.0703,
  lng: 7.68687,
  radius: 100, // meters
  enterGeofenceNotificationTitle: 'You arrived!',
  enterGeofenceNotificationText: 'You entered the geofenced area.',
  exitGeofenceNotificationTitle: 'You left!',
  exitGeofenceNotificationText: 'You exited the geofenced area.',
})
  .then((id: string) => console.log('Geofence added:', id))
  .catch((error) => console.error('Failed to add geofence:', error));
```

### Listening to Events

```typescript
import BackgroundGeofence, { GeofenceEvent } from '@enhancers/react-native-background-geofence';

const enterSubscription = BackgroundGeofence.on(
  GeofenceEvent.ENTER,
  (id: string) => {
    console.log('Entered geofence:', id);
  }
);

const exitSubscription = BackgroundGeofence.on(
  GeofenceEvent.EXIT,
  (id: string) => {
    console.log('Exited geofence:', id);
  }
);

// Clean up when no longer needed
enterSubscription.remove();
exitSubscription.remove();
```

### Removing Geofences

```typescript
// Remove a specific geofence
BackgroundGeofence.removeGeofence('my-geofence-1')
  .then(() => console.log('Geofence removed'))
  .catch((error) => console.error('Failed to remove geofence:', error));

// Remove all geofences
BackgroundGeofence.removeAll()
  .then(() => console.log('All geofences removed'))
  .catch((error) => console.error('Failed to remove geofences:', error));
```

### Checking Service Status

```typescript
BackgroundGeofence.checkStatus(
  (status) => {
    console.log('Service running:', status.isRunning);
    console.log('Location services enabled:', status.locationServicesEnabled);
    console.log('Authorization:', status.authorization);
    // authorization: 0 = denied, 1 = always, 2 = when in use
  },
  (error) => {
    console.error('Status check failed:', error);
  }
);
```

### Registering a Headless Task (Android)

For handling geofence events when the app is fully closed, register a headless task in your `index.js`:

```typescript
import BackgroundGeofence from '@enhancers/react-native-background-geofence';

BackgroundGeofence.headlessTask(async (event) => {
  console.log('Headless task event:', event.name, event.params);
});
```

---

## API Reference

### `addGeofence(config: GeofenceConfig): Promise<string>`

Adds a new geofence. Returns the ID of the created geofence.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the geofence |
| `lat` | `number` | Yes | Latitude of the center point |
| `lng` | `number` | Yes | Longitude of the center point |
| `radius` | `number` | Yes | Radius in meters |
| `enterGeofenceNotificationTitle` | `string` | No | Notification title on enter |
| `enterGeofenceNotificationText` | `string` | No | Notification body on enter |
| `exitGeofenceNotificationTitle` | `string` | No | Notification title on exit |
| `exitGeofenceNotificationText` | `string` | No | Notification body on exit |

### `removeGeofence(id: string): Promise<void>`

Removes the geofence with the given ID.

### `removeAll(): Promise<void>`

Removes all registered geofences.

### `on(event: GeofenceEvent, callback: (id: string) => void): EmitterSubscription`

Subscribes to a geofence event. Returns a subscription — call `.remove()` on it to unsubscribe.

| Value | Description |
|-------|-------------|
| `GeofenceEvent.ENTER` | Fired when the device enters a geofenced region |
| `GeofenceEvent.EXIT` | Fired when the device exits a geofenced region |

### `removeAllListeners(event: GeofenceEvent): void`

Removes all listeners for the given event type.

### `checkStatus(successFn, errorFn?): void`

Checks the current status of location services and permissions.

The `successFn` receives a `ServiceStatus` object:

| Field | Type | Description |
|-------|------|-------------|
| `isRunning` | `boolean` | Whether the geofencing service is active |
| `locationServicesEnabled` | `boolean` | Whether device location is enabled |
| `authorization` | `AuthorizationStatus` | `0` = denied, `1` = always, `2` = when in use |

### `headlessTask(task: (event: HeadlessTaskEvent) => Promise<void>): void`

Registers a handler for background headless task events (Android only).

---

## Types

```typescript
enum GeofenceEvent {
  ENTER = 'onEnterGeofence',
  EXIT = 'onExitGeofence',
}

interface GeofenceConfig {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  enterGeofenceNotificationTitle?: string;
  enterGeofenceNotificationText?: string;
  exitGeofenceNotificationTitle?: string;
  exitGeofenceNotificationText?: string;
}

interface ServiceStatus {
  isRunning: boolean;
  locationServicesEnabled: boolean;
  authorization: AuthorizationStatus; // 0 | 1 | 2
}

interface HeadlessTaskEvent {
  name: 'onEnterGeofence' | 'onExitGeofence';
  params: any;
}
```

---

## License

MIT
