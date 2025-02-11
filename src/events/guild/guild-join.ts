import { DiscordClient } from "bot"
import { Events, Guild } from "discord.js"
import { EventInterface } from "typings"

import { Logger } from "../../services/index.js"

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const logs = require("../../../config/logs.json")

const event: EventInterface = {
    name: Events.GuildCreate,
    options: { once: false, rest: false },
    execute: async (guild: Guild, client: DiscordClient) => {
        Logger.info(logs.info.guildJoined.replaceAll("{GUILD_NAME}", guild.name).replaceAll("{GUILD_ID}", guild.id))

        const owner = await guild.fetchOwner()

        if (owner) {
            // TODO: send message to owner
        }
    }
}

export default event
