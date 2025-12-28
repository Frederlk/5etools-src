// Reward Markdown Renderer - TypeScript implementation
// Migrated from js/render-markdown.js RendererMarkdown.reward
// Provides reward-specific markdown rendering for D&D 5e rewards

import type { Entry } from "../../../types/entry.js";
import type { Reward, RewardType } from "../../../types/rewards.js";
import type { TextStack, RenderMeta, StyleHint } from "../renderer/types.js";
import { createTextStack, createRenderMeta } from "../renderer/types.js";
import { MarkdownRenderer, getMarkdownRenderer, markdownUtils } from "./renderer.js";

// ============ Types ============

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

// ============ Helper Functions ============

const getRewardSubtitle = (reward: RewardEntry): string => {
	const parts: string[] = [];

	if (reward.type) {
		parts.push(toTitleCase(reward.type));
	}

	if (reward.rarity) {
		parts.push(toTitleCase(reward.rarity));
	}

	return parts.join(", ");
};

const toTitleCase = (str: string): string => {
	return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
};

const getRewardRenderableEntriesMeta = (reward: RewardEntry): RewardEntriesMeta => {
	const ptSubtitle = getRewardSubtitle(reward);

	return {
		entriesContent: [
			ptSubtitle ? `{@i ${ptSubtitle}}` : "",
			...(reward.entries ?? []),
		].filter(Boolean) as Entry[],
	};
};

// ============ Generic Rendering Helpers ============

const getGenericCompactRenderedString = (
	ent: { name: string; _displayName?: string; entries?: Entry[] },
	renderer: MarkdownRenderer,
	meta: RenderMeta,
): string => {
	const subStack: TextStack = createTextStack();
	const displayName = ent._displayName ?? ent.name;

	subStack[0] += `## ${displayName}\n\n`;

	if (ent.entries) {
		for (const entry of ent.entries) {
			renderer.recursiveRender(entry, subStack, meta, { suffix: "\n" });
			subStack[0] += "\n";
		}
	}

	return `\n${markdownUtils.getNormalizedNewlines(subStack.join("").trim())}\n\n`;
};

// ============ Reward Markdown Renderer ============

export class RewardMarkdownRenderer {
	private _renderer: MarkdownRenderer;
	private _styleHint: StyleHint;

	constructor(renderer?: MarkdownRenderer, styleHint: StyleHint = "classic") {
		this._renderer = renderer ?? getMarkdownRenderer();
		this._styleHint = styleHint;
	}

	setRenderer(renderer: MarkdownRenderer): this {
		this._renderer = renderer;
		return this;
	}

	setStyleHint(styleHint: StyleHint): this {
		this._styleHint = styleHint;
		return this;
	}

	getCompactRenderedString(reward: RewardEntry, opts: RewardMarkdownOptions = {}): string {
		const meta = opts.meta ?? createRenderMeta();

		const entriesMeta = getRewardRenderableEntriesMeta(reward);

		const entries: Entry[] = [
			{ entries: entriesMeta.entriesContent } as Entry,
		].filter(Boolean);

		const entFull = {
			...reward,
			entries,
		};

		return markdownUtils.withMetaDepth(1, { meta }, () => {
			return getGenericCompactRenderedString(entFull, this._renderer, meta);
		});
	}
}

// ============ Module Export ============

let _rewardRenderer: RewardMarkdownRenderer | null = null;

export const getRewardMarkdownRenderer = (styleHint: StyleHint = "classic"): RewardMarkdownRenderer => {
	if (!_rewardRenderer) {
		_rewardRenderer = new RewardMarkdownRenderer(undefined, styleHint);
	} else {
		_rewardRenderer.setStyleHint(styleHint);
	}
	return _rewardRenderer;
};

export const rewardMarkdown = {
	getCompactRenderedString: (reward: RewardEntry, opts: RewardMarkdownOptions = {}): string => {
		return getRewardMarkdownRenderer(opts.styleHint).getCompactRenderedString(reward, opts);
	},

	getRewardRenderableEntriesMeta,
	getRewardSubtitle,
};
