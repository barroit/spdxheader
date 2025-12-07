# SPDX-License-Identifier: GPL-3.0-or-later

name := $(shell head -n1 README)

prefix := build
bundle := entry.js
vsix   := $(name).vsix

input := entry.js package.json
input += $(wildcard cmd/*.js)

profile := --platform=node --format=esm
extern  := --external:vscode

.PHONY: install uninstall publish

install:

$(prefix):
	mkdir -p $@

$(prefix)/$(bundle)1: $(input) | $(prefix)
	trap 'rm -f $@.$$$$' EXIT && \
	esbuild $(profile) --bundle --sourcemap $(extern) $< >$@.$$$$ && \
	mv $@.$$$$ $@

$(prefix)/$(bundle): $(prefix)/$(bundle)1
	head -n1 entry.js >$@
	printf '\n' >>$@
	cat $< >>$@

$(prefix)/$(vsix): $(prefix)/$(bundle)
	vsce package --skip-license -o $@

install: $(prefix)/$(vsix)
	code --install-extension $<

uninstall:
	code --uninstall-extension \
	     $$(code --list-extensions | grep $(name) || printf '39\n')

publish: $(prefix)/$(vsix)
	vsce publish --skip-license
