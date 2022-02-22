CODE_VERSION=$(shell git rev-list -1 HEAD)
VERSION := $(CODE_VERSION), Built Time: $(shell date)
deploy:
	yarn
	yarn build
	s3-deploy './dist/**' --cwd './dist/' --profile sutanto-dev --bucket wa.brader.id --deleteRemoved --cache 31536000  --etag
	aws cloudfront create-invalidation --distribution-id ERYQRFNBJC0QK --paths "/*" --profile sutanto-dev

