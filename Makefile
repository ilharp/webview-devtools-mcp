
.DEFAULT_GOAL := all

.PHONY: all
all: build

.PHONY: build
build: install-deps .WAIT build-server build-chii build-cdmcp .WAIT copy-chobitsu-dist

.PHONY: install-deps
install-deps:
	yarn --immutable

.PHONY: build-server
build-server:
	yarn workspace @wdmcp/server build

.PHONY: build-chobitsu
build-chobitsu:
	yarn workspace chobitsu build

.PHONY: build-chii
build-chii: build-chobitsu
	yarn workspace chii webpack --mode=production

.PHONY: build-cdmcp
build-cdmcp:
	yarn workspace chrome-devtools-mcp prepare
	yarn workspace chrome-devtools-mcp bundle

.PHONY: copy-chobitsu-dist
copy-chobitsu-dist:
	mkdir -p packages/chrome-devtools-mcp/build/server
	cp packages/chii/public/target.js packages/chrome-devtools-mcp/build/server/target.js
