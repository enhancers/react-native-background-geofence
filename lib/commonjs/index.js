"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeGeofence = exports.removeAllListeners = exports.removeAll = exports.on = exports.init = exports.default = exports.addGeofence = exports.RNBackgroundGeofence = exports.Events = void 0;
var _reactNative = require("react-native");
const TAG = 'RNBackgroundGeofence';
const Events = exports.Events = {
  EXIT: 'onExit',
  ENTER: 'onEnter'
};
const LINKING_ERROR = `The package 'react-native-my-react-native-library' doesn't seem to be linked. Make sure: \n\n` + _reactNative.Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const RNBackgroundGeofence = exports.RNBackgroundGeofence = _reactNative.NativeModules.RNBackgroundGeofence ? _reactNative.NativeModules.RNBackgroundGeofence : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
const boundaryEventEmitter = new _reactNative.NativeEventEmitter(RNBackgroundGeofence);
const HeadlessBoundaryEventTask = async ({
  event,
  ids
}) => {
  console.log(event, ids);
  boundaryEventEmitter.emit(event, ids);
};
const init = () => {
  console.log('[geofence] initialize');
  _reactNative.AppRegistry.registerHeadlessTask('OnBoundaryEvent', () => HeadlessBoundaryEventTask);
};
exports.init = init;
const addGeofence = boundary => {
  if (!boundary || boundary.constructor !== Array && typeof boundary !== 'object') {
    throw TAG + ': a boundary must be an array or non-null object';
  }
  return new Promise((resolve, reject) => {
    if (typeof boundary === 'object' && !boundary.id) {
      reject(TAG + ': an id is required');
    }
    RNBackgroundGeofence.addGeofence(boundary).then(id => resolve(id)).catch(e => reject(e));
  });
};
exports.addGeofence = addGeofence;
const on = (event, callback) => {
  console.log('[geofence] added geofence event listener for event ' + event);
  if (typeof callback !== 'function') {
    throw TAG + ': callback function must be provided';
  }
  if (!Object.values(Events).find(e => e === event)) {
    throw TAG + ': invalid event';
  }
  return boundaryEventEmitter.addListener(event, callback);
};
exports.on = on;
const removeAllListeners = event => {
  console.log('[geofence] remove all listeners');
  if (!Object.values(Events).find(e => e === event)) {
    throw TAG + ': invalid event';
  }
  return boundaryEventEmitter.removeAllListeners(event);
};
exports.removeAllListeners = removeAllListeners;
const removeAll = () => {
  console.log('[geofence] remove all boundaries');
  return RNBackgroundGeofence.removeAll();
};
exports.removeAll = removeAll;
const removeGeofence = id => {
  if (!id || id.constructor !== Array && typeof id !== 'string') {
    throw TAG + ': id must be a string';
  }
  return RNBackgroundGeofence.removeGeofence(id);
};
exports.removeGeofence = removeGeofence;
const BackgroundGeofence = {
  init,
  addGeofence,
  on,
  removeAllListeners,
  removeAll,
  removeGeofence
};
var _default = exports.default = BackgroundGeofence;
//# sourceMappingURL=index.js.map