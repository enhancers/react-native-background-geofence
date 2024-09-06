import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
} from 'react-native';
import BackgroundGeofence, {
  Events,
  removeAll,
  removeAllListeners,
  removeGeofence,
} from 'react-native-background-geofence';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const TEST_GEOFENCE_ID = 'home';

export default function App() {
  const [lastEventReceived, setLastEventReceived] =
    useState('no event received');

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

    const onEnterEvent = BackgroundGeofence.on(Events.ENTER, (id: string) => {
      console.log(`Get out of my ${id}!!`);
      setLastEventReceived(Events.ENTER + ' - ' + id);
    });
    const onExitEvent = BackgroundGeofence.on(Events.EXIT, (id: string) => {
      console.log(`Ya! You better get out of my ${id}!!`);
      setLastEventReceived(Events.EXIT + ' - ' + id);
    });
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
        lat: 34.017714,
        lng: -118.499033,
        radius: 50, // in meters
      })
        .then((id) => console.log('added geofence with id', id))
        .catch((e: any) => console.error('error :(', e));
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
        onPress={() => removeAllListeners(Events.ENTER)}
      >
        <Text style={styles.buttonText}>REMOVE ALL 'onEnter' LISTENERS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => removeAllListeners(Events.EXIT)}
      >
        <Text style={styles.buttonText}>REMOVE ALL 'onExit' LISTENERS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitleText: {
    fontSize: 18,
  },
  statusText: {
    fontSize: 18,
    marginTop: 12,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  button: {
    margin: 12,
    backgroundColor: '#000',
    color: '#ffff',
    padding: 12,
    borderRadius: 8,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
