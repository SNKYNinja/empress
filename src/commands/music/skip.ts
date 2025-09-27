import type { DiscordClient } from "bot";
import {
    type ChatInputCommandInteraction,
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { CommandInterface } from "typings";
import { MusicUtils } from "../../functions/music-utils.js";

const command: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Skip the current track")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setContexts(InteractionContextType.Guild),
    player: true,
    currentTrack: true,
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await MusicUtils.skipTrack(interaction, client);
    },
};

export default command;
