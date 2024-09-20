import { useEffect, useState } from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import BackgroundGeofence, {
  removeAll,
  removeAllListeners,
  removeGeofence,
} from '@enhancers/react-native-background-geofence';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import styles from './App.styles';
import { GeofenceEvent } from '../../src/types';

const TEST_GEOFENCE_ID = 'home';

export default function App() {
  const [lastEventReceived, setLastEventReceived] =
    useState<any>('no event received');

  const requestLocationPermission = async () => {
    let permission;
    if (Platform.OS === 'android') {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    } else {
      permission = PERMISSIONS.IOS.LOCATION_ALWAYS;
    }

    return await request(permission);
  };

  useEffect(() => {
    BackgroundGeofence.init();

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
      if (res !== RESULTS.GRANTED) {
        console.error('Location permissions not granted');
        return;
      }

      console.log('Location permission granted');

      BackgroundGeofence.addGeofence({
        id: TEST_GEOFENCE_ID,
        lat: 42.4389,
        lng: -71.4493,
        radius: 500, // in meters
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
