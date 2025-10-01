import { EventInterface } from "typings";
import { DiscordClient } from "bot";

import { glob } from "glob";
import { pathToFileURL } from "node:url";
import path from "path";

export class ClientEventHandler {
    constructor() {}

    public async loadEvents(client: DiscordClient) {
        const eventDir = await glob(`${process.cwd()}/dist/events/*/*{.ts,.js}`);

        await Promise.all(
            eventDir.map(async (file) => {
                const eventsPath = path.resolve(file);
                const event: EventInterface = (await import(`${pathToFileURL(eventsPath)}`))
                    .default;

                if (event.options.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }

                client.events.set(event.name, event);
            })
        );
    }
}
