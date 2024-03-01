# AI Project

This is not my real github account and this will likely not be updated.

## Prerequisites:

### Configurations - Init `default.json`

Create a file called `default.json` in the `/config` folder. You can use the existing `default.example.json` file as a reference to the required contents of the file.

### Ollama Server

Your ollama server should be up and running for this API to work. `ollamaURL` in the `default.json` file should point to your ollama server.

### Database - MongoDB

A Mongo Daabase is required in order to save registered users, chat sessions, files, etc. The variable `mongoURI` in the `default.json` file should point to your mongodb server.

### Running the API

```
// install all packages
npm i

// start the api in development mode (use this for local use)
npm run dev

// start the api in production mode
npm start

```

### Running the UI (dev/production)

Refer to the UI repo for instructions on how to run the UI. Both UI and API should be running at the same time in order to use locally (dev).

Once you are ready to deploy a 'production' version of the app you must create a `public` folder in the root of this project and stick the built HTML/JS/CSS files there.

### Notes

Files uploaded to the API are stored in a folder called `uploads` in the root of this project.

In order to use real time communication between the API and UI `socket.io` is used. There are some bugs in the UI/API if you lose connection in the middle of a response from the LLM. Also, if you start a new chat while in the middle of getting a response from the LLM.
