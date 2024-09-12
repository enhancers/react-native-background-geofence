type AuthorizationStatus = 0 | 1 | 2;

export enum GeofenceEvent {
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

export interface ServiceStatus {
  /** TRUE if service is running. */
  isRunning: boolean;

  /** TRUE if location services are enabled */
  locationServicesEnabled: boolean;

  /**
   * Authorization status.
   *
   * Posible values:
   *  NOT_AUTHORIZED, AUTHORIZED, AUTHORIZED_FOREGROUND
   *
   * @example
   * if (authorization == BackgroundGeolocation.NOT_AUTHORIZED) {...}
   */
  authorization: AuthorizationStatus;
}

export interface BackgroundGeolocationError {
  code: number;
  message: string;
}

type HeadlessTaskEventName = 'onEnterGeofence' | 'onExitGeofence';
