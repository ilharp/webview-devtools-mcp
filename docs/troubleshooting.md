# Troubleshooting

## General tips

- Run `npx webview-devtools-mcp@latest --help` to test if the MCP server runs on your machine.
- Make sure that your MCP client uses the same npm and Node.js version as your terminal.
- When configuring your MCP client, try using the `-y` or `--yes` argument to `npx` to auto-accept the installation prompt.
- Find the specific error in the output of the `webview-devtools-mcp` server. If your client is an IDE, logs are usually in its Output pane.
- Confirm that your WebView/page loads `target.js` from the same `--host` and `--port` used by the MCP server.
- Search the [GitHub repository issues and discussions](https://github.com/ilharp/webview-devtools-mcp) for help or existing similar problems.

## Debugging

Start the MCP server with debugging enabled and a log file:

```sh
DEBUG=* npx webview-devtools-mcp@latest --log-file=/path/to/webview-devtools-mcp.log
```

Using `.mcp.json` to debug while using a client:

```json
{
  "mcpServers": {
    "webview-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "webview-devtools-mcp@latest",
        "--log-file",
        "/path/to/webview-devtools-mcp.log"
      ],
      "env": {
        "DEBUG": "*"
      }
    }
  }
}
```

## Specific problems

### `Error [ERR_MODULE_NOT_FOUND]: Cannot find module ...`

This usually indicates either a non-supported Node.js version is in use or that the `npm`/`npx` cache is corrupted. Try clearing the cache and running `webview-devtools-mcp` again:

```sh
rm -rf ~/.npm/_npx # NOTE: this might remove other installed npx executables.
npm cache clean --force
```

### No pages appear in `list_pages`

`webview-devtools-mcp` does not create a page by itself. A page appears only after your WebView or web page loads the server's `target.js` and connects back.

Check the following:

1. The MCP server is running.
2. Your starting HTML includes the script tag:

   ```html
   <script src="http://<host>:<port>/target.js"></script>
   ```

3. The `host` and `port` in that URL match the MCP server configuration. The defaults are `127.0.0.1` and `9333`.
4. The WebView runtime can fetch that URL. Open or request `http://<host>:<port>/target.js` from the same device/runtime when possible.
5. The WebView has been opened or reloaded after you added the script tag.

If a tool call waits and then fails with a message like `No webview connected to ... Open your webview (inject target.js) and retry`, the MCP server is running but no instrumented WebView has connected yet.

### The WebView cannot load `target.js`

If the injected script fails to load, the WebView cannot connect to the MCP server. Common causes:

- The MCP client configured a different `--port` than the script URL uses.
- The MCP server is listening on `127.0.0.1`, but the WebView is running on another device, in a simulator, in WSL, or inside a different network namespace.
- A firewall or corporate network blocks inbound connections to the selected port.
- The page's Content Security Policy blocks scripts from the MCP server URL.
- The WebView only allows HTTPS content, while the local bridge URL is HTTP.

For local same-machine development, the default script URL is:

```html
<script src="http://127.0.0.1:9333/target.js"></script>
```

If you changed the port in your MCP config, keep the script URL in sync:

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

```html
<script src="http://127.0.0.1:9334/target.js"></script>
```

### Remote WebView or phone cannot connect to the PC

When the MCP server runs on your PC but the WebView runs on a phone, simulator, embedded device, or another machine, do not inject `127.0.0.1`. On the phone, `127.0.0.1` means the phone itself.

Use a host address that the WebView device can reach:

1. Start the MCP server on an interface reachable from the device:

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
3. Inject that address in the WebView's starting HTML:

   ```html
   <script src="http://192.168.1.23:9333/target.js"></script>
   ```

4. Make sure the phone and PC are on the same network and that your firewall allows inbound TCP connections to the selected port.
5. Open or reload the WebView and try `list_pages` again.

For emulators, use the address that the emulator exposes for the host machine when appropriate. For example, Android Emulator commonly uses `10.0.2.2`.

### WebView connects, then disappears after navigation or reload

A connected page only exists while the currently loaded document is instrumented. If navigation or reload takes the WebView to a document that does not load `target.js`, the page disconnects and tools can no longer operate on it.

Fix this by ensuring that every entry page or route that should be debuggable loads the script tag, or by adding the script to the shell HTML that wraps your WebView app.

### Console or network events are missing from early page load

If `target.js` loads late, the server can only observe activity after the bridge is initialized. Place the script early in the starting document, for example in `<head>`:

```html
<head>
  <script src="http://127.0.0.1:9333/target.js"></script>
</head>
```

### Content Security Policy blocks `target.js`

If your page has a strict Content Security Policy, the browser or WebView may refuse to load `target.js` or open the bridge connection.

Update the policy used in your development/debug build so the page can load scripts and connect back to the MCP server host and port. For example, if the server is reachable at `http://192.168.1.23:9333`, allow that origin in the relevant `script-src` and connection directives for the debug build.

### Operating system sandboxes and containers

Some MCP clients run the MCP server inside macOS Seatbelt, Linux containers, WSL, or another sandbox. In that setup, `127.0.0.1` may refer to the sandbox rather than the host machine or the device running the WebView.

If the WebView runs outside the sandbox:

- Bind the MCP server to a reachable interface with `--host=0.0.0.0` or an appropriate host address.
- Inject a URL that is reachable from the WebView runtime, not merely from the MCP client's sandbox.
- Ensure any container, VM, or host firewall forwards or allows the selected port.

### WSL

When the MCP server runs inside WSL and the WebView runs on Windows, a phone, or an emulator, `127.0.0.1` may not be the right address for the WebView to reach the server.

Possible workarounds include:

- Run the MCP server from PowerShell or Git Bash instead of WSL, then inject the Windows host address.
- Configure [mirrored networking for WSL](https://learn.microsoft.com/en-us/windows/wsl/networking) and use an address that the WebView runtime can reach.
- Bind the server to a reachable interface and inject that address:

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

### Windows 10: Error during discovery for MCP server `webview-devtools`: MCP error -32000: Connection closed

- **Solution 1:** Call using `cmd`. For more info, see [modelcontextprotocol/servers#1082](https://github.com/modelcontextprotocol/servers/issues/1082#issuecomment-2791786310).

  ```json
  {
    "mcpServers": {
      "webview-devtools": {
        "command": "cmd",
        "args": ["/c", "npx", "-y", "webview-devtools-mcp@latest"]
      }
    }
  }
  ```

  On Windows, running a Node.js package via `npx` often requires the `cmd /c` prefix when launched from another process such as an IDE extension host.

- **Solution 2:** Use the absolute path to `npx`.

  The path below is an example. Adjust it to match the actual location of `npx` on your machine. Depending on your setup, the file extension might be `.cmd`, `.bat`, or `.exe` rather than `.ps1`. Use double backslashes (`\\`) as path delimiters in JSON.

  ```json
  {
    "mcpServers": {
      "webview-devtools": {
        "command": "C:\\nvm4w\\nodejs\\npx.ps1",
        "args": ["-y", "webview-devtools-mcp@latest"]
      }
    }
  }
  ```

### Claude Code plugin installation fails with `Failed to clone repository`

When installing `webview-devtools-mcp` as a Claude Code plugin via `/plugin marketplace add`, the installation may fail with a timeout error if your environment cannot reach `github.com` on port 443 (HTTPS):

```
Failed to download/cache plugin webview-devtools-mcp: Failed to clone repository:
  Cloning into '...'...
  fatal: unable to access 'https://github.com/ilharp/webview-devtools-mcp.git/':
  Failed to connect to github.com port 443
```

This can happen in environments with restricted outbound HTTPS connectivity,
corporate firewalls, or proxy configurations that block HTTPS git operations.

**Workaround 1: Use SSH instead of HTTPS**

If you have SSH access to GitHub configured, you can redirect all GitHub HTTPS
URLs to use SSH by running:

```sh
git config --global url."git@github.com:".insteadOf "https://github.com/"
```

Then retry the plugin installation. This tells git to use your SSH key for all
GitHub operations instead of HTTPS.

**Workaround 2: Install via CLI instead**

If the plugin marketplace approach fails, you can install `webview-devtools-mcp`
as an MCP server directly without cloning the repository:

```sh
claude mcp add webview-devtools --scope user npx webview-devtools-mcp@latest
```

This bypasses the git clone entirely and uses npm/npx to fetch the package. Note
that this method installs only the MCP server without the bundled skills.
