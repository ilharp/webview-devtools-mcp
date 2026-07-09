<!-- AUTO GENERATED DO NOT EDIT - run 'npm run gen' to update-->

# Chrome DevTools MCP Tool Reference

- **[Input automation](#input-automation)** (7 tools)
  - [`click`](#click)
  - [`fill`](#fill)
  - [`fill_form`](#fill_form)
  - [`hover`](#hover)
  - [`press_key`](#press_key)
  - [`type_text`](#type_text)
  - [`click_at`](#click_at)
- **[Navigation automation](#navigation-automation)** (4 tools)
  - [`list_pages`](#list_pages)
  - [`navigate_page`](#navigate_page)
  - [`select_page`](#select_page)
  - [`wait_for`](#wait_for)
- **[Network](#network)** (2 tools)
  - [`get_network_request`](#get_network_request)
  - [`list_network_requests`](#list_network_requests)
- **[Debugging](#debugging)** (7 tools)
  - [`evaluate_script`](#evaluate_script)
  - [`get_console_message`](#get_console_message)
  - [`list_console_messages`](#list_console_messages)
  - [`take_screenshot`](#take_screenshot)
  - [`take_snapshot`](#take_snapshot)
  - [`screencast_start`](#screencast_start)
  - [`screencast_stop`](#screencast_stop)
- **[Third-party](#third-party)** (2 tools)
  - [`execute_3p_developer_tool`](#execute_3p_developer_tool)
  - [`list_3p_developer_tools`](#list_3p_developer_tools)
- **[WebMCP](#webmcp)** (2 tools)
  - [`execute_webmcp_tool`](#execute_webmcp_tool)
  - [`list_webmcp_tools`](#list_webmcp_tools)

## Input automation

### `click`

**Description:** Clicks on the provided element

**Parameters:**

- **uid** (string) **(required)**: The uid of an element on the page from the page content snapshot
- **dblClick** (boolean) _(optional)_: Set to true for double clicks. Default is false.
- **includeSnapshot** (boolean) _(optional)_: Whether to include a snapshot in the response. Default is false.

---

### `fill`

**Description:** Type text into an input, text area or select an option from a &lt;select&gt; element.

**Parameters:**

- **uid** (string) **(required)**: The uid of an element on the page from the page content snapshot
- **value** (string) **(required)**: The value to [`fill`](#fill) in. "true" or "false" for checkboxes and toggles, "true" for radio buttons.
- **includeSnapshot** (boolean) _(optional)_: Whether to include a snapshot in the response. Default is false.

---

### `fill_form`

**Description:** [`Fill`](#fill) out multiple form elements (inputs, selects, checkboxes, radios) at once. ALWAYS prefer this tool over multiple individual '[`fill`](#fill)' or '[`click`](#click)' calls when interacting with forms. It is significantly faster, more reliable, and reduces turn count. Example: [`Fill`](#fill) username, password, and check "Remember Me" in one call.

**Parameters:**

- **elements** (array) **(required)**: Elements from snapshot to [`fill`](#fill) out.
- **includeSnapshot** (boolean) _(optional)_: Whether to include a snapshot in the response. Default is false.

---

### `hover`

**Description:** [`Hover`](#hover) over the provided element

**Parameters:**

- **uid** (string) **(required)**: The uid of an element on the page from the page content snapshot
- **includeSnapshot** (boolean) _(optional)_: Whether to include a snapshot in the response. Default is false.

---

### `press_key`

**Description:** Press a key or key combination. Use this when other input methods like [`fill`](#fill)() cannot be used (e.g., keyboard shortcuts, navigation keys, or special key combinations).

**Parameters:**

- **key** (string) **(required)**: A key or a combination (e.g., "Enter", "Control+A", "Control++", "Control+Shift+R"). Modifiers: Control, Shift, Alt, Meta
- **includeSnapshot** (boolean) _(optional)_: Whether to include a snapshot in the response. Default is false.

---

### `type_text`

**Description:** Type text using keyboard into a previously focused input

**Parameters:**

- **text** (string) **(required)**: The text to type
- **submitKey** (string) _(optional)_: Optional key to press after typing. E.g., "Enter", "Tab", "Escape"

---

### `click_at`

**Description:** Clicks at the provided coordinates (requires flag: --experimentalVision=true)

**Parameters:**

- **x** (number) **(required)**: The x coordinate
- **y** (number) **(required)**: The y coordinate
- **dblClick** (boolean) _(optional)_: Set to true for double clicks. Default is false.
- **includeSnapshot** (boolean) _(optional)_: Whether to include a snapshot in the response. Default is false.

---

## Navigation automation

### `list_pages`

**Description:** Get a list of pages open in the browser.

**Parameters:** None

---

### `navigate_page`

**Description:** Go to a URL, or back, forward, or reload. Use project URL if not specified otherwise.

**Parameters:**

- **handleBeforeUnload** (enum: "accept", "decline") _(optional)_: Whether to auto accept or beforeunload dialogs triggered by this navigation. Default is accept.
- **ignoreCache** (boolean) _(optional)_: Whether to ignore cache on reload.
- **initScript** (string) _(optional)_: A JavaScript script to be executed on each new document before any other scripts for the next navigation.
- **timeout** (integer) _(optional)_: Maximum wait time in milliseconds. If set to 0, the default timeout will be used.
- **type** (enum: "url", "back", "forward", "reload") _(optional)_: Navigate the page by URL, back or forward in history, or reload.
- **url** (string) _(optional)_: Target URL (only type=url)

---

### `select_page`

**Description:** Select a page as a context for future tool calls.

**Parameters:**

- **pageId** (number) **(required)**: The ID of the page to select. Call [`list_pages`](#list_pages) to get available pages.
- **bringToFront** (boolean) _(optional)_: Whether to focus the page and bring it to the top.

---

### `wait_for`

**Description:** Wait for the specified text to appear on the selected page.

**Parameters:**

- **text** (array) **(required)**: Non-empty list of texts. Resolves when any value appears on the page.
- **timeout** (integer) _(optional)_: Maximum wait time in milliseconds. If set to 0, the default timeout will be used.

---

## Network

### `get_network_request`

**Description:** Gets a network request by an optional reqid, if omitted returns the currently selected request in the DevTools Network panel.

**Parameters:**

- **reqid** (number) _(optional)_: The reqid of the network request. If omitted returns the currently selected request in the DevTools Network panel.
- **requestFilePath** (string) _(optional)_: The absolute or relative path to a .network-request file to save the request body to. If omitted, the body is returned inline.
- **responseFilePath** (string) _(optional)_: The absolute or relative path to a .network-response file to save the response body to. If omitted, the body is returned inline.

---

### `list_network_requests`

**Description:** List all requests for the currently selected page since the last navigation.

**Parameters:**

- **includePreservedRequests** (boolean) _(optional)_: Set to true to return the preserved requests over the last 3 navigations.
- **pageIdx** (integer) _(optional)_: Page number to return (0-based). When omitted, returns the first page.
- **pageSize** (integer) _(optional)_: Maximum number of requests to return. When omitted, returns all requests.
- **resourceTypes** (array) _(optional)_: Filter requests to only return requests of the specified resource types. When omitted or empty, returns all requests.

---

## Debugging

### `evaluate_script`

**Description:** Evaluate a JavaScript function inside the currently selected page. Returns the response as JSON, so returned values have to be JSON-serializable.

**Parameters:**

- **function** (string) **(required)**: A JavaScript function declaration to be executed by the tool in the currently selected page.
  Example without arguments: `() => document.title` or `async () => await fetch("example.com")`.
  Example with arguments: `(el) => el.innerText`

- **args** (array) _(optional)_: An optional list of arguments to pass to the function.
- **dialogAction** (string) _(optional)_: Handle dialogs while execution. "accept", "dismiss", or string for response of window.prompt. Defaults to accept.
- **filePath** (string) _(optional)_: The absolute or relative path to a file to save the script output to. If omitted, the output is returned inline.

---

### `get_console_message`

**Description:** Gets a console message by its ID. You can get all messages by calling [`list_console_messages`](#list_console_messages).

**Parameters:**

- **msgid** (number) **(required)**: The msgid of a console message on the page from the listed console messages

---

### `list_console_messages`

**Description:** List all console messages for the currently selected page since the last navigation.

**Parameters:**

- **includePreservedMessages** (boolean) _(optional)_: Set to true to return the preserved messages over the last 3 navigations.
- **pageIdx** (integer) _(optional)_: Page number to return (0-based). When omitted, returns the first page.
- **pageSize** (integer) _(optional)_: Maximum number of messages to return. When omitted, returns all messages.
- **serviceWorkerId** (string) _(optional)_: Filter messages to only return messages of the specified service worker.
- **types** (array) _(optional)_: Filter messages to only return messages of the specified resource types. When omitted or empty, returns all messages.

---

### `take_screenshot`

**Description:** Take a screenshot of the page or element.

**Parameters:**

- **filePath** (string) _(optional)_: The absolute path, or a path relative to the current working directory, to save the screenshot to instead of attaching it to the response.
- **format** (enum: "png", "jpeg", "webp") _(optional)_: Type of format to save the screenshot as. Default is "png"
- **fullPage** (boolean) _(optional)_: If set to true takes a screenshot of the full page instead of the currently visible viewport. Incompatible with uid.
- **quality** (number) _(optional)_: Compression quality for JPEG and WebP formats (0-100). Higher values mean better quality but larger file sizes. Ignored for PNG format.
- **uid** (string) _(optional)_: The uid of an element on the page from the page content snapshot. If omitted, takes a page screenshot.

---

### `take_snapshot`

**Description:** Take a text snapshot of the currently selected page based on the a11y tree. The snapshot lists page elements along with a unique
identifier (uid). Always use the latest snapshot. Prefer taking a snapshot over taking a screenshot. The snapshot indicates the element selected
in the DevTools Elements panel (if any).

**Parameters:**

- **filePath** (string) _(optional)_: The absolute path, or a path relative to the current working directory, to save the snapshot to instead of attaching it to the response.
- **verbose** (boolean) _(optional)_: Whether to include all possible information available in the full a11y tree. Default is false.

---

### `screencast_start`

**Description:** Starts recording a screencast (video) of the selected page in specified format. (requires flag: --experimentalScreencast=true)

**Parameters:**

- **filePath** (string) _(optional)_: Output file path (.webm,.mp4 are supported). Uses mkdtemp to generate a unique path if not provided.

---

### `screencast_stop`

**Description:** Stops the active screencast recording on the selected page. (requires flag: --experimentalScreencast=true)

**Parameters:** None

---

## Third-party

> NOTE: The Third-party category is not active by default. Use the '--categoryExperimentalThirdParty' flag.

### `execute_3p_developer_tool`

**Description:** Executes a tool exposed by the page. (requires flag: --categoryExperimentalThirdParty=true)

**Parameters:**

- **toolName** (string) **(required)**: The name of the tool to execute
- **params** (string) _(optional)_: The JSON-stringified parameters to pass to the tool

---

### `list_3p_developer_tools`

**Description:** Lists all third-party developer tools the page exposes for providing runtime information.
Third-party developer tools can be called via the '[`execute_3p_developer_tool`](#execute_3p_developer_tool)()' MCP tool.
Alternatively, third-party developer tools can be executed by calling '[`evaluate_script`](#evaluate_script)' and adding the
following command to the script:
`window.__dtmcp.executeTool(toolName, params)`
This might be helpful when the third-party developer tools return non-serializable values or when composing
third-party developer tools with additional functionality. (requires flag: --categoryExperimentalThirdParty=true)

**Parameters:** None

---

## WebMCP

> NOTE: The WebMCP category is not active by default. Use the '--categoryExperimentalWebmcp' flag.

### `execute_webmcp_tool`

**Description:** Executes a WebMCP tool exposed by the page. (requires flag: --categoryExperimentalWebmcp=true)

**Parameters:**

- **toolName** (string) **(required)**: The name of the WebMCP tool to execute
- **input** (string) _(optional)_: The JSON-stringified parameters to pass to the WebMCP tool

---

### `list_webmcp_tools`

**Description:** Lists all WebMCP tools the page exposes. (requires flag: --categoryExperimentalWebmcp=true)

**Parameters:** None

---
