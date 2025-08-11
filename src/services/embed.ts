import { EmbedBuilder, RGBTuple } from "@discordjs/builders"
import { Colors, Icons } from "../constants/index.js"
import { BaseInteraction } from "discord.js"

interface EmbedOptions {
    title?: string
    description?: string
    color?: RGBTuple
    url?: string
    fields?: { name: string; value: string; inline?: boolean }[]
    footer?: { text: string; iconURL?: string }
    thumbnail?: string | null
    image?: string | null
    author?: { name: string; iconURL?: string; url?: string }
    timestamp?: boolean
}

class EmbedHandler {
    static create(opts: EmbedOptions): EmbedBuilder {
        const embed = new EmbedBuilder().setColor(opts.color ?? Colors.DISCORD.background)

        if (opts.title) embed.setTitle(opts.title)
        if (opts.description) embed.setDescription(opts.description)
        if (opts.url) embed.setURL(opts.url)
        if (opts.fields) embed.addFields(...opts.fields)
        if (opts.footer) embed.setFooter(opts.footer)
        if (opts.thumbnail) embed.setThumbnail(opts.thumbnail)
        if (opts.image) embed.setImage(opts.image)
        if (opts.author) embed.setAuthor(opts.author)
        if (opts.timestamp ?? true) embed.setTimestamp()

        return embed
    }

    static error(interaction: BaseInteraction, message: string): EmbedBuilder {
        return this.create({
            description: `${Icons.STATUS.error} ${message}`,
            color: Colors.DISCORD.red,
            author: { name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ size: 1024 }) }
        })
    }
}

export { EmbedHandler, EmbedOptions }
