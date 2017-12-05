# This file is licensed under the Affero General Public License version 3 or
# later. See the COPYING file.
# @author Bernhard Posselt <dev@bernhard-posselt.com>
# @copyright Bernhard Posselt 2017
# @author Georg Ehrke <oc.list@georgehrke.com>
# @copyright Georg Ehrke 2017
# @author Raimund Schlüßler
# @copyright 2017 Raimund Schlüßler <raimund.schluessler@googlemail.com>

# Generic Makefile for building and packaging a Nextcloud app which uses npm and
# Composer.
#
# Dependencies:
# * make
# * which
# * curl: used if phpunit and composer are not installed to fetch them from the web
# * tar: for building the archive
# * npm: for building and testing everything JS
#
# If no composer.json is in the app root directory, the Composer step
# will be skipped. The same goes for the package.json which can be located in
# the app root or the js/ directory.
#
# The npm command by launches the npm build script:
#
#    npm run build
#
# The npm test command launches the npm test script:
#
#    npm run test
#
# The idea behind this is to be completely testing and build tool agnostic. All
# build tools and additional package managers should be installed locally in
# your project, since this won't pollute people's global namespace.
#
# The following npm scripts in your package.json install and update the
# npm dependencies and use gulp as build system (notice how everything is
# run from the node_modules folder):
#
#    "scripts": {
#        "test": "node node_modules/gulp-cli/bin/gulp.js karma",
#        "prebuild": "npm install && npm upgrade",
#        "build": "node node_modules/gulp-cli/bin/gulp.js"
#    },

app_name=$(notdir $(CURDIR))
build_tools_directory=$(CURDIR)/build/tools
source_build_directory=$(CURDIR)/build/source/tasks
source_artifact_directory=$(CURDIR)/build/artifacts/source
source_package_name=$(source_artifact_directory)/$(app_name)
appstore_build_directory=$(CURDIR)/build/appstore/tasks
appstore_artifact_directory=$(CURDIR)/build/artifacts/appstore
appstore_package_name=$(appstore_artifact_directory)/$(app_name)
npm=$(shell which npm 2> /dev/null)
gcp=$(shell which gcp 2> /dev/null)

ifeq (, $(gcp))
	copy_command=cp
else
	copy_command=gcp
endif

# code signing
# assumes the following:
# * the app is inside the nextcloud/apps folder
# * the private key is located in ~/.nextcloud/tasks.key
# * the certificate is located in ~/.nextcloud/tasks.crt
occ=$(CURDIR)/../../occ
configdir=$(CURDIR)/../../config
private_key=$(HOME)/.nextcloud/$(app_name).key
certificate=$(HOME)/.nextcloud/$(app_name).crt
sign=php -f $(occ) integrity:sign-app --privateKey="$(private_key)" --certificate="$(certificate)"
sign_skip_msg="Skipping signing, either no key and certificate found in $(private_key) and $(certificate) or occ can not be found at $(occ)"
ifneq (,$(wildcard $(private_key)))
ifneq (,$(wildcard $(certificate)))
ifneq (,$(wildcard $(occ)))
	CAN_SIGN=true
endif
endif
endif

all: build

# Fetches the PHP and JS dependencies and compiles the JS. If no composer.json
# is present, the composer step is skipped, if no package.json or js/package.json
# is present, the npm step is skipped
.PHONY: build
build:
	make npm

# Installs npm dependencies
.PHONY: npm
npm:
	cd js && $(npm) run build

# Removes the appstore build
.PHONY: clean
clean:
	rm -rf ./build

# Same as clean but also removes dependencies installed by npm
.PHONY: distclean
distclean: clean
	rm -rf vendor
	rm -rf node_modules
	rm -rf js/vendor
	rm -rf js/node_modules

# Builds the source and appstore package
.PHONY: dist
dist:
	make source
	make appstore

# Builds the source package
.PHONY: source
source:
	rm -rf $(source_build_directory) $(source_artifact_directory)
	mkdir -p $(source_build_directory) $(source_artifact_directory)
	rsync -rv . $(source_build_directory) \
	--exclude=/.git/ \
	--exclude=/.idea/ \
	--exclude=/build/ \
	--exclude=/js/node_modules/ \
	--exclude=*.log
ifdef CAN_SIGN
	$(sign) --path "$(source_build_directory)"
else
	@echo $(sign_skip_msg)
endif
	tar -cvzf $(source_package_name).tar.gz -C $(source_build_directory)/../ $(app_name)

