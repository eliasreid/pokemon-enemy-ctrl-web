
// Could send a heartbeat message back and forth  https://www.jstips.co/en/javascript/working-with-websocket-timeout/

//Should contain id=<session_id>
let sessionParams = (new URL(location)).searchParams;

let websocket_req = "ws://localhost:8999/?type=browser&" +  sessionParams;
console.log("opening websocket with %s", websocket_req);

let webSocket = new WebSocket(websocket_req);

webSocket.onopen = function(event){
  //enable test send button
  document.getElementById('status').innerText = "CONNECTED! try testsend button";
  document.getElementById('testsend').disabled = false;
};

webSocket.onmessage = function(event){
  console.log("received message: %s", event.data);
};

webSocket.onclose = function(event){
  console.log("connection closed");
  document.getElementById('status').innerText = "DISCONNECTED, try reloading or joining a different session";
};

webSocket.onerror = function(event){
  console.log("websocket error");
}

let button = document.getElementById("testsend");
button.onclick = function(){
  console.log('btn clicked');
  webSocket.send("sent from browser");
}
