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
        .setName("queue")
        .setDescription("Display the current music queue")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setContexts(InteractionContextType.Guild),
    player: true,
    currentTrack: true,
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await MusicUtils.showQueue(interaction, client);
    },
};

export default command;
