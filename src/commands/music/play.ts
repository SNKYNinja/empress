import type { DiscordClient } from "bot"
import {
    type AutocompleteInteraction,
    InteractionContextType,
    PermissionFlagsBits,
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
    type GuildMember,
    MessageFlags,
    type RGBTuple
} from "discord.js"
import type { CommandInterface } from "typings"
import { EmbedHandler } from "../../services/index.js"
import { Colors, DiscordLimits, Icons } from "../../constants/index.js"
import { formatDuration } from "../../functions/utils.js"

const command: CommandInterface = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a track or playlist")
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setContexts(InteractionContextType.Guild)
        .addStringOption((opts) =>
            opts
                .setName("query")
                .setDescription("Song name, URL, or search query")
                .setRequired(true)
                .setAutocomplete(true)
        ),
    autocomplete: async (interaction: AutocompleteInteraction, client: DiscordClient) => {
        const searchQuery = interaction.options.getFocused(true).value

        if (searchQuery.length === 0) {
            return []
        }

        try {
            const result = await client.poru.resolve({
                query: searchQuery,
                source: "spsearch"
            })

            if (result.loadType === "error" || result.loadType === "empty") {
                return []
            }

            const choices = result.tracks
                .filter((track) => typeof track.info.uri === "string" && track.info.title)
                .slice(0, DiscordLimits.CHOICES_PER_AUTOCOMPLETE)
                .map((track) => {
                    const author = track.info.author || "Unknown Artist"
                    const title = track.info.title
                    const maxTitleLength = 85 - author.length // Reserve space for author in brackets

                    const truncatedTitle =
                        title.length > maxTitleLength ? `${title.slice(0, maxTitleLength - 3)}...` : title

                    return {
                        name: `${truncatedTitle} [${author}]`,
                        value: track.info.uri as string
                    }
                })

            return choices
        } catch {
            return []
        }
    },
    execute: async (interaction: ChatInputCommandInteraction, client: DiscordClient) => {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral })

        const query = interaction.options.getString("query", true)
        const member = interaction.member as GuildMember
        const voiceChannel = member.voice.channel

        if (!voiceChannel) {
            const errorEmbed = EmbedHandler.error(interaction, "You need to be in a voice channel to play music")
            return interaction.editReply({ embeds: [errorEmbed] })
        }

        const permissions = voiceChannel.permissionsFor(interaction.guild!.members.me!)
        if (!permissions?.has(["Connect", "Speak"])) {
            const errorEmbed = EmbedHandler.error(
                interaction,
                "I don't have permission to join or speak in that voice channel"
            )
            return interaction.editReply({ embeds: [errorEmbed] })
        }

        try {
            const player =
                client.poru.players.get(interaction.guild!.id) ??
                client.poru.createConnection({
                    guildId: interaction.guild!.id,
                    voiceChannel: voiceChannel.id,
                    textChannel: interaction.channel!.id,
                    deaf: true,
                    mute: false
                })

            const result = await client.poru.resolve({
                query: query,
                source: "spsearch",
                requester: member
            })

            const { loadType, tracks, playlistInfo } = result

            if (loadType === "error" || loadType === "empty") {
                const errorEmbed = EmbedHandler.error(interaction, `No results found for **${query}**`)
                return interaction.editReply({ embeds: [errorEmbed] })
            }

            if (loadType === "playlist") {
                tracks.forEach((track) => {
                    track.info.requester = member
                    player.queue.add(track)
                })

                const firstTrack = tracks[0]
                const platformInfo = getPlatformInfo(firstTrack.info.uri || query)
                const isNowPlaying = !player.isPlaying && !player.isPaused

                // Calculate total duration of playlist
                const totalDuration = tracks.reduce((total, track) => total + (track.info.length || 0), 0)
                const formattedDuration = formatDuration(totalDuration)

                const playlistEmbed = EmbedHandler.create({
                    color: platformInfo.color,
                    title: playlistInfo?.name || "Unknown Playlist",
                    thumbnail: firstTrack.info.artworkUrl || "/placeholder.svg?height=120&width=120",
                    description: `${platformInfo.icon} **Added to Queue** • Position ${player.queue.length - tracks.length + 1} - ${player.queue.length}`,
                    fields: [
                        {
                            name: "Tracks",
                            value: `\`${tracks.length}\``,
                            inline: true
                        },
                        { name: '\u200B', value: '\u200B', inline: true },
                        {
                            name: "Duration",
                            value: `\`${formattedDuration}\``,
                            inline: true
                        }
                    ]
                })

                await interaction.editReply({ embeds: [playlistEmbed] })
            } else {
                const track = tracks[0]
                track.info.requester = member
                player.queue.add(track)

                const { title, uri, artworkUrl, author } = track.info
                const duration = formatDuration(track.info.length)
                const isNowPlaying = !player.isPlaying && !player.isPaused
                const { color, icon } = getPlatformInfo(track.info.uri || query)

                const trackEmbed = EmbedHandler.create({
                    color: color,
                    title: title.length > 60 ? `${title.substring(0, 57)}...` : title,
                    url: uri!,
                    thumbnail: artworkUrl || "/placeholder.svg?height=120&width=120",
                    description: `${icon} **Added to Queue** • Position ${player.queue.length}`,
                    fields: [
                        {
                            name: "Artist",
                            value: author || "Unknown Artist",
                            inline: true
                        },
                        { name: '\u200B', value: '\u200B', inline: true },
                        {
                            name: "Duration",
                            value: `\`${duration}\``,
                            inline: true
                        }
                    ]
                })

                await interaction.editReply({ embeds: [trackEmbed] })
            }

            if (!player.isPlaying && !player.isPaused && player.queue.length > 0) {
                player.play()
            }
        } catch (err) {
            const errorEmbed = EmbedHandler.error(interaction, "An error occurred while processing your request")
            await interaction.editReply({ embeds: [errorEmbed] })
        }
    }
}

function getPlatformInfo(uri: string) {
    if (!uri) {
        return {
            icon: "",
            color: Colors.DISCORD.green
        }
    }

    const lowerUri = uri.toLowerCase()

    if (lowerUri.includes("spotify.com") || lowerUri.includes("open.spotify") || lowerUri.startsWith("spotify:")) {
        return {
            icon: `${Icons.LOGO.spotify} `,
            color: Colors.DISCORD.green
        }
    }

    if (
        lowerUri.includes("music.youtube.com") ||
        lowerUri.includes("youtube.com/watch") ||
        lowerUri.includes("youtu.be") ||
        lowerUri.includes("ytmusic")
    ) {
        return {
            icon: `${Icons.LOGO.youtube} `,
            color: Colors.DISCORD.red
        }
    }

    return {
        icon: "",
        color: Colors.DISCORD.green
    }
}

export default command
