
#import "RNBackgroundGeofence.h"
#import "RNBGBackgroundTaskManager.h"
#import <UserNotifications/UserNotifications.h>

@implementation RNBackgroundGeofence

RCT_EXPORT_MODULE()

-(instancetype)init
{
    self = [super init];
    if (self) {
        self.locationManager = [[CLLocationManager alloc] init];
        self.locationManager.delegate = self;

        self.locationManager.allowsBackgroundLocationUpdates = YES;
        self.locationManager.pausesLocationUpdatesAutomatically = NO;

        // Restore notification config persisted across app launches (needed when
        // iOS relaunches the terminated app to deliver a geofence event).
        NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
        self.enterGeofenceNotificationTitle = [defaults stringForKey:@"RNBGEnterTitle"];
        self.enterGeofenceNotificationText  = [defaults stringForKey:@"RNBGEnterText"];
        self.exitGeofenceNotificationTitle  = [defaults stringForKey:@"RNBGExitTitle"];
        self.exitGeofenceNotificationText   = [defaults stringForKey:@"RNBGExitText"];
    }

    return self;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"onEnterGeofence", @"onExitGeofence"];
}

- (void) startObserving {
    NSLog(@"startObserving");
}
- (void) stopObserving {
    NSLog(@"stopObserving");
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

// MARK: - Private helpers

- (void)_addGeofence:(NSDictionary *)config
             resolve:(RCTPromiseResolveBlock)resolve
              reject:(RCTPromiseRejectBlock)reject
{
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];

    if (config[@"enterGeofenceNotificationTitle"] != nil && config[@"enterGeofenceNotificationText"]) {
        self.enterGeofenceNotificationTitle = config[@"enterGeofenceNotificationTitle"];
        self.enterGeofenceNotificationText = config[@"enterGeofenceNotificationText"];
        [defaults setObject:self.enterGeofenceNotificationTitle forKey:@"RNBGEnterTitle"];
        [defaults setObject:self.enterGeofenceNotificationText  forKey:@"RNBGEnterText"];
    }

    if (config[@"exitGeofenceNotificationTitle"] != nil && config[@"exitGeofenceNotificationText"]) {
        self.exitGeofenceNotificationTitle = config[@"exitGeofenceNotificationTitle"];
        self.exitGeofenceNotificationText = config[@"exitGeofenceNotificationText"];
        [defaults setObject:self.exitGeofenceNotificationTitle forKey:@"RNBGExitTitle"];
        [defaults setObject:self.exitGeofenceNotificationText  forKey:@"RNBGExitText"];
    }

    [defaults synchronize];

    CLAuthorizationStatus status = [CLLocationManager authorizationStatus];
    if (status == kCLAuthorizationStatusAuthorizedAlways ||
        status == kCLAuthorizationStatusAuthorizedWhenInUse) {
        NSString *geofenceId = config[@"id"];
        CLLocationCoordinate2D center = CLLocationCoordinate2DMake(
            [config[@"lat"] doubleValue],
            [config[@"lng"] doubleValue]
        );
        CLRegion *boundaryRegion = [[CLCircularRegion alloc]
            initWithCenter:center
                    radius:[config[@"radius"] doubleValue]
                identifier:geofenceId];

        [self.locationManager startMonitoringForRegion:boundaryRegion];
        resolve(geofenceId);
    } else {
        reject(@"PERM", @"Access fine location is not permitted",
               [NSError errorWithDomain:@"boundary" code:200
                               userInfo:@{@"Error reason": @"Invalid permissions"}]);
    }
}

- (void)_removeGeofence:(NSString *)boundaryId
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject
{
    if ([self removeBoundary:boundaryId]) {
        resolve(boundaryId);
    } else {
        reject(@"no_boundary", @"No boundary with the provided id was found",
               [NSError errorWithDomain:@"boundary" code:200
                               userInfo:@{@"Error reason": @"Invalid boundary ID"}]);
    }
}

- (void)_removeAll:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
    @try {
        [self removeAllBoundaries];
    }
    @catch (NSError *ex) {
        reject(@"failed_remove_all", @"Failed to remove all boundaries", ex);
        return;
    }
    resolve(NULL);
}

- (void) removeAllBoundaries
{
    for(CLRegion *region in [self.locationManager monitoredRegions]) {
        [self.locationManager stopMonitoringForRegion:region];
    }
}

- (bool) removeBoundary:(NSString *)boundaryId
{
    for(CLRegion *region in [self.locationManager monitoredRegions]){
        if ([region.identifier isEqualToString:boundaryId]) {
            [self.locationManager stopMonitoringForRegion:region];
            return true;
        }
    }
    return false;
}

- (void)sendLocalNotification:(NSString *)title
    message:(NSString *)message
    region:(CLRegion *)region {

    UNMutableNotificationContent* content = [[UNMutableNotificationContent alloc] init];

    content.title = [NSString localizedUserNotificationStringForKey:title arguments:nil];
    content.body = [NSString localizedUserNotificationStringForKey:message arguments:nil];
    content.sound = [UNNotificationSound defaultSound];

    UNTimeIntervalNotificationTrigger* trigger = [UNTimeIntervalNotificationTrigger
                triggerWithTimeInterval:1 repeats:NO];
    NSString *identifier = [NSString stringWithFormat:@"geofence-%@-%@",
                            region.identifier, [[NSUUID UUID] UUIDString]];
    UNNotificationRequest* request = [UNNotificationRequest requestWithIdentifier:identifier
                content:content trigger:trigger];

    UNUserNotificationCenter* center = [UNUserNotificationCenter currentNotificationCenter];
    [center addNotificationRequest:request withCompletionHandler:nil];
}

