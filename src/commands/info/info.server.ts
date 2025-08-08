import { DiscordClient } from "bot"
import { ChatInputCommandInteraction, Guild, ChannelType } from "discord.js"
import { EmbedHandler } from "../../services/index.js"
import { Colors } from "../../constants/index.js"
import { SubCommand } from "typings"
import { StringUtils, DiscordUtils } from "../../functions/utils.js"
import getGuildData from "../../functions/guild-data.js"

const { splitPascalCase, toPascalCase } = StringUtils
const { getChannelCountByTypes } = DiscordUtils

const command: SubCommand = {
    subCmd: "info.server",
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await interaction.deferReply()

        const guild = interaction.guild as Guild
        const { members, channels, emojis, roles, stickers } = guild

        const sortedRoles = roles.cache
            .map((r) => r)
            .slice(1, roles.cache.size)
            .sort((a, b) => b.position - a.position)

        const userRoles = sortedRoles.filter((r) => !r.managed)
        const managedRoles = sortedRoles.filter((r) => r.managed)
        const botCount = members.cache.filter((m) => m.user.bot).size
        const guildMetaData = getGuildData(guild)

        let embedColor = Colors.DISCORD.background
        if (members.me?.roles.highest.hexColor !== "#000000") {
            const hex = members.me!.roles.highest.hexColor.substring(1)
            const r = parseInt(hex.substring(0, 2), 16)
            const g = parseInt(hex.substring(2, 4), 16)
            const b = parseInt(hex.substring(4, 6), 16)
            embedColor = [r, g, b]
        }

        const textChannels = getChannelCountByTypes(channels, [
            ChannelType.GuildText,
            ChannelType.GuildForum,
            ChannelType.GuildAnnouncement
        ])
        const voiceChannels = getChannelCountByTypes(channels, [ChannelType.GuildVoice, ChannelType.GuildStageVoice])
        const threads = getChannelCountByTypes(channels, [
            ChannelType.PublicThread,
            ChannelType.PrivateThread,
            ChannelType.AnnouncementThread
        ])
        const categories = getChannelCountByTypes(channels, [ChannelType.GuildCategory])

        const guildCreatedTimestamp = Math.floor(guild.createdTimestamp / 1000)
        const animatedEmojis = emojis.cache.filter((e) => e.animated).size
        const staticEmojis = emojis.cache.filter((e) => !e.animated).size

        const resEmbed = EmbedHandler.create({
            color: embedColor,
            thumbnail: guild.iconURL({ size: 512 }),
            author: {
                name: guild.name,
                iconURL: guild.iconURL({ size: 64 }) ?? undefined
            },
            description: `\`${guild.id}\` • <@${guild.ownerId}> • <t:${guildCreatedTimestamp}:R>${guild.vanityURLCode ? ` • discord.gg/${guild.vanityURLCode}` : ""}`,
            fields: [
                {
                    name: "Users",
                    value: `**${guild.memberCount - botCount}** + **${botCount}** bots`,
                    inline: true
                },
                {
                    name: "Channels",
                    value: `**${textChannels}** text **${voiceChannels}** voice\n**${threads}** threads **${categories}** cats`,
                    inline: true
                },
                {
                    name: "Boost",
                    value: `**L${guildMetaData.boostLevel}** • **${guild.premiumSubscriptionCount}** boosts\n**${guildMetaData.uploadLimit}** MB upload`,
                    inline: true
                },
                {
                    name: "Assets",
                    value: `static: ${staticEmojis}/${guildMetaData.maxEmojis}\nanimated: ${animatedEmojis}/${guildMetaData.maxAnimatedEmojis}\nstickers: ${stickers.cache.size}/${guildMetaData.maxStickers}`,
                    inline: true
                },
                {
                    name: "Security",
                    value: `**Verification:** ${splitPascalCase(guildMetaData.verificationLevel, " ")}\n**Content Filter:** ${splitPascalCase(guildMetaData.explicitContentFilter, " ")}`,
                    inline: true
                },
                {
                    name: "Roles",
                    value: `**${userRoles.length}** user + **${managedRoles.length}** managed`,
                    inline: true
                }
            ]
        })

        if (guild.features.length > 0) {
            const featureNames = guild.features
                .slice(0, 8)
                .map((feature) => toPascalCase(feature, { separator: " " }))
                .join(" • ")

            resEmbed.addFields({
                name: "Features",
                value: featureNames + (guild.features.length > 8 ? ` • +${guild.features.length - 8} more` : "")
            })
        }

        if (userRoles.length > 0) {
            const topRoles = userRoles.slice(0, 15).join(" ")
            if (topRoles.length < 1024) {
                resEmbed.addFields({
                    name: `Top Roles (${Math.min(15, userRoles.length)}/${userRoles.length})`,
                    value: topRoles
                })
            }
        }

        if (guild.bannerURL()) {
            resEmbed.setImage(guild.bannerURL({ size: 1024 }))
        }

        await interaction.editReply({ embeds: [resEmbed] })
    }
}

export default command
