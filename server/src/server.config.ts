export const serverConfig = {
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