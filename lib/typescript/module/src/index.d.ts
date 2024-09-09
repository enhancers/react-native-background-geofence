import type { Boundary } from './types';
export declare const Events: {
    EXIT: string;
    ENTER: string;
};
export declare const RNBackgroundGeofence: any;
export declare const init: () => void;
export declare const addGeofence: (boundary: Boundary) => Promise<unknown>;
export declare const on: (event: string, callback: (id: string) => void) => import("react-native").EmitterSubscription;
export declare const removeAllListeners: (event: string) => void;
export declare const removeAll: () => any;
export declare const removeGeofence: (id: string) => any;
declare const BackgroundGeofence: {
    init: () => void;
    addGeofence: (boundary: Boundary) => Promise<unknown>;
    on: (event: string, callback: (id: string) => void) => import("react-native").EmitterSubscription;
    removeAllListeners: (event: string) => void;
    removeAll: () => any;
    removeGeofence: (id: string) => any;
};
export default BackgroundGeofence;
//# sourceMappingURL=index.d.ts.map