
.DEFAULT_GOAL := all

PARAL := -j16

.PHONY: all
all: build

.PHONY: build
build: install-deps .WAIT build-server build-chii build-cdmcp .WAIT copy-chobitsu-dist

.PHONY: ci
ci:
	$(MAKE) stg-import $(PARAL)
	$(MAKE) build $(PARAL)
	$(MAKE) cdmcp-gen $(PARAL)
	$(MAKE) build-cdmcp $(PARAL)
	$(MAKE) copy-chobitsu-dist $(PARAL)
	$(MAKE) npm-pack $(PARAL)

.PHONY: stg-import
stg-import:
	cd packages/chobitsu && git checkout master && stg init && stg import -S ../../patches/chobitsu/series
	cd packages/chrome-devtools-mcp && git checkout main && stg init && stg import -S ../../patches/chrome-devtools-mcp/series

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
	yarn workspace webview-devtools-mcp prepare
	yarn workspace webview-devtools-mcp bundle

.PHONY: cdmcp-gen
cdmcp-gen:
	yarn workspace webview-devtools-mcp gen

.PHONY: npm-pack
npm-pack:
	cd packages/chrome-devtools-mcp && npm pack --pack-destination build

.PHONY: copy-chobitsu-dist
copy-chobitsu-dist:
	mkdir -p packages/chrome-devtools-mcp/build/server
	cp packages/chii/public/target.js packages/chrome-devtools-mcp/build/server/target.js
