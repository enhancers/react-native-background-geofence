import {
  NativeEventEmitter,
  NativeModules,
  AppRegistry,
  Platform,
} from 'react-native';
import type { Boundary } from './types';

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

const TAG = 'RNBackgroundGeofence';

const boundaryEventEmitter = new NativeEventEmitter(RNBackgroundGeofence);

export const Events = {
  EXIT: 'onExit',
  ENTER: 'onEnter',
};

const HeadlessBoundaryEventTask = async ({
  event,
  ids,
}: {
  event: string;
  ids: any;
}) => {
  console.log(event, ids);
  boundaryEventEmitter.emit(event, ids);
};

AppRegistry.registerHeadlessTask(
  'OnBoundaryEvent',
  () => HeadlessBoundaryEventTask
);

export const addGeofence = (boundary: Boundary) => {
  if (
    !boundary ||
    (boundary.constructor !== Array && typeof boundary !== 'object')
  ) {
    throw TAG + ': a boundary must be an array or non-null object';
  }
  return new Promise((resolve, reject) => {
    if (typeof boundary === 'object' && !boundary.id) {
      reject(TAG + ': an id is required');
    }

    RNBackgroundGeofence.addGeofence(boundary)
      .then((id: string) => resolve(id))
      .catch((e: any) => reject(e));
  });
};

export const on = (event: string, callback: (id: string) => void) => {
  if (typeof callback !== 'function') {
    throw TAG + ': callback function must be provided';
  }
  if (!Object.values(Events).find((e) => e === event)) {
    throw TAG + ': invalid event';
  }

  return boundaryEventEmitter.addListener(event, callback);
};

export const off = (event: string) => {
  if (!Object.values(Events).find((e) => e === event)) {
    throw TAG + ': invalid event';
  }

  return boundaryEventEmitter.removeAllListeners(event);
};
export const removeAll = () => {
  return RNBackgroundGeofence.removeAll();
};

export const removeGeofence = (id: string) => {
  if (!id || (id.constructor !== Array && typeof id !== 'string')) {
    throw TAG + ': id must be a string';
  }

  return RNBackgroundGeofence.removeGeofence(id);
};

const BackgroundGeofence = {
  addGeofence,
  on,
  off,
  removeAll,
  removeGeofence,
};

export default BackgroundGeofence;
