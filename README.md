# Pokemon Enemy Controller - Web client and server

WIP

This repo contains a web server and webclient for controlling the enemy battle actions in pokemon game emulators:
- Web server in `src/`: Makes a websocket connection to an enemy-ctrl plugin running on a host emulator to open a "session" that a browser client can join.
- Client in `client/`: Browser based UI to send commands to the emulator to control the enemy actions. Connects to a session opened by the emulator.

Emulator plugin repo - controls Pokemon Crystal through BizHawk's GBHawk GBC emulator (also WIP): https://github.com/eliasreid/crystal-ai-ctrl

## setup
install node and npm: https://nodejs.org/en/download/

open terminal to this project directory and run `npm install`

## How to run locally

Start server with `npm start`

Launch Emulator with plugin (see https://github.com/eliasreid/crystal-ai-ctrl)

Click "Connect" button in the emulator plugin UI to start a session.

The server will print a message like localhost:8999/session/?id=0, which can be be reached locally with a web browser to join the session.

If successfully connected to the emulator session, there should be some kind of "Connect" indication on the web page. The page should now update as the game progresses through trainer battles on the emulator.
