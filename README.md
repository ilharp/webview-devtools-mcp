# webview-devtools-mcp

[![npm webview-devtools-mcp package](https://img.shields.io/npm/v/webview-devtools-mcp.svg)](https://npmjs.org/package/webview-devtools-mcp)

DevTools for any WebView — no remote-debugging port required.
Works in Safari/iOS WebView/Lark Web App and more.
Based on [chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) and [chii](https://github.com/liriliri/chii).

`webview-devtools-mcp` is a Model Context Protocol (MCP) server for AI coding agents such as Claude Code, Cursor, Copilot, Gemini CLI, and Antigravity. It lets an agent inspect and automate a WebView or web page that you explicitly instrument with `target.js`: take snapshots and screenshots, click and type, inspect console messages and network requests, evaluate JavaScript, and debug live app state.

Unlike browser-launching MCP servers, this server does **not** open a browser tab for you. It starts a local debugging bridge and waits for your WebView/page to connect back.

## [Tool reference](./docs/tool-reference.md) | [Troubleshooting](./docs/troubleshooting.md)

## Screenshots

| Lark Web App                            |
| --------------------------------------- |
| ![Lark Web App](./docs/assets/lark.gif) |

## How it works

1. Your MCP client starts `webview-devtools-mcp`.
2. The server listens on `--host`/`--port` and serves `target.js`.
3. You add a `<script>` tag for that `target.js` to the starting HTML that your WebView loads.
4. When the WebView opens or reloads, it connects to the MCP server.
5. Your agent can list the connected page and drive it through the MCP tools.

A connected page only exists while the instrumented WebView/page is open. If the WebView reloads or closes, the target may disappear and then reconnect.

## Update checks

By default, the server periodically checks the npm registry for updates and logs a notification when a newer version is available.
You can disable these update checks by setting the `CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS` environment variable.

## Requirements

- [Node.js](https://nodejs.org/) [LTS](https://github.com/nodejs/Release#release-schedule) version.
- [npm](https://www.npmjs.com/)

## Getting started

### 1. Add the MCP server to your client

Add the following config to your MCP client:

```json
{
  "mcpServers": {
    "webview-devtools": {
      "command": "npx",
      "args": ["-y", "webview-devtools-mcp@latest"]
    }
  }
}
```

> [!NOTE]
> Using `webview-devtools-mcp@latest` ensures that your MCP client will always use the latest version of the webview-devtools-mcp.

By default the server listens on `127.0.0.1:9333`. If you change the port, the script URL you inject must use the same port:

```json
{
  "mcpServers": {
    "webview-devtools": {
      "command": "npx",
      "args": ["-y", "webview-devtools-mcp@latest", "--port=9334"]
    }
  }
}
```

If you are interested in doing only basic browser tasks, use the `--slim` mode:

```json
{
  "mcpServers": {
    "webview-devtools": {
      "command": "npx",
      "args": ["-y", "webview-devtools-mcp@latest", "--slim"]
    }
  }
}
```

See [Slim tool reference](./docs/slim-tool-reference.md).

### 2. Inject `target.js` into your starting HTML

Add this script tag to the HTML document that your WebView loads first:

```html
<script src="http://127.0.0.1:9333/target.js"></script>
```

If you configured a different `--host` or `--port`, use that exact host and port in the script URL:

```html
<script src="http://<host>:<port>/target.js"></script>
```

For best results, place the script early in the document, for example in `<head>`, so console, network, and page lifecycle activity is available as early as possible.

> [!IMPORTANT]
> The host in the script URL is resolved from the WebView's runtime environment, not from your MCP client. `127.0.0.1` works only when the WebView and the MCP server run on the same machine/runtime.

### 3. Open or reload the WebView

After your MCP client has started the server and your WebView has loaded the instrumented HTML, ask your agent to inspect the connected page, for example:

```text
List connected pages using webview-devtools-mcp and take a snapshot of the current page.
```

If no page appears, reload the WebView and verify that the `target.js` URL is reachable from the WebView environment.

## Remote WebViews and mobile devices

When the MCP server runs on your PC but the WebView runs on a phone, simulator, embedded device, or another machine, do not use `127.0.0.1` in the injected script. On the phone, `127.0.0.1` means the phone itself, not your PC.

Use a host address that the device can reach:

1. Start the MCP server on an interface reachable from the device, for example:

   ```json
   {
     "mcpServers": {
       "webview-devtools": {
         "command": "npx",
         "args": [
           "-y",
           "webview-devtools-mcp@latest",
           "--host=0.0.0.0",
           "--port=9333"
         ]
       }
     }
   }
   ```

2. Find your PC's LAN IP address, for example `192.168.1.23`.
3. In the WebView's starting HTML, inject the PC address, not localhost:

   ```html
   <script src="http://192.168.1.23:9333/target.js"></script>
   ```

4. Make sure the phone and PC are on the same network and that your firewall allows inbound TCP connections to the selected port.
5. Open or reload the WebView, then have your agent call `list_pages` or take a snapshot.

For emulators, use the address that the emulator exposes for the host machine when appropriate (for example, Android Emulator commonly uses `10.0.2.2`). The key rule is the same: the WebView must be able to fetch `http://<host>:<port>/target.js` and open the bridge connection back to that host and port.

## MCP Client configuration

<details>
  <summary>Amp</summary>
  Follow https://ampcode.com/manual#mcp and use the config provided above. You can also install webview-devtools-mcp using the CLI:

```bash
amp mcp add webview-devtools -- npx webview-devtools-mcp@latest
```

</details>

<details>
  <summary>Antigravity</summary>

To use webview-devtools-mcp follow the instructions from <a href="https://antigravity.google/docs/mcp">Antigravity's docs</a> to install a custom MCP server. Add the following config to the MCP servers config:

```bash
{
  "mcpServers": {
    "webview-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "webview-devtools-mcp@latest"
      ]
    }
  }
}
```

</details>

<details>
  <summary>Claude Code</summary>

**Install via CLI (MCP only)**

Use the Claude Code CLI to add the webview-devtools-mcp (<a href="https://code.claude.com/docs/en/mcp">guide</a>):

```bash
claude mcp add webview-devtools --scope user npx webview-devtools-mcp@latest
```

**Install as a Plugin (MCP + Skills)**

To install webview-devtools-mcp with skills, add the marketplace registry in Claude Code:

```sh
/plugin marketplace add ilharp/webview-devtools-mcp
```

Then, install the plugin:

```sh
/plugin install webview-devtools-mcp@webview-devtools-plugins
```

Restart Claude Code to have the MCP server and skills load (check with `/skills`).

> [!TIP]
> If the plugin installation fails with a `Failed to clone repository` error (e.g., HTTPS connectivity issues behind a corporate firewall), see the [troubleshooting guide](./docs/troubleshooting.md#claude-code-plugin-installation-fails-with-failed-to-clone-repository) for workarounds, or use the CLI installation method above instead.

</details>

<details>
  <summary>Cline</summary>
  Follow https://docs.cline.bot/mcp/configuring-mcp-servers and use the config provided above.
</details>

<details>
  <summary>Codex</summary>
  Follow the <a href="https://developers.openai.com/codex/mcp/#configure-with-the-cli">configure MCP guide</a>
  using the standard config from above. You can also install webview-devtools-mcp using the Codex CLI:

```bash
codex mcp add webview-devtools -- npx webview-devtools-mcp@latest
```

</details>

<details>
  <summary>Command Code</summary>

Use the Command Code CLI to add webview-devtools-mcp (<a href="https://commandcode.ai/docs/mcp">MCP guide</a>):

```bash
cmd mcp add webview-devtools --scope user npx webview-devtools-mcp@latest
```

</details>

<details>
  <summary>Copilot CLI</summary>

Start Copilot CLI:

```
copilot
```

Start the dialog to add a new MCP server by running:

```
/mcp add
```

Configure the following fields and press `CTRL+S` to save the configuration:

- **Server name:** `webview-devtools`
- **Server Type:** `[1] Local`
- **Command:** `npx -y webview-devtools-mcp@latest`

</details>

<details>
  <summary>Copilot / VS Code</summary>

**Install as a Plugin (Recommended)**

The easiest way to get up and running is to install `webview-devtools-mcp` as an agent plugin.
This bundles the **MCP server** and all **skills** together, so your agent gets both the tools
and the expert guidance it needs to use them effectively.

1.  Open the **Command Palette** (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux).
2.  Search for and run the **Chat: Install Plugin From Source** command.
3.  Paste in our repository name: `ilharp/webview-devtools-mcp`.

That's it! Your agent is now supercharged with webview-devtools-mcp capabilities.

</details>

<details>
  <summary>Cursor</summary>

**Click the button to install:**

[<img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor">](https://cursor.com/en/install-mcp?name=webview-devtools&config=eyJjb21tYW5kIjoibnB4IC15IHdlYnZpZXctZGV2dG9vbHMtbWNwQGxhdGVzdCJ9)

**Or install manually:**

Go to `Cursor Settings` -> `MCP` -> `New MCP Server`. Use the config provided above.

</details>

<details>
  <summary>Factory CLI</summary>
Use the Factory CLI to add webview-devtools-mcp (<a href="https://docs.factory.ai/cli/configuration/mcp">guide</a>):

```bash
droid mcp add webview-devtools "npx -y webview-devtools-mcp@latest"
```

</details>

<details>
  <summary>Gemini CLI</summary>
Install webview-devtools-mcp using the Gemini CLI.

**Project wide:**

```bash
# Either MCP only:
gemini mcp add webview-devtools npx webview-devtools-mcp@latest
# Or as a Gemini extension (MCP+Skills):
gemini extensions install --auto-update https://github.com/ilharp/webview-devtools-mcp
```

**Globally:**

```bash
gemini mcp add -s user webview-devtools npx webview-devtools-mcp@latest
```

Alternatively, follow the <a href="https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md#how-to-set-up-your-mcp-server">MCP guide</a> and use the standard config from above.

</details>

<details>
  <summary>Gemini Code Assist</summary>
  Follow the <a href="https://cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer#configure-mcp-servers">configure MCP guide</a>
  using the standard config from above.
</details>

<details>
  <summary>Grok Build CLI</summary>

```bash
grok mcp add webview-devtools npx webview-devtools-mcp@latest
```

See the <a href="https://docs.x.ai/build/features/skills-plugins-marketplaces">docs</a> for more options
</details>

<details>
  <summary>JetBrains AI Assistant & Junie</summary>

Go to `Settings | Tools | AI Assistant | Model Context Protocol (MCP)` -> `Add`. Use the config provided above.
The same way webview-devtools-mcp can be configured for JetBrains Junie in `Settings | Tools | Junie | MCP Settings` -> `Add`. Use the config provided above.

</details>

<details>
  <summary>Kiro</summary>

In **Kiro Settings**, go to `Configure MCP` > `Open Workspace or User MCP Config` > Use the configuration snippet provided above.

Or, from the IDE **Activity Bar** > `Kiro` > `MCP Servers` > `Click Open MCP Config`. Use the configuration snippet provided above.

</details>

<details>
  <summary>Mistral Vibe</summary>

Add in ~/.vibe/config.toml:

```toml
[[mcp_servers]]
name = "webview-devtools"
transport = "stdio"
command = "npx"
args = ["webview-devtools-mcp@latest"]
```

</details>

<details>
  <summary>OpenCode</summary>

Add the following configuration to your `opencode.json` file. If you don't have one, create it at `~/.config/opencode/opencode.json` (<a href="https://opencode.ai/docs/mcp-servers">guide</a>):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "webview-devtools": {
      "type": "local",
      "command": ["npx", "-y", "webview-devtools-mcp@latest"]
    }
  }
}
```

</details>

<details>
  <summary>Qoder</summary>

In **Qoder Settings**, go to `MCP Server` > `+ Add` > Use the configuration snippet provided above.

Alternatively, follow the <a href="https://docs.qoder.com/user-guide/chat/model-context-protocol">MCP guide</a> and use the standard config from above.

</details>

<details>
  <summary>Qoder CLI</summary>

Install webview-devtools-mcp using the Qoder CLI (<a href="https://docs.qoder.com/cli/using-cli#mcp-servers">guide</a>):

**Project wide:**

```bash
qodercli mcp add webview-devtools -- npx webview-devtools-mcp@latest
```

**Globally:**

```bash
qodercli mcp add -s user webview-devtools -- npx webview-devtools-mcp@latest
```

</details>

<details>
  <summary>Visual Studio</summary>

**Click the button to install:**

[<img src="https://img.shields.io/badge/Visual_Studio-Install-C16FDE?logo=visualstudio&logoColor=white" alt="Install in Visual Studio">](https://vs-open.link/mcp-install?%7B%22name%22%3A%22webview-devtools%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22webview-devtools-mcp%40latest%22%5D%7D)

</details>

<details>
  <summary>Warp</summary>

Go to `Settings | AI | Manage MCP Servers` -> `+ Add` to [add an MCP Server](https://docs.warp.dev/knowledge-and-collaboration/mcp#adding-an-mcp-server). Use the config provided above.

</details>

<details>
  <summary>Windsurf</summary>
  Follow the <a href="https://docs.windsurf.com/windsurf/cascade/mcp#mcp-config-json">configure MCP guide</a>
  using the standard config from above.
</details>

## Your first prompt

After the WebView is open and connected, enter a prompt like this in your MCP client:

```text
List connected pages using webview-devtools-mcp and take a text snapshot.
```

Your MCP client should report the connected page and return an text snapshot. From there you can ask it to click, fill forms, evaluate JavaScript, inspect console messages, inspect network requests, or take screenshots.

> [!NOTE]
> Connecting to the MCP server alone does not create a page. The page appears only after your instrumented WebView loads `target.js` and connects back to the server.

## Tools

If you run into any issues, checkout our [troubleshooting guide](./docs/troubleshooting.md).

<!-- BEGIN AUTO GENERATED TOOLS -->

- **Input automation** (7 tools)
  - [`click`](docs/tool-reference.md#click)
  - [`fill`](docs/tool-reference.md#fill)
  - [`fill_form`](docs/tool-reference.md#fill_form)
  - [`hover`](docs/tool-reference.md#hover)
  - [`press_key`](docs/tool-reference.md#press_key)
  - [`type_text`](docs/tool-reference.md#type_text)
  - [`click_at`](docs/tool-reference.md#click_at)
- **Navigation automation** (4 tools)
  - [`list_pages`](docs/tool-reference.md#list_pages)
  - [`navigate_page`](docs/tool-reference.md#navigate_page)
  - [`select_page`](docs/tool-reference.md#select_page)
  - [`wait_for`](docs/tool-reference.md#wait_for)
- **Network** (2 tools)
  - [`get_network_request`](docs/tool-reference.md#get_network_request)
  - [`list_network_requests`](docs/tool-reference.md#list_network_requests)
- **Debugging** (7 tools)
  - [`evaluate_script`](docs/tool-reference.md#evaluate_script)
  - [`get_console_message`](docs/tool-reference.md#get_console_message)
  - [`list_console_messages`](docs/tool-reference.md#list_console_messages)
  - [`take_screenshot`](docs/tool-reference.md#take_screenshot)
  - [`take_snapshot`](docs/tool-reference.md#take_snapshot)
  - [`screencast_start`](docs/tool-reference.md#screencast_start)
  - [`screencast_stop`](docs/tool-reference.md#screencast_stop)
- **Third-party** (2 tools)
  - [`execute_3p_developer_tool`](docs/tool-reference.md#execute_3p_developer_tool)
  - [`list_3p_developer_tools`](docs/tool-reference.md#list_3p_developer_tools)
- **WebMCP** (2 tools)
  - [`execute_webmcp_tool`](docs/tool-reference.md#execute_webmcp_tool)
  - [`list_webmcp_tools`](docs/tool-reference.md#list_webmcp_tools)

<!-- END AUTO GENERATED TOOLS -->

## Configuration

webview-devtools-mcp supports the following configuration option:

<!-- BEGIN AUTO GENERATED OPTIONS -->

- **`--port`**

  - **Type:** number
  - **Default:** `9333`

- **`--host`**

  - **Type:** string
  - **Default:** `127.0.0.1`

- **`--logFile`/ `--log-file`**
  Path to a file to write debug logs to. Set the env variable `DEBUG` to `*` to enable verbose logs. Useful for submitting bug reports.
  - **Type:** string
  - **Default:** `false`

- **`--acceptInsecureCerts`/ `--accept-insecure-certs`**
  If enabled, ignores errors relative to self-signed and expired certificates. Use with caution.
  - **Type:** boolean
  - **Default:** `false`

- **`--experimentalPageIdRouting`/ `--experimental-page-id-routing`**
  Whether to expose pageId on page-scoped tools and route requests by page ID (useful for concurrent agent sessions).
  - **Type:** boolean
  - **Default:** `false`

- **`--experimentalDevtools`/ `--experimental-devtools`**
  Whether to enable automation over DevTools targets
  - **Type:** boolean
  - **Default:** `false`

- **`--experimentalVision`/ `--experimental-vision`**
  Whether to enable coordinate-based tools such as click_at(x,y). Usually requires a computer-use model able to produce accurate coordinates by looking at screenshots.
  - **Type:** boolean
  - **Default:** `false`

- **`--memoryDebugging`/ `--memory-debugging`, `-experimentalMemory`**
  Whether to enable memory debugging tools.
  - **Type:** boolean
  - **Default:** `false`

- **`--experimentalStructuredContent`/ `--experimental-structured-content`**
  Whether to output structured formatted content.
  - **Type:** boolean
  - **Default:** `false`

- **`--experimentalIncludeAllPages`/ `--experimental-include-all-pages`**
  Whether to include all kinds of pages such as webviews or background pages as pages.
  - **Type:** boolean
  - **Default:** `false`

- **`--experimentalScreencast`/ `--experimental-screencast`**
  Exposes experimental screencast tools (requires ffmpeg). Install ffmpeg https://www.ffmpeg.org/download.html and ensure it is available in the MCP server PATH.
  - **Type:** boolean
  - **Default:** `false`

- **`--experimentalFfmpegPath`/ `--experimental-ffmpeg-path`**
  Path to ffmpeg executable for screencast recording.
  - **Type:** string
  - **Default:** `false`

- **`--categoryExperimentalWebmcp`/ `--category-experimental-webmcp`**
  Set to true to enable debugging WebMCP tools. Requires Chrome 149+ with the following flags: `--enable-features=WebMCP,DevToolsWebMCPSupport`
  - **Type:** boolean
  - **Default:** `false`

- **`--blockedUrlPattern`/ `--blocked-url-pattern`**
  Restricts browser's network access by blocking specified URL patterns (uses https://urlpattern.spec.whatwg.org/). Silently detaches from targets with blocked URLs upon connection, and blocks runtime requests (including navigations and subresources). Accepts an array of patterns.
  - **Type:** array
  - **Default:** `false`

- **`--allowedUrlPattern`/ `--allowed-url-pattern`**
  Restricts browser's network access by allowing only specified URL patterns (uses https://urlpattern.spec.whatwg.org/). Requires Chrome 149+. Silently detaches from targets with unallowed URLs upon connection, and blocks runtime requests (including navigations and subresources). Accepts an array of patterns.
  - **Type:** array
  - **Default:** `false`

- **`--categoryEmulation`/ `--category-emulation`**
  Set to false to exclude tools related to emulation.
  - **Type:** boolean
  - **Default:** `true`

- **`--categoryPerformance`/ `--category-performance`**
  Set to false to exclude tools related to performance.
  - **Type:** boolean
  - **Default:** `true`

- **`--categoryNetwork`/ `--category-network`**
  Set to false to exclude tools related to network.
  - **Type:** boolean
  - **Default:** `true`

- **`--categoryExtensions`/ `--category-extensions`**
  Set to true to include tools related to extensions. Note: This feature is currently only supported with a pipe connection. autoConnect, browserUrl, and wsEndpoint are not supported with this feature until 149 will be released.
  - **Type:** boolean
  - **Default:** `false`

- **`--categoryExperimentalThirdParty`/ `--category-experimental-third-party`**
  Set to true to enable third-party developer tools exposed by the inspected page itself
  - **Type:** boolean
  - **Default:** `false`

- **`--screenshotFormat`/ `--screenshot-format`**
  Override the default output format used by take_screenshot when the caller does not specify one. JPEG and WebP are ~3-5x smaller than PNG, which helps reduce context size in AI conversations. Unset preserves the existing default ("png").
  - **Type:** string
  - **Choices:** `jpeg`, `png`, `webp`
  - **Default:** `false`

- **`--screenshotQuality`/ `--screenshot-quality`**
  Override the default compression quality (0-100) used by take_screenshot for JPEG and WebP when the caller does not specify one. Lower values mean smaller files. Ignored for PNG. Unset preserves the Puppeteer default.
  - **Type:** number
  - **Default:** `false`

- **`--screenshotMaxWidth`/ `--screenshot-max-width`**
  Maximum width in pixels for screenshots. If the captured image is wider, it is downscaled (preserving aspect ratio) before being returned. Reduces context size in AI conversations. Unset means no resize.
  - **Type:** number
  - **Default:** `false`

- **`--screenshotMaxHeight`/ `--screenshot-max-height`**
  Maximum height in pixels for screenshots. If the captured image is taller, it is downscaled (preserving aspect ratio) before being returned. Can be combined with --screenshot-max-width; the smaller scale factor wins. Unset means no resize.
  - **Type:** number
  - **Default:** `false`

- **`--slim`**
  Exposes a "slim" set of 3 tools covering navigation, script execution and screenshots only. Useful for basic browser tasks.
  - **Type:** boolean
  - **Default:** `false`

- **`--redactNetworkHeaders`/ `--redact-network-headers`**
  If true, redacts some of the network headers considered sensitive before returning to the client.
  - **Type:** boolean
  - **Default:** `false`

- **`--allowUnrestrictedPaths`/ `--allow-unrestricted-paths`**
  If set, disables the default path restriction that applies when the MCP client does not negotiate the roots capability. By default, file-writing tools are restricted to the OS temp directory when no roots are configured. Use this only when connecting a trusted local client that does not implement MCP roots and requires access to paths outside the temp directory.
  - **Type:** boolean
  - **Default:** `false`

<!-- END AUTO GENERATED OPTIONS -->

Pass them via the `args` property in the JSON configuration. For example:

```json
{
  "mcpServers": {
    "webview-devtools": {
      "command": "npx",
      "args": ["webview-devtools-mcp@latest", "--port=9334"]
    }
  }
}
```

Remember to keep the injected script URL in sync with these options:

```html
<script src="http://127.0.0.1:9334/target.js"></script>
```

## Concepts

### Instrumented WebViews, not launched browser tabs

`webview-devtools-mcp` can inspect and automate pages that have loaded `target.js`. It cannot inject the script into an arbitrary page by itself, and it cannot create a new WebView for you. If `list_pages` returns no pages, open or reload the WebView and verify that the script URL is reachable from that runtime.

### Navigation

`navigate_page` operates on an already connected page. If navigation takes the WebView to a document that does not load `target.js`, the page will disconnect and no further tools can operate on it until an instrumented page loads again.

### Security and privacy

`webview-devtools-mcp` exposes the connected page to MCP clients. A connected agent may inspect page content, read console output, observe network requests, execute JavaScript, click, type, and otherwise interact with the page.

Only connect pages and MCP clients that you trust. Avoid opening sensitive personal or production data in an instrumented WebView unless you intend to make it available to the connected MCP client.

When using `--host=0.0.0.0` or another non-loopback host for a remote device, the debugging bridge may be reachable by other machines on the network. Use a trusted network, firewall the selected port, and stop the MCP server when you are done.

## Known limitations

See [Troubleshooting](./docs/troubleshooting.md).
