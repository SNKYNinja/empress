import { ApplicationCommandDataResolvable, Events } from "discord.js"
import { CommandInterface } from "typings"
import { DiscordClient } from "bot"

import { glob } from "glob"
import { pathToFileURL } from "node:url"
import path from "path"
import { Logger } from "../services/logger.js"

export class SlashCommandHandler {
    constructor() {}

    public async loadCommands(client: DiscordClient) {
        try {
            let cmdArray: Array<ApplicationCommandDataResolvable> = []
            let cmdDevArray: Array<ApplicationCommandDataResolvable> = []

            const cmdDir = await glob(`${process.cwd()}/dist/commands/*/*{.ts,.js}`)

            await Promise.all(
                cmdDir.map(async (file) => {
                    const cmdPath = path.resolve(file)

                    const command: CommandInterface = (await import(`${pathToFileURL(cmdPath)}`)).default

                    if (command.subCmd) return client.subcommands.set(command.subCmd, command)

                    if (file.endsWith(".dev.ts") || file.endsWith(".dev.js")) {
                        cmdDevArray.push(command.data.toJSON())
                    } else {
                        cmdArray.push(command.data.toJSON())
                    }

                    client.commands.set(command.data.name, command)
                })
            )

            // register commands
            client.on(Events.ClientReady, async () => {
                // puglic commands
                client.application?.commands.set(cmdArray)

                // dev commands
                client.config.guilds.forEach(async (guild) => {
                    await client.guilds.cache.get(guild.id)?.commands.set(cmdDevArray)
                })
            })
        } catch (err) {
            Logger.error("Command Handler", err)
        }
    }
}