# Builds the source package for the app store, ignores php and js tests
.PHONY: appstore
appstore:
	rm -rf $(appstore_build_directory) $(appstore_artifact_directory)
	mkdir -p $(appstore_build_directory) $(appstore_artifact_directory)
	rsync -av .	$(appstore_build_directory) \
	--exclude=/tests \
	--exclude=/.git \
	--exclude=/.idea \
	--exclude=/.editorconfig \
	--exclude=/.gitattributes \
	--exclude=/.gitignore \
	--exclude=/.scrutinizer.yml \
	--exclude=/.travis.yml \
	--exclude=/build.xml \
	--exclude=/CONTRIBUTING.md \
	--exclude=/tasks.sublime-project \
	--exclude=/tasks.sublime-workspace \
	--exclude=/issue_template.md \
	--exclude=/Makefile \
	--exclude=/phpunit.xml \
	--exclude=/README.md \
	--exclude=/CHANGELOG.md \
	--exclude=/build \
	--exclude=/css/src \
	--exclude=/img/src \
	--exclude=/js/.bowerrc \
	--exclude=/js/README.md \
	--exclude=/js/.jshintrc \
	--exclude=/js/.stylelintrc \
	--exclude=/js/bower.json \
	--exclude=/js/gulpfile.js \
	--exclude=/js/package.json \
	--exclude=/js/README.mkdir \
	--exclude=/js/yarn.lock \
	--exclude=/js/app \
	--exclude=/js/config \
	--exclude=/js/node_modules \
	--exclude=/js/vendor/**/.bower.json \
	--exclude=/js/vendor/**/.npmignore \
	--exclude=/js/vendor/**/bower.json \
	--exclude=/js/vendor/**/Gruntfile.js \
	--exclude=/js/vendor/**/package.json \
	--exclude=/js/vendor/**/*.md \
	--exclude=/js/vendor/**/karma.conf.js \
	--exclude=/js/vendor/**/*.map \
	--exclude=/js/vendor/angular-mocks \
	--exclude=/js/vendor/angular/angular.js \
	--exclude=/js/vendor/angular/angular.min.js.gzip \
	--exclude=/js/vendor/angular/angular-csp.css \
	--exclude=/js/vendor/angular/index.js \
	--exclude=/js/vendor/angular-animate/angular-animate.js \
	--exclude=/js/vendor/angular-animate/index.js \
	--exclude=/js/vendor/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js \
	--exclude=/js/vendor/angular-drag-and-drop-lists/demo \
	--exclude=/js/vendor/angular-drag-and-drop-lists/test \
	--exclude=/js/vendor/angular-drag-and-drop-lists/LICENSE \
	--exclude=/js/vendor/angular-route/angular-route.js \
	--exclude=/js/vendor/angular-route/index.js \
	--exclude=/js/vendor/angular-sanitize/angular-sanitize.js \
	--exclude=/js/vendor/angular-sanitize/index.js \
	--exclude=/js/vendor/angular-ui-select/dist/select.js \
	--exclude=/js/vendor/angular-ui-select/dist/select.css \
	--exclude=/js/vendor/angular-ui-select/docs \
	--exclude=/js/vendor/angular-ui-select/composer.json \
	--exclude=/js/vendor/angular-ui-select/deploy-docs.sh \
	--exclude=/js/vendor/ical.js/build/benchmark \
	--exclude=/js/vendor/ical.js/build/ical.js \
	--exclude=/js/vendor/ical.js/lib \
	--exclude=/js/vendor/ical.js/samples \
	--exclude=/js/vendor/ical.js/sandbox \
	--exclude=/js/vendor/ical.js/tasks \
	--exclude=/js/vendor/ical.js/test-agent \
	--exclude=/js/vendor/ical.js/test-agent-server.js \
	--exclude=/js/vendor/ical.js/test-agent-coverage.json \
	--exclude=/js/vendor/jstimezonedetect/dist/jstz.js \
	--exclude=/js/vendor/jstimezonedetect/LICENCE.txt \
	--exclude=/js/vendor/ui-select/dist/select.js \
	--exclude=/js/vendor/ui-select/dist/select.css \
	--exclude=/js/vendor/ui-select/docs \
	--exclude=/js/vendor/ui-select/src \
	--exclude=/js/vendor/ui-select/test \
	--exclude=/js/vendor/ui-select/composer.json \
	--exclude=/js/vendor/ui-select/deploy-docs.sh \
	--exclude=/js/vendor/ui-select/*.js \
	--exclude=/js/vendor/ui-select/LICENSE \
	--exclude=/js/vendor_legacy/jquery-timepicker/i18n \
	--exclude=/js/vendor_legacy/jquery-timepicker/include \
	--exclude=/js/vendor_legacy/jquery-timepicker/legacy_1.2.6 \
	--exclude=/js/vendor_legacy/jquery-timepicker/tests \
	--exclude=/js/vendor_legacy/jquery-timepicker/index.html \
	--exclude=/js/vendor_legacy/jquery-timepicker/jquery.ui.timepicker.css \
	--exclude=/js/vendor_legacy/jquery-timepicker/GPL-LICENSE.txt \
	--exclude=/js/vendor_legacy/jquery-timepicker/MIT-LICENSE.txt \
	--exclude=/js/vendor_legacy/jquery-timepicker/README.md \
	--exclude=/js/vendor_legacy/jquery-timepicker/timepicker.png \
	--exclude=/screenshots \
	--exclude=/timezones/INFO.md
ifdef CAN_SIGN
	mv $(configdir)/config.php $(configdir)/config-2.php
	$(sign) --path="$(appstore_build_directory)"
	mv $(configdir)/config-2.php $(configdir)/config.php
else
	@echo $(sign_skip_msg)
endif
	cd $(appstore_build_directory)/../; \
	zip -r $(appstore_package_name).zip $(app_name)
	tar -czf $(appstore_package_name).tar.gz -C $(appstore_build_directory)/../ $(app_name)
	openssl dgst -sha512 -sign $(private_key) $(appstore_package_name).tar.gz | openssl base64 -out $(appstore_artifact_directory)/$(app_name).sha512


# Command for running JS and PHP tests. Works for package.json files in the js/
# and root directory. If phpunit is not installed systemwide, a copy is fetched
# from the internet
.PHONY: test
test:
	cd js && $(npm) run test
ifeq (, $(shell which phpunit 2> /dev/null))
	@echo "No phpunit command available, downloading a copy from the web"
	mkdir -p $(build_tools_directory)
	curl -sSL https://phar.phpunit.de/phpunit.phar -o $(build_tools_directory)/phpunit.phar
	php $(build_tools_directory)/phpunit.phar -c phpunit.xml --coverage-clover build/php-unit.clover
	php $(build_tools_directory)/phpunit.phar -c phpunit.integration.xml --coverage-clover build/php-integration.clover
else
	phpunit -c phpunit.xml --coverage-clover build/php-unit.clover
	phpunit -c phpunit.integration.xml --coverage-clover build/php-unit.clover
endif
