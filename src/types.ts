export enum Events {
  EXIT = 'onExitGeofence',
  ENTER = 'onEnterGeofence',
}

export interface GeofenceConfig {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  enterGeofenceNotificationTitle?: string;
  enterGeofenceNotificationText?: string;
  exitGeofenceNotificationTitle?: string;
  exitGeofenceNotificationText?: string;
}

export interface HeadlessTaskEvent {
  name: HeadlessTaskEventName;
  params: any;
}
type HeadlessTaskEventName = 'onEnterGeofence' | 'onExitGeofence';
