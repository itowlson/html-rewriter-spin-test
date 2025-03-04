/** @module Interface fermyon:html-rewrite/rewriter **/

import { rewriter as rr } from '../bindings/rewrite-rules';

type TransformFunc = (e: rr.Element) => rr.RewriteAction | null;

export class RewriterRsrc {
    rules: { [key: string]: Array<TransformFunc> }

    constructor() {
        this.rules = {};
    }

    on(selector: string, action: TransformFunc): RewriterRsrc {
        if (this.rules[selector]) {
            this.rules[selector].push(action);
        } else {
            this.rules[selector] = [action];
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

export function getRewriter(): RewriterRsrc {
    return new RewriterRsrc()
        .on("spork", (_) => ({ tag: 'append-inner-content', val: [" 🐔", 'text'] }))
        .on("a", (e) => {
            let href = e.attributes.find(e => e[0] == "href");
            if (href) {
                let mangled = href[1] + "?something=BIBBLYBOBBLY";
                return { tag: 'set-attribute', val: ["href", mangled] };
            } else {
                return null;
            }
        })
        .on("a", (_) => ({ tag: 'prepend-inner-content', val: ["🐔 ", 'text'] }))
        .on("a", (_) => ({ tag: 'append-inner-content', val: [" 🐔", 'text'] }));
}

export const rewriter = { getRewriter, RewriterRsrc };
