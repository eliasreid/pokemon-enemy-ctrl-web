


// Could send a heartbeat message back and forth  https://www.jstips.co/en/javascript/working-with-websocket-timeout/



let button = document.getElementById("connect");
button.onclick = function(){
  //connect to websocket server
  let webSocket = new WebSocket("ws://ec2-18-191-134-165.us-east-2.compute.amazonaws.com:80");
  webSocket.onopen = function(event){
    console.log("websocket opened, event: " + event.data);

    webSocket.onmessage = function(event){
      console.log("received event: " + event.data) ;
    }
    
    webSocket.onclose = function(event){
      console.log("websocket closed");
    }
    webSocket.onerror = function(event){
      console.log("websocket error");
    }
  }

  document.getElementById("testsend").onclick = function(){
    webSocket.send("data from client");
  }
  
  //Check if number
  var inputted_session = document.getElementById("session_id").value;
  
  if(!isNaN(inputted_session)){
    console.log("connecting to session " + inputted_session);
  }

  //get number from input field

}
