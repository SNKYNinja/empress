import { DiscordClient } from "bot"
import { Events } from "discord.js"
import { EventInterface } from "typings"

import clientDB from "../../models/client/client.db.js"

const event: EventInterface = {
    name: Events.ClientReady,
    options: { once: true, rest: false },
    execute: async (client: DiscordClient) => {
        client.poru.init()

        // store ram usage
        setInterval(async () => {
            const memUsage = process.memoryUsage().heapUsed / (1024 * 1024)

            const data = await clientDB.findOneAndUpdate(
                { client: true },
                { $push: { memory: memUsage } },
                { upsert: true, new: true }
            )

            if (data && data.memory.length >= 14) {
                data.memory.shift()
                await data.save()
            }
        }, 30 * 1000) // every 30 secs
    }
}

export default event
