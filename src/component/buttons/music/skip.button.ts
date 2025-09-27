import { ButtonInterface } from "typings";
import { DiscordClient } from "bot";
import { ButtonInteraction } from "discord.js";
import { MusicUtils } from "../../../functions/music-utils.js";

const button: ButtonInterface = {
    id: "skip",
    player: true,
    currentTrack: true,
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        await MusicUtils.skipTrack(interaction, client);
    },
};

export default button;
