import { ConfigInterface } from "typings"
import "dotenv/config"

export const config: ConfigInterface = {
    owner: process.env.OWNER_ID,
    bot: { name: "Empress", token: process.env.DISCORD_TOKEN },
    guilds: [
        {
            name: process.env.DEV_GUILD_NAME,
            id: process.env.DEV_GUILD_ID
        }
    ],
    rateLimits: {
        commands: {
            amount: 10,
            interval: 30
        },
        buttons: {
            amount: 10,
            interval: 30
        },
        triggers: {
            amount: 10,
            interval: 30
        },
        reactions: {
            amount: 10,
            interval: 30
        }
    }
}
