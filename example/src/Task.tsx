import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import styles from './App.styles';
import BackgroundGeofence from 'react-native-background-geofence';

const Task = () => {
  const [lastTaskId, setLastTaskId] = useState<number | null>(null);

  const start = () => {
    BackgroundGeofence.startTask((n) => {
      setLastTaskId(n);
    });
  };

  const end = () => {
    if (lastTaskId) {
      BackgroundGeofence.endTask(lastTaskId);
      setLastTaskId(null);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => (lastTaskId ? end() : start())}
    >
      <Text style={styles.buttonText}>
        {lastTaskId ? 'END' : 'START'} TASK TEST
      </Text>
    </TouchableOpacity>
  );
};

export default Task;
