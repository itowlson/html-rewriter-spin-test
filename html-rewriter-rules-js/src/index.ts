import * as rw from "./rewriter.js";
import { Rewriter } from "./rewriter.js";

const hrefRewriter: rw.RewriteRule = {
    rewrite(element: rw.Element): rw.RewriteAction | null {
        let href = element.attributes.find(e => e[0] == "href");
        if (href) {
            let mangled = href[1] + "?something=BIBBLYBOBBLY";
            return rw.setAtttribute("href", mangled);
        } else {
            return null;
        }
    }
}

class DecorationPrepender implements rw.RewriteRule {
    constructor(private readonly decoration: string) {}
    rewrite(element: rw.Element): rw.RewriteAction | null {
        let prefix = `${this.decoration} `;
        return rw.prependInnerContent(prefix, 'text');
    }
}

export function getRewriter(): Rewriter {
    return new Rewriter()
        .on("a", hrefRewriter)
        .on("a", new DecorationPrepender("🐔"))
        .on("a", (_) => ({ tag: 'append-inner-content', val: [" 🎉", 'text'] }));
}

export const rewriter = { getRewriter, Rewriter };
