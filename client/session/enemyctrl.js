
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
  try{
    const jsonMsg = JSON.parse(event.data);
    if(jsonMsg.hasOwnProperty('msgType') && jsonMsg.msgType === 'battleStart'){

      console.log("interpretted battleStart message");

      //Problem, gives a list of 1 with the div element CONTAINING the buttons
      //how to iterate over sub buttons
      console.log("before getelements");
      var mon_buttons = Array.from(document.getElementById("pokemon-buttons").children);
      console.log("num buttons %i", mon_buttons.length);
      //Instead of updating button text, I'm updating all the buttons
      
      //Hide all buttons, then unhide buttons with 
      mon_buttons.forEach((btn) => {
        btn.style.visibility = 'hidden';
        btn.disabled = true;
      });
      jsonMsg.trainerInfo.pokemonNames.slice(0, 6).forEach((name, i)=> {
        mon_buttons[i].style.visibility = 'visible';
        mon_buttons[i].disabled = false;
        mon_buttons[i].innerHTML = name;
      });
    }
  }catch(err){

  }
};

function test_func(val){
  console.log("test func called with %d", val);
}

webSocket.onclose = function(event){
  console.log("connection closed");
  document.getElementById('status').innerText = "DISCONNECTED, try reloading or joining a different session";
};

webSocket.onerror = function(event){
  console.log("websocket error");
}

let mon_buttons = Array.from(document.getElementById("pokemon-buttons").children);
mon_buttons.forEach((button, i) => {
  button.onclick = function() {chooseMon(i)};
});

function chooseMon(index){
  //Send message
  console.log("choose mon called, index %d", index);
  var chooseMonMsg = {msgType: "chosenAction", actionType: "pokemonSwitch", actionIndex: index};
  webSocket.send(JSON.stringify(chooseMonMsg));
}

let button = document.getElementById("testsend");
button.onclick = function(){
  console.log('btn clicked');
  webSocket.send("sent from browser");
  console.log('buttons size');

  var buttons = document.getElementsByClassName("pokemon-buttons");
  console.log('%1', buttons.length);
  for(const button of buttons){
    console.log('button: %1', button.textContent);
  }
}
