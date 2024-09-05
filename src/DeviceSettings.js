'use strict';

import { NativeModules } from 'react-native';

const { RNBackgroundGeofence } = NativeModules;

const IGNORE_BATTERY_OPTIMIZATIONS = 'IGNORE_BATTERY_OPTIMIZATIONS';
const POWER_MANAGER = 'POWER_MANAGER';

let resolveSettingsRequest = function (resolve, request) {
  if (request.lastSeenAt > 0) {
    request.lastSeenAt = new Date(request.lastSeenAt);
  }
  resolve(request);
};

export default class DeviceSettings {
  isIgnoringBatteryOptimizations() {
    return new Promise((resolve, reject) => {
      let success = (isIgnoring) => {
        resolve(isIgnoring);
      };
      let failure = (error) => {
        reject(error);
      };
      RNBackgroundGeofence.isIgnoringBatteryOptimizations(success, failure);
    });
  }

  showIgnoreBatteryOptimizations() {
    return new Promise((resolve, reject) => {
      let success = (request) => {
        resolveSettingsRequest(resolve, request);
      };
      let failure = (error) => {
        reject(error);
      };
      let args = { action: IGNORE_BATTERY_OPTIMIZATIONS };
      RNBackgroundGeofence.requestSettings(args, success, failure);
    });
  }

  showPowerManager() {
    return new Promise((resolve, reject) => {
      let success = (request) => {
        resolveSettingsRequest(resolve, request);
      };
      let failure = (error) => {
        reject(error);
      };
      let args = { action: POWER_MANAGER };
      RNBackgroundGeofence.requestSettings(args, success, failure);
    });
  }

  show(request) {
    return new Promise((resolve, reject) => {
      let success = (success) => {
        resolve(success);
      };
      let failure = (error) => {
        reject(error);
      };
      let args = { action: request.action };
      RNBackgroundGeofence.showSettings(args, success, failure);
    });
  }
}
