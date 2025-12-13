# SPDX-License-Identifier: GPL-3.0-or-later

license-prefix := license-list-data/json
picomatch-y    := $(module-prefix)/picomatch/package.json

prebundle := $(prefix)/licenses.json $(picomatch-y)

$(prefix)/licenses.json: $(prefix)/%: $(license-prefix)/% | $(prefix)
	jq -c '{ ids: [ .licenses[].licenseId ] }' $< >$@

$(picomatch-y):
	$(npm) i -D picomatch
	rm $(package)
