import { env } from 'process';

export const serverConfig = {
    bot: {
        clientId: '745710864316760195',
        clientSecret: 'hbM8e03CUujP3wRH-A7CaK8VzwidfSXj',
        token: {
            env: 'DISCORD_BOT_TOKEN',
            file: './discord-bot-token'
        }
    },
    database: {
        host: `mongodb://${env['MONGODB_HOST'] || '127.0.0.1'}`,
        port: env['MONGODB_PORT'] || '27017',
        name: env['MONGODB_NAME'] || 'DiscordLaboBotV2'
    },
    commands: {
        prefix: "!"
    },
    express: {
        port: 8080
    },
    socket: {
        port: 3000
    }
};