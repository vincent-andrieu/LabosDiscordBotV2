import { Client, Role } from 'discord.js';
import DiscordOauth2 from 'discord-oauth2';

import { DiscordRole, DiscordUser } from '@global/interfaces/discord.interface';
import { ServerSchema } from '@schemas/servers.schema';
import { CServer } from '@interfaces/server.class';
import { serverConfig } from '../server.config';
import DiscordBot from '../init/bot';
import Sockets from 'init/sockets';

export class DiscordService {
    private _serverSchema: ServerSchema = new ServerSchema(this._socketService);
    private _discordOAuth = new DiscordOauth2({
        clientId: serverConfig.bot.clientId,
        clientSecret: serverConfig.bot.clientSecret
    });

    constructor(private _client: Client, private _socketService: Sockets) {}

    public getAuthUrl(serverId: string, password: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this._serverSchema.login(serverId, password).then((isLoginValid: boolean) => {
                if (!isLoginValid) {
                    return reject("Permission denied");
                }
                this._serverSchema.getById(serverId).then((server: CServer) => {
                    if (!server.url) {
                        return reject("No URL");
                    }
                    const oauthUrl: string = this._discordOAuth.generateAuthUrl({
                        scope: ['identify'],
                        state: JSON.stringify({
                            serverId: server._id,
                            password: server.password
                        }),
                        redirectUri: `${server.url?.endsWith("/") ? server.url.slice(0, -1) : server.url}/auth/discord/redirect`
                    });

                    if (!oauthUrl) {
                        return reject("Fail to generate auth URL");
                    }
                    resolve(JSON.stringify(oauthUrl));
                }).catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public setToken(code: string, serverId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this._serverSchema.getById(serverId).then((server: CServer) => {
                this._discordOAuth.tokenRequest({
                    code: code,
                    scope: ['identify'],
                    grantType: 'authorization_code',
                    redirectUri: `${server.url?.endsWith("/") ? server.url.slice(0, -1) : server.url}/auth/discord/redirect`
                })
                    .then((token) => {
                        this._discordOAuth.getUser(token.access_token)
                            .then((user) => {
                                resolve(user.id.toString());
                                this._discordOAuth.revokeToken(
                                    token.access_token,
                                    Buffer.from(`${serverConfig.bot.clientId}:${serverConfig.bot.clientSecret}`).toString("base64")
                                );
                            })
                            .catch((err) => reject(err));
                    })
                    .catch((err) => reject(err));
            }).catch((err) => reject(err));
        });
    }

    public getRoles(server: CServer): Array<DiscordRole> {
        if (!server.defaultChannel) {
            return [];
        }
        const result: Array<DiscordRole> = [];

        server.defaultChannel.guild.roles.cache.forEach((role: Role) => result.push({
            id: role.id,
            name: role.name,
            color: role.hexColor
        }));

        return result;
    }

    public getChannelUsers(server: CServer): Array<DiscordUser> {
        if (!server.defaultChannel) {
            return [];
        }
        const result: Array<DiscordUser> = [];

        server.defaultChannel.members.array().forEach((guildMember) => result.push({
            id: guildMember.id,
            name: guildMember.displayName,
            avatar: guildMember.user.displayAvatarURL(),
            color: guildMember.displayHexColor
        }));

        return result;
    }

    public isUserInServer(serverId: string, userId: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (!serverId || !userId) {
                return resolve(false);
            }

            const guild = DiscordBot.getServerFromId(serverId);

            if (!guild) {
                return resolve(false);
            }
            guild.members.fetch(userId)
                .then((guildMember) => resolve(!!guildMember))
                .catch(() => resolve(false));
        });
    }
}