import { Client, Collection, GatewayIntentBits, Partials, version } from "discord.js"
import { CommandInterface, EventInterface, ButtonInterface, SelectMenuInterface, ConfigInterface } from "typings"
import { config } from "./config.js"

import { SlashCommandHandler, ComponentInteractionHandler, ClientEventHandler } from "./handlers/index.js"
const { loadCommands } = new SlashCommandHandler()
const { loadEvents } = new ClientEventHandler()
const { loadButtons, loadSelectMenus } = new ComponentInteractionHandler()

import { connect } from "mongoose"

import { Logger } from "./services/index.js"

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const logs = require("../config/logs.json")

export class DiscordClient extends Client {
    public commands: Collection<string, CommandInterface>
    public subcommands: Collection<string, CommandInterface>
    public events: Collection<string, EventInterface>
    public buttons: Collection<string, ButtonInterface>
    public selectMenus: Collection<string, SelectMenuInterface>
    public cooldowns: Collection<string, number>
    public config: ConfigInterface

    constructor() {
        super({
            intents: [
                GatewayIntentBits.AutoModerationConfiguration,
                GatewayIntentBits.AutoModerationExecution,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.DirectMessages,
                // GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.MessageContent
            ],
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.GuildScheduledEvent,
                Partials.Message,
                Partials.Reaction,
                Partials.ThreadMember,
                Partials.User
            ]
        })

        this.commands = new Collection()
        this.subcommands = new Collection()
        this.events = new Collection()
        this.buttons = new Collection()
        this.selectMenus = new Collection()
        this.config = config
        this.cooldowns = new Collection()
    }

    private async connectDatabase() {
        try {
            const conn = await connect(process.env.DATABASE_URL)
            Logger.info(logs.info.dbConnection.replaceAll("{PORT}", conn.connection.port))
        } catch (err) {
            Logger.warn(logs.error.dbConnection, err)
        }
    }

    public async loadClient() {
        try {
            await Promise.all([
                loadCommands(this),
                loadEvents(this),
                loadButtons(this),
                loadSelectMenus(this),
                this.connectDatabase()
            ])
            await this.login(this.config.bot.token)

            Logger.info(logs.info.clientLogin.replaceAll("{USER_TAG}", this.user?.tag))
        } catch (err) {
            Logger.warn(logs.error.clientLogin, err)
        }
    }
}

new DiscordClient().loadClient()
