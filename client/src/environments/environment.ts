// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import moment = require("moment");

export const environment = {
    production: false,
    cookiesName: {
        sidenavStatus: 'sidenavStatus',
        discordUserId: 'discordUserId'
    },
    cookiesDuration: moment(moment.now()).add(1, 'year').toDate(), // 1 year
    sockets: {
        url: 'http://localhost:3000'
    },
    server: {
        url: 'http://localhost:8080'
    }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.