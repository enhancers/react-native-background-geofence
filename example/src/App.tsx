import { useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import BackgroundGeofence, { Events } from 'react-native-background-geofence';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

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
    requestLocationPermission()
      .then((res: any) => {
        if (res !== RESULTS.GRANTED) {
          console.error('Location permissions not granted');
          return;
        }

        // BackgroundGeofence.addGeofence({
        //   id: 'home',
        //   lat: 34.017714,
        //   lng: -118.499033,
        //   radius: 50, // in meters
        // })
        //   .then(() => console.log('success!'))
        //   .catch((e: any) => console.error('error :(', e));

        // BackgroundGeofence.on(Events.ENTER, (id: string) => {
        //   console.log(`Get out of my ${id}!!`);
        // });

        // BackgroundGeofence.on(Events.EXIT, (id: string) => {
        //   console.log(`Ya! You better get out of my ${id}!!`);
        // });
      })
      .catch((err: any) => console.log('error', err));
  }, []);

  return (
    <View style={styles.container}>
      <Text>TEST GEOFENCE</Text>
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
