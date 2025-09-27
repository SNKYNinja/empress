import { DiscordClient } from "bot";
import { ButtonInteraction } from "discord.js";
import { buildPlayerControls } from "../../../services/poru.js";
import { ButtonInterface } from "typings";

const button: ButtonInterface = {
    id: "p/p",
    player: true,
    execute: async (interaction: ButtonInteraction, client: DiscordClient) => {
        const player = client.poru.players.get(interaction.guild!.id)!;

        player.pause(!player.isPaused);

        if (player.message) {
            const [controlRow, secondaryRow] = buildPlayerControls(player);
            await player.message.edit({ components: [controlRow, secondaryRow] }).catch(() => {});
        }

        await interaction.deferUpdate();
    },
};

export default button;
