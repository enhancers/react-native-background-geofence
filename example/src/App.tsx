import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import BackgroundGeofence from 'react-native-background-geofence';

export default function App() {
  useEffect(() => {
    BackgroundGeofence.addGeofence({
      identifier: 'Home',
      radius: 200,
      latitude: 45.51921926,
      longitude: -73.61678581,
      notifyOnEntry: true,
      notifyOnExit: true,
      extras: {
        route_id: 1234,
      },
    })
      .then((res) => console.log('asd', res))
      .catch((e) => console.error(e));
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
