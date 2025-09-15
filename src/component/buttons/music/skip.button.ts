import { ButtonInterface } from "typings";
import { DiscordClient } from "bot";
import { ButtonInteraction } from "discord.js";
import { EmbedHandler } from "../../../services/index.js";
import { Colors } from "../../../constants/index.js";

const button: ButtonInterface = {
    id: "skip",
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        await interaction.deferUpdate();

        const current = player.currentTrack?.info;
        const title = current?.title ?? "Unknown";
        const uri = current?.uri ?? "";

        const embed = EmbedHandler.create({
            author: {
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            },
            description: uri
                ? `*Skipped ― [${title}](${uri})*`
                : `*Skipped ― ${title}*`,
            color: Colors.ALL.blue,
            timestamp: true,
        });

        const channel = interaction.channel;
        if (channel && "send" in channel) {
            const message = await channel.send({ embeds: [embed] });
            setTimeout(() => message?.delete().catch(() => {}), 7000);
        }

        player.skip();
    },
};

export default button;
