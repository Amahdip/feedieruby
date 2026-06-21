# SalamRuby Browser JS Library

[![npm package](https://img.shields.io/npm/v/@salamruby/js?style=flat-square)](https://www.npmjs.com/package/@salamruby/js)
[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Please see [SalamRuby Docs](https://salamruby.com/docs).
Specifically, [Quickstart/Implementation details](https://salamruby.com/docs/getting-started/quickstart-in-app-survey).

## What is SalamRuby

SalamRuby is your go-to solution for in-product micro-surveys that will supercharge your product experience! 🚀 For more information please check out [salamruby.com](https://salamruby.com).

## How to use this library

1. Install the SalamRuby package inside your project using npm:

```bash
npm install -s @salamruby/js
```

2. Import SalamRuby and initialize the widget in your main component (e.g., App.tsx or App.js):

```javascript
import salamruby from "@salamruby/js";

if (typeof window !== "undefined") {
  salamruby.setup({
    workspaceId: "your-workspace-id",
    appUrl: "https://app.salamruby.com",
  });
}
```

Replace your-environment-id with your actual environment ID. You can find your environment ID in the **Setup Checklist** in the SalamRuby settings.

For more detailed guides for different frameworks, check out our [Framework Guides](https://salamruby.com/docs/getting-started/framework-guides).
