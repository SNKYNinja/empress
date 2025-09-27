import {
    ActionRowBuilder,
    BaseInteraction,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    StringSelectMenuInteraction,
    userMention,
} from "discord.js";
import { Icons } from "../constants/icons.js";

type AnyInteraction = ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction;

interface PaginatorOptions {
    disableAfterMs?: number;
    ephemeral?: boolean;
    deferReplied?: boolean;
}

/**
 * Presents an interactive set of embeds with pagination controls.
 * Preserves original behavior while aligning with current code style.
 */
class EmbedPaginator {
    public readonly client: BaseInteraction["client"];
    public readonly interaction: AnyInteraction;
    public readonly embeds: EmbedBuilder[];
    private readonly pageByMessageId: Record<string, number>;
    private readonly disableAfterMs: number;
    private readonly ephemeral: boolean;
    private readonly deferReplied: boolean;

    constructor(interaction: AnyInteraction, embeds: EmbedBuilder[], opts?: PaginatorOptions) {
        this.client = interaction.client;
        this.interaction = interaction;
        this.embeds = embeds;
        this.pageByMessageId = {};
        this.disableAfterMs = opts?.disableAfterMs ?? 5 * 60 * 1000;
        this.ephemeral = opts?.ephemeral ?? false;
        this.deferReplied = opts?.deferReplied ?? false;
    }

    private buildControls(messageId: string): ActionRowBuilder<ButtonBuilder> {
        const current = this.pageByMessageId[messageId];
        const isFirst = current === 0;
        const isLast = current === this.embeds.length - 1;

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setEmoji(Icons.NAVIGATION.backward)
                .setCustomId("most_prev_embed")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(isFirst),
            new ButtonBuilder()
                .setEmoji(Icons.NAVIGATION.back)
                .setCustomId("prev_embed")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(isFirst),
            new ButtonBuilder()
                .setCustomId("page-no")
                .setLabel(`${current + 1}/${this.embeds.length}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setEmoji(Icons.NAVIGATION.front)
                .setCustomId("next_embed")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(isLast),
            new ButtonBuilder()
                .setEmoji(Icons.NAVIGATION.forward)
                .setCustomId("most_next_embed")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(isLast)
        );

        return row;
    }

    private setFooterForCurrent(messageId: string): void {
        const page = this.pageByMessageId[messageId];
        const currentEmbed = this.embeds[page];
        currentEmbed.setFooter({
            text: this.interaction.user.displayName,
            iconURL: this.interaction.user.displayAvatarURL({ size: 1024 }),
        });
    }

    public async send(): Promise<void> {
        const id = this.interaction.id;
        this.pageByMessageId[id] ??= 0;

        this.setFooterForCurrent(id);

        const replyOptions = {
            embeds: [this.embeds[this.pageByMessageId[id]]],
            components: [this.buildControls(id)],
            ephemeral: this.ephemeral,
        } as const;

        if (this.deferReplied) {
            await this.interaction.editReply(replyOptions);
        } else {
            await this.interaction.reply(replyOptions);
        }

        const message = await this.interaction.fetchReply();

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: this.disableAfterMs,
        });

        collector.on("collect", async (button) => {
            if (!button) return;

            if (button.user.id !== this.interaction.user.id) {
                const invalid = new EmbedBuilder()
                    .setDescription(
                        `${Icons.INDICATORS.red} This message is only for ${userMention(
                            this.interaction.user.id
                        )}`
                    )
                    .setColor(0xed4245);
                await button.reply({ embeds: [invalid], ephemeral: true });
                return;
            }

            const validIds = new Set([
                "prev_embed",
                "next_embed",
                "most_prev_embed",
                "most_next_embed",
                "page-no",
            ]);
            if (!validIds.has(button.customId)) return;

            await button.deferUpdate();

            const current = this.pageByMessageId[id];
            const lastIndex = this.embeds.length - 1;

            switch (button.customId) {
                case "prev_embed":
                    if (current > 0) this.pageByMessageId[id] = current - 1;
                    break;
                case "next_embed":
                    if (current < lastIndex) this.pageByMessageId[id] = current + 1;
                    break;
                case "most_prev_embed":
                    if (current > 0) this.pageByMessageId[id] = 0;
                    break;
                case "most_next_embed":
                    if (current < lastIndex) this.pageByMessageId[id] = lastIndex;
                    break;
                case "page-no":
                    return;
            }

            this.setFooterForCurrent(id);

            await this.interaction.editReply({
                embeds: [this.embeds[this.pageByMessageId[id]]],
                components: [this.buildControls(id)],
            });
        });

        collector.on("end", async () => {
            const row = this.buildControls(id);
            const disabled = row.components.map((c) =>
                ButtonBuilder.from(c as ButtonBuilder).setDisabled(true)
            );
            await this.interaction.editReply({
                components: [new ActionRowBuilder<ButtonBuilder>().addComponents(disabled)],
            });
        });
    }
}

export { EmbedPaginator, PaginatorOptions };
