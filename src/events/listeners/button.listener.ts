import { DiscordClient } from "bot"
import { ButtonInteraction, Events, NewsChannel, TextChannel, ThreadChannel } from "discord.js"
import { EventInterface } from "typings"

import { config } from "../../config.js"
import { Logger, EmbedHandler } from "../../services/index.js"

import { RateLimiter } from "discord.js-rate-limiter"

const rateLimiter = new RateLimiter(config.rateLimits.commands.amount, config.rateLimits.commands.interval)

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const logs = require("../../../config/logs.json")

const event: EventInterface = {
    name: Events.InteractionCreate,
    options: { once: false, rest: false },
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        if (!interaction.isButton()) return

        // don't respond to self/bots
        if (interaction.user.id === interaction.client.user.id || interaction.user.bot) return

        // check if user is rate limited
        const limited = rateLimiter.take(interaction.user.id)
        if (limited) return

        const button = client.buttons.get(interaction.customId)

        if (!button) {
            Logger.error(
                logs.error.buttonNotFound
                    .replaceAll("{INTERACTION_ID}", interaction.id)
                    .replaceAll("{BUTTON_ID}", interaction.customId)
            )
            return EmbedHandler.error(interaction, "Button not found...")
        }

        try {
            button.execute(interaction, client)
        } catch (err) {
            Logger.error(
                interaction.channel instanceof TextChannel ||
                    interaction.channel instanceof NewsChannel ||
                    interaction.channel instanceof ThreadChannel
                    ? logs.error.buttonGuild
                        .replaceAll("{INTERACTION_ID}", interaction.id)
                        .replaceAll("{BUTTON_ID}", interaction.customId)
                        .replaceAll("{USER_TAG}", interaction.user.tag)
                        .replaceAll("{USER_ID}", interaction.user.id)
                        .replaceAll("{CHANNEL_NAME}", interaction.channel.name)
                        .replaceAll("{CHANNEL_ID}", interaction.channel.id)
                        .replaceAll("{GUILD_NAME}", interaction.guild?.name ?? "Unknown Guild")
                        .replaceAll("{GUILD_ID}", interaction.guild?.id ?? "Unknown ID")
                    : logs.error.buttonOther
                        .replaceAll("{INTERACTION_ID}", interaction.id)
                        .replaceAll("{BUTTON_ID}", interaction.customId)
                        .replaceAll("{USER_TAG}", interaction.user.tag)
                        .replaceAll("{USER_ID}", interaction.user.id),
                err
            )
        }
    }
}

export default event
