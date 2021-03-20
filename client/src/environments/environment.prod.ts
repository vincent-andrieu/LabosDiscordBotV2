import { env } from 'process';

export const environment = {
    production: true,
    cookiesName: {
        sidenavStatus: 'sidenavStatus',
        discordUserId: 'discordUserId'
    },
    sockets: {
        url: env['SOCKETS_URL'] ||  'http://localhost:3000'
    },
    server: {
        url: env['SERVER_URL'] || 'http://localhost:8080'
    }
};