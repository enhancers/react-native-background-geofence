import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import BackgroundGeofence, { Events } from 'react-native-background-geofence';

export default function App() {
  useEffect(() => {
    BackgroundGeofence.addGeofence({
      id: 'home',
      lat: 34.017714,
      lng: -118.499033,
      radius: 50, // in meters
    })
      .then(() => console.log('success!'))
      .catch((e: any) => console.error('error :(', e));

    // BackgroundGeofence.on(Events.ENTER, (id: string) => {
    //   // Prints 'Get out of my Chipotle!!'
    //   console.log(`Get out of my ${id}!!`);
    // });

    // BackgroundGeofence.on(Events.EXIT, (id: string) => {
    //   // Prints 'Ya! You better get out of my Chipotle!!'
    //   console.log(`Ya! You better get out of my ${id}!!`);
    // });
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
