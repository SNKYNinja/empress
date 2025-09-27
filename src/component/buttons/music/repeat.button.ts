import { DiscordClient } from "bot";
import { ButtonInteraction } from "discord.js";
import { ButtonInterface } from "typings";
import { MusicUtils } from "../../../functions/music-utils.js";

const button: ButtonInterface = {
    id: "repeat",
    player: true,
    currentTrack: true,
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        await MusicUtils.repeatTrack(interaction, client);
    },
};

export default button;
