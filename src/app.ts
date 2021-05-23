import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import path from 'path';
import url from 'url';

const app = express();
app.use(express.static('client'));


//https://github.com/websockets/ws#how-to-detect-and-close-broken-connections
// - pongs are automatically sent in response.
// - Could also implement a ping listener on the client side, to notify if lost connection
//So close should work on clean close, if not clean, can implement hearbeats wi
//https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20780#issuecomment-518051061

let globalSessionId = 0;

//initialize a simple http server
const httpServer = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server: httpServer });

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

//TOOD: introduced a bug, somehow "emulator" test socket is sending message to itself?

let sessions = new Array<EmuSession>();

//handle incoming connections from clients
wss.on('connection', (ws: WebSocket, req) => {

  console.log('connection opened. %d clients', wss.clients.size);
  if(req.url != null){
    //TODO: emulator and browser might as well differentiate from each other in their request

    //check if from emulator first - may not even need emu in the request
    //don't require emulator to give ID

        //e.g. emulator could request /?type=emulator&id=42
    //url is "/?id=42"
    let reqParams = new URLSearchParams(req.url.substring(1));

    if(!reqParams.has("type")){
      console.log("malformed request from client, requires type query string");
      ws.send("provide type query string");
      ws.terminate();
      return;
    }

    let requestType = reqParams.get("type")!;
    
    if(requestType === "emulator"){
      //TODO: don't assume this!
      //For now, assume unique ID
      // I thought that sharing the global would be bad, but maybe not?
      // https://stackoverflow.com/a/5481788/13371278
      var sessionId = globalSessionId++;
      sessions.push(new EmuSession(String(sessionId), ws));
      const session = sessions[sessions.length - 1];
      console.log(`emulator connection received, creating session with ID ${sessionId}. ${sessions.length} total sessions`);
      let sessionStartReply: Object = {inviteUrl: `http://localhost:8999/${session.id}`};
      ws.send(JSON.stringify(sessionStartReply));
      ws.on('message', (message: string) => {
        if(session.active()){
          //There is an active session between the emu and browser, send data to browser
          console.log("emu message received, fwding to browser");
          session.browserClient!.send(message);
        }else{
          console.log("emu message received, but no active session");
        }
      });
      //emulator connection close
      ws.onclose = (event: WebSocket.CloseEvent)=>{
        //close down session
        if(session.browserClient != null){
          session.browserClient.send("emuator client closing");
          session.browserClient.close();
        }
        const num_before = sessions.length;
        sessions = sessions.filter(function( sess ) {
          return session !== sess;
        });
        console.log(`emulator client closed, sessions from ${num_before} to ${sessions.length}`);
      }
    }else if(requestType === "browser"){
      if(!reqParams.has("id")){
        console.log("malformed request from browser client, requires id query string");
        ws.send("provide id query string");
        ws.terminate();
        return;
      }
      let requestId = reqParams.get("id")!;
      ws.send(`hello browser with id ${ requestId }`);
      
      //check for matching session with emulator
      const session = sessions.find( el => el.id == requestId);
      if(session != null && session.emuActive()){
        //add browser to session
        session.browserClient = ws;
        session.emuClient.send("browser client connected");
        console.log(`browser connected to session ${session.id}`);

        ws.on('message', (message: string) => {
          if(session.active()){
            console.log("browser message received, fwding to emu");
            session.emuClient.send(message);
          }else{
            console.log("browser message received, but session not active??");
          }
        });

        //TODO: anything on browser close? we do need to notify emulator
        ws.onclose = (event: WebSocket.CloseEvent) => {
          session.emuClient.send("browser client closing");
        };
      }else{
        console.log("client connected, but no active matching session");
        ws.send("No matching session");
        ws.terminate();
        return;
      }
    }
  }else{
    ws.send("websocket request url null, terminating connection");
    ws.terminate();
  }

});

wss.on('error', (event: string, ws: WebSocket) => {
  console.log(`wss server error, event: ${event}`);
});

//start our server
httpServer.listen(process.env.PORT || 8999, () => {
  let server_addr = httpServer.address();
  if(typeof server_addr === 'object' && server_addr != null){
    console.log(`Server started on port ${server_addr.port} :)`);
  }
});

wss.on('close', (ws: WebSocket) => {
  console.log('WS Server closing closing');
});


