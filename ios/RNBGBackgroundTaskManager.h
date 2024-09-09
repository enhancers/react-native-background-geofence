//
//  MAURBackgroundTaskManager.h
//  BackgroundGeolocation
//
//  Created by Joel and Vomako (http://stackoverflow.com/a/27664620)
//

#ifndef RNBGBackgroundTaskManager_h
#define RNBGBackgroundTaskManager_h

#endif

typedef void (^CompletionBlock)(void);

@interface RNBGBackgroundTaskManager : NSObject

+ (id)sharedTasks;

- (NSUInteger)beginTask;
- (NSUInteger)beginTaskWithCompletionHandler:(CompletionBlock)_completion;
- (void)endTaskWithKey:(NSUInteger)_key;

@end
