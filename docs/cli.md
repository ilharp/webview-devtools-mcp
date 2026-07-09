# WebView DevTools CLI

The `webview-devtools-mcp` package includes an **experimental** CLI interface for inspecting and automating an already-instrumented WebView or web page from your terminal. It is useful for debugging, smoke tests, and scripts that need to call the same tools exposed through the MCP server.

The CLI does not launch a browser or create a WebView for you. It starts or talks to a background `webview-devtools-mcp` daemon, and that daemon waits for a WebView/page that has loaded `target.js` to connect back.

## Getting started

Install the package globally to make the `chrome-devtools` command available:

```sh
npm i webview-devtools-mcp@latest -g
chrome-devtools status # check if install worked.
```

## How it works

The CLI acts as a client to a background `webview-devtools-mcp` daemon (uses Unix sockets on Linux/Mac and named pipes on Windows).

- **Automatic Start**: The first time you call a tool (e.g., `list_pages`), the CLI automatically starts the MCP server in the background if it is not already running.
- **WebView Connection**: A page appears only after your WebView/page loads `target.js` and connects back to the daemon.
- **Persistence**: The same background daemon is reused for subsequent commands, preserving connected pages while they remain open.
- **Manual Control**: You can explicitly manage the background process using `start`, `stop`, and `status`. The `start` command forwards supported arguments to the underlying MCP server. Run `webview-devtools start --help` for the supported arguments.

```sh
# Check if the daemon is running
webview-devtools status

# Start the daemon on the default local address (127.0.0.1:9333)
webview-devtools start

# List connected instrumented WebViews/pages
webview-devtools list_pages

# Take a text snapshot of the selected page
webview-devtools take_snapshot

# Take a screenshot and save it to a file
webview-devtools take_screenshot --filePath screenshot.png

# Stop the background daemon when finished
webview-devtools stop
```

## Inject `target.js`

Before the CLI can see a page, add the script served by the daemon to the starting HTML loaded by your WebView/page:

```html
<script src="http://127.0.0.1:9333/target.js"></script>
```

If you start the daemon with a different `--host` or `--port`, the injected script URL must use the same host and port:

```sh
webview-devtools start --port 9334
```

```html
<script src="http://127.0.0.1:9334/target.js"></script>
```

Place the script early in the document, for example in `<head>`, so the tools can observe page activity as early as possible.

## Remote WebViews and mobile devices

When the daemon runs on your PC but the WebView runs on a phone, simulator, embedded device, or another machine, `127.0.0.1` in the injected script refers to the device itself, not your PC.

Use a host address reachable from the device:

```sh
# Listen on all network interfaces on the PC
webview-devtools start --host 0.0.0.0 --port 9333
```

Then inject the PC's reachable address in the WebView's starting HTML, for example:

```html
<script src="http://192.168.1.23:9333/target.js"></script>
```

Make sure the device can reach the PC and that your firewall allows inbound TCP connections to the selected port. For emulators, use the host address exposed by that emulator when appropriate (for example, Android Emulator commonly uses `10.0.2.2`).

## Command usage

The CLI supports tools that are available in the MCP server without additional interactive setup (see [Tool reference](./tool-reference.md)). Some generated MCP tools are excluded from the CLI, such as `wait_for` and `fill_form`.

```sh
webview-devtools <tool> [arguments] [flags]
```

- **Required Arguments**: Passed as positional arguments.
- **Optional Arguments**: Passed as flags (e.g., `--filePath`, `--fullPage`).

### Examples

**Page discovery and snapshots:**

```sh
webview-devtools list_pages
webview-devtools select_page 0
webview-devtools take_snapshot
```

**Interaction:**

```sh
# Click an element by its UID from a snapshot
webview-devtools click "element-uid-123"

# Fill a form field
webview-devtools fill "input-uid-456" "search query"
```

**Debugging:**

```sh
# Evaluate JavaScript in the selected page
webview-devtools evaluate_script "() => document.title"

# Inspect console output and network requests
webview-devtools list_console_messages
webview-devtools list_network_requests
```

## Output format

By default, the CLI outputs a human-readable summary of the tool's result. For programmatic use, you can request raw JSON:

```sh
chrome-devtools list_pages --output-format=json
```

## Troubleshooting

If the CLI hangs or fails to connect, first verify that the daemon is running and that your WebView has loaded the matching `target.js` URL.

```sh
webview-devtools status
webview-devtools list_pages
```

If no page appears, reload the WebView and check that `http://<host>:<port>/target.js` is reachable from the WebView runtime.

To restart the daemon:

```sh
webview-devtools stop
webview-devtools start
```

For more verbose logs, set the `DEBUG` environment variable:

```sh
DEBUG=* webview-devtools list_pages
```

## CLI generation

Implemented in `scripts/generate-cli.ts`. Some commands are excluded from CLI generation such as `wait_for` and `fill_form`.

`webview-devtools-mcp` args are also filtered in `src/bin/webview-devtools.ts` because not all args make sense in a CLI interface.
