---
name: webview-devtools
description: 'Use webview-devtools-mcp to inspect and automate an already-instrumented WebView/page: choose this skill when the user’s target environment is configured so the page injects wdmcp’s target.js (or the user is explicitly asking to work with such a configured WebView). If the page is not yet injecting target.js, do not start by using the tools; first help the user configure or add the target.js injection, then use tools after the WebView connects.'
---

## Core Concepts

**Instrumented WebView, not launched Chrome**: This skill is for WebViews/pages that already load the wdmcp server’s `target.js`, for example with `<script src="//<host>:<port>/target.js"></script>`. The MCP server does not open or navigate a Chrome profile for the user; it starts a local wdmcp server and waits for instrumented targets to connect back. If no target connects, the first tool call times out with guidance to inject `target.js`.
**target.js bridge**: `target.js` is the webview-side bundle. When loaded in the page, it opens a target WebSocket to the wdmcp server, registers page metadata (URL/title/favicon), and runs an in-page CDP backend.
**Page availability and lifecycle**: `list_pages` shows currently connected instrumented WebViews. A page appears only while the WebView is open and connected; reloads/disconnects are surfaced as target create/destroy events. Use `select_page` when multiple WebViews are connected.
**Navigation constraints**: `navigate_page` can act only on the currently connected WebView through its in-page backend; it cannot create a fresh browser tab or inject `target.js` into an unconfigured page for you.
**Element interaction**: Use `take_snapshot` to get page structure with element `uid`s. Each element has a unique `uid` for interaction. If an element isn't found, take a fresh snapshot - the element may have been removed or the page changed.

## Environment Readiness

Before using the tools, decide whether the user's target page is already connected or can be connected:

1. Confirm the page/WebView is intended to be inspected through this skill.
2. Determine the server URL the page should load. Start from the MCP configuration, because the port may not be the default `9333`: look for workspace/client config files such as `.mcp.json`, `gemini-extension.json`, `.claude/settings.json`, `.vscode/launch.json`, or `.gemini/settings.json`, then inspect the configured command args for `--port` and `--host`.
3. If no configured host/port is found, use the defaults `127.0.0.1:9333`. Confirm the page loads that exact `target.js` URL, for example `<script src="http://<host>:<port>/target.js"></script>`.
4. Confirm `<host>:<port>` is reachable from the device or runtime that hosts the WebView. For a mobile device, simulator, remote WebView, or embedded app, `127.0.0.1` usually means the device itself, not the user's development machine; use a reachable host address instead.
5. If the user has not added `target.js` yet, do not call browser-automation tools first. Explain the injection requirement and help them configure it.
6. If the user says the page is already configured, use `list_pages` to check connected targets. If no page appears or the first tool call times out, ask the user to open/reload the WebView and verify the injected script URL is reachable.

## Workflow Patterns

### Before interacting with a page

1. Navigate: `navigate_page` or `new_page`
2. Wait: `wait_for` to ensure content is loaded if you know what you look for.
3. Snapshot: `take_snapshot` to understand page structure
4. Interact: Use element `uid`s from snapshot for `click`, `fill`, etc.

### Efficient data retrieval

- Use `filePath` parameter for large outputs (screenshots, snapshots, traces)
- Use pagination (`pageIdx`, `pageSize`) and filtering (`types`) to minimize data
- Set `includeSnapshot: false` on input actions unless you need updated page state

### Tool selection

- **Automation/interaction**: `take_snapshot` (text-based, faster, better for automation)
- **Visual inspection**: `take_screenshot` (when user needs to see visual state)
- **Additional details**: `evaluate_script` for data not in accessibility tree

### Parallel execution

You can send multiple tool calls in parallel, but maintain correct order: navigate → wait → snapshot → interact.
