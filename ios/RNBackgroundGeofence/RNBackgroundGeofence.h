#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>
#import <UIKit/UIKit.h>
#import <AudioToolbox/AudioToolbox.h>
#import <TSLocationManager/TSLocationManager.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTInvalidating.h>

@interface RNBackgroundGeofence : RCTEventEmitter <RCTInvalidating>

@property(nonatomic, strong) TSLocationManager *locationManager;

@end
