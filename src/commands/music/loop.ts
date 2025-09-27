import type { DiscordClient } from "bot";
import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { CommandInterface } from "typings";
import { Colors } from "../../constants/index.js";
import { buildPlayerControls } from "../../services/poru.js";
import { EmbedHandler } from "../../services/index.js";

const command: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Set the loop mode of the player")
        .addStringOption((option) =>
            option
                .setName("mode")
                .setDescription("Choose the looping mode")
                .addChoices(
                    { name: "Track", value: "TRACK" },
                    { name: "Queue", value: "QUEUE" },
                    { name: "Disable", value: "NONE" }
                )
                .setRequired(true)
        ),
    player: true,
    currentTrack: true,
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await interaction.deferReply();

        const player = client.poru.players.get(interaction.guild!.id)!;
        const mode = interaction.options.getString("mode") as "TRACK" | "QUEUE" | "NONE";

        let description: string;

        const queueLoop = `*Queue Looped ― **${player.queue.length + 1}** track${
            player.queue.length === 1 ? "" : "s"
        }*`;
        const trackLoop = `*Track Looped ― [${player.currentTrack?.info.title}](${player.currentTrack?.info.uri})*`;
        const disabledLoop = "*Loop Disabled ― Player*";

        player.setLoop(mode);

        switch (mode) {
            case "TRACK":
                description = trackLoop;
                break;
            case "QUEUE":
                description = queueLoop;
                break;
            case "NONE":
                description = disabledLoop;
                break;
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
            await player.message.edit({ components: [controlRow, secondaryRow] }).catch((e) => {
                console.log(e);
            });
        }

        await interaction.editReply({ embeds: [embed] });
    },
};

export default command;
