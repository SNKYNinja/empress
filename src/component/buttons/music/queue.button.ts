import { ButtonInterface } from "typings";
import { DiscordClient } from "bot";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { Colors } from "../../../constants/index.js";
import { EmbedHandler } from "../../../services/embed.js";
import { EmbedPaginator } from "../../../services/paginator.js";

const trim = (text: string, max: number): string =>
    text.length > max ? `${text.slice(0, max - 1)}…` : text;

const formatLong = (ms: number): string => {
    const sec = Math.floor(ms / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    const parts: string[] = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    if (s || parts.length === 0) parts.push(`${s}s`);
    return parts.join(" ");
};

const button: ButtonInterface = {
    id: "queue",
    player: true,
    currentTrack: true,
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        const hasQueue = player.queue.length > 0;
        const current = player.currentTrack?.info;
        if (!current || !hasQueue) {
            const embed = EmbedHandler.create({
                description: `There are no tracks in queue!`,
                color: Colors.DISCORD.red,
                author: {
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL(),
                },
            });
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply();

        let queueLength = 0;
        for (const track of player.queue) queueLength += track.info.length;

        const chunkSize = 5;
        const embeds: EmbedBuilder[] = [];
        for (let i = 0; i < player.queue.length; i += chunkSize) {
            const chunk = player.queue.slice(i, i + chunkSize);
            const nowTitle = current.title ?? "Unknown";
            const nowUri = current.uri ?? "";
            const nowLength = current.length ?? 0;

            const embed = new EmbedBuilder()
                .setColor(Colors.DISCORD.burple)
                .setTitle("Now Playing")
                .setAuthor({
                    name: interaction.guild?.name!,
                    iconURL: interaction.guild?.iconURL() ?? undefined,
                })
                .setThumbnail(current.artworkUrl ?? null)
                .setDescription(
                    nowUri
                        ? `[${nowTitle}](${nowUri}) [\`${Math.floor(
                              nowLength / 60000
                          )}:${Math.floor((nowLength % 60000) / 1000)
                              .toString()
                              .padStart(2, "0")}\`]`
                        : `${nowTitle} [\`${Math.floor(nowLength / 60000)}:${Math.floor(
                              (nowLength % 60000) / 1000
                          )
                              .toString()
                              .padStart(2, "0")}\`]`
                )
                .addFields({
                    name: `Up Next ― ${formatLong(queueLength)}`,
                    value: chunk
                        .map(
                            (track: any, index: number) =>
                                `**${i + index + 1}.** [${trim(track.info.title, 31)}](${
                                    track.info.uri
                                }) ➜ ${track.info.requester}`
                        )
                        .join("\n_ _"),
                });

            embeds.push(embed);
        }

        const paginator = new EmbedPaginator(interaction, embeds, { deferReplied: true });
        await paginator.send();
    },
};

export default button;
