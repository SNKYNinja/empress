import { type NodeGroup, Poru, type PoruOptions } from "poru"
import type { DiscordClient } from "../bot.js"
import { Logger } from "./logger.js"

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

        // Track start event
        client.poru.on("trackStart", (player, track) => {
            const channel = client.channels.cache.get(player.textChannel)
            if (channel && "send" in channel) {
                channel.send(`Now playing \`${track.info.title}\``)
            }
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
