
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNBackgroundGeofenceSpec.h"

@interface BackgroundGeofence : NSObject <NativeBackgroundGeofenceSpec>
#else
#import <React/RCTBridgeModule.h>

@interface BackgroundGeofence : NSObject <RCTBridgeModule>
#endif

@end
