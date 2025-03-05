import { rewriter as rr } from '../bindings/rewrite-rules';

export type Element = rr.Element;
export type RewriteAction = rr.RewriteAction;

export type TransformFunc = (e: rr.Element) => rr.RewriteAction | null;

export interface RewriteRule {
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

export function setAtttribute(attribute: string, value: string): rr.RewriteAction {
    return { tag: 'set-attribute', val: [attribute, value] }
}

export function prependInnerContent(content: string, contentType: 'text' | 'html'): rr.RewriteAction {
    return { tag: 'prepend-inner-content', val: [content, contentType] };
}
