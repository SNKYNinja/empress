import type { DiscordClient } from "bot";
import { type ButtonInteraction, type ChatInputCommandInteraction } from "discord.js";
import { EmbedHandler } from "../services/index.js";
import { Colors } from "../constants/index.js";
import { EmbedPaginator } from "../services/index.js";
import { StringUtils } from "../functions/utils.js";

// Shared utility functions for music operations
export const MusicUtils = {
    async showQueue(
        interaction: ButtonInteraction | ChatInputCommandInteraction,
        client: DiscordClient
    ) {
        const player = client.poru.players.get(interaction.guild!.id)!;
        const hasQueue = player.queue.length > 0;
        const current = player.currentTrack?.info;

        if (!current || !hasQueue) {
            const embed = EmbedHandler.create({
                description: "*There are no tracks in queue!*",
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
        const embeds: any[] = [];
        for (let i = 0; i < player.queue.length; i += chunkSize) {
            const chunk = player.queue.slice(i, i + chunkSize);
            const nowTitle = current.title ?? "Unknown";
            const nowUri = current.uri ?? "";
            const nowLength = current.length ?? 0;

            const embed = EmbedHandler.create({
                color: Colors.DISCORD.burple,
                title: "Now Playing",
                author: {
                    name: interaction.guild?.name!,
                    iconURL: interaction.guild?.iconURL() ?? undefined,
                },
                thumbnail: current.artworkUrl ?? null,
                description: nowUri
                    ? `[${nowTitle}](${nowUri}) [\`${Math.floor(nowLength / 60000)}:${Math.floor(
                          (nowLength % 60000) / 1000
                      )
                          .toString()
                          .padStart(2, "0")}\`]`
                    : `${nowTitle} [\`${Math.floor(nowLength / 60000)}:${Math.floor(
                          (nowLength % 60000) / 1000
                      )
                          .toString()
                          .padStart(2, "0")}\`]`,
                fields: [
                    {
                        name: `Up Next ― ${StringUtils.formatLong(queueLength)}`,
                        value:
                            "\n" +
                            chunk
                                .map(
                                    (track: any, index: number) =>
                                        `**${i + index + 1}.** [${StringUtils.trimSentence(
                                            track.info.title,
                                            31
                                        )}](${track.info.uri}) ➜ ${track.info.requester}`
                                )
                                .join("\n_ _"),
                    },
                ],
            });

            embeds.push(embed);
        }

        const paginator = new EmbedPaginator(interaction, embeds, { deferReplied: true });
        await paginator.send();
    },

    async shuffleQueue(
        interaction: ButtonInteraction | ChatInputCommandInteraction,
        client: DiscordClient
    ) {
        const player = client.poru.players.get(interaction.guild!.id)!;

        if (player.queue.length <= 1) {
            const embed = EmbedHandler.error(interaction, "*No tracks in the queue to shuffle!*");
            return interaction.reply({ embeds: [embed], ephemeral: true });
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

        await interaction.reply({ embeds: [embed] });
    },

    async repeatTrack(
        interaction: ButtonInteraction | ChatInputCommandInteraction,
        client: DiscordClient
    ) {
        const player = client.poru.players.get(interaction.guild!.id)!;

        if (!player.currentTrack?.info.isSeekable) {
            const embed = EmbedHandler.error(interaction, "*Track is not seekable!*");
            return interaction.reply({ embeds: [embed], ephemeral: true });
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

        player.seekTo(0);
        await interaction.reply({ embeds: [embed] });
    },

    async skipTrack(
        interaction: ButtonInteraction | ChatInputCommandInteraction,
        client: DiscordClient
    ) {
        const player = client.poru.players.get(interaction.guild!.id)!;

        const current = player.currentTrack?.info;
        const title = current?.title ?? "Unknown";
        const uri = current?.uri ?? "";

        const embed = EmbedHandler.create({
            author: {
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            },
            description: uri ? `*Skipped ― [${title}](${uri})*` : `*Skipped ― ${title}*`,
            color: Colors.ALL.blue,
            timestamp: true,
        });

        player.skip();
        await interaction.reply({ embeds: [embed] });
    },
};
