'use strict';

import { NativeEventEmitter, NativeModules } from 'react-native';

console.log(NativeModules);
const { RNBackgroundGeofence } = NativeModules;
const EventEmitter = new NativeEventEmitter(RNBackgroundGeofence);

import * as Events from './Events';

const TAG = 'TSLocationManager';
const PLATFORM_ANDROID = 'android';
const PLATFORM_IOS = 'ios';

/**
 * Logging API
 */
const LOGGER = {
  error: function (msg) {
    RNBackgroundGeofence.log('error', msg);
  },
  warn: function (msg) {
    RNBackgroundGeofence.log('warn', msg);
  },
  debug: function (msg) {
    RNBackgroundGeofence.log('debug', msg);
  },
  info: function (msg) {
    RNBackgroundGeofence.log('info', msg);
  },
  notice: function (msg) {
    RNBackgroundGeofence.log('notice', msg);
  },
  header: function (msg) {
    RNBackgroundGeofence.log('header', msg);
  },
  on: function (msg) {
    RNBackgroundGeofence.log('on', msg);
  },
  off: function (msg) {
    RNBackgroundGeofence.log('off', msg);
  },
  ok: function (msg) {
    RNBackgroundGeofence.log('ok', msg);
  },
};

/// Internal Subscription instance
/// @deprecated.
class Subscription {
  constructor(event, subscription, callback) {
    this.event = event;
    this.subscription = subscription;
    this.callback = callback;
  }
}

// Plugin event listener subscriptions
// @deprecated.
let EVENT_SUBSCRIPTIONS = [];

const findEventSubscriptionByEvent = (event, callback) => {
  let found = null;
  for (let n = 0, len = EVENT_SUBSCRIPTIONS.length; n < len; n++) {
    let sub = EVENT_SUBSCRIPTIONS[n];
    if (sub.event === event && sub.callback === callback) {
      found = sub;
      break;
    }
  }
  return found;
};

const findEventSubscription = (subscription) => {
  let found = null;
  for (let n = 0, len = EVENT_SUBSCRIPTIONS.length; n < len; n++) {
    let sub = EVENT_SUBSCRIPTIONS[n];
    if (sub.subscription === subscription) {
      found = sub;
      break;
    }
  }
  return found;
};

const removeEventSubscription = (subscription) => {
  const found = findEventSubscription(subscription);
  if (found !== null) {
    EVENT_SUBSCRIPTIONS.splice(EVENT_SUBSCRIPTIONS.indexOf(found), 1);
  }
};

// Validate provided config for #ready, #setConfig
const validateConfig = (config) => {
  // Detect obsolete notification* fields and re-map to Notification instance.
  if (
    config.notificationPriority ||
    config.notificationText ||
    config.notificationTitle ||
    config.notificationChannelName ||
    config.notificationColor ||
    config.notificationSmallIcon ||
    config.notificationLargeIcon
  ) {
    console.warn(
      '[BackgroundGeolocation] WARNING: Config.notification* fields (eg: notificationText) are all deprecated in favor of notification: {title: "My Title", text: "My Text"}  See docs for "Notification" class'
    );
    config.notification = {
      text: config.notificationText,
      title: config.notificationTitle,
      color: config.notificationColor,
      channelName: config.notificationChannelName,
      smallIcon: config.notificationSmallIcon,
      largeIcon: config.notificationLargeIcon,
      priority: config.notificationPriority,
    };
  }

  return config;
};

// Cached copy of DeviceInfo.
let deviceInfo = null;
/**
 * Native API
 */
