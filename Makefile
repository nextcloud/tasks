# This file is licensed under the Affero General Public License version 3 or
# later. See the COPYING file.
# @author Bernhard Posselt <dev@bernhard-posselt.com>
# @copyright Bernhard Posselt 2017
# @author Georg Ehrke <oc.list@georgehrke.com>
# @copyright Georg Ehrke 2017
# @author Raimund Schlüßler
# @copyright 2018 Raimund Schlüßler <raimund.schluessler@mailbox.org>

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
# The npm command by launches the npm build script:
#
#    npm run build
#
# The npm test command launches the npm test script:
#
#    npm run test
#

app_name=$(notdir $(CURDIR))
build_directory=$(CURDIR)/build
appstore_build_directory=$(CURDIR)/build/appstore/$(app_name)
appstore_artifact_directory=$(CURDIR)/build/artifacts/appstore
appstore_package_name=$(appstore_artifact_directory)/$(app_name)

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
ifneq ("$(wildcard $(private_key))","") #(,$(wildcard $(private_key)))
	ifneq ("$(wildcard $(certificate))","")#(,$(wildcard $(certificate)))
		ifneq ("$(wildcard $(occ))","")#(,$(wildcard $(occ)))
			CAN_SIGN=true
		endif
	endif
endif

.PHONY: all
all: dev-setup build-js-production

# cleanup and generate a clean developement setup
dev-setup: clean clean-dev npm-init

npm-init:
	npm install

npm-update:
	npm update

# Runs the development build
build-js:
	npm run dev

# Runs the production build
build-js-production:
	npm run build

# Runs the development build and keep watching
watch-js:
	npm run watch

composer.phar:
	curl -sS https://getcomposer.org/installer | php

install-composer-deps-dev: composer.phar
	php composer.phar install -o

update-composer: composer.phar
	rm -f composer.lock
	php composer.phar install --prefer-dist

# Removes the build directory and the compiled files
.PHONY: clean
clean:
	rm -f ./js/tasks-main.js
	rm -f ./js/tasks-main.js.map
	rm -f ./js/tasks-main.js.LICENSE.txt
	rm -f ./js/tasks-dashboard.js
	rm -f ./js/tasks-dashboard.js.map
	rm -f ./js/tasks-dashboard.js.LICENSE.txt
	rm -f ./js/tasks-talk.js
	rm -f ./js/tasks-talk.js.map
	rm -f ./js/tasks-talk.js.LICENSE.txt
	rm -rf $(build_directory)

# Same as clean but also removes dependencies installed by npm
.PHONY: clean-dev
clean-dev:
	rm -rf node_modules

# Builds the source package for the app store
.PHONY: appstore
appstore: clean build-js-production
	mkdir -p $(appstore_build_directory) $(appstore_artifact_directory)
	rsync -av .	$(appstore_build_directory) \
	--exclude=/.git \
	--exclude=/.github \
	--exclude=/.babelrc \
	--exclude=/.babelrc.js \
	--exclude=/.codecov.yml \
	--exclude=/.editorconfig \
	--exclude=/.eslintrc.js \
	--exclude=/.gitattributes \
	--exclude=/.gitignore \
	--exclude=/.phpunit.result.cache \
	--exclude=/.php-cs-fixer.dist.php.cache \
	--exclude=/.php-cs-fixer.dist.php \
	--exclude=/.gitlab-ci.yml \
	--exclude=/.prettierrc.js \
	--exclude=/.scrutinizer.yml \
	--exclude=/.stylelintignore \
	--exclude=/.stylelintrc \
	--exclude=/.travis.yml \
	--exclude=/.tx \
	--exclude=/.v8flags*.json \
	--exclude=/babel.config.js \
	--exclude=/build.xml \
	--exclude=/clover.integration.xml \
	--exclude=/clover.unit.xml \
	--exclude=/composer.json \
	--exclude=/composer.lock \
	--exclude=/composer.phar \
	--exclude=/CONTRIBUTING.md \
	--exclude=/issue_template.md \
	--exclude=/gulpfile.js \
	--exclude=/Makefile \
	--exclude=/package-lock.json \
	--exclude=/package.json \
	--exclude=/phpunit.xml \
	--exclude=/phpunit.integration.xml \
	--exclude=/README.md \
	--exclude=/stylelint.config.js \
	--exclude=/webpack.config.js \
	--exclude=/build \
	--exclude=/coverage \
	--exclude=/img/src \
	--exclude=/src \
	--exclude=/node_modules \
	--exclude=/screenshots/ \
	--exclude=/test \
	--exclude=/tests \
	--exclude=/vendor
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
# create hash
ifdef CAN_SIGN
	openssl dgst -sha512 -sign $(private_key) $(appstore_package_name).tar.gz | openssl base64 -out $(appstore_artifact_directory)/$(app_name).sha512
else
	@echo "Skipping hashing, no key found in $(private_key)."
endif

# Command for running VUE tests
.PHONY: test
test:
	npm run test

test-php:
	phpunit -c phpunit.xml
	phpunit -c phpunit.integration.xml

test-php-coverage:
	phpunit -c phpunit.xml
	phpunit -c phpunit.integration.xml

lint-php:
	php composer.phar run-script cs:check
