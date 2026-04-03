#ifdef RCT_NEW_ARCH_ENABLED
#import <RNBackgroundGeofenceSpec/RNBackgroundGeofenceSpec.h>
#endif

#import <React/RCTBridgeModule.h>
#import <CoreLocation/CoreLocation.h>
#import <React/RCTConvert.h>
#import <React/RCTEventEmitter.h>

typedef NS_ENUM(NSInteger, RNBGLocationAuthorizationStatus) {
    RNBGLocationAuthorizationDenied = 0,
    RNBGLocationAuthorizationAllowed = 1,
    RNBGLocationAuthorizationAlways = RNBGLocationAuthorizationAllowed,
    RNBGLocationAuthorizationForeground = 2,
    RNBGLocationAuthorizationNotDetermined = 99,
};

#ifdef RCT_NEW_ARCH_ENABLED
@interface RNBackgroundGeofence : RCTEventEmitter <NativeBackgroundGeofenceSpec, CLLocationManagerDelegate>
#else
@interface RNBackgroundGeofence : RCTEventEmitter <RCTBridgeModule, CLLocationManagerDelegate>
#endif
- (bool)removeBoundary:(NSString *)boundaryId;
- (void)removeAllBoundaries;
@property(strong, nonatomic) CLLocationManager *locationManager;
@property(nonatomic, strong) NSString *enterGeofenceNotificationTitle;
@property(nonatomic, strong) NSString *enterGeofenceNotificationText;
@property(nonatomic, strong) NSString *exitGeofenceNotificationTitle;
@property(nonatomic, strong) NSString *exitGeofenceNotificationText;
@end
