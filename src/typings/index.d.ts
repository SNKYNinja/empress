import { DiscordClient } from "bot";
import {
    SlashCommandBuilder,
    ClientEvents,
    PermissionFlagsBits,
    ColorResolvable,
    AutocompleteInteraction,
    BaseGuildEmoji,
    BaseSelectMenuComponent,
    ApplicationCommandOptionChoiceData,
    CommandInteraction,
    ChatInputCommandInteraction,
} from "discord.js";

export type ObjectNameIDArray = { name: string; id: string }[];

interface RateLimit {
    amount: number;
    interval: number;
}

export interface ConfigInterface {
    owner: string;
    bot: {
        name: string;
        token: string;
    };
    guilds: ObjectNameIDArray;
    rateLimits: {
        commands: RateLimit;
        buttons: RateLimit;
        triggers: RateLimit;
        reactions: RateLimit;
    };
}

export interface EventInterface {
    name: keyof ClientEvents;
    options: { rest: boolean; once: boolean };
    execute: (...args: any[]) => any;
}

interface BaseCommand {
    owner?: boolean; // owner-only command
    subCmd?: string; // subcommand name
}

export interface CommandInterface {
    subCmd?: string;
    owner?: boolean;
    player?: boolean;
    currentTrack?: boolean;
    data: SlashCommandBuilder | any;
    autocomplete?: (...args: any[]) => Promise<ApplicationCommandOptionChoiceData[]>; // autocomplete callback
    execute: (interaction: ChatInputCommandInteraction, client: DiscordClient) => any;
}

export interface SubCommandInterface {
    subCmd?: string;
    data: SlashCommandBuilder | any;
}

export interface SubCommand {
    subCmd?: string;
    owner?: boolean;
    player?: boolean;
    currentTrack?: boolean;
    autocomplete?: (...args: any[]) => Promise<ApplicationCommandOptionChoiceData>; // autocomplete callback
    execute: (interaction: ChatInputCommandInteraction, client: DiscordClient) => any;
}

export interface ButtonInterface {
    id: string; // button unique id
    player?: boolean;
    currentTrack?: boolean;
    owner?: boolean;
    execute: (...args: any[]) => any;
}

export interface SelectMenuInterface {
    id: string; // select menu unique id
    execute: (...args: any[]) => any;
}
