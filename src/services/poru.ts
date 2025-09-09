import { type NodeGroup, Poru, type PoruOptions } from "poru"
import type { DiscordClient } from "../bot.js"
import { Logger } from "./logger.js"
import { ActionRowBuilder, APIMessageComponentEmoji, ButtonStyle, TextChannel } from "discord.js"
import { ButtonBuilder } from "@discordjs/builders"
import { Icons, Colors } from "../constants/index.js"
import { EmbedHandler } from "./embed.js"

const nodes: NodeGroup[] = [
    {
        name: "Node 1",
        host: "lava-v4.ajieblogs.eu.org",
        port: 443,
        password: "https://dsc.gg/ajidevserver",
        secure: true
    }
]

const options: PoruOptions = {
    library: "discord.js",
    defaultPlatform: "ytsearch",
    reconnectTries: 1
}

export class PoruService {
    public static setupPoru(client: DiscordClient): void {
        client.poru = new Poru(client, nodes, options)

        client.poru.on("trackStart", (player, track) => {
            // const channel = client.channels.cache.get(player.textChannel)
            // if (channel && "send" in channel) {
            //     channel.send(`Now playing \`${track.info.title}\``)
            // }

            const source = track.info.sourceName.charAt(0).toUpperCase() + track.info.sourceName.slice(1)
            const nextTrack = player.queue[0]?.info
            const nextTrackText = nextTrack
                ? `[${nextTrack.title.length > 35 ? nextTrack.title.substring(0, 35) + "..." : nextTrack.title}](${nextTrack.uri})`
                : "None"

            // // Determine loop status
            let loopEmoji: string
            switch (player.loop) {
                case "TRACK":
                    loopEmoji = "🔂"
                    break
                case "QUEUE":
                    loopEmoji = "🔁"
                    break
                default:
                    loopEmoji = "↩️"
            }
            // Create main control row
            const controlRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId("loop")
                    .setEmoji({
                        name: loopEmoji
                    })
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setEmoji({ name: Icons.MUSIC.previous })
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(!player.previousTrack),
                new ButtonBuilder()
                    .setCustomId("p/p")
                    .setEmoji({ name: Icons.MUSIC.pause })
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("skip")
                    .setEmoji({ name: Icons.MUSIC.skip })
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("stop")
                    .setEmoji({ name: Icons.MUSIC.stop })
                    .setStyle(ButtonStyle.Danger)
            )

            // Create secondary control row
            const secondaryRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId("shuffle")
                    .setEmoji({ name: Icons.MUSIC.shuffle })
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("queue")
                    .setEmoji({ name: Icons.MUSIC.queue })
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("like")
                    .setEmoji({ name: Icons.MUSIC.like })
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("repeat")
                    .setEmoji({ name: Icons.MUSIC.repeat })
                    .setStyle(ButtonStyle.Secondary)
            )

            // Format duration
            const duration = track.info.length
                ? `${Math.floor(track.info.length / 60000)}:${Math.floor((track.info.length % 60000) / 1000)
                      .toString()
                      .padStart(2, "0")}`
                : "Live"

            const embed = EmbedHandler.create({
                title: "🎵 Now Playing",
                description:
                    `**[${track.info.title}](${track.info.uri})**\n\n` +
                    `**Artist:** ${track.info.author}\n` +
                    `**Duration:** \`${duration}\`\n` +
                    `**Source:** ${source}\n` +
                    `**Requested by:** <@${track.info.requester?.id}>\n\n` +
                    `**Next:** ${nextTrackText}`,
                color: Colors.ALL.blue,
                thumbnail: track.info.artworkUrl,
                timestamp: true,
                image: track.info.artworkUrl
            })
            const channel = client.channels.cache.get(player.textChannel) as TextChannel
            // Clean up previous message
            // @ts-ignore-error
            player.message?.delete().catch(() => {})
            // Send new player message
            channel
                ?.send({
                    embeds: [embed],
                    components: [controlRow, secondaryRow]
                })
                .then((message) => {
                    // @ts-ignore-error
                    player.message = message
                })
                .catch(() => {})
        })

        // Track end event
        client.poru.on("trackEnd", (player, track) => {
            Logger.info(`Track ended: ${track.info.title} in guild ${player.guildId}`)
        })

        // Player create event
        client.poru.on("playerCreate", (player) => {
            Logger.info(`Player created for guild ${player.guildId}`)
        })

        // Player destroy event
        client.poru.on("playerDestroy", (player) => {
            Logger.info(`Player destroyed for guild ${player.guildId}`)
        })

        // Queue end event
        client.poru.on("queueEnd", (player) => {
            const channel = client.channels.cache.get(player.textChannel)
            if (channel && "send" in channel) {
                channel.send("Queue has ended!")
            }
            Logger.info(`Queue ended for guild ${player.guildId}`)
        })

        // Player error event
        // client.poru.on("playerError", (player, error) => {
        //     Logger.error(`Player error in guild ${player.guildId}`, error)
        // })

        // Node connect event
        client.poru.on("nodeConnect", (node) => {
            Logger.info(`Lavalink "${node.name}" connected`)
        })

        // Node disconnect event
        client.poru.on("nodeDisconnect", (node) => {
            Logger.warn(`Lavalink "${node.name}" disconnected`)
        })

        // Node error event
        client.poru.on("nodeError", (node, error) => {
            Logger.error(`Lavalink "${node.name}" error`, error)
        })

        Logger.info("Poru music system initialized")
    }
}
