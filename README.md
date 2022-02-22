## Architecture

You can found the diagram for this project in the following link:

[https://drive.google.com/file/d/17wNQJZNdJDWuhBcaJyTqudrrYtjJRKq0/view?usp=sharing](https://drive.google.com/file/d/17wNQJZNdJDWuhBcaJyTqudrrYtjJRKq0/view?usp=sharing)

## Build Requirements
To build this project in your local computer, you need these requirements to be installed in your local computer:

- Go go1.17.7
- Node v16.14.0
- Yarn v1.22.17
- Docker version 20.10.12, build e91ed57


We provided binary files (pre-compiled files) in this repository. If you just want to run (skip build process), you only need Docker to installed in your local computer, you don't need Go, Node and Yarn.

## Build on Windows

There is power shell file `build-on-windows.ps1` that you can use to build these projects, it will build:
- API (REST API)
- Scanner (Worker to scan the repository)
- Client (SPA web app)

## Build on Linux and Mac
Simply run `make build-prod` command in your Linux terminal, it will build:
- API (REST API)
- Scanner (Worker to scan the repository)
- Client (SPA web app)

## Running Program (Windows, Linux and Mac)

Make sure these port is not being used in your local computer:
- 8080
- 8081
- 5432
- 4222

You can run the project using Docker by running the following command:

`docker-compose up`
