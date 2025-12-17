# SPDX-License-Identifier: GPL-3.0-or-later

esbuild-extra := --inject:define.js

license-prefix := license-list-data/json

npm-packages := picomatch

npm-modules  := $(addprefix $(module-prefix)/,$(npm-packages))
npm-module-y := $(addsuffix /package.json,$(npm-modules))

prebundle := $(prefix)/licenses.json $(npm-module-y)

$(prefix)/licenses.json: $(prefix)/%: $(license-prefix)/% | $(prefix)
	jq -c '{ ids: [ .licenses[].licenseId ] }' $< >$@

$(npm-module-y): $(module-prefix)/%/package.json:
	$(npm) i -D $*
	touch $(package).in

distclean-prebundle := distclean-prebundle

distclean-prebundle:
	rm -f $(prefix)/licenses.json
