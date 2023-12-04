# Discove App

React native app for https://discove.xyz .

## Setup

- yarn install
- create a `.env.development.local` using `.env.example` as a template.

# Running a build

yarn run build

# Running a preview version on android physical device

eas build -p android --profile preview
Download directly to the device
Once your build is completed, copy the URL to the APK from the build details page or the link provided when eas build is done.
Send that URL to your device. Maybe by email? Up to you.
Open the URL on your device, install the APK and run it.

# create a testflight version

bump version in `app.config.ts` under the `version` property

eas build --profile production --platform ios

eas submit --platform ios

go into the build manually and add the external group
