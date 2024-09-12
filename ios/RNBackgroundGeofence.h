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

@interface RNBackgroundGeofence : RCTEventEmitter <RCTBridgeModule, CLLocationManagerDelegate>
- (bool)removeBoundary:(NSString *)boundaryId;
- (void)removeAllBoundaries;
@property(strong, nonatomic) CLLocationManager *locationManager;
@property(nonatomic, strong) NSString *enterGeofenceNotificationTitle;
@property(nonatomic, strong) NSString *enterGeofenceNotificationText;
@property(nonatomic, strong) NSString *exitGeofenceNotificationTitle;
@property(nonatomic, strong) NSString *exitGeofenceNotificationText;
@end
