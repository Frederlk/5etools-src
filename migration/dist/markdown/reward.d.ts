import type { Entry } from "../../../types/entry.js";
import type { Reward } from "../../../types/rewards.js";
import type { RenderMeta, StyleHint } from "../renderer/types.js";
import { MarkdownRenderer } from "./renderer.js";
export interface RewardEntry extends Reward {
    _displayName?: string;
}
export interface RewardMarkdownOptions {
    meta?: RenderMeta;
    styleHint?: StyleHint;
}
export interface RewardEntriesMeta {
    entriesContent: Entry[];
}
export declare class RewardMarkdownRenderer {
    private _renderer;
    private _styleHint;
    constructor(renderer?: MarkdownRenderer, styleHint?: StyleHint);
    setRenderer(renderer: MarkdownRenderer): this;
    setStyleHint(styleHint: StyleHint): this;
    getCompactRenderedString(reward: RewardEntry, opts?: RewardMarkdownOptions): string;
}
export declare const getRewardMarkdownRenderer: (styleHint?: StyleHint) => RewardMarkdownRenderer;
export declare const rewardMarkdown: {
    getCompactRenderedString: (reward: RewardEntry, opts?: RewardMarkdownOptions) => string;
    getRewardRenderableEntriesMeta: (reward: RewardEntry) => RewardEntriesMeta;
    getRewardSubtitle: (reward: RewardEntry) => string;
};
//# sourceMappingURL=reward.d.ts.map