import { DiscordClient } from "bot"
import { Colors } from "../../constants/index.js"
import { ChatInputCommandInteraction, GuildMember } from "discord.js"
import { SubCommand } from "typings"
import { EmbedHandler } from "../../services/index.js"
import { StringUtils } from "../../functions/utils.js"

const { splitPascalCase } = StringUtils

const command: SubCommand = {
    subCmd: "info.user",
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await interaction.deferReply()

        const targetUser = interaction.options.getUser("target") || interaction.user
        const user = await targetUser.fetch(true)
        const member = (interaction.options.getMember("target") as GuildMember) || (interaction.member as GuildMember)

        let embedColor = Colors.DISCORD.background
        if (member?.displayHexColor !== "#000000") {
            const hex = member.displayHexColor.substring(1)
            const r = parseInt(hex.substring(0, 2), 16)
            const g = parseInt(hex.substring(2, 4), 16)
            const b = parseInt(hex.substring(4, 6), 16)
            embedColor = [r, g, b]
        }

        const roles =
            member?.roles.cache
                .filter((r) => r.name !== "@everyone")
                .sort((a, b) => b.position - a.position)
                .map((r) => r) || []

        const joinedServer = member?.joinedTimestamp ? Math.floor(member.joinedTimestamp / 1000) : null
        const joinedDiscord = Math.floor(user.createdTimestamp / 1000)
        const userBadges = user.flags?.toArray() || []

        // Get highest permission
        const getHighestPermission = () => {
            if (!member?.permissions) return "None"
            if (member.permissions.has("Administrator")) return "Administrator"
            if (member.permissions.has("ManageGuild")) return "Manage Server"
            if (member.permissions.has("ManageChannels")) return "Manage Channels"
            if (member.permissions.has("ManageRoles")) return "Manage Roles"
            if (member.permissions.has("BanMembers")) return "Ban Members"
            if (member.permissions.has("KickMembers")) return "Kick Members"
            if (member.permissions.has("ManageMessages")) return "Manage Messages"
            return "Basic Permissions"
        }

        const presence = member?.presence
        console.log()
        const status = presence?.status ? splitPascalCase(presence.status, " ") : "offline"
        const activities = presence?.activities.filter((activity) => activity.type !== 4)
        const activity =
            activities && activities.length > 0
                ? `${activities[0].name}${activities[0].details ? ` - ${activities[0].details}` : ""}`
                : "None"

        const userType = user.bot ? "Bot" : user.system ? "System" : "User"
        const avatarURL = user.displayAvatarURL({ size: 1024 })
        const bannerURL = user.bannerURL({ size: 1024 })

        const resEmbed = EmbedHandler.create({
            color: embedColor,
            thumbnail: avatarURL,
            author: {
                name: `${user.displayName} (${user.username})`,
                iconURL: avatarURL
            },
            description: `\`${user.id}\` • **${userType}** • <t:${joinedDiscord}:R>${member && joinedServer ? ` • Joined <t:${joinedServer}:R>` : ""}`,
            fields: [
                {
                    name: "Status",
                    value: `**${status}**${activity !== "None" ? `\n${activity}` : ""}`,
                    inline: true
                },
                {
                    name: "Server Info",
                    value: member
                        ? `**Nickname:** ${member.nickname || "None"}\n**Color:** ${member.displayHexColor}`
                        : "Not in server",
                    inline: true
                },
                {
                    name: "Permission",
                    value: `**${getHighestPermission()}**`,
                    inline: true
                },
                {
                    name: "Highest Role",
                    value: member?.roles.highest.name !== "@everyone" ? `${member.roles.highest}` : "None",
                    inline: true
                },
                {
                    name: "Badges",
                    value:
                        userBadges.length > 0
                            ? userBadges
                                  .slice(0, 3)
                                  .map((badge) => splitPascalCase(badge, " "))
                                  .join("\n") + (userBadges.length > 3 ? `\n+${userBadges.length - 3} more` : "")
                            : "None",
                    inline: true
                },
                {
                    name: "Assets",
                    value: `**Avatar:** ${avatarURL ? "[View](" + avatarURL + ")" : "Default"}\n**Banner:** ${bannerURL ? "[View](" + bannerURL + ")" : "None"}`,
                    inline: true
                }
            ]
        })

        if (roles.length > 0) {
            const topRoles = roles.slice(0, 12).join(" ")
            if (topRoles.length < 1024) {
                resEmbed.addFields({
                    name: `Roles (${Math.min(12, roles.length)}/${roles.length})`,
                    value: topRoles
                })
            }
        }

        if (bannerURL) {
            resEmbed.setImage(bannerURL)
        }

        await interaction.editReply({ embeds: [resEmbed] })
    }
}

export default command
