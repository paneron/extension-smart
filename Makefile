# https://gist.github.com/klmr/575726c7e05d8780505a
# Inspired by
# <http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html>
# sed script explained:
# /^##/:
# 	* save line in hold space
# 	* purge line
# 	* Loop:
# 		* append newline + line to hold space
# 		* go to next line
# 		* if line starts with doc comment, strip comment character off and loop
# 	* remove target prerequisites
# 	* append hold space (+ newline) to line
# 	* replace newline plus comments by
# 	* print line
# Separate expressions are necessary because labels cannot be delimited by
# semicolon; see <http://stackoverflow.com/a/11799865/1968>
.PHONY: show-help
show-help:
	@echo "$$(tput bold)Available rules:$$(tput sgr0)"
	@echo
	@sed -n -e "/^## / { \
		h; \
		s/.*//; \
		:doc" \
		-e "H; \
		n; \
		s/^## //; \
		t doc" \
		-e "s/:.*//; \
		G; \
		s/\\n## /---/; \
		s/\\n/ /g; \
		p; \
	}" ${MAKEFILE_LIST} \
	| LC_ALL='C' sort --ignore-case \
	| awk -F '---' \
		-v ncol=$$(tput cols) \
		-v indent=19 \
		-v col_on="$$(tput setaf 6)" \
		-v col_off="$$(tput sgr0)" \
	'{ \
		printf "%s%*s%s ", col_on, -indent, $$1, col_off; \
		n = split($$2, words, " "); \
		line_length = ncol - indent; \
		for (i = 1; i <= n; i++) { \
			line_length -= length(words[i]) + 1; \
			if (line_length <= 0) { \
				line_length = ncol - indent - length(words[i]) - 1; \
				printf "\n%*s ", -indent, " "; \
			} \
			printf "%s ", words[i]; \
		} \
		printf "\n"; \
	}' \
	| more $(shell test $(shell uname) == Darwin && echo '--no-init --raw-control-chars')


NPM := pnpm

.PHONY: all
## Install build dependencies and build assets using Dev environment
all: prep build

.PHONY: prep
## Install build dependencies
prep:
	$(NPM)

.PHONY: build
## Build assets
build:
	$(NPM) run build

.PHONY: dev
## Start dev mode
dev:
	$(NPM) run dev

.PHONY: lint
## Lint source files
lint:
	$(NPM) run lint $${QUIET:+--quiet}

.PHONY: lint-fix
## Lint source files and auto-fix when possible
lint-fix:
	$(NPM) run fix $${QUIET:+--quiet}

.PHONY: clean
## Remove output files
clean:
	$(NPM) run clean

.PHONY: test-all
## Run all tests
test-all: test test-e2e

.PHONY: test
## Run tests
test:
	$(NPM) run test

./paneron/dist/main/main.js:
	git clone https://github.com/paneron/paneron
	git checkout 1ab232b008ba9709c9a80512c0eceaeb525515bf
	cd paneron && yarn install && yarn compile

.PHONY: test-e2e
## Run end-to-end tests
test-e2e: ./paneron/dist/main/main.js
	$(NPM) run test:e2e

.PHONY: audit
## Run security audit for npm packages
audit:
	$(NPM) audit

.PHONY: audit-json
## Run security audit for npm packages, and output results as json
audit-json:
	$(NPM) audit --json
