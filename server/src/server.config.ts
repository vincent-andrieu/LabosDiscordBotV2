import { env } from 'process';

export const serverConfig = {
    bot: {
        clientId: env['DISCORD_BOT_CLIENT_ID'],
        clientSecret: env['DISCORD_BOT_CLIENT_SECRET'],
        token: {
            env: 'DISCORD_BOT_TOKEN',
            file: './discord-bot-token'
        }
    },
    database: {
        host: env['MONGODB_HOST'] || '127.0.0.1',
        port: env['MONGODB_PORT'] || '27017',
        username: env['MONGODB_USERNAME'],
        password: env['MONGODB_PASSWORD'],
        name: env['MONGODB_NAME'] || 'DiscordLaboBotV2'
    },
    commands: {
        prefix: "!"
    },
    express: {
        port: Number(env['EXPRESS_PORT']) || 8080
    },
    socket: {
        port: Number(env['SOCKET_PORT']) || 3000
    }
};