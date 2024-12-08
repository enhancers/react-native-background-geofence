// *****
import {
  AppRegistry,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native';

import {
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
  BackgroundGeofenceEventEmitter.emit(event, ids);
};

AppRegistry.registerHeadlessTask(
  'OnBoundaryEvent',
  () => HeadlessBoundaryEventTask
);

/**
 * Adds a geofence configuration to the background geofencing service.
 *
 * @param {GeofenceConfig} config - The geofence configuration object to add.
 *   This must include the following properties:
 *   - `id` (string, required): A unique identifier for the geofence.
 *   - `lat` (number, required): The latitude of the geofence center.
 *   - `lng` (number, required): The longitude of the geofence center.
 *   - `radius` (number, required): The radius of the geofence in meters.
 *   Optional properties:
 *   - `enterGeofenceNotificationTitle` (string): The title of the notification displayed upon entering the geofence.
 *   - `enterGeofenceNotificationText` (string): The text of the notification displayed upon entering the geofence.
 *   - `exitGeofenceNotificationTitle` (string): The title of the notification displayed upon exiting the geofence.
 *   - `exitGeofenceNotificationText` (string): The text of the notification displayed upon exiting the geofence.
 *
 * @throws Will throw an error if `config` is null, undefined, not an object, or if required properties are missing.
 *
 * @returns {Promise<string>} - A promise that resolves with the `id` of the added geofence if the operation is successful,
 *   or rejects with an error if the operation fails.
 */

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

/**
 * Subscribes to a geofence event and registers a callback to be executed when the event is triggered.
 *
 * @param {GeofenceEvent} event - The geofence event to listen for. Possible values are:
 *   - `GeofenceEvent.EXIT`: Triggered when a user exits a geofence.
 *   - `GeofenceEvent.ENTER`: Triggered when a user enters a geofence.
 *
 * @param {(id: string) => void} callback - The function to execute when the event is triggered.
 *   - `id` (string): The unique identifier of the geofence associated with the event.
 *
 * @throws Will throw an error if the `callback` is not a function.
 *
 * @returns {EmitterSubscription} - Returns a subscription object. Use this object to remove the listener when it's no longer needed.
 **/

export const on = (event: GeofenceEvent, callback: (id: string) => void) => {
  if (typeof callback !== 'function') {
    throw TAG + ': callback function must be provided';
  }

  return BackgroundGeofenceEventEmitter.addListener(event, callback);
};

export const removeAllListeners = (event: GeofenceEvent) => {
  return BackgroundGeofenceEventEmitter.removeAllListeners(event);
};
export const removeAll = () => {
  return RNBackgroundGeofence.removeAll();
};

/**
 * Removes a geofence by its unique identifier.
 *
 * @param {string} id - The unique identifier of the geofence to be removed.
 *
 * @throws Will throw an error if the `id` is null, undefined, or not a string.
 *
 * @returns {Promise<void>} - A promise that resolves when the geofence is successfully removed,
 *   or rejects with an error if the removal fails.
 */

export const removeGeofence = (id: string) => {
  if (!id || (id.constructor !== Array && typeof id !== 'string')) {
    throw TAG + ': id must be a string';
  }

  return RNBackgroundGeofence.removeGeofence(id);
};

const emptyFn = () => {};

const headlessTask = (task: (event: HeadlessTaskEvent) => Promise<void>) => {
  AppRegistry.registerHeadlessTask(TASK_KEY, () => task);
};

const checkStatus = (
  successFn: (status: ServiceStatus) => void,
  errorFn?: (error: BackgroundGeolocationError) => void
) => {
  successFn = successFn || emptyFn;
  errorFn = errorFn || emptyFn;
  RNBackgroundGeofence.checkStatus(successFn, errorFn);
};

/**
 * Triggers a test geofence event for debugging purposes.
 *
 * @param {string} event - The name of the event to trigger. This should match a valid geofence event string
 *   expected by the native geofence module.
 *
 **/

const triggetTestEvent = (event: string) => {
  RNBackgroundGeofence.triggetTestEvent(event);
};

const BackgroundGeofence = {
  addGeofence,
  on,
  removeAllListeners,
  removeAll,
  removeGeofence,
  headlessTask,
  checkStatus,
  triggetTestEvent,
};

export * from './types';

export default BackgroundGeofence;
