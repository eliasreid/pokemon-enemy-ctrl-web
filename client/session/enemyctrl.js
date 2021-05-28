
// Could send a heartbeat message back and forth  https://www.jstips.co/en/javascript/working-with-websocket-timeout/

//Should contain id=<session_id>
let sessionParams = (new URL(location)).searchParams;
// ec2-18-191-134-165.us-east-2.compute.amazonaws.com
let websocket_req = "ws://ec2-18-191-134-165.us-east-2.compute.amazonaws.com:80/?type=browser&" +  sessionParams;
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

    if(jsonMsg.hasOwnProperty('msgType') && jsonMsg.msgType === 'availableActions'){
      setPokemonButtons(jsonMsg.pokemon);
      setMoveButtons(jsonMsg.moves);
      setItemButtons(jsonMsg.items);
    }

    //Doing everything in availableActions instead of separate battleStart msg.
    //May add this back in for something.

    // if(jsonMsg.hasOwnProperty('msgType') && jsonMsg.msgType === 'battleStart'){

    //   console.log("interpretted battleStart message");

    //   var mon_buttons = Array.from(document.getElementById("pokemon-buttons").children);
    //   console.log("num buttons %i", mon_buttons.length);
    //   //Instead of updating button text, I'm updating all the buttons
      
    //   //Hide all buttons, then unhide buttons with 
    //   mon_buttons.forEach( btn => {
    //     btn.style.visibility = 'hidden';
    //     btn.disabled = true;
    //   });
    //   jsonMsg.trainerInfo.pokemonNames.slice(0, 6).forEach((name, i)=> {
    //     mon_buttons[i].style.visibility = 'visible';
    //     mon_buttons[i].disabled = false;
    //     mon_buttons[i].innerHTML = name;
    //   });
    // }
  }catch(err){

  }
};

function setPokemonButtons(pokemon){
  var mon_buttons = Array.from(document.getElementById("pokemon-buttons").getElementsByTagName('button'));
  mon_buttons.forEach( btn => {
    btn.style.visibility = 'hidden';
    btn.disabled = true;
  });
  pokemon.slice(0, 6).forEach((mon, i) => {
    mon_buttons[i].style.visibility = 'visible';
    mon_buttons[i].disabled = mon.status === "fainted";
    mon_buttons[i].innerHTML = mon.name + " (" + mon.status + ")";
  });
}

function setMoveButtons(moves){
  var move_buttons = Array.from(document.getElementById("move-buttons").getElementsByTagName('button'));
  move_buttons.forEach( btn => {
    btn.style.visibility = 'hidden';
    btn.disabled = true;
  });
  moves.forEach((moveName, i) => {
    move_buttons[i].style.visibility = 'visible';
    move_buttons[i].disabled = false;
    move_buttons[i].innerHTML = moveName;
  });
}

function setItemButtons(items){
  var item_buttons = Array.from(document.getElementById("item-buttons").getElementsByTagName('button'));
  item_buttons.forEach( btn => {
    btn.style.visibility = 'hidden';
    btn.disabled = true;
  });
  items.forEach((item, i) => {
    item_buttons[i].style.visibility = 'visible';
    item_buttons[i].disabled = false;
    item_buttons[i].innerHTML = item;
  });
}

webSocket.onclose = function(event){
  console.log("connection closed");
  document.getElementById('status').innerText = "DISCONNECTED, try reloading or joining a different session";
};

webSocket.onerror = function(event){
  console.log("websocket error");
}

let mon_buttons = Array.from(document.getElementById("pokemon-buttons").getElementsByTagName('button'));
mon_buttons.forEach((button, i) => {
  button.onclick = function() {chooseMon(i)};
});

let move_buttons = Array.from(document.getElementById("move-buttons").getElementsByTagName('button'));
move_buttons.forEach((button, i) => {
  button.onclick = function() {chooseMove(i)};
});

let item_buttons = Array.from(document.getElementById("item-buttons").getElementsByTagName('button'));
item_buttons.forEach((button, i) => {
  button.onclick = function() {chooseItem(i)};
});

function chooseMon(index){
  //Send message
  console.log("choose mon called, index %d", index);
  var chooseMonMsg = {msgType: "chosenAction", actionType: "pokemonSwitch", actionIndex: index};
  webSocket.send(JSON.stringify(chooseMonMsg));
}

function chooseMove(index){
    //Send message
    console.log("choose move called, index %d", index);
    var chooseMoveMsg = {msgType: "chosenAction", actionType: "useMove", actionIndex: index};
    webSocket.send(JSON.stringify(chooseMoveMsg));
}

function chooseItem(index){
      //Send message
      console.log("choose item called, index %d", index);
      var chooseItemMsg = {msgType: "chosenAction", actionType: "useItem", actionIndex: index};
      webSocket.send(JSON.stringify(chooseItemMsg));
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
