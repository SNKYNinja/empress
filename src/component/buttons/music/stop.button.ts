import { DiscordClient } from "bot";
import { ButtonInteraction } from "discord.js";
import { ButtonInterface } from "typings";

const button: ButtonInterface = {
    id: "stop",
    player: true,
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        player.destroy();

        interaction.deferUpdate();
    },
};

export default button;
