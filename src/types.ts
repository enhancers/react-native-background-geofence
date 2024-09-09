import { type EmitterSubscription } from 'react-native';

export enum Events {
  EXIT = 'onExitGeofence',
  ENTER = 'onEnterGeofence',
}

export interface Config {
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

export interface BoundaryStatic {
  on: (
    event: Events,
    callback: (boundaries: string[]) => void
  ) => EmitterSubscription;
  off: (event: Events) => void;
  add: (config: Config) => Promise<string>;
  remove: (id: string) => Promise<null>;
  removeAll: () => Promise<null>;
}

declare let Boundary: BoundaryStatic;
export default Boundary;

type HeadlessTaskEventName = 'onEnterGeofence' | 'onExitGeofence';
