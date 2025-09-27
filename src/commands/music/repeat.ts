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
        .setName("repeat")
        .setDescription("Repeat the current track from the beginning")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setContexts(InteractionContextType.Guild),
    player: true,
    currentTrack: true,
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await MusicUtils.repeatTrack(interaction, client);
    },
};

export default command;
