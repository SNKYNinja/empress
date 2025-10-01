import { ButtonInterface, SelectMenuInterface } from "typings";
import { DiscordClient } from "bot";

import { glob } from "glob";
import { pathToFileURL } from "node:url";
import path from "path";

export class ComponentInteractionHandler {
    constructor() {}

    public async loadButtons(client: DiscordClient) {
        const buttonDir = await glob(`${process.cwd()}/dist/component/buttons/*/*{.ts,.js}`);

        await Promise.all(
            buttonDir.map(async (file) => {
                const buttonPath = path.resolve(file);
                const button: ButtonInterface = (await import(`${pathToFileURL(buttonPath)}`))
                    .default;

                client.buttons.set(button.id, button);
            })
        );
    }

    public async loadSelectMenus(client: DiscordClient) {
        const menuDir = await glob(`${process.cwd()}/dist/component/selectMenus/*/*{.ts,.js}`);

        await Promise.all(
            menuDir.map(async (file) => {
                const selectMenuPath = path.resolve(file);
                const menu: SelectMenuInterface = (await import(`${pathToFileURL(selectMenuPath)}`))
                    .default;

                client.selectMenus.set(menu.id, menu);
            })
        );
    }
}
