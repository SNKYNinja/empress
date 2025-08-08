import { EmbedBuilder, RGBTuple } from "@discordjs/builders"
import { Colors } from "../constants/index.js"

interface EmbedOptions {
    title?: string
    description?: string
    color?: RGBTuple
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
        if (opts.fields) embed.addFields(...opts.fields)
        if (opts.footer) embed.setFooter(opts.footer)
        if (opts.thumbnail) embed.setThumbnail(opts.thumbnail)
        if (opts.image) embed.setImage(opts.image)
        if (opts.author) embed.setAuthor(opts.author)
        if (opts.timestamp ?? true) embed.setTimestamp()

        return embed
    }

    static error(message: string): EmbedBuilder {
        return this.create({ description: message, color: Colors.DISCORD.red })
    }
}

export { EmbedHandler, EmbedOptions }
