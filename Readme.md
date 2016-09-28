# Intercom Test app for Cordova

## Installation
- Add appropriate platform and run it
   - iOS
   ```
   cordova platform add ios
   cordova run ios
   ```
   - Android
   ```
   cordova platform add android
   cordova run android
   ```
- Add plugins (this should be automatically done in the first step but if not, manually add Intercom Cordova plugin https://github.com/intercom/intercom-cordova )
    `cordova plugin add cordova-plugin-intercom`
    `cordova plugin add https://github.com/intercom/phonegap-plugin-push.git --variable SENDER_ID="YOUR_SENDER_ID"`
- In `config.xml` configure the following preference values
    - `intercom-app-id`
    - `intercom-ios-api-key`
    - `intercom-android-api-key`
    - `SENDER_ID` for Android push notifications
- In the app, in the settings page configure
   - Secure Mode Secret Key if using secure Mode
   - GCM Sender ID if using Android push notifications/messages


## Screens

![screens](/screenshots/screens.gif)
