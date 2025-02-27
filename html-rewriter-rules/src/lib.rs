wit_bindgen::generate!({
    world: "rewrite-rules",
    generate_all,
});

struct Rewriter;

impl exports::fermyon::html_rewrite::rewriter::Guest for Rewriter {
    fn selectors() -> Vec<String> {
        ["a"].into_iter().map(|s| s.to_owned()).collect()
    }

    fn transform_selector(selector: String, element: exports::fermyon::html_rewrite::rewriter::Element) -> Vec<exports::fermyon::html_rewrite::rewriter::RewriteAction> {
        match selector.as_str() {
            "a" => rewrite_a(&element),
            _ => panic!("what the heck element is that you joker")
        }
    }
}

fn rewrite_a(element: &exports::fermyon::html_rewrite::rewriter::Element) -> Vec<exports::fermyon::html_rewrite::rewriter::RewriteAction> {
    if let Some(href) = element.attributes.iter().find(|(k, _)| k == "href").map(|(_, v)| v) {
        vec![exports::fermyon::html_rewrite::rewriter::RewriteAction::SetAttribute(("href".to_owned(), format!("{href}&BIBBLE=BOBBLE")))]
    } else {
        vec![]
    }
}

export!(Rewriter);
