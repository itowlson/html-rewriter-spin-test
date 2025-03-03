use futures::{SinkExt, StreamExt};
use lol_html::element;
use spin_sdk::http::{Fields, IncomingRequest, IncomingResponse, OutgoingResponse, Request, ResponseOutparam};
use spin_sdk::http_component;

mod wit {
    wit_bindgen::generate!({
        world: "rewrite-host",
    });
}

#[http_component]
async fn handle_html_rewriter_host(req: IncomingRequest, response_outparam: ResponseOutparam) {
    let headers = Fields::from_list(&[("content-type".to_owned(), "text/html".into())]).unwrap();
    let response = OutgoingResponse::new(headers);
    let upstream_url = format!("https://developer.fermyon.com{}", req.path_with_query().unwrap_or("/".to_owned()));
    let upstream_resp: IncomingResponse = spin_sdk::http::send(Request::get(upstream_url)).await.unwrap();

    if upstream_resp.status() != 200 {
        println!("EXIT! status = {}", upstream_resp.status());
        response.set_status_code(upstream_resp.status()).unwrap();
        return;
    }

    let response_body = response.take_body();
    response_outparam.set(response);

    let output_sink = OutputSink {
        sink: Box::pin(response_body),
    };

    let mut settings = lol_html::Settings::new();
    for selector in wit::fermyon::html_rewrite::rewriter::selectors() {
        let selector2 = selector.clone();
        settings.element_content_handlers.push(element!(&selector, move |e| mangle_by_sel(&selector2, e)));
    }
    let mut rewriter = lol_html::HtmlRewriter::new(settings, output_sink);

    let mut stm = upstream_resp.take_body_stream();
    while let Some(chunk) = stm.next().await {
        let chunk = chunk.unwrap();
        rewriter.write(&chunk).unwrap();
    }

    rewriter.end().unwrap();
}
struct OutputSink {
    sink: std::pin::Pin<Box<dyn futures::Sink<Vec<u8>, Error = spin_executor::bindings::wasi::io::streams::StreamError>>>,
}

impl lol_html::OutputSink for OutputSink {
    fn handle_chunk(&mut self, chunk: &[u8]) {
        let future = self.sink.send(chunk.to_vec());
        spin_executor::run(future).unwrap();
    }
}

fn mangle_by_sel(selector: &str, e: &mut lol_html::html_content::Element) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let element = wit::fermyon::html_rewrite::rewriter::Element {
        tag: e.tag_name(),
        attributes: e.attributes().iter().map(|a| (a.name(), a.value())).collect(),
        can_have_content: e.can_have_content(),
        is_self_closing: e.is_self_closing(),
    };
    let transformations = wit::fermyon::html_rewrite::rewriter::transform_selector(selector, &element);
    for transformation in &transformations {
        apply(transformation, e)?;
    }
    Ok(())
}

fn apply(transformation: &wit::fermyon::html_rewrite::rewriter::RewriteAction, e: &mut lol_html::html_content::Element) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    match transformation {
        wit::fermyon::html_rewrite::rewriter::RewriteAction::SetAttribute((attr, value)) => e.set_attribute(attr, value)?,
        wit::fermyon::html_rewrite::rewriter::RewriteAction::SetTagName(name) => e.set_tag_name(name)?,
        wit::fermyon::html_rewrite::rewriter::RewriteAction::RemoveAttribute(attr) => e.remove_attribute(attr),
        wit::fermyon::html_rewrite::rewriter::RewriteAction::SetInnerContent((content, ty)) => e.set_inner_content(content, ty.into()),
        wit::fermyon::html_rewrite::rewriter::RewriteAction::PrependInnerContent((content, ty)) => e.prepend(content, ty.into()),
        wit::fermyon::html_rewrite::rewriter::RewriteAction::AppendInnerContent((content, ty)) => e.append(content, ty.into()),
        wit::fermyon::html_rewrite::rewriter::RewriteAction::RemoveElement => e.remove(),
        wit::fermyon::html_rewrite::rewriter::RewriteAction::RemoveElementKeepContent => e.remove_and_keep_content(),
        wit::fermyon::html_rewrite::rewriter::RewriteAction::ReplaceElement((content, ty)) => e.replace(content, ty.into()),
        wit::fermyon::html_rewrite::rewriter::RewriteAction::After((content, ty)) => e.after(content, ty.into()),
        wit::fermyon::html_rewrite::rewriter::RewriteAction::Before((content, ty)) => e.before(content, ty.into()),
    };
    Ok(())
}

impl From<&wit::fermyon::html_rewrite::rewriter::ContentType> for lol_html::html_content::ContentType {
    fn from(value: &wit::fermyon::html_rewrite::rewriter::ContentType) -> Self {
        match value {
            wit::fermyon::html_rewrite::rewriter::ContentType::Html => lol_html::html_content::ContentType::Html,
            wit::fermyon::html_rewrite::rewriter::ContentType::Text => lol_html::html_content::ContentType::Text,
        }
    }
}
