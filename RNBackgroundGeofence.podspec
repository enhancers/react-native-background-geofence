require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "RNBackgroundGeofence"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]


  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/enhancers/react-native-background-geofence.git", :tag => "#{s.version}" }

  s.dependency 'React-Core'
  s.static_framework = true
  s.preserve_paths      = 'docs', 'CHANGELOG.md', 'LICENSE', 'package.json', 'RNBackgroundGeofence.ios.js'
  s.dependency 'CocoaLumberjack', '~> 3.8.5'
  s.source_files        = 'ios/RNBackgroundGeofence/*.{h,mm}'
  s.libraries           = 'sqlite3', 'z', 'stdc++'
  s.vendored_frameworks = 'ios/RNBackgroundGeofence/TSLocationManager.xcframework'
  s.resource_bundles = {'TSLocationManagerPrivacy' => ['ios/Resources/PrivacyInfo.xcprivacy']}
end
