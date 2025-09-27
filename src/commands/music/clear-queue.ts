import type { DiscordClient } from "bot";
import {
    type ChatInputCommandInteraction,
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import type { CommandInterface } from "typings";
import { EmbedHandler } from "../../services/index.js";
import { Colors } from "../../constants/index.js";

const command: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName("clear-queue")
        .setDescription("Remove all the tracks from the queue")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setContexts(InteractionContextType.Guild),
    player: true,
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        if (player.queue.length === 0) {
            const embed = EmbedHandler.error(
                interaction,
                "*There are no tracks in the queue to clear!*"
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const trackCount = player.queue.length;
        player.queue.clear();

        const embed = EmbedHandler.create({
            author: {
                name: interaction.user.displayName,
                iconURL: interaction.user.displayAvatarURL(),
            },
            description: `*Cleared **${trackCount} track${trackCount > 1 ? "s" : ""}** from queue*`,
            color: Colors.ALL.blue,
            timestamp: true,
        });

        await interaction.reply({ embeds: [embed] });
    },
};

export default command;
