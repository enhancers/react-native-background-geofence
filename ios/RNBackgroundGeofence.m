
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
    }

    return self;
}

RCT_EXPORT_METHOD(startTask:(RCTResponseSenderBlock)callback)
{
    NSUInteger taskKey = [[RNBGBackgroundTaskManager sharedTasks] beginTask];
    callback(@[[NSNumber numberWithInteger:taskKey]]);
}

RCT_EXPORT_METHOD(endTask:(NSNumber* _Nonnull)taskKey)
{
    [[RNBGBackgroundTaskManager sharedTasks] endTaskWithKey:[taskKey integerValue]];
}

RCT_EXPORT_METHOD(addGeofence:(NSDictionary*)config 
    addWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{

    if(config[@"enterGeofenceNotificationTitle"] != nil && config[@"enterGeofenceNotificationText"]) {
        self.enterGeofenceNotificationTitle = config[@"enterGeofenceNotificationTitle"] ;
        self.enterGeofenceNotificationText = config[@"enterGeofenceNotificationText"];
    }

    if(config[@"exitGeofenceNotificationTitle"] != nil && config[@"exitGeofenceNotificationText"]) {
        self.exitGeofenceNotificationTitle = config[@"exitGeofenceNotificationTitle"];
        self.exitGeofenceNotificationText = config[@"exitGeofenceNotificationText"];
    }
    
    if (CLLocationManager.authorizationStatus != kCLAuthorizationStatusAuthorizedAlways) {
        [self.locationManager requestAlwaysAuthorization];
    }

    if ([CLLocationManager authorizationStatus] == kCLAuthorizationStatusAuthorizedAlways) {
        NSString *id = config[@"id"];
        CLLocationCoordinate2D center = CLLocationCoordinate2DMake([config[@"lat"] doubleValue], [config[@"lng"] doubleValue]);
        CLRegion *boundaryRegion = [[CLCircularRegion alloc]initWithCenter:center
                                                                    radius:[config[@"radius"] doubleValue]
                                                                identifier:id];

        [self.locationManager startMonitoringForRegion:boundaryRegion];

        resolve(id);
    } else {
        reject(@"PERM", @"Access fine location is not permitted", [NSError errorWithDomain:@"boundary" code:200 userInfo:@{@"Error reason": @"Invalid permissions"}]);
    }
}

RCT_EXPORT_METHOD(removeGeofence:(NSString *)boundaryId removeWithResolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    if ([self removeBoundary:boundaryId]) {
        resolve(boundaryId);
    } else {
        reject(@"@no_boundary", @"No boundary with the provided id was found", [NSError errorWithDomain:@"boundary" code:200 userInfo:@{@"Error reason": @"Invalid boundary ID"}]);
    }
}

RCT_EXPORT_METHOD(removeAll:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        [self removeAllBoundaries];
    }
    @catch (NSError *ex) {
        reject(@"failed_remove_all", @"Failed to remove all boundaries", ex);
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

- (NSArray<NSString *> *)supportedEvents
{
    return @[@"onEnterGeofence", @"onExitGeofence"];
}

- (void)sendLocalNotification:(NSString *)title 
    message:(NSString *)message 
    region:(CLRegion *)region {

    UNMutableNotificationContent* content = [[UNMutableNotificationContent alloc] init];

    content.title = [NSString localizedUserNotificationStringForKey:title arguments:nil];
    content.body = [NSString localizedUserNotificationStringForKey:message
                arguments:nil];
    content.sound = [UNNotificationSound defaultSound];
       
    UNTimeIntervalNotificationTrigger* trigger = [UNTimeIntervalNotificationTrigger
                triggerWithTimeInterval:5 repeats:NO];
    UNNotificationRequest* request = [UNNotificationRequest requestWithIdentifier:@"FiveSecond"
                content:content trigger:trigger];

    UNUserNotificationCenter* center = [UNUserNotificationCenter currentNotificationCenter];
    [center addNotificationRequest:request withCompletionHandler:nil];

}

- (void)locationManager:(CLLocationManager *)manager didEnterRegion:(CLRegion *)region
{
    NSLog(@"didEnter : %@", region);
    [self sendEventWithName:@"onEnterGeofence" body:region.identifier];

    if(self.enterGeofenceNotificationTitle != nil && self.enterGeofenceNotificationText) {
        [self sendLocalNotification:self.enterGeofenceNotificationTitle message:self.enterGeofenceNotificationText region:region];
    } 
}

- (void)locationManager:(CLLocationManager *)manager didExitRegion:(CLRegion *)region
{
    NSLog(@"didExit : %@", region);
    [self sendEventWithName:@"onExitGeofence" body:region.identifier];

    if(self.exitGeofenceNotificationTitle != nil && self.exitGeofenceNotificationText) {
        [self sendLocalNotification:self.exitGeofenceNotificationTitle message:self.exitGeofenceNotificationText region:region];
    }
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end

