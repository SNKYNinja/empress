import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { SubCommandInterface } from "typings"

const command: SubCommandInterface = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription(".")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setContexts(InteractionContextType.Guild)
        .addSubcommand((subCmd) =>
            subCmd
                .setName("user")
                .setDescription(".")
                .addUserOption((opts) => opts.setName("target").setDescription(".").setRequired(true))
        )
        .addSubcommand((subCmd) => subCmd.setName("server").setDescription("."))
}

export default command
