import { DiscordClient } from "bot";
import { ButtonInteraction } from "discord.js";
import { ButtonInterface } from "typings";
import { MusicUtils } from "../../../functions/music-utils.js";

const button: ButtonInterface = {
    id: "shuffle",
    player: true,
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        await MusicUtils.shuffleQueue(interaction, client);
    },
};

export default button;
