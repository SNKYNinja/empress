import { DiscordClient } from "bot"
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Events,
    NewsChannel,
    TextChannel,
    ThreadChannel
} from "discord.js"

import { EventInterface } from "typings"

import { Logger, EmbedHandler } from "../../services/index.js"

import { DiscordLimits } from "../../constants/index.js"
import { config } from "../../config.js"

import { RateLimiter } from "discord.js-rate-limiter"
const rateLimiter = new RateLimiter(config.rateLimits.commands.amount, config.rateLimits.commands.interval)

import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const logs = require("../../../config/logs.json")

const event: EventInterface = {
    name: Events.InteractionCreate,
    options: { once: false, rest: false },
    execute: async (interaction: ChatInputCommandInteraction | AutocompleteInteraction, client: DiscordClient) => {
        if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return

        const command = client.commands.get(interaction.commandName)
        if (!command) {
            Logger.error(
                logs.error.commandNotFound
                    .replaceAll("{INTERACTION_ID}", interaction.id)
                    .replaceAll("{COMMAND_NAME}", interaction.commandName)
            )

            return EmbedHandler.error(interaction, "Command not found...")
        }

        const subCommand = interaction.options.getSubcommand(false)
        const subCmdFile = subCommand ? client.subcommands.get(`${interaction.commandName}.${subCommand}`) : null

        if (interaction.isChatInputCommand()) {
            // check if user is rate limited
            const limited = rateLimiter.take(interaction.user.id)
            if (limited) return

            try {
                if (command.owner && interaction.user.id !== client.config.owner) return

                subCmdFile ? subCmdFile.execute(interaction, client) : command.execute(interaction, client)

                const commandLog = subCommand ? `${interaction.commandName}.${subCommand}` : interaction.commandName

                Logger.info(`Command Executed [${commandLog}]`)
            } catch (err) {
                Logger.error(
                    interaction.channel instanceof TextChannel ||
                        interaction.channel instanceof NewsChannel ||
                        interaction.channel instanceof ThreadChannel
                        ? logs.error.commandGuild
                              .replaceAll("{INTERACTION_ID}", interaction.id)
                              .replaceAll("{COMMAND_NAME}", interaction.commandName)
                              .replaceAll("{USER_TAG}", interaction.user.tag)
                              .replaceAll("{USER_ID}", interaction.user.id)
                              .replaceAll("{CHANNEL_NAME}", interaction.channel.name)
                              .replaceAll("{CHANNEL_ID}", interaction.channel.id)
                              .replaceAll("{GUILD_NAME}", interaction.guild?.name ?? "Unknown Guild")
                              .replaceAll("{GUILD_ID}", interaction.guild?.id ?? "Unknown ID")
                        : logs.error.commandOther
                              .replaceAll("{INTERACTION_ID}", interaction.id)
                              .replaceAll("{COMMAND_NAME}", interaction.commandName)
                              .replaceAll("{USER_TAG}", interaction.user.tag)
                              .replaceAll("{USER_ID}", interaction.user.id)
                )
            }
        } else if (interaction.isAutocomplete()) {
            const autoCompleteHandler = subCmdFile?.autocomplete || command.autocomplete

            if (!autoCompleteHandler) {
                Logger.error(
                    logs.error.autocompleteNotFound
                        .replaceAll("{INTERACTION_ID}", interaction.id)
                        .replaceAll("{COMMAND_NAME}", interaction.commandName)
                )
                return
            }

            try {
                let choices = await autoCompleteHandler(interaction, client)
                await interaction.respond(choices.slice(0, DiscordLimits.CHOICES_PER_AUTOCOMPLETE))
            } catch (err) {
                Logger.error(
                    interaction.channel instanceof TextChannel ||
                        interaction.channel instanceof NewsChannel ||
                        interaction.channel instanceof ThreadChannel
                        ? logs.error.autocompleteGuild
                              .replaceAll("{INTERACTION_ID}", interaction.id)
                              .replaceAll("{OPTION_NAME}", interaction.commandName)
                              .replaceAll("{COMMAND_NAME}", interaction.commandName)
                              .replaceAll("{USER_TAG}", interaction.user.tag)
                              .replaceAll("{USER_ID}", interaction.user.id)
                              .replaceAll("{CHANNEL_NAME}", interaction.channel.name)
                              .replaceAll("{CHANNEL_ID}", interaction.channel.id)
                              .replaceAll("{GUILD_NAME}", interaction.guild?.name ?? "Unknown Guild")
                              .replaceAll("{GUILD_ID}", interaction.guild?.id ?? "Unknown ID")
                        : logs.error.autocompleteOther
                              .replaceAll("{INTERACTION_ID}", interaction.id)
                              .replaceAll("{OPTION_NAME}", interaction.commandName)
                              .replaceAll("{COMMAND_NAME}", interaction.commandName)
                              .replaceAll("{USER_TAG}", interaction.user.tag)
                              .replaceAll("{USER_ID}", interaction.user.id),
                    err
                )
            }
        }
    }
}

export default event
