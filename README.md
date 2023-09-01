# SUSE CSP Marketplace Offer Supplemental Documentation

Usage instructions for deploying SUSE products from cloud service providers' marketplaces.

## Contributing

_marketplace-docs_ is a [Lektor](https://www.getlektor.com/) project published via github CI to [github pages](https://pages.github.com/).

Please see https://www.getlektor.com/docs/installation/ for instructions on setting up Lektor locally for development.

### Documents

Each document is represented as a _page_ object, stored in a `contents.lr` file, nested under [content](/content). Please see the [Lektor content docs](https://www.getlektor.com/docs/content/) for more details on how this works.

The heirarchy is a directory for each product, and a subdirectory for each CSP. If necessary an additional subdirectory can be made for special instructions. For example: `content/neuvector-prime/aws/contents.lr`. Please note that for page generation each level must have a `contents.lr`, but for unused heirarchy it can be blank.

The `contents.lr` defines the page with the following attributes :

* title: The title of the page in the format "$PRODUCT in $CSP: $DOCUMENT_TYPE". For example: "NeuVector Prime in AWS: Usage Instructions"
* theme: either "suse" or "rancher" depending on the product branding.
* body: The contents of the document, in _markdown_.

Substitution from query parameters into code blocks is supported for known params. Valid param keys must be included in the `allowed_param_keys` definition in [application.js](/assets/js/application.js). The values will replace the double-bracketed key names. Example:

```
--version={{chart_version}}
```

Given a URL ending `?chart_version=1.2.3`

The code block would render as

```
--version==1.2.3
```

### Pull Requests

Create a PR with changes and a screenshot, please.

---
All contents Copyright (c) 2023 SUSE LLC.
