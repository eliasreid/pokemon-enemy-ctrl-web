import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import path from 'path';
import url from 'url';

const app = express();

//TODO: make homepage index.html instructions on how to connect to emulator
app.use(express.static("client"));

app.get('/', function(req, res, next){
  req.route
  console.log("request received. path: %s, route: %s, url: %s", req.path, req.route, req.originalUrl);
  res.sendFile(path.join(__dirname, '..', '/client/index.html'));
});

//https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
// - pongs are automatically sent in response.

// - Could also implement a ping listener on the client side, to notify if lost connection

// Need some way to map clients together. wss.clients gives a Set of clients
// What happen if I keep a reference to a client outside of the set, then it is removed.

let emuId = 0;

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });


//Probably want to keep track of a list of two-way connections (emu-sessions)
class EmuSession {
  id: string;
  readonly emuClient: WebSocket;
  browserClient?: WebSocket;

  constructor(id: string, emuClient: WebSocket){
    this.id = id;
    this.emuClient = emuClient;
    this.browserClient = undefined; // undefined typically used for "not yet initialized"
  }
  emuActive = () => {
    return this.emuClient.readyState == WebSocket.OPEN;
  };
  active = () => {
    if(this.browserClient == null){
      return false;
    }
    return this.browserClient.readyState == WebSocket.OPEN && this.emuClient.readyState == WebSocket.OPEN
  };
}

let sessions = new Array<EmuSession>();

//handle incoming connections from clients
wss.on('connection', (ws: WebSocket, req) => {

  console.log('connection opened. %d clients', wss.clients.size);
  if(req.url != null){
    //TODO: emulator and browser might as well differentiate from each other in their request
  
    //e.g. emulator could request /?type=emulator&id=42

    //url is "/?id=42"
    let reqParams = new URLSearchParams(req.url.substring(1));

    //check has "type", and "id"
    if(reqParams.has("id") && reqParams.has("type")){
      let requestType = reqParams.get("type")!;
      let requestId = reqParams.get("id")!;
      console.log(`connection from type: ${requestType}, id: ${requestId}`);

      if(requestType === "emulator"){
        //For now, assume unique ID
        sessions.push(new EmuSession(requestId, ws));
        ws.send(`hello emu with id ${ requestId }`);
        ws.on('message', (message: string) => {
          //get browser from session id
          //TODO: can I avoid find here by just using the "pushed" session in upper scope?
          const session = sessions.find( el => el.id == requestId);
          //TODO: confirm the ? does what I think it does
          // Want to check if have a matching sesstion, and if its active
          if(session?.active()){
            //There is an active session between the emu and browser, send data to browser
            console.log("emu message received, fwding to browser");
            session.browserClient!.send(message);
          }else{
            console.log("emu message received, but no active session");
          }
        });
      }else if(requestType === "browser"){
        ws.send(`hello browser with id ${ requestId }`);
        
        //check for matching session with emulator
        const session = sessions.find( el => el.id == requestId);
        if(session?.emuActive()){
          //add browser to session
          session.browserClient = ws;
          ws.on('message', (message: string) => {
            if(session.active()){
              console.log("browser message received, fwding to emu");
              session.emuClient.send(message);
            }else{
              console.log("browser message received, but session not active??");
            }
          });
        }
      }

    }else{
      //return error - disconnect socket?
      ws.send("websocket request missing fields, terminating connection");
      ws.terminate();
    }
  }else{
    ws.send("websocket request url null, terminating connection");
    ws.terminate();
  }

});

wss.on('close', () => {
  console.log('connection closed. %d clients', wss.clients.size);
  //TODO: find the session this belongs to - send message to other party, terminate them
  //TODO: remove session from list
})


//start our server
server.listen(process.env.PORT || 8999, () => {
  let server_addr = server.address();
  if(typeof server_addr === 'object' && server_addr != null){
    console.log(`Server started on port ${server_addr.port} :)`);
  }
});