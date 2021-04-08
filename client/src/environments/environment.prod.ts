import moment = require("moment");

export const environment = {
    production: true,
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