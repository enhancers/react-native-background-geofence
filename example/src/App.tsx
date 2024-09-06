import { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
} from 'react-native';
import BackgroundGeofence, {
  Events,
  removeGeofence,
} from 'react-native-background-geofence';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const TEST_GEOFENCE_ID = 'home';

export default function App() {
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
    const onEnterEvent = BackgroundGeofence.on(Events.ENTER, (id: string) => {
      console.log(`Get out of my ${id}!!`);
    });
    const onExitEvent = BackgroundGeofence.on(Events.EXIT, (id: string) => {
      console.log(`Ya! You better get out of my ${id}!!`);
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
      <TouchableOpacity onPress={() => addGeofenceTest()}>
        <Text>ADD GEOFENCE</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginTop: 80 }}
        onPress={() => removeGeofence(TEST_GEOFENCE_ID)}
      >
        <Text>REMOVE ALL</Text>
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
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
