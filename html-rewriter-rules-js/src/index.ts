/** @module Interface fermyon:html-rewrite/rewriter **/

import { rewriter as rr } from '../bindings/rewrite-rules';

// THE LIBRARY

type TransformFunc = (e: rr.Element) => rr.RewriteAction | null;

interface RewriteRule {
    rewrite(element: rr.Element): rr.RewriteAction | null;
}

export class Rewriter {
    rules: { [key: string]: Array<TransformFunc> }

    constructor() {
        this.rules = {};
    }

    on(selector: string, action: TransformFunc | RewriteRule): Rewriter {
        let f = typeof action == 'function' ? action : ((e: rr.Element) => action.rewrite(e));
        if (this.rules[selector]) {
            this.rules[selector].push(f);
        } else {
            this.rules[selector] = [f];
        }

        return this;
    }

    selectors(): Array<string> {
        return Object.keys(this.rules);
    }

    transformSelector(selector: string, element: rr.Element): Array<rr.RewriteAction> {
        let transformationFuncs = this.rules[selector] || [];
        return transformationFuncs.map(f => f(element)).filter(a => a !== null);
    }
}

function setAtttribute(attribute: string, value: string): rr.RewriteAction {
    return { tag: 'set-attribute', val: [attribute, value] }
}

function prependInnerContent(content: string, contentType: 'text' | 'html'): rr.RewriteAction {
    return { tag: 'prepend-inner-content', val: [content, contentType] };
}

// A PARTICULAR SET OF REWRITE RULES

const hrefRewriter: RewriteRule = {
    rewrite(element: rr.Element): rr.RewriteAction | null {
        let href = element.attributes.find(e => e[0] == "href");
        if (href) {
            let mangled = href[1] + "?something=BIBBLYBOBBLY";
            return setAtttribute("href", mangled);
        } else {
            return null;
        }
    }
}

class DecorationPrepender implements RewriteRule {
    constructor(private readonly decoration: string) {}
    rewrite(element: rr.Element): rr.RewriteAction | null {
        let prefix = `${this.decoration} `;
        return prependInnerContent(prefix, 'text');
    }

}

export function getRewriter(): Rewriter {
    return new Rewriter()
        .on("a", hrefRewriter)
        .on("a", new DecorationPrepender("🐔"))
        .on("a", (_) => ({ tag: 'append-inner-content', val: [" 🐔", 'text'] }));
}

export const rewriter = { getRewriter, Rewriter };
