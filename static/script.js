out = document.getElementById("content")

addr = location.host;

var lastRequest = {
    'id': 0,
    'jsonrpc': '2.0',
    'method': 'Server.GetStatus',
};

var lastData

// Map {id: Client, id: Client}
var connectedClients = new Map();

// Create websocket
const snapsock = new WebSocket("ws://case-audio.local:1780/jsonrpc");
// Handle responses
snapsock.addEventListener("message", (message) => {
    handleMessage(JSON.parse(message.data));
})

// Send "Server.GetStatus" request when socket is opened
snapsock.addEventListener('open', () => snapsock.send(JSON.stringify(++lastRequest.id && lastRequest)));

// spotify state handler
spot = new librespot(addr)

// create socket for spotify
const spotsock = new WebSocket("ws://" + addr + ":8081");

spotsock.addEventListener("message", (message) => {
    spot.handleMessage(JSON.parse(message.data));
})


document.addEventListener("DOMContentLoaded", () => {
    //Setup buttons
    //document.getElementById("playPause").onclick = function() {spot.sendPlayPause()};
    //document.getElementById("nextSong").onclick = function() {spot.sendNext()};
    //document.getElementById("previousSong").onclick = function() {spot.sendPrevious()};
    //document.getElementById("spotMute").onclick = function() {spot.sendMute()};

    //setup spotify
    //var spotVol = document.getElementById("spotVolume");
    //spot.slider = new Slider(
    //    spotVol,
    //    (vol) => {spot.sendCommand("/player/set-volume?volume=" + vol*655);},
    //    () => {spot.updateDisplay();}
    //    );

    //spotVol.oninput = () => {spot.slider.sendVolume()};

    // Add all connected clients
    connectedClients.forEach((client) => { client.addDiv()})
})

