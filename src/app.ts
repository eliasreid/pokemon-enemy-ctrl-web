import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

let emuId = 0;

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

//handle incoming connections from clients
wss.on('connection', (ws: WebSocket) => {

  //connection is up, let's add a simple simple event
  ws.on('message', (message: string) => {

    //log the received message and send it back to the client
    console.log('received: %s', message);
    ws.send(`Hello, you sent -> ${message}`);
  });

  //send immediatly a feedback to the incoming connection    
  var connectionSuccessMsg = {id : emuId};
  ws.send(JSON.stringify(connectionSuccessMsg));
});

//start our server
server.listen(process.env.PORT || 8999, () => {
  let server_addr = server.address();
  if(typeof server_addr === 'object' && server_addr != null){
    console.log(`Server started on port ${server_addr.port} :)`);
  }
});