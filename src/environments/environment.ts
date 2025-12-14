// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyAwyl2obJk5LGGcTWe9OoiQEu9DrnBuDL4",
    authDomain: "figmacricket.firebaseapp.com",
    databaseURL: "https://figmacricket-dc90f-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "figmacricket",
    storageBucket: "figmacricket.firebasestorage.app",
    messagingSenderId: "554911060100",
    appId: "1:554911060100:web:39c6bb8e3cab1a029172d1",
    measurementId: "G-MBS9BXH5BB"
  },
  google: {
    clientId: '283947795791-ccg73rtcieliv8urtvhvsljqruunj7g7.apps.googleusercontent.com',
    scopes: ['profile', 'email']
  }
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
