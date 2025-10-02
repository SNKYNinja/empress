import { type NodeGroup, Poru, type PoruOptions, type Player } from "poru";
import type { DiscordClient } from "../bot.js";
import { Logger } from "./logger.js";
import { ActionRowBuilder, ButtonStyle, TextChannel, Message, GuildMember } from "discord.js";
import { ButtonBuilder } from "@discordjs/builders";
import { Icons, Colors } from "../constants/index.js";
import { EmbedHandler } from "./embed.js";
import { formatDuration } from "../functions/utils.js";

// Extend Poru types to include custom properties
declare module "poru" {
    interface Player {
        message?: Message;
    }
}

const nodes: NodeGroup[] = [
    {
        name: "Node 1",
        host: "lavalink.jirayu.net",
        port: 13592,
        password: "youshallnotpass",
        secure: false,
    },
];

const options: PoruOptions = {
    library: "discord.js",
    defaultPlatform: "ytsearch",
    reconnectTries: 1,
};

export function buildPlayerControls(
    player: Player
): [ActionRowBuilder<ButtonBuilder>, ActionRowBuilder<ButtonBuilder>] {
    // Determine loop status
    let loopEmoji: any;
    switch (player.loop) {
        case "TRACK":
            loopEmoji = Icons.MUSIC.loop_once;
            break;
        case "QUEUE":
            loopEmoji = Icons.MUSIC.loop_queue;
            break;
        default:
            loopEmoji = Icons.MUSIC.loop;
    }

    const pausePlayEmoji = player.isPaused ? Icons.MUSIC.play : Icons.MUSIC.pause;

    const controlRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId("loop").setEmoji(loopEmoji).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("prev")
            .setEmoji(Icons.MUSIC.previous)
            .setStyle(ButtonStyle.Primary),
        // .setDisabled(!player.previousTrack)
        new ButtonBuilder()
            .setCustomId("p/p")
            .setEmoji(pausePlayEmoji)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("skip")
            .setEmoji(Icons.MUSIC.skip)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("playlist")
            .setEmoji(Icons.MUSIC.playlist)
            .setStyle(ButtonStyle.Secondary)
    );

    const secondaryRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId("stop")
            .setEmoji(Icons.MUSIC.stop)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("shuffle")
            .setEmoji(Icons.MUSIC.shuffle)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("like")
            .setEmoji(Icons.MUSIC.like)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("repeat")
            .setEmoji(Icons.MUSIC.repeat)
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("queue")
            .setEmoji(Icons.MUSIC.queue)
            .setStyle(ButtonStyle.Secondary)
    );

    return [controlRow, secondaryRow];
}

export class PoruService {
    public static setupPoru(client: DiscordClient): void {
        client.poru = new Poru(client, nodes, options);

        client.poru.on("trackStart", (player, track) => {
            const source =
                track.info.sourceName.charAt(0).toUpperCase() + track.info.sourceName.slice(1);
            const nextTrack = player.queue[0]?.info;
            const nextTrackText = nextTrack
                ? `[${
                      nextTrack.title.length > 35
                          ? nextTrack.title.substring(0, 35) + "..."
                          : nextTrack.title
                  }](${nextTrack.uri})`
                : "None";

            const [controlRow, secondaryRow] = buildPlayerControls(player);

            // Format duration
            const duration = formatDuration(track.info.length);

            const channel = client.channels.cache.get(player.textChannel) as TextChannel;

            const embed = EmbedHandler.create({
                author: {
                    name: channel.guild.name,
                    iconURL: channel.guild.iconURL({ size: 64 }) ?? undefined,
                },
                title: "Now Playing",
                description: `**[${track.info.title}](${track.info.uri})**`,
                color: Colors.ALL.blue,
                image: track.info.artworkUrl,
                fields: [
                    {
                        name: "Author",
                        value: track.info.author.split(",").join(", "),
                        inline: true,
                    },
                    { name: "\u200B", value: "\u200B", inline: true },
                    {
                        name: "Duration",
                        value: `\`${duration}\``,
                        inline: true,
                    },
                    { name: "Next Track", value: nextTrackText, inline: true },
                    { name: "\u200B", value: "\u200B", inline: true },
                    {
                        name: "Requested By",
                        value: track.info.requester ? `<@${track.info.requester.id}>` : "Unknown",
                        inline: true,
                    },
                ],
                footer: {
                    text: (track.info.requester as GuildMember).displayName || "Unknown",
                    iconURL:
                        track.info.requester?.displayAvatarURL({
                            size: 1024,
                        }) || undefined,
                },
                timestamp: true,
            });
            // Clean up previous message
            player.message?.delete().catch(() => {});

            // Send new player message
            channel
                ?.send({
                    embeds: [embed],
                    components: [controlRow, secondaryRow],
                })
                .then((message) => {
                    player.message = message;
                })
                .catch(() => {});
        });

        // Track end event
        client.poru.on("trackEnd", (player, track) => {
            player.message?.delete().catch(() => {});
            Logger.info(`Track ended: ${track.info.title} in guild ${player.guildId}`);
        });

        // Player create event
        client.poru.on("playerCreate", (player) => {
            Logger.info(`Player created for guild ${player.guildId}`);
        });

        // Player destroy event
        client.poru.on("playerDestroy", (player) => {
            player.message?.delete().catch(() => {});
            Logger.info(`Player destroyed for guild ${player.guildId}`);
        });

        // Queue end event
        client.poru.on("queueEnd", (player) => {
            const channel = client.channels.cache.get(player.textChannel);
            player.message?.delete().catch(() => {});
            if (channel && "send" in channel) {
                channel.send("Queue has ended!");
            }
            Logger.info(`Queue ended for guild ${player.guildId}`);
        });

        // Player error event
        // client.poru.on("playerError", (player, error) => {
        //     Logger.error(`Player error in guild ${player.guildId}`, error)
        // })

        // Node connect event
        client.poru.on("nodeConnect", (node) => {
            Logger.info(`Lavalink "${node.name}" connected`);
        });

        // Node disconnect event
        client.poru.on("nodeDisconnect", (node) => {
            Logger.warn(`Lavalink "${node.name}" disconnected`);
        });

        // Node error event
        client.poru.on("nodeError", (node, error) => {
            Logger.error(`Lavalink "${node.name}" error`, error);
        });

        Logger.info("Poru music system initialized");
    }
}