- (void)locationManager:(CLLocationManager *)manager didEnterRegion:(CLRegion *)region
{
    NSLog(@"didEnter : %@", region);
    [self sendEventWithName:@"onEnterGeofence" body:region.identifier];

    if (self.enterGeofenceNotificationTitle != nil && self.enterGeofenceNotificationText) {
        [self sendLocalNotification:self.enterGeofenceNotificationTitle
                            message:self.enterGeofenceNotificationText
                             region:region];
    }
}

- (void)locationManager:(CLLocationManager *)manager didExitRegion:(CLRegion *)region
{
    NSLog(@"didExit : %@", region);
    [self sendEventWithName:@"onExitGeofence" body:region.identifier];

    if (self.exitGeofenceNotificationTitle != nil && self.exitGeofenceNotificationText) {
        [self sendLocalNotification:self.exitGeofenceNotificationTitle
                            message:self.exitGeofenceNotificationText
                             region:region];
    }
}

- (RNBGLocationAuthorizationStatus) authorizationStatus
{
    CLAuthorizationStatus authStatus = [CLLocationManager authorizationStatus];
    switch (authStatus) {
        case kCLAuthorizationStatusNotDetermined:
            return RNBGLocationAuthorizationNotDetermined;
        case kCLAuthorizationStatusRestricted:
        case kCLAuthorizationStatusDenied:
            return RNBGLocationAuthorizationDenied;
        case kCLAuthorizationStatusAuthorizedAlways:
            return RNBGLocationAuthorizationAlways;
        case kCLAuthorizationStatusAuthorizedWhenInUse:
            return RNBGLocationAuthorizationForeground;
    }
}

- (BOOL) locationServicesEnabled
{
    if ([CLLocationManager respondsToSelector:@selector(locationServicesEnabled)]) {
        return [CLLocationManager locationServicesEnabled];
    }
    return NO;
}

// MARK: - Public API (New Architecture — selectors must match generated spec)

#ifdef RCT_NEW_ARCH_ENABLED

- (void)addGeofence:(JS::NativeBackgroundGeofence::GeofenceConfig &)config
            resolve:(RCTPromiseResolveBlock)resolve
             reject:(RCTPromiseRejectBlock)reject
{
    NSDictionary *dict = @{
        @"id": config.id_() ?: @"",
        @"lat": @(config.lat()),
        @"lng": @(config.lng()),
        @"radius": @(config.radius()),
        @"enterGeofenceNotificationTitle": config.enterGeofenceNotificationTitle() ?: [NSNull null],
        @"enterGeofenceNotificationText":  config.enterGeofenceNotificationText()  ?: [NSNull null],
        @"exitGeofenceNotificationTitle":  config.exitGeofenceNotificationTitle()  ?: [NSNull null],
        @"exitGeofenceNotificationText":   config.exitGeofenceNotificationText()   ?: [NSNull null],
    };
    [self _addGeofence:dict resolve:resolve reject:reject];
}

- (void)removeGeofence:(NSString *)geofenceId
               resolve:(RCTPromiseResolveBlock)resolve
                reject:(RCTPromiseRejectBlock)reject
{
    [self _removeGeofence:geofenceId resolve:resolve reject:reject];
}

- (void)removeAll:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
    [self _removeAll:resolve reject:reject];
}

- (void)checkStatus:(RCTResponseSenderBlock)successCallback
    failureCallback:(RCTResponseSenderBlock)failureCallback
{
    RCTLogInfo(@"RTCBackgroundGeofence #checkStatus");
    BOOL locationServicesEnabled = [self locationServicesEnabled];
    NSInteger authorizationStatus = [self authorizationStatus];
    NSMutableDictionary *dict = [NSMutableDictionary dictionaryWithCapacity:3];
    [dict setObject:[NSNumber numberWithBool:locationServicesEnabled] forKey:@"locationServicesEnabled"];
    [dict setObject:[NSNumber numberWithInteger:authorizationStatus] forKey:@"authorization"];
    successCallback(@[dict]);
}

- (void)triggetTestEvent:(NSString *)event
{
    [self sendEventWithName:event body:@"test-id"];
}

- (void)endTask:(double)taskKey
{
    [[RNBGBackgroundTaskManager sharedTasks] endTaskWithKey:(NSInteger)taskKey];
}

#else

// MARK: - Old Architecture (bridge)

RCT_EXPORT_METHOD(endTask:(NSNumber* _Nonnull)taskKey)
{
    [[RNBGBackgroundTaskManager sharedTasks] endTaskWithKey:[taskKey integerValue]];
}

RCT_EXPORT_METHOD(addGeofence:(NSDictionary*)config
    addWithResolver:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    [self _addGeofence:config resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(removeGeofence:(NSString *)boundaryId
    removeWithResolver:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    [self _removeGeofence:boundaryId resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(removeAll:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    [self _removeAll:resolve reject:reject];
}

RCT_EXPORT_METHOD(checkStatus:(RCTResponseSenderBlock)success
    failure:(RCTResponseSenderBlock)failure)
{
    RCTLogInfo(@"RTCBackgroundGeofence #checkStatus");
    BOOL locationServicesEnabled = [self locationServicesEnabled];
    NSInteger authorizationStatus = [self authorizationStatus];
    NSMutableDictionary *dict = [NSMutableDictionary dictionaryWithCapacity:3];
    [dict setObject:[NSNumber numberWithBool:locationServicesEnabled] forKey:@"locationServicesEnabled"];
    [dict setObject:[NSNumber numberWithInteger:authorizationStatus] forKey:@"authorization"];
    success(@[dict]);
}

RCT_EXPORT_METHOD(triggetTestEvent:(NSString *)event)
{
    [self sendEventWithName:event body:@"test-id"];
}

#endif

@end
