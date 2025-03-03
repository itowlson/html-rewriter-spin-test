# Usage

The entry point is the host, but the actual application is in the "rules" directory (because eventually the host will be an off-the-shelf component).

**NOTE:** The Rust rules sample uses an earlier iteration of the WIT; the JS is the one I care about, so that's the one I'm trying to refine.

```
cd html-rewriter-rules-js
npm install
spin up --build
curl localhost:3000/spin/v3/quickstart
```

(You can visit pages in a browser!  But beware, redirects don't work, and some links may take you to the actual origin site instead of the proxied site!)
