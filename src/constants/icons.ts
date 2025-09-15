import { ApplicationEmoji, Emoji } from "discord.js";

export class Icons {
    public static readonly STATUS = {
        success: "<:checkmark:1404455160683696208>",
        error: "<:crossmark:1404455332918464583>",
        announcement: "<:blurple_announcement:1030340123788836955>",
    } as { [key: string]: string };

    public static readonly UI = {
        reply: "<:reply:1001495577093230753>",
    } as { [key: string]: string };

    public static readonly INDICATORS = {
        red: "<:red_icon:1136928709450924084>",
        yellow: "<:yellow_icon:1136929054474375178>",
        orange: "<:orange_icon:1136929050057773097>",
        green: "<:green_icon:1136929045397913620>",
        purple: "<:purple_icon:1136929037999165440>",
        blue: "<:blue_icon:1136929032118730883>",
    } as { [key: string]: string };

    public static readonly LOGO = {
        spotify: "<:spotify:1405838138454315018>",
        youtube: "<:ytmusic:1405839056587329586>",
    };

    public static readonly MEDIA = {
        pause: "<:pause:1034451169839423518>",
        play: "<:play:1049700245715562607>",
    } as { [key: string]: string };

    public static readonly MUSIC = {
        play: {
            name: "play",
            id: "1415186265325703259",
            animated: false,
        },
        pause: {
            name: "pause",
            id: "1415188041756049470",
            animated: false,
        },
        stop: {
            name: "stop",
            id: "1415188017114775663",
            animated: false,
        },
        skip: {
            name: "skip",
            id: "1415188055316369418",
            animated: false,
        },
        previous: {
            name: "prev",
            id: "1415188069446975529",
            animated: false,
        },
        shuffle: {
            name: "shuffle",
            id: "1415188030389485659",
            animated: false,
        },
        repeat: {
            name: "repeat",
            id: "1415187989859930114",
            animated: false,
        },
        loop: {
            name: "loop",
            id: "1415188081450942526",
            animated: false,
        },
        loop_once: {
            name: "loop_once",
            id: "1415191116189274152",
            animated: false,
        },
        loop_queue: {
            name: "loop_queue",
            id: "1415191105368100884",
            animated: false,
        },
        queue: {
            name: "queue",
            id: "1415187972344778835",
            animated: false,
        },
        like: {
            name: "like",
            id: "1415188002681917450",
            animated: false,
        },
        playlist: {
            name: "playlist",
            id: "1415188270220050443",
            animated: false,
        },
    };
}
