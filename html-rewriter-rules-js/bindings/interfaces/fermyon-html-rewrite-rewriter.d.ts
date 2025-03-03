/** @module Interface fermyon:html-rewrite/rewriter **/
export function selectors(): Array<string>;
export function transformSelector(selector: string, element: Element): Array<RewriteAction>;
export interface Element {
  /**
   * get-attribute: func(attr: string) -> option<string>;
   */
  attributes: Array<[string, string]>,
}
export type RewriteAction = RewriteActionSetAttribute;
export interface RewriteActionSetAttribute {
  tag: 'set-attribute',
  val: [string, string],
}
