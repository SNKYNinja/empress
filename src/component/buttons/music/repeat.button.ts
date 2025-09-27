import { DiscordClient } from "bot";
import { Colors } from "../../../constants/index.js";
import { ButtonInteraction, MessageFlags } from "discord.js";
import { EmbedHandler } from "../../../services/index.js";
import { ButtonInterface } from "typings";

const button: ButtonInterface = {
    id: "repeat",
    player: true,
    currentTrack: true,
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        if (!player.currentTrack?.info.isSeekable) {
            const embed = EmbedHandler.error(interaction, "*Track is not seekable!*");

            return interaction.reply({
                embeds: [embed],
                flags: MessageFlags.Ephemeral,
            });
        }

        const embed = EmbedHandler.create({
            author: {
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            },
            description: `*Track Repeated ― [${player.currentTrack.info.title}](${player.currentTrack.info.uri})*`,
            color: Colors.ALL.blue,
            timestamp: true,
        });

        interaction.deferUpdate();

        const channel = interaction.channel;
        if (channel && "send" in channel) {
            const message = await channel.send({ embeds: [embed] });
            setTimeout(() => message?.delete().catch(() => {}), 7000);
        }

        player.seekTo(0);
    },
};

export default button;
