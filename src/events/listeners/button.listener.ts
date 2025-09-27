import { DiscordClient } from "bot";
import { ButtonInteraction, Events, NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import { EventInterface, ButtonInterface } from "typings";

import { config } from "../../config.js";
import { Logger, EmbedHandler } from "../../services/index.js";

import { RateLimiter } from "discord.js-rate-limiter";

const rateLimiter = new RateLimiter(
    config.rateLimits.commands.amount,
    config.rateLimits.commands.interval
);

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const logs = require("../../../config/logs.json");

const validateFlags = (
    interaction: ButtonInteraction,
    client: DiscordClient,
    button: ButtonInterface
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

    if (button.owner && interaction.user.id !== config.owner) {
        return sendError("*This action can only be performed by the bot owner!*");
    }

    if (button.player) {
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

    if (button.currentTrack) {
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
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        if (!interaction.isButton()) return;

        // don't respond to self/bots
        if (interaction.user.id === interaction.client.user.id || interaction.user.bot) return;

        // check if user is rate limited
        const limited = rateLimiter.take(interaction.user.id);
        if (limited) return;

        const button = client.buttons.get(interaction.customId);

        if (!button) {
            Logger.error(
                logs.error.buttonNotFound
                    .replaceAll("{INTERACTION_ID}", interaction.id)
                    .replaceAll("{BUTTON_ID}", interaction.customId)
            );
            return EmbedHandler.error(interaction, "*Button not found...*");
        }

        if (!validateFlags(interaction, client, button)) return;

        try {
            button.execute(interaction, client);
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
            );
        }
    },
};

export default event;
