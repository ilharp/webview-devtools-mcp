
.DEFAULT_GOAL := all

.PHONY: all
all: build

.PHONY: build
build: install-deps .WAIT build-server build-chii build-cdmcp .WAIT copy-chobitsu-dist

.PHONY: ci
ci: stg-import .WAIT build .WAIT cdmcp-gen .WAIT build-cdmcp .WAIT copy-chobitsu-dist .WAIT npm-pack

.PHONY: stg-import
stg-import:
	cd packages/chobitsu
	git checkout master
	stg init
	stg import -S ../../patches/chobitsu/series
	cd ../..
	cd packages/chrome-devtools-mcp
	git checkout main
	stg init
	stg import -S ../../patches/chrome-devtools-mcp/series
	cd ../..

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

.PHONY: cdmcp-gen
cdmcp-gen:
	yarn workspace chrome-devtools-mcp gen

.PHONY: npm-pack
npm-pack:
	cd packages/chrome-devtools-mcp
	yarn pack --out build/webview-devtools-mcp.tgz
	cd ../..

.PHONY: copy-chobitsu-dist
copy-chobitsu-dist:
	mkdir -p packages/chrome-devtools-mcp/build/server
	cp packages/chii/public/target.js packages/chrome-devtools-mcp/build/server/target.js
