import { DiscordClient } from "bot"
import { ButtonInteraction, Events } from "discord.js"
import { EventInterface } from "typings"

import { config } from "../../config.js"

import { RateLimiter } from "discord.js-rate-limiter"
const rateLimiter = new RateLimiter(config.rateLimits.commands.amount, config.rateLimits.commands.interval)

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

        if (!button) return

        button.execute(interaction, client)
    }
}

export default event
