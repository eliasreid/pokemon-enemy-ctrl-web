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

//handle incoming connections from clients
wss.on('connection', (ws: WebSocket, req) => {

  console.log('connection opened. %d clients', wss.clients.size);
  if(req.url != null){
    //url is "/?id=42"
    let reqParams = new URLSearchParams(req.url.substring(1));
    if(reqParams.has("id")){
      let requestId = reqParams.get("id");
      console.log(`connection from ${requestId}`);

      //connection is up, let's add a simple simple event
      ws.on('message', (message: string) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
      });

      // var connectionSuccessMsg = {id : emuId};
      // ws.send(JSON.stringify(connectionSuccessMsg));
      ws.send(`hello emu with id ${ requestId }`);

    }else{
      //return error - disconnect socket?
      ws.send("No id specified, terminating connection");
      ws.terminate();
    }
  }else{
    console.log('request url null');
    
  }

});

wss.on('close', () => {
  console.log('connection closed. %d clients', wss.clients.size);
})


//start our server
server.listen(process.env.PORT || 8999, () => {
  let server_addr = server.address();
  if(typeof server_addr === 'object' && server_addr != null){
    console.log(`Server started on port ${server_addr.port} :)`);
  }
});