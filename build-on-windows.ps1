$Env:GOOS = "linux"; $Env:GOARCH = "amd64"; 
cd backend/api
go mod tidy
go build -o ../../bin/api
cd ../scanner
go mod tidy
go build -o ../../bin/scanner
cd ../../client
yarn
yarn build