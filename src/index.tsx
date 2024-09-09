import {
  NativeEventEmitter,
  NativeModules,
  AppRegistry,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import type { Config, HeadlessTaskEvent } from './types';

var TASK_KEY = 'com.enhancers.backgroundgeofence.react.headless.Task';

const TAG = 'RNBackgroundGeofence';

export const Events = {
  EXIT: 'onExit',
  ENTER: 'onEnter',
};

const LINKING_ERROR =
  `The package 'react-native-my-react-native-library' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export const RNBackgroundGeofence = NativeModules.RNBackgroundGeofence
  ? NativeModules.RNBackgroundGeofence
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

const BackgroundGeofenceEventEmitter = new NativeEventEmitter(
  RNBackgroundGeofence
);

const HeadlessBoundaryEventTask = async ({
  event,
  ids,
}: {
  event: string;
  ids: any;
}) => {
  console.log(event, ids);
  BackgroundGeofenceEventEmitter.emit(event, ids);
};

export const init = () => {
  console.log('[geofence] initialize');

  AppRegistry.registerHeadlessTask(
    'OnBoundaryEvent',
    () => HeadlessBoundaryEventTask
  );
};

export const addGeofence = (config: Config) => {
  if (!config || (config.constructor !== Array && typeof config !== 'object')) {
    throw TAG + ': a boundary must be an array or non-null object';
  }
  return new Promise((resolve, reject) => {
    if (typeof config === 'object' && !config.id) {
      reject(TAG + ': an id is required');
    }

    RNBackgroundGeofence.addGeofence(config)
      .then((id: string) => resolve(id))
      .catch((e: any) => reject(e));
  });
};

export const on = (event: string, callback: (id: string) => void) => {
  console.log('[geofence] added geofence event listener for event ' + event);

  if (typeof callback !== 'function') {
    throw TAG + ': callback function must be provided';
  }
  if (!Object.values(Events).find((e) => e === event)) {
    throw TAG + ': invalid event';
  }

  return DeviceEventEmitter.addListener(event, callback);
};

export const removeAllListeners = (event: string) => {
  console.log('[geofence] remove all listeners');
  if (!Object.values(Events).find((e) => e === event)) {
    throw TAG + ': invalid event';
  }

  return BackgroundGeofenceEventEmitter.removeAllListeners(event);
};
export const removeAll = () => {
  console.log('[geofence] remove all boundaries');
  return RNBackgroundGeofence.removeAll();
};

export const removeGeofence = (id: string) => {
  if (!id || (id.constructor !== Array && typeof id !== 'string')) {
    throw TAG + ': id must be a string';
  }

  return RNBackgroundGeofence.removeGeofence(id);
};

const emptyFn = () => {};

const headlessTask = (
  task: (event: HeadlessTaskEvent) => Promise<void>,
  successFn: () => void,
  errorFn: () => void
) => {
  successFn = successFn || emptyFn;
  errorFn = errorFn || emptyFn;
  AppRegistry.registerHeadlessTask(TASK_KEY, () => task);
  RNBackgroundGeofence.registerHeadlessTask(successFn, errorFn);
};

const startTask = (callbackFn: (n: number) => void) => {
  if (typeof callbackFn !== 'function') {
    throw 'RNBackgroundGeolocation: startTask requires callback function';
  }

  if (typeof RNBackgroundGeofence.startTask === 'function') {
    RNBackgroundGeofence.startTask(callbackFn);
  } else {
    // android does not need background tasks so we invoke callbackFn directly
    callbackFn(-1);
  }
};

const endTask = (taskKey: number) => {
  if (typeof RNBackgroundGeofence.endTask === 'function') {
    RNBackgroundGeofence.endTask(taskKey);
  } else {
    // noop
  }
};

const BackgroundGeofence = {
  init,
  addGeofence,
  on,
  removeAllListeners,
  removeAll,
  removeGeofence,
  startTask,
  endTask,
  headlessTask,
};

export default BackgroundGeofence;
