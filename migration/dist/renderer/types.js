// Renderer Type Definitions - TypeScript types for the rendering system
// These are renderer-specific types; entity types are imported from /types/
/**
 * Default markdown configuration.
 */
export const defaultMarkdownConfig = {
    tagRenderMode: "convertMarkdown",
    isAddColumnBreaks: false,
    isAddPageBreaks: false,
    style: "classic",
};
// ============ Factory Functions ============
/**
 * Create a new TextStack for accumulating rendered output.
 */
export const createTextStack = () => [""];
/**
 * Create a new RenderMeta with default values.
 */
export const createRenderMeta = (overrides) => ({
    depth: 0,
    _typeStack: [],
    ...overrides,
});
/**
 * Create a new RenderOptions with default values.
 */
export const createRenderOptions = (overrides) => ({
    prefix: "",
    suffix: "",
    ...overrides,
});
//# sourceMappingURL=types.js.map