// *****
import {
  AppRegistry,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

import type {
  BackgroundGeolocationError,
  GeofenceConfig,
  GeofenceEvent,
  HeadlessTaskEvent,
  ServiceStatus,
} from './types';

var TASK_KEY = 'com.enhancers.backgroundgeofence.react.headless.Task';

const TAG = 'RNBackgroundGeofence';

const LINKING_ERROR =
  `The package 'react-native-background-geofence' doesn't seem to be linked. Make sure: \n\n` +
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

export const BackgroundGeofenceEventEmitter = new NativeEventEmitter(
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

export const addGeofence = (config: GeofenceConfig) => {
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

export const on = (event: GeofenceEvent, callback: (id: string) => void) => {
  console.log('[geofence] added geofence event listener for event ' + event);

  if (typeof callback !== 'function') {
    throw TAG + ': callback function must be provided';
  }

  return BackgroundGeofenceEventEmitter.addListener(event, callback);
};

export const removeAllListeners = (event: GeofenceEvent) => {
  console.log('[geofence] remove all listeners');

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
  successFn?: () => void,
  errorFn?: () => void
) => {
  successFn = successFn || emptyFn;
  errorFn = errorFn || emptyFn;
  AppRegistry.registerHeadlessTask(TASK_KEY, () => task);
  RNBackgroundGeofence.registerHeadlessTask(successFn, errorFn);
};

const checkStatus = (
  successFn: (status: ServiceStatus) => void,
  errorFn?: (error: BackgroundGeolocationError) => void
) => {
  successFn = successFn || emptyFn;
  errorFn = errorFn || emptyFn;
  RNBackgroundGeofence.checkStatus(successFn, errorFn);
};

const triggetTestEvent = (event: string) => {
  RNBackgroundGeofence.triggetTestEvent(event);
};

const BackgroundGeofence = {
  init,
  addGeofence,
  on,
  removeAllListeners,
  removeAll,
  removeGeofence,
  headlessTask,
  checkStatus,
  triggetTestEvent,
};

export default BackgroundGeofence;