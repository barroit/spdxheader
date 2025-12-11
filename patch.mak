# SPDX-License-Identifier: GPL-3.0-or-later

prebundle := $(prefix)/licenses.json

data := license-list-data/json

$(prefix)/licenses.json: $(prefix)/%: $(data)/% | $(prefix)
	jq -c '{ ids: [ .licenses[].licenseId ] }' $< >$@
