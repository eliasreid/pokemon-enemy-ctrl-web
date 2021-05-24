## Pokemon Enemy Controller - Web client and server

WIP

This repo contains a web server and webclient for controlling the enemy battle actions in pokemon game emulators:
- Web server in `src/`: Makes a websocket connection to an enemy-ctrl plugin running on a host emulator to open a "session" that a browser client can join.
- Client in `client/`: Browser based UI to send commands to the emulator to control the enemy actions. Connects to a session opened by the emulator.

Emulator plugin repo - controls Pokemon Crystal through BizHawk's GBHawk GBC emulator (also WIP): https://github.com/eliasreid/crystal-ai-ctrl