export default class NativeModule {
  /**
   * Core API Methods
   */
  static ready(config) {
    return new Promise((resolve, reject) => {
      let success = (state) => {
        resolve(state);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.ready(validateConfig(config), success, failure);
    });
  }

  static configure(config) {
    console.warn(
      '[BackgroundGeolocation] Method #configure is deprecated in favor of #ready'
    );
    return new Promise((resolve, reject) => {
      let success = (state) => {
        resolve(state);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.configure(validateConfig(config), success, failure);
    });
  }

  static requestPermission() {
    return new Promise((resolve, reject) => {
      let success = (status) => {
        resolve(status);
      };
      let failure = (status) => {
        reject(status);
      };
      RNBackgroundGeofence.requestPermission(success, failure);
    });
  }

  static requestTemporaryFullAccuracy(purpose) {
    return new Promise((resolve, reject) => {
      let success = (status) => {
        resolve(status);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.requestTemporaryFullAccuracy(
        purpose,
        success,
        failure
      );
    });
  }

  static getProviderState() {
    return new Promise((resolve, reject) => {
      let success = (state) => {
        resolve(state);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.getProviderState(success, failure);
    });
  }

  static setConfig(config) {
    return new Promise((resolve, reject) => {
      let success = (state) => {
        resolve(state);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.setConfig(validateConfig(config), success, failure);
    });
  }

  static reset(config) {
    config = config || {};
    return new Promise((resolve, reject) => {
      let success = (state) => {
        resolve(state);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.reset(validateConfig(config), success, failure);
    });
  }

  static addListener(event, success, failure) {
    if (!Events[event.toUpperCase()]) {
      throw TAG + "#addListener - Unknown event '" + event + "'";
    }
    const handler = (response) => {
      if (response.hasOwnProperty('error') && response.error != null) {
        if (typeof failure === 'function') {
          failure(response.error);
        } else {
          success(response);
        }
      } else {
        success(response);
      }
    };
    const subscription = EventEmitter.addListener(event, handler);

    if (typeof subscription.remove === 'function') {
      // React Native 0.65+ altered EventEmitter
      //
      // Wrap .remove() to remove from our own local EVENT_SUBSCRIPTIONS cache.
      // Eventually we can remove this local cache entirely once people are trained
      // to not use removeListener.
      const originalRemove = subscription.remove;
      subscription.remove = () => {
        originalRemove.call(subscription);
        removeEventSubscription(subscription);
      };
    } else {
      // Old RN API?  Create a .remove() method.
      subscription.remove = () => {
        EventEmitter.removeListener(event, handler);
        removeEventSubscription(subscription);
      };
    }
    EVENT_SUBSCRIPTIONS.push(new Subscription(event, subscription, success));
    return subscription;
  }

  // @deprecated in favor of subscription.remove().
  static removeListener(event, callback, success, failure) {
    console.warn(
      'BackgroundGeolocation.removeListener is deprecated.  Event-listener methods (eg: onLocation) now return a subscription instance.  Call subscription.remove() on the returned subscription instead.  Eg:\nconst subscription = BackgroundGeolocation.onLocation(myLocationHandler)\n...\nsubscription.remove()'
    );
    const found = findEventSubscriptionByEvent(event, callback);
    if (found !== null) {
      found.subscription.remove();
      return true;
    } else {
      return false;
    }
  }

  static removeListeners() {
    return new Promise((resolve, reject) => {
      EVENT_SUBSCRIPTIONS.forEach((sub) => {
        sub.subscription.remove();
      });
      EVENT_SUBSCRIPTIONS = [];
      resolve();
    });
  }

  static getState() {
    return new Promise((resolve, reject) => {
      let success = (state) => {
        resolve(state);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.getState(success, failure);
    });
  }

  static start() {
    return new Promise((resolve, reject) => {
      let success = (state) => {
        resolve(state);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.start(success, failure);
    });
  }

  static stop() {
    return new Promise((resolve, reject) => {
      let success = (state) => {
        resolve(state);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.stop(success, failure);
    });
  }

  static startGeofences() {
    return new Promise((resolve, reject) => {
      let success = (state) => {
        resolve(state);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.startGeofences(success, failure);
    });
  }

  static startBackgroundTask() {
    return new Promise((resolve, reject) => {
      let success = (taskId) => {
        resolve(taskId);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.beginBackgroundTask(success, failure);
    });
  }

  // TODO Rename native methods #finish -> #stopBackgroundTask
  static stopBackgroundTask(taskId) {
    return new Promise((resolve, reject) => {
      if (!taskId) {
        reject('INVALID_TASK_ID: ' + taskId);
        return;
      }
      let success = (taskId) => {
        resolve(taskId);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.finish(taskId, success, failure);
    });
  }

  /**
   * Geofencing Methods
   */

  static addGeofence(config) {
    return new Promise((resolve, reject) => {
      let success = () => {
        resolve();
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.addGeofence(config, success, failure);
    });
  }

  static removeGeofence(identifier) {
    return new Promise((resolve, reject) => {
      let success = () => {
        resolve();
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.removeGeofence(identifier, success, failure);
    });
  }

  static addGeofences(geofences) {
    return new Promise((resolve, reject) => {
      let success = () => {
        resolve();
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.addGeofences(geofences, success, failure);
    });
  }

  static removeGeofences() {
    return new Promise((resolve, reject) => {
      let success = () => {
        resolve();
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.removeGeofences(success, failure);
    });
  }

  static getGeofences() {
    return new Promise((resolve, reject) => {
      let success = (result) => {
        resolve(result);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.getGeofences(success, failure);
    });
  }

  static getGeofence(identifier) {
    return new Promise((resolve, reject) => {
      let success = (result) => {
        resolve(result);
      };
      let failure = (error) => {
        reject(error);
      };
      if (typeof identifier !== 'string' || identifier.length == 0) {
        failure('Invalid identifier: ' + identifier);
        return;
      }
      RNBackgroundGeofence.getGeofence(identifier, success, failure);
    });
  }

  static geofenceExists(identifier) {
    return new Promise((resolve, reject) => {
      let callback = (result) => {
        resolve(result);
      };
      if (typeof identifier !== 'string' || identifier.length == 0) {
        reject('Invalid identifier: ' + identifier);
        return;
      }
      RNBackgroundGeofence.geofenceExists(identifier, callback);
    });
  }
  /**
   * Logging & Debug Methods
   */

  static setLogLevel(value) {
    return new Promise((resolve, reject) => {
      let success = (state) => {
        resolve(state);
      };
      let failure = (error) => {
        reject(error);
      };
      let config = { logLevel: value };
      RNBackgroundGeofence.setConfig(config, success, failure);
    });
  }

  static getLog() {
    return new Promise((resolve, reject) => {
      let success = (log) => {
        resolve(log);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.getLog(success, failure);
    });
  }

  static destroyLog() {
    return new Promise((resolve, reject) => {
      let success = () => {
        resolve();
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.destroyLog(success, failure);
    });
  }

  static emailLog(email) {
    return new Promise((resolve, reject) => {
      let success = () => {
        resolve();
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.emailLog(email, success, failure);
    });
  }

  static isPowerSaveMode() {
    return new Promise((resolve, reject) => {
      let success = (isPowerSaveMode) => {
        resolve(isPowerSaveMode);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.isPowerSaveMode(success, failure);
    });
  }

  static getSensors() {
    return new Promise((resolve, reject) => {
      let success = (result) => {
        resolve(result);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.getSensors(success, failure);
    });
  }

  static getDeviceInfo() {
    return new Promise((resolve, reject) => {
      if (deviceInfo != null) {
        return resolve(deviceInfo);
      }
      let success = (result) => {
        // Cache DeviceInfo
        deviceInfo = result;
        resolve(result);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.getDeviceInfo(success, failure);
    });
  }

  static playSound(soundId) {
    return new Promise((resolve, reject) => {
      let success = () => {
        resolve();
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.playSound(soundId);
      success();
    });
  }

  static get logger() {
    return LOGGER;
  }
}
