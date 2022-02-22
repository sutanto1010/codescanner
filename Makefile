build-prod:
	GOOS=linux GOARCH=arm64
	cd backend/api && go build -o ../../bin/api
	cd ../../
	cd backend/scanner && go build -o ../../bin/scanner
	cd ../../
	cd client && yarn && yarn build