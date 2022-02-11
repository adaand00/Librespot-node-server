const http = require('http');
const websocket = require('ws');

var player = {
    status: "stopped",
    volume: 0,
    track: {
        artist: [],
        album: "",
        title: "",
        artUrl: ""
    }
}

function getPlayerInfo(trackID) {

    //TODO: update player from spotify API

    player.track.title = trackID;

}

var sockets = [];

const wsServer = new websocket.Server({port: 8081}).on('connection', function(socket) {
    //save socket as connected
    sockets.push(socket);
  
    // on message recieved, send back the status
    socket.on('message', function(msg) {
      socket.send(JSON.stringify(player))
    });
  
    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function() {
      sockets = sockets.filter(s => s !== socket);
    });
  });


const hServer = new http.createServer((req, res) => {
    if(req.method == "POST"){
        // split and remove endpoint
        let par = req.url.split('?');
        let endpoint = par.shift();

        // return error 400 if there are no parameters in request
        if(par.length == 0){
            res.statusCode = 400;
            res.end();
        }
        
        // save params in Key/value pair
        let paramMap = new Map;
        par.forEach(kvPair => {
            kvPair.split("=")
            paramMap.set(kvPair[0], kvPair[1])
        });

        // verify correct endpoint
        if (endpoint != "/set"){
            res.statusCode = 405;
            res.end();
        }

        if(paramMap.has("id")){
            // update player info
            getPlayerInfo(paramMap.get("id"))
        }

        if(paramMap.has("vol")){
            // update volume
            player.volume = paramMap.get("vol")
        }

        if(paramMap.has("status")){
            // update vstatus
            player.status = paramMap.get("status")
        }

        sockets.forEach((socket) => {
            socket.send(JSON.stringify(player));
        })

        res.statusCode = 200;
        res.end("OK");
    }

    
}).listen(8082);
