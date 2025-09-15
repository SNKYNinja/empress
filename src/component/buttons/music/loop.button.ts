import { DiscordClient } from "bot";
import { Colors } from "../../../constants/index.js";
import { ButtonInteraction } from "discord.js";
import { ButtonInterface } from "typings";
import { buildPlayerControls } from "../../../services/poru.js";
import { EmbedHandler } from "../../../services/index.js";

const button: ButtonInterface = {
    id: "loop",
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        let description: string;
        const queueLoop = `*Queue Looped ― **${player.queue.length + 1}** track${
            player.queue.length === 1 ? "" : "s"
        }*`;
        const trackLoop = `*Track Looped ― [${(player.currentTrack?.info.title, 31)}](${
            player.currentTrack?.info.uri
        })*`;
        const disabledLoop = "*Loop Disabled ― Player*";

        switch (player.loop) {
            case "TRACK":
                if (player.queue.length > 0) {
                    player.setLoop("QUEUE");
                    description = queueLoop;
                } else {
                    player.setLoop("NONE");
                    description = disabledLoop;
                }
                break;
            case "QUEUE":
                player.setLoop("NONE");
                description = disabledLoop;
                break;
            default:
                player.setLoop("TRACK");
                description = trackLoop;
        }

        const embed = EmbedHandler.create({
            author: {
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            },
            description,
            color: Colors.ALL.blue,
            timestamp: true,
        });

        if (player.message) {
            const [controlRow, secondaryRow] = buildPlayerControls(player);
            await player.message.edit({ components: [controlRow, secondaryRow] }).catch(() => {});
        }

        interaction.deferUpdate();

        const channel = interaction.channel;
        if (channel && "send" in channel) {
            const message = await channel.send({ embeds: [embed] });
            setTimeout(() => message?.delete().catch(() => {}), 7000);
        }
    },
};

export default button;
