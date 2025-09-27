import { DiscordClient } from "bot";
import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Events,
    NewsChannel,
    TextChannel,
    ThreadChannel,
} from "discord.js";

import { EventInterface, CommandInterface, SubCommand } from "typings";

import { Logger, EmbedHandler } from "../../services/index.js";

import { DiscordLimits } from "../../constants/index.js";
import { config } from "../../config.js";

import { RateLimiter } from "discord.js-rate-limiter";
const rateLimiter = new RateLimiter(
    config.rateLimits.commands.amount,
    config.rateLimits.commands.interval
);

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const logs = require("../../../config/logs.json");

const validateCommandFlags = (
    interaction: ChatInputCommandInteraction,
    client: DiscordClient,
    command: CommandInterface | SubCommand
): boolean => {
    const guild = interaction.guild;
    if (!guild) return false;

    const sendError = (message: string): false => {
        interaction.reply({
            embeds: [EmbedHandler.error(interaction, message)],
            ephemeral: true,
        });
        return false;
    };

    if (command.owner && interaction.user.id !== config.owner) {
        return sendError("*This action can only be performed by the bot owner!*");
    }

    if (command.player) {
        const player = client.poru.players.get(guild.id);
        const botVoiceChannel = guild.members.cache.get(client.user!.id)?.voice.channel;

        if (!player || !botVoiceChannel) {
            return sendError("*I'm not connected to any voice channel!*");
        }

        const userVoiceChannel = guild.members.cache.get(interaction.user.id)?.voice.channel;
        if (!userVoiceChannel) {
            return sendError("*You need to be in a voice channel!*");
        }

        if (botVoiceChannel.id !== userVoiceChannel.id) {
            return sendError("*You need to be in the same voice channel as me!*");
        }
    }

    if (command.currentTrack) {
        const player = client.poru.players.get(guild.id);
        if (!player || !player.currentTrack) {
            return sendError("*There's no track currently playing!*");
        }
    }

    return true;
};

const event: EventInterface = {
    name: Events.InteractionCreate,
    options: { once: false, rest: false },
    execute: async (
        interaction: ChatInputCommandInteraction | AutocompleteInteraction,
        client: DiscordClient
    ) => {
        if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            Logger.error(
                logs.error.commandNotFound
                    .replaceAll("{INTERACTION_ID}", interaction.id)
                    .replaceAll("{COMMAND_NAME}", interaction.commandName)
            );

            return EmbedHandler.error(interaction, "Command not found...");
        }

        const subCommand = interaction.options.getSubcommand(false);
        const subCmdFile = subCommand
            ? client.subcommands.get(`${interaction.commandName}.${subCommand}`)
            : null;

        if (interaction.isChatInputCommand()) {
            // check if user is rate limited
            const limited = rateLimiter.take(interaction.user.id);
            if (limited) return;

            try {
                // Validate command flags
                const commandToValidate = subCmdFile || command;
                if (!validateCommandFlags(interaction, client, commandToValidate)) return;

                subCmdFile
                    ? subCmdFile.execute(interaction, client)
                    : command.execute(interaction, client);

                const commandLog = subCommand
                    ? `${interaction.commandName}.${subCommand}`
                    : interaction.commandName;

                Logger.info(`Command Executed [${commandLog}]`);
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
                              .replaceAll(
                                  "{GUILD_NAME}",
                                  interaction.guild?.name ?? "Unknown Guild"
                              )
                              .replaceAll("{GUILD_ID}", interaction.guild?.id ?? "Unknown ID")
                        : logs.error.commandOther
                              .replaceAll("{INTERACTION_ID}", interaction.id)
                              .replaceAll("{COMMAND_NAME}", interaction.commandName)
                              .replaceAll("{USER_TAG}", interaction.user.tag)
                              .replaceAll("{USER_ID}", interaction.user.id)
                );
            }
        } else if (interaction.isAutocomplete()) {
            const autoCompleteHandler = subCmdFile?.autocomplete || command.autocomplete;

            if (!autoCompleteHandler) {
                Logger.error(
                    logs.error.autocompleteNotFound
                        .replaceAll("{INTERACTION_ID}", interaction.id)
                        .replaceAll("{COMMAND_NAME}", interaction.commandName)
                );
                return;
            }

            try {
                let choices = await autoCompleteHandler(interaction, client);
                await interaction.respond(choices.slice(0, DiscordLimits.CHOICES_PER_AUTOCOMPLETE));
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
                              .replaceAll(
                                  "{GUILD_NAME}",
                                  interaction.guild?.name ?? "Unknown Guild"
                              )
                              .replaceAll("{GUILD_ID}", interaction.guild?.id ?? "Unknown ID")
                        : logs.error.autocompleteOther
                              .replaceAll("{INTERACTION_ID}", interaction.id)
                              .replaceAll("{OPTION_NAME}", interaction.commandName)
                              .replaceAll("{COMMAND_NAME}", interaction.commandName)
                              .replaceAll("{USER_TAG}", interaction.user.tag)
                              .replaceAll("{USER_ID}", interaction.user.id),
                    err
                );
            }
        }
    },
};

export default event;
