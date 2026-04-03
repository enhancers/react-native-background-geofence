#ifdef RCT_NEW_ARCH_ENABLED

#import "RNBackgroundGeofence.h"

@implementation RNBackgroundGeofence (TurboModule)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
    return std::make_shared<facebook::react::NativeBackgroundGeofenceSpecJSI>(params);
}

@end

#endif
