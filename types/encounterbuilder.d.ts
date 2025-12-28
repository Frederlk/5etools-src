export interface Encounterbuilder {
    _meta?:         Meta;
    encounterShape: EncounterShapeElement[];
}

export interface Meta {
    dependencies?: { [key: string]: any };
    otherSources?: OtherSources;
    [property: string]: any;
}

export interface OtherSources {
    /**
     * Keys are other sources to be loaded; values are `otherSources` sources from that source
     * to search for.
     */
    monster?: { [key: string]: any };
    [property: string]: any;
}

export interface EncounterShapeElement {
    name?:          string;
    otherSources?:  OtherSourceElement[];
    page?:          number | string;
    reprintedAs?:   Array<ReprintedAClass | string>;
    shapeTemplate?: ShapeTemplateElement[];
    source?:        string;
}

export interface OtherSourceElement {
    page?:  number | string;
    source: string;
}

export interface ReprintedAClass {
    edition?: Edition;
    /**
     * A tag used in the renderer, e.g. "creature"
     */
    tag?: string;
    /**
     * A UID, e.g. "longsword|phb"
     */
    uid: string;
}

/**
 * A context-sensitive behaviour hint. Generally, entities marked with `"edition": "one"`
 * will not be modified (as they are assumed to be up-to-date) prior to display/use, and
 * entities lacking an `"edition"` or using `"edition": "classic"` may be modified to better
 * suit modern rules. For example:
 * - Classes/subclasses: an edition mismatch between class and subclass will prompt the
 * renderer to add a note that the subclass is from a different game edition, and that
 * feature levels may have to be adjusted accordingly (notably, when rendering synthetic
 * subclass copies)
 * - Plutonium, when using the "Modern (2024)" rules version: non-"one" species will be
 * stripped of their ability scores; non-"one" backgrounds will gain extra ability scores;
 * etc.
 */
export type Edition = "classic" | "one";

export interface ShapeTemplateElement {
    groups: GroupElement[];
}

export interface GroupElement {
    count:  Count;
    ratio?: Ratio;
}

export interface Count {
    exact?:      number;
    max?:        number;
    min?:        number;
    formulaMax?: string;
    formulaMin?: string;
}

export interface Ratio {
    exact?: ExactClass | number;
    max?:   ExactClass | number;
    min?:   ExactClass | number;
}

/**
 * A fraction, expressed as a numerator and a denominator.
 */
export interface ExactClass {
    denom: number;
    num:   number;
}
