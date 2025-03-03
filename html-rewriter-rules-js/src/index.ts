/** @module Interface fermyon:html-rewrite/rewriter **/

import { rewriter as rr } from '../bindings/rewrite-rules';

export abstract class RewriteRules {
    abstract selectors(): Array<string>;
    abstract transformSelector(selector: string, element: rr.Element): Array<rr.RewriteAction>;
}

export class Rewriter extends RewriteRules {
    selectors(): Array<string> {
        return ["a"];
    }
    
    transformSelector(selector: string, element: rr.Element): Array<rr.RewriteAction> {
        let actions: Array<rr.RewriteAction> = [];
        if (selector === "a") {
            let href = element.attributes.find(e => e[0] == "href");
            if (href) {
                let mangled = href[1] + "?something=BIBBLYBOBBLY";
                actions.push({ tag: 'set-attribute', val: ["href", mangled] });
            }
            actions.push({ tag: 'prepend-inner-content', val: ["🎉 ", 'text'] });
            actions.push({ tag: 'append-inner-content', val: [" 🎉", 'text'] });
        }
        return actions;
    }
}

export const rewriter = new Rewriter();
