/** @module Interface fermyon:html-rewrite/rewriter **/
export function selectors(): Array<string>;
export function transformSelector(selector: string, element: Element): Array<RewriteAction>;
export interface Element {
  tag: string,
  attributes: Array<[string, string]>,
  canHaveContent: boolean,
  isSelfClosing: boolean,
}
/**
 * # Variants
 * 
 * ## `"html"`
 * 
 * ## `"text"`
 */
export type ContentType = 'html' | 'text';
export type RewriteAction = RewriteActionSetTagName | RewriteActionSetAttribute | RewriteActionRemoveAttribute | RewriteActionSetInnerContent | RewriteActionPrependInnerContent | RewriteActionAppendInnerContent | RewriteActionRemoveElement | RewriteActionRemoveElementKeepContent | RewriteActionReplaceElement | RewriteActionAfter | RewriteActionBefore;
export interface RewriteActionSetTagName {
  tag: 'set-tag-name',
  val: string,
}
export interface RewriteActionSetAttribute {
  tag: 'set-attribute',
  val: [string, string],
}
export interface RewriteActionRemoveAttribute {
  tag: 'remove-attribute',
  val: string,
}
export interface RewriteActionSetInnerContent {
  tag: 'set-inner-content',
  val: [string, ContentType],
}
export interface RewriteActionPrependInnerContent {
  tag: 'prepend-inner-content',
  val: [string, ContentType],
}
export interface RewriteActionAppendInnerContent {
  tag: 'append-inner-content',
  val: [string, ContentType],
}
export interface RewriteActionRemoveElement {
  tag: 'remove-element',
}
export interface RewriteActionRemoveElementKeepContent {
  tag: 'remove-element-keep-content',
}
export interface RewriteActionReplaceElement {
  tag: 'replace-element',
  val: [string, ContentType],
}
export interface RewriteActionAfter {
  tag: 'after',
  val: [string, ContentType],
}
export interface RewriteActionBefore {
  tag: 'before',
  val: [string, ContentType],
}
