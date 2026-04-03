import { useEffect, useState } from 'react';
import { Alert, View, Text, Platform, TouchableOpacity } from 'react-native';
import BackgroundGeofence, {
  removeAll,
  removeAllListeners,
  removeGeofence,
} from '@enhancers/react-native-background-geofence';
import { request, requestNotifications, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import styles from './App.styles';
import { GeofenceEvent } from '../../src/types';

const TEST_GEOFENCE_ID = 'home';

export default function App() {
  const [lastEventReceived, setLastEventReceived] =
    useState<any>('no event received');

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      if (parseInt(String(Platform.Version), 10) >= 33) {
        await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      }

      const fineResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (fineResult !== RESULTS.GRANTED) {
        return fineResult;
      }

      // On Android 10+ background location must be requested separately
      if (parseInt(String(Platform.Version), 10) >= 29) {
        return await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
      }

      return fineResult;
    } else {
      // Also request notification permission so local notifications are shown
      await requestNotifications(['alert', 'sound']);
      return await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
    }
  };

  useEffect(() => {
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
    return () => {
      onEnterEvent.remove();
      onExitEvent.remove();
    };
  }, []);

  const addGeofenceTest = () => {
    requestLocationPermission().then((res: any) => {
      if (res === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission blocked',
          'Location permission is blocked. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ]
        );
        return;
      }
      if (res !== RESULTS.GRANTED) {
        Alert.alert('Permission denied', 'Location permission is required to add a geofence.');
        return;
      }

      console.log('Location permission granted');

      BackgroundGeofence.addGeofence({
        id: TEST_GEOFENCE_ID,
        lat: 45.0703,
        lng: 7.68687, // Turin city center
        radius: 100, // in meters
        enterGeofenceNotificationTitle: 'enter-titolo',
        enterGeofenceNotificationText: 'enter-testo',
        exitGeofenceNotificationTitle: 'exit-titolo',
        exitGeofenceNotificationText: 'exit-testo',
      })
        .then((id) => {
          console.log('[geofence] Added geofence with id', id);
        })
        .catch((e: any) =>
          console.error('[geofence] Error in BackgroundGeofence.addGeofence', e)
        );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusTitleText}>LAST EVENT RECEIVED:</Text>
      <Text style={styles.statusText}>{lastEventReceived}</Text>
      <TouchableOpacity style={styles.button} onPress={() => addGeofenceTest()}>
        <Text style={styles.buttonText}>ADD GEOFENCE</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => removeGeofence(TEST_GEOFENCE_ID)}
      >
        <Text style={styles.buttonText}>REMOVE GEOFENCE</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => removeAll()}>
        <Text style={styles.buttonText}>REMOVE ALL BOUNDARIES</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => removeAllListeners(GeofenceEvent.ENTER)}
      >
        <Text style={styles.buttonText}>REMOVE ALL 'onEnter' LISTENERS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => removeAllListeners(GeofenceEvent.EXIT)}
      >
        <Text style={styles.buttonText}>REMOVE ALL 'onExit' LISTENERS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => BackgroundGeofence.triggetTestEvent(GeofenceEvent.ENTER)}
      >
        <Text style={styles.buttonText}>Trigger Test Event "ENTER"</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => BackgroundGeofence.triggetTestEvent(GeofenceEvent.EXIT)}
      >
        <Text style={styles.buttonText}>Trigger Test Event "EXIT"</Text>
      </TouchableOpacity>
    </View>
  );
}
