import { describe, it, expect, beforeEach } from "vitest";
import { PlainTextRenderer, createPlainTextRenderer, getPlainTextRenderer, isEntryObject, getEntryType, defaultRendererConfig, } from "./base.js";
describe("base", () => {
    describe("isEntryObject", () => {
        it("should return false for string", () => {
            expect(isEntryObject("hello")).toBe(false);
        });
        it("should return true for object", () => {
            expect(isEntryObject({ type: "entries" })).toBe(true);
        });
        it("should return false for null", () => {
            expect(isEntryObject(null)).toBe(false);
        });
        it("should return true for array", () => {
            expect(isEntryObject([])).toBe(true);
        });
        it("should return true for entry with entries", () => {
            const entry = { type: "entries", entries: ["text"] };
            expect(isEntryObject(entry)).toBe(true);
        });
    });
    describe("getEntryType", () => {
        it("should return 'string' for string entry", () => {
            expect(getEntryType("hello")).toBe("string");
        });
        it("should return 'null' for null", () => {
            expect(getEntryType(null)).toBe("null");
        });
        it("should return type property from object", () => {
            expect(getEntryType({ type: "list" })).toBe("list");
            expect(getEntryType({ type: "table" })).toBe("table");
            expect(getEntryType({ type: "entries" })).toBe("entries");
        });
        it("should return 'entries' for object without type", () => {
            expect(getEntryType({ entries: [] })).toBe("entries");
            expect(getEntryType({})).toBe("entries");
        });
    });
    describe("defaultRendererConfig", () => {
        it("should have expected default values", () => {
            expect(defaultRendererConfig.styleHint).toBe("classic");
            expect(defaultRendererConfig.isAddHandlers).toBe(true);
            expect(defaultRendererConfig.baseUrl).toBe("");
        });
    });
    describe("PlainTextRenderer", () => {
        let renderer;
        beforeEach(() => {
            renderer = new PlainTextRenderer();
        });
        describe("configuration", () => {
            it("should accept custom config", () => {
                const customRenderer = new PlainTextRenderer({
                    styleHint: "one",
                    isAddHandlers: false,
                    baseUrl: "http://example.com",
                });
                expect(customRenderer).toBeDefined();
            });
            it("should set style hint", () => {
                renderer.setStyleHint("one");
                expect(renderer.render("test")).toBe("test");
            });
            it("should set add handlers", () => {
                renderer.setAddHandlers(false);
                expect(renderer.render("test")).toBe("test");
            });
            it("should set base URL", () => {
                renderer.setBaseUrl("http://example.com");
                expect(renderer.render("test")).toBe("test");
            });
            it("should chain configuration methods", () => {
                const result = renderer
                    .setStyleHint("one")
                    .setAddHandlers(false)
                    .setBaseUrl("http://example.com");
                expect(result).toBe(renderer);
            });
        });
        describe("render strings", () => {
            it("should render plain string", () => {
                expect(renderer.render("Hello world")).toBe("Hello world");
            });
            it("should strip tags from string", () => {
                expect(renderer.render("Cast {@spell fireball}!")).toBe("Cast fireball!");
            });
            it("should handle multiple tags", () => {
                expect(renderer.render("{@bold A} and {@italic B}")).toBe("A and B");
            });
            it("should handle nested tags", () => {
                expect(renderer.render("{@bold outer {@italic inner}}")).toBe("outer inner");
            });
            it("should handle empty string", () => {
                expect(renderer.render("")).toBe("");
            });
        });
        describe("render numbers", () => {
            it("should render number as string", () => {
                expect(renderer.render(42)).toBe("42");
            });
            it("should render zero", () => {
                expect(renderer.render(0)).toBe("0");
            });
        });
        describe("render entries", () => {
            it("should render entries with name", () => {
                const entry = {
                    type: "entries",
                    name: "Section Title",
                    entries: ["Content here"],
                };
                const result = renderer.render(entry);
                expect(result).toContain("Section Title");
                expect(result).toContain("Content here");
            });
            it("should render entries without name", () => {
                const entry = {
                    type: "entries",
                    entries: ["Just content"],
                };
                expect(renderer.render(entry)).toContain("Just content");
            });
            it("should render nested entries", () => {
                const entry = {
                    type: "entries",
                    name: "Outer",
                    entries: [
                        {
                            type: "entries",
                            name: "Inner",
                            entries: ["Deep content"],
                        },
                    ],
                };
                const result = renderer.render(entry);
                expect(result).toContain("Outer");
                expect(result).toContain("Inner");
                expect(result).toContain("Deep content");
            });
            it("should handle empty entries", () => {
                const entry = {
                    type: "entries",
                    entries: [],
                };
                expect(renderer.render(entry)).toBe("");
            });
        });
        describe("render list", () => {
            it("should render list items with dash prefix", () => {
                const entry = {
                    type: "list",
                    items: ["Item A", "Item B", "Item C"],
                };
                const result = renderer.render(entry);
                expect(result).toContain("- Item A");
                expect(result).toContain("- Item B");
                expect(result).toContain("- Item C");
            });
            it("should handle empty list", () => {
                const entry = {
                    type: "list",
                    items: [],
                };
                expect(renderer.render(entry)).toBe("");
            });
            it("should render nested entries in list items", () => {
                const entry = {
                    type: "list",
                    items: [
                        {
                            type: "item",
                            name: "Named Item",
                            entry: "Item content",
                        },
                    ],
                };
                const result = renderer.render(entry);
                expect(result).toContain("Named Item");
                expect(result).toContain("Item content");
            });
        });
        describe("render table", () => {
            it("should render table with caption", () => {
                const entry = {
                    type: "table",
                    caption: "My Table",
                    colLabels: ["A", "B"],
                    rows: [["1", "2"]],
                };
                const result = renderer.render(entry);
                expect(result).toContain("My Table");
            });
            it("should render column labels", () => {
                const entry = {
                    type: "table",
                    colLabels: ["Col A", "Col B"],
                    rows: [["1", "2"]],
                };
                const result = renderer.render(entry);
                expect(result).toContain("Col A");
                expect(result).toContain("Col B");
            });
            it("should render table rows", () => {
                const entry = {
                    type: "table",
                    rows: [
                        ["A1", "B1"],
                        ["A2", "B2"],
                    ],
                };
                const result = renderer.render(entry);
                expect(result).toContain("A1");
                expect(result).toContain("B1");
                expect(result).toContain("A2");
                expect(result).toContain("B2");
            });
            it("should handle roll cells with exact value", () => {
                const entry = {
                    type: "table",
                    rows: [[{ roll: { exact: 5 } }, "Effect"]],
                };
                const result = renderer.render(entry);
                expect(result).toContain("5");
            });
            it("should handle roll cells with range", () => {
                const entry = {
                    type: "table",
                    rows: [[{ roll: { min: 1, max: 4 } }, "Effect"]],
                };
                const result = renderer.render(entry);
                expect(result).toContain("1-4");
            });
            it("should strip tags from column labels", () => {
                const entry = {
                    type: "table",
                    colLabels: ["{@dice d6}", "Effect"],
                    rows: [[1, "A"]],
                };
                const result = renderer.render(entry);
                expect(result).toContain("d6");
                expect(result).not.toContain("{@");
            });
            it("should handle empty table", () => {
                const entry = {
                    type: "table",
                    rows: [],
                };
                expect(renderer.render(entry)).toBe("");
            });
        });
        describe("render quote", () => {
            it("should render quote with attribution", () => {
                const entry = {
                    type: "quote",
                    entries: ["To be or not to be."],
                    by: "Shakespeare",
                };
                const result = renderer.render(entry);
                expect(result).toContain("To be or not to be.");
                expect(result).toContain("Shakespeare");
            });
            it("should render quote with source", () => {
                const entry = {
                    type: "quote",
                    entries: ["A quote."],
                    by: "Author",
                    from: "Book Title",
                };
                const result = renderer.render(entry);
                expect(result).toContain("Author");
                expect(result).toContain("Book Title");
            });
            it("should wrap quote in quotation marks", () => {
                const entry = {
                    type: "quote",
                    entries: ["Quote text"],
                };
                const result = renderer.render(entry);
                expect(result).toContain('"Quote text"');
            });
        });
        describe("render inset", () => {
            it("should render inset with name in brackets", () => {
                const entry = {
                    type: "inset",
                    name: "Sidebar",
                    entries: ["Inset content"],
                };
                const result = renderer.render(entry);
                expect(result).toContain("[Sidebar]");
                expect(result).toContain("Inset content");
            });
            it("should render inset without name", () => {
                const entry = {
                    type: "inset",
                    entries: ["Just content"],
                };
                const result = renderer.render(entry);
                expect(result).toContain("Just content");
            });
        });
        describe("render item", () => {
            it("should render item with name and entry", () => {
                const entry = {
                    type: "item",
                    name: "Item Name",
                    entry: "Item description",
                };
                const result = renderer.render(entry);
                expect(result).toContain("Item Name.");
                expect(result).toContain("Item description");
            });
            it("should render item with entries array", () => {
                const entry = {
                    type: "item",
                    name: "Multi",
                    entries: ["First", "Second"],
                };
                const result = renderer.render(entry);
                expect(result).toContain("First");
                expect(result).toContain("Second");
            });
        });
        describe("render image", () => {
            it("should render image placeholder with title", () => {
                const entry = {
                    type: "image",
                    href: { type: "internal", path: "img.png" },
                    title: "My Image",
                };
                const result = renderer.render(entry);
                expect(result).toContain("[Image: My Image]");
            });
            it("should render image placeholder without title", () => {
                const entry = {
                    type: "image",
                    href: { type: "internal", path: "img.png" },
                };
                const result = renderer.render(entry);
                expect(result).toContain("[Image]");
            });
        });
        describe("render hr", () => {
            it("should render horizontal rule", () => {
                const entry = { type: "hr" };
                const result = renderer.render(entry);
                expect(result).toContain("---");
            });
        });
        describe("render code", () => {
            it("should render code block", () => {
                const entry = {
                    type: "code",
                    preformatted: "const x = 1;",
                };
                const result = renderer.render(entry);
                expect(result).toContain("```");
                expect(result).toContain("const x = 1;");
            });
        });
        describe("render bonus", () => {
            it("should render positive bonus with plus sign", () => {
                const entry = { type: "bonus", value: 5 };
                expect(renderer.render(entry)).toBe("+5");
            });
            it("should render negative bonus without extra sign", () => {
                const entry = { type: "bonus", value: -2 };
                expect(renderer.render(entry)).toBe("-2");
            });
            it("should render zero as +0", () => {
                const entry = { type: "bonus", value: 0 };
                expect(renderer.render(entry)).toBe("+0");
            });
        });
        describe("render bonusSpeed", () => {
            it("should render positive speed bonus", () => {
                const entry = { type: "bonusSpeed", value: 10 };
                expect(renderer.render(entry)).toBe("+10 ft.");
            });
            it("should render negative speed bonus", () => {
                const entry = { type: "bonusSpeed", value: -5 };
                expect(renderer.render(entry)).toBe("-5 ft.");
            });
        });
        describe("render dice", () => {
            it("should render dice with display text", () => {
                const entry = {
                    type: "dice",
                    displayText: "2d6 fire damage",
                };
                expect(renderer.render(entry)).toBe("2d6 fire damage");
            });
            it("should render dice from toRoll string", () => {
                const entry = {
                    type: "dice",
                    toRoll: "3d8+5",
                };
                expect(renderer.render(entry)).toBe("3d8+5");
            });
            it("should render dice from toRoll array", () => {
                const entry = {
                    type: "dice",
                    toRoll: [{ number: 2, faces: 6, modifier: 3 }],
                };
                expect(renderer.render(entry)).toBe("2d6+3");
            });
        });
        describe("render abilityDc", () => {
            it("should render ability DC formula", () => {
                const entry = {
                    type: "abilityDc",
                    attributes: ["str", "dex"],
                };
                const result = renderer.render(entry);
                expect(result).toContain("DC = 8 + proficiency bonus");
                expect(result).toContain("str/dex");
            });
        });
        describe("render abilityAttackMod", () => {
            it("should render attack modifier formula", () => {
                const entry = {
                    type: "abilityAttackMod",
                    attributes: ["int"],
                };
                const result = renderer.render(entry);
                expect(result).toContain("Attack = proficiency bonus");
                expect(result).toContain("int");
            });
        });
        describe("render options with prefix/suffix", () => {
            it("should add prefix", () => {
                const result = renderer.render("text", { prefix: "> " });
                expect(result).toBe("> text");
            });
            it("should add suffix", () => {
                const result = renderer.render("text", { suffix: "\n\n" });
                expect(result).toBe("text\n\n");
            });
            it("should add both prefix and suffix", () => {
                const result = renderer.render("text", { prefix: "* ", suffix: "!" });
                expect(result).toBe("* text!");
            });
        });
        describe("recursiveRender", () => {
            it("should handle array input", () => {
                const entries = ["first", "second"];
                const result = renderer.render(entries);
                expect(result).toContain("first");
                expect(result).toContain("second");
            });
            it("should handle null entry", () => {
                expect(renderer.render(null)).toBe("");
            });
            it("should handle wrapper type", () => {
                const entry = {
                    type: "wrapper",
                    wrapped: "inner content",
                };
                expect(renderer.render(entry)).toBe("inner content");
            });
            it("should handle section type", () => {
                const entry = {
                    type: "section",
                    name: "Section",
                    entries: ["Content"],
                };
                const result = renderer.render(entry);
                expect(result).toContain("Section");
            });
        });
        describe("render unknown types", () => {
            it("should try to render entries for unknown type", () => {
                const entry = {
                    type: "unknownType",
                    entries: ["fallback content"],
                };
                const result = renderer.render(entry);
                expect(result).toContain("fallback content");
            });
        });
        describe("render link", () => {
            it("should render link text", () => {
                const entry = {
                    type: "link",
                    text: "Click here",
                    href: "http://example.com",
                };
                expect(renderer.render(entry)).toBe("Click here");
            });
        });
        describe("render inline", () => {
            it("should render inline entries", () => {
                const entry = {
                    type: "inline",
                    entries: ["inline ", "text"],
                };
                expect(renderer.render(entry)).toBe("inline text");
            });
        });
        describe("render gallery", () => {
            it("should render all images in gallery", () => {
                const entry = {
                    type: "gallery",
                    images: [
                        { type: "image", href: { path: "a.png" }, title: "A" },
                        { type: "image", href: { path: "b.png" }, title: "B" },
                    ],
                };
                const result = renderer.render(entry);
                expect(result).toContain("[Image: A]");
                expect(result).toContain("[Image: B]");
            });
        });
        describe("render tableGroup", () => {
            it("should render all tables in group", () => {
                const entry = {
                    type: "tableGroup",
                    tables: [
                        { type: "table", caption: "Table 1", rows: [] },
                        { type: "table", caption: "Table 2", rows: [] },
                    ],
                };
                const result = renderer.render(entry);
                expect(result).toContain("Table 1");
                expect(result).toContain("Table 2");
            });
        });
        describe("render attack", () => {
            it("should render attack type and entries", () => {
                const entry = {
                    type: "attack",
                    attackType: "MW",
                    attackEntries: ["Hit: 5 damage"],
                };
                const result = renderer.render(entry);
                expect(result).toContain("MW Attack:");
                expect(result).toContain("5 damage");
            });
            it("should render multiple attack types", () => {
                const entry = {
                    type: "attack",
                    attackTypes: ["MW", "RW"],
                    attackEntries: ["Hit: damage"],
                };
                const result = renderer.render(entry);
                expect(result).toContain("MW/RW Attack:");
            });
        });
        describe("render homebrew", () => {
            it("should render new content from homebrew", () => {
                const entry = {
                    type: "homebrew",
                    entries: ["New homebrew content"],
                };
                const result = renderer.render(entry);
                expect(result).toContain("New homebrew content");
            });
        });
    });
    describe("createPlainTextRenderer", () => {
        it("should create a new PlainTextRenderer", () => {
            const renderer = createPlainTextRenderer();
            expect(renderer).toBeInstanceOf(PlainTextRenderer);
        });
        it("should accept config", () => {
            const renderer = createPlainTextRenderer({ styleHint: "one" });
            expect(renderer).toBeInstanceOf(PlainTextRenderer);
        });
    });
    describe("getPlainTextRenderer", () => {
        it("should return a PlainTextRenderer", () => {
            const renderer = getPlainTextRenderer();
            expect(renderer).toBeInstanceOf(PlainTextRenderer);
        });
        it("should return the same instance", () => {
            const renderer1 = getPlainTextRenderer();
            const renderer2 = getPlainTextRenderer();
            expect(renderer1).toBe(renderer2);
        });
    });
});
//# sourceMappingURL=base.test.js.map