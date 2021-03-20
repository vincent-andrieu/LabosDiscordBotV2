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
        address: 'mongodb://127.0.0.1',
        port: '27017',
        name: 'DiscordLaboBotV2'
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