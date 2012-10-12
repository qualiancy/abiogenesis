TESTS=test/*.js
REPORTER=dot

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require ./test/bootstrap \
		--reporter $(REPORTER) \
		$(TESTS)

.PHONY: test
