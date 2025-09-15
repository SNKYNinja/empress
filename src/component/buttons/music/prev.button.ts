import { ButtonInterface } from "typings";
import { DiscordClient } from "bot";
import { ButtonInteraction, MessageFlags } from "discord.js";
import { EmbedHandler } from "../../../services/index.js";
import { Colors } from "../../../constants/index.js";

const button: ButtonInterface = {
    id: "prev",
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        if (!player.previousTrack) {
            const embed = EmbedHandler.error(
                interaction,
                "*No previous track was found!*"
            );

            return interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferUpdate();

        const embed = EmbedHandler.create({
            author: {
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            },
            description: `*Skipped to previous track ― [${player.previousTrack.info.title}](${player.previousTrack.info.uri})*`,
            color: Colors.ALL.blue,
            timestamp: true,
        });

        const channel = interaction.channel;
        if (channel && "send" in channel) {
            const message = await channel.send({ embeds: [embed] });
            setTimeout(() => message?.delete().catch(() => {}), 7000);
        }

        player.queue.unshift(player.previousTrack);
        player.loop === "QUEUE" && player.queue.pop();
        player.skip();
    },
};

export default button;
