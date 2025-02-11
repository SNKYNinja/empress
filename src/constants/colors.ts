import { ColorResolvable, RGBTuple } from "discord.js"

function hexToRgb(hex: string): RGBTuple {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return [r, g, b]
}

export class Colors {
    public static readonly ALL = {
        default: "#000000",
        aqua: "#1ABC9C",
        darkAqua: "#11806A",
        green: "#2ECC71",
        darkGreen: "#1F8B4C",
        blue: "#3498DB",
        darkBlue: "#206694",
        purple: "#9B59B6",
        darkPurple: "#71368A",
        luminousVividPink: "#E91E63",
        darkLuminousVividPink: "#AD1457",
        gold: "#F1C40F",
        darkGold: "#C27C0E",
        orange: "#E67E22",
        darkOrange: "#A84300",
        red: "#E74C3C",
        darkRed: "#992D22",
        grey: "#95A5A6",
        darkGrey: "#979C9F",
        darkerGrey: "#7F8C8D",
        lightGrey: "#BCC0C0",
        navy: "#34495E",
        darkNavy: "#2C3E50",
        yellow: "#FFFF00"
    } as { [key: string]: ColorResolvable }

    public static readonly DISCORD = {
        white: hexToRgb("#FFFFFF"),
        black: hexToRgb("#000000"),
        burple: hexToRgb("#5865F2"),
        fuschia: hexToRgb("#EB459E"),
        greyple: hexToRgb("#99AAB5"),
        darkButNotBlack: hexToRgb("#2C2F33"),
        notQuiteBlack: hexToRgb("#23272A"),
        background: hexToRgb("#2F3136"),
        red: hexToRgb("#ED4245"),
        green: hexToRgb("#43B383"),
        yellow: hexToRgb("#FEE75C")
    } as { [key: string]: RGBTuple }

    public static readonly MATERIAL = {
        red: "#FF5555",
        blue: "#55AAFF",
        yellow: "#FFAA55",
        green: "#55FF55",
        pink: "#FF55FF"
    } as { [key: string]: ColorResolvable }

    public static readonly CUSTOM = {
        yellow: "#F8DD85",
        transparent: "#00000000"
    } as { [key: string]: ColorResolvable }

    public static readonly CHART = {
        purple: {
            default: "rgba(149, 76, 233, 1)",
            half: "rgba(149, 76, 233, 0.5)",
            quarter: "rgba(149, 76, 233, 0.25)",
            low: "rgba(149, 76, 233, 0.1)",
            zero: "rgba(149, 76, 233, 0)"
        },
        indigo: {
            default: "rgba(80, 102, 120, 1)",
            half: "rgba(80, 102, 120, 0.5)",
            quarter: "rgba(80, 102, 120, 0.25)",
            low: "rgba(80, 102, 120, 0.1)",
            zero: "rgba(80, 102, 120, 0)"
        },
        green: {
            default: "rgba(92, 221, 139, 1)",
            half: "rgba(92, 221, 139, 0.5)",
            quarter: "rgba(92, 221, 139, 0.25)",
            low: "rgba(92, 221, 139, 0.1)",
            zero: "rgba(92, 221, 139, 0)"
        },
        blurple: {
            default: "rgba(88, 101, 242, 1)",
            half: "rgba(88, 101, 242, 0.5)",
            quarter: "rgba(88, 101, 242, 0.25)",
            low: "rgba(88, 101, 242, 0.1)",
            zero: "rgba(88, 101, 242, 0)"
        }
    } as {
        [key: string]: {
            default: string
            half: string
            quarter: string
            low: string
            zero: string
        }
    }
}
