
## Changes to upstream forks live as stgit patches — keep diffs minimal

`packages/chrome-devtools-mcp`, `packages/chii`, and `packages/chobitsu` are **forks of upstream projects** (each is its own nested git repo). Our modifications to them are **not ordinary commits — they are a stacked-git (`stg`) patch stack**, and the exported patch files live under `patches/<package>/` in the root repo (the `series` file records patch order).

Implication: every change you make to an **upstream-originated file** in these forks ends up as a hunk in some patch. Therefore:

- **Make the smallest possible, logically-correct change.** First inspect the baseline and your diff with `git -C packages/<pkg> show HEAD:<file>` / `git -C packages/<pkg> diff`, and leave untouched any line you don't have to change.
- **Do not "clean up" pre-existing upstream dead code, duplication, or style.** That bloats the patch, makes it dirty, and makes rebasing onto a newer upstream harder. Touch only what your feature actually needs.
- When you need a value for later use, prefer inlining or a minimal local extraction over adding large blocks near the top of the file (unless truly necessary).

### Which files you can freely rewrite

Files **added** by our patches (not upstream files) are owned by this project — normal editing or full rewrites are fine. How to tell: `git -C packages/chrome-devtools-mcp log --oneline -- <file>`, or check which patch in `patches/chrome-devtools-mcp/` introduces it. Already in upstream = edit minimally; added by a patch = edit freely.

### The patch stack is managed by hand

- The stack is managed manually with the `stg` command line. There are **no scripts / automation / build hooks** that apply or refresh patches.
- **Do not** run `stg` (push/pop/refresh/...), `git commit` inside the nested forks, or modify files under `patches/`, unless the user explicitly asks. The maintainer folds working-tree changes into the patch stack themselves with `stg`.
- Your job is usually: get the source into a correct, minimal shape and leave it in the working tree. Turning it into a patch is the maintainer's step.

## Repo layout at a glance

- Root: a yarn workspace (`packages/*`); the patch stack is exported under `patches/`.
- `packages/chrome-devtools-mcp` — fork of upstream `ChromeDevTools/chrome-devtools-mcp` with the wdmcp changes layered on (patch stack).
- `packages/chii` — fork of chii; builds the webview-side injection script `target.js` (webpack bundle, which bundles chobitsu).
- `packages/chobitsu` — fork of chobitsu (the webview-side CDP backend); Changes require a rebuild before they reach `target.js`.
- `packages/server` (`@wdmcp/server`) — the HTTP/WS server extracted from chii, used by chrome-devtools-mcp's wdmcp transport.

## Build steps

```sh
yarn --immutable
yarn workspace @wdmcp/server build
yarn workspace chobitsu build
yarn workspace chii gulp clean
yarn workspace chii webpack --mode=production
yarn workspace chrome-devtools-mcp prepare
COREPACK_ENABLE_STRICT=0 yarn workspace chrome-devtools-mcp bundle
mkdir -p packages/chrome-devtools-mcp/build/server
cp packages/chii/public/target.js packages/chrome-devtools-mcp/build/server/target.js
```
