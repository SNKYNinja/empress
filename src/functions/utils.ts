import type { ChannelType, GuildChannelManager, Role } from "discord.js"

const DEFAULT_FIELD_LIMIT = 1024

export const splitPascalCase = (text: string, separator: string): string => {
    if (!text) return ""
    return text.split(/(?=[A-Z])/).join(separator)
}

export const toPascalCase = (text: string, options: { separator?: string } = {}): string => {
    if (!text) return ""

    const pascalCase =
        text.charAt(0).toUpperCase() +
        text
            .slice(1)
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())

    return options.separator ? splitPascalCase(pascalCase, options.separator) : pascalCase
}

export const getChannelCountByTypes = (channels: GuildChannelManager, types: readonly ChannelType[]): number => {
    return channels.cache.filter((channel) => types.includes(channel.type)).size
}

interface RoleDisplayOptions {
    maxLength?: number
    includeSeparators?: boolean
    formatter?: (role: Role) => string
}

interface RoleDisplayResult {
    count: number
    roles: string[]
    hasMore: boolean
    totalLength: number
}

export const calculateRoleDisplay = (roles: readonly Role[], options: RoleDisplayOptions = {}): RoleDisplayResult => {
    const {
        maxLength = DEFAULT_FIELD_LIMIT,
        includeSeparators = true,
        formatter = (role: Role) => `<@&${role.id}>`
    } = options

    if (roles.length === 0) {
        return {
            count: 0,
            roles: [],
            hasMore: false,
            totalLength: 0
        }
    }

    let totalLength = 0
    const formattedRoles: string[] = []

    for (const role of roles) {
        const roleString = formatter(role)
        const additionalLength = roleString.length + (includeSeparators && formattedRoles.length > 0 ? 1 : 0)

        if (totalLength + additionalLength > maxLength) {
            break
        }

        totalLength += additionalLength
        formattedRoles.push(roleString)
    }

    return {
        count: formattedRoles.length,
        roles: formattedRoles,
        hasMore: formattedRoles.length < roles.length,
        totalLength
    }
}

export const maxDisplayRoles = (roles: Role[], maxFieldLength = DEFAULT_FIELD_LIMIT): number => {
    return calculateRoleDisplay(roles, { maxLength: maxFieldLength }).count
}

export const StringUtils = {
    splitPascalCase,
    toPascalCase
} as const

export const DiscordUtils = {
    getChannelCountByTypes,
    calculateRoleDisplay,
    maxDisplayRoles
} as const

export const Utils = {
    ...StringUtils,
    ...DiscordUtils
} as const
