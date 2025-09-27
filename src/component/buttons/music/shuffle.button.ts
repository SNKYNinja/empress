import { DiscordClient } from "bot";
import { ButtonInteraction, MessageFlags } from "discord.js";
import { EmbedHandler } from "../../../services/index.js";
import { ButtonInterface } from "typings";
import { Colors } from "../../../constants/index.js";

const button: ButtonInterface = {
    id: "shuffle",
    player: true,
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        if (player.queue.length <= 1) {
            const embed = EmbedHandler.error(interaction, "*No tracks in the queue to shuffle!*");
            return interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral,
            });
        }

        player.queue.shuffle();

        const embed = EmbedHandler.create({
            author: {
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            },
            description: `*Shuffled **${player.queue.length}** track${
                player.queue.length === 1 ? "" : "s"
            } in the queue*`,
            color: Colors.ALL.blue,
            timestamp: true,
        });

        const channel = interaction.channel;
        if (channel && "send" in channel) {
            const message = await channel.send({ embeds: [embed] });
            setTimeout(() => message?.delete().catch(() => {}), 7000);
        }
    },
};

export default button;
