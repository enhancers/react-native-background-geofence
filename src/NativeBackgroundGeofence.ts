import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

type GeofenceConfig = Readonly<{
  id: string;
  lat: number;
  lng: number;
  radius: number;
  enterGeofenceNotificationTitle?: string;
  enterGeofenceNotificationText?: string;
  exitGeofenceNotificationTitle?: string;
  exitGeofenceNotificationText?: string;
}>;

type ServiceStatus = Readonly<{
  isRunning: boolean;
  locationServicesEnabled: boolean;
  authorization: number;
}>;

export interface Spec extends TurboModule {
  addGeofence(config: GeofenceConfig): Promise<string>;
  removeGeofence(id: string): Promise<string>;
  removeAll(): Promise<void>;
  checkStatus(
    successCallback: (result: ServiceStatus) => void,
    failureCallback: (error: string) => void,
  ): void;
  triggetTestEvent(event: string): void;
  endTask(taskKey: number): void;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNBackgroundGeofence');
