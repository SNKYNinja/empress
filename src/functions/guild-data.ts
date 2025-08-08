import { GuildExplicitContentFilter, GuildNSFWLevel, GuildPremiumTier, GuildVerificationLevel, Guild } from "discord.js"

interface guildMetaData {
    maxEmojis: number
    maxAnimatedEmojis: number
    maxStickers: number
    boostLevel: number
    uploadLimit: number
    explicitContentFilter: string
    nsfwLevel: string
    verificationLevel: string
}

export default function getGuildData(guild: Guild): guildMetaData {
    const guildData: guildMetaData = {
        maxEmojis: 50,
        maxAnimatedEmojis: 50,
        maxStickers: 5,
        boostLevel: 0,
        uploadLimit: 8,
        explicitContentFilter: GuildExplicitContentFilter[guild.explicitContentFilter],
        nsfwLevel: GuildNSFWLevel[guild.nsfwLevel],
        verificationLevel: GuildVerificationLevel[guild.verificationLevel]
    }

    switch (guild.premiumTier) {
        case GuildPremiumTier.Tier1:
            guildData.maxEmojis = 100
            guildData.maxAnimatedEmojis = 100
            guildData.maxStickers = 15
            guildData.boostLevel = 1
            guildData.uploadLimit = 8
            break
        case GuildPremiumTier.Tier2:
            guildData.maxEmojis = 150
            guildData.maxAnimatedEmojis = 150
            guildData.maxStickers = 30
            guildData.boostLevel = 3
            guildData.uploadLimit = 50
            break
        case GuildPremiumTier.Tier3:
            guildData.maxEmojis = 250
            guildData.maxAnimatedEmojis = 250
            guildData.maxStickers = 60
            guildData.boostLevel = 3
            guildData.uploadLimit = 100
    }

    return guildData
}
