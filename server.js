const http = require('http');
const websocket = require('ws');
const keys = require('./API-keys');
const axios = require('axios');
const static = require('node-static')

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

var token = "";

//Get track data from spotify API
function getPlayerInfo(trackID){
    let auth = keys.id + ":" + keys.secret;

    let url = 'https://accounts.spotify.com/api/token';
    let data = 'grant_type=client_credentials';
    let opts = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (new Buffer.alloc(auth.length, auth).toString('base64'))
        }
    }
    
    return axios.post(url, data, opts).then( (response) => {
        token = response.data.access_token;

        let opts = {
            url: "https://api.spotify.com/v1/tracks/" + trackID,
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json" 
            }
        }

        return axios(opts);

    }).then( (response) => {

        let track = response.data;
        
        player.track.title = track.name;
        player.track.artUrl = track.album.images[0].url;
        player.track.album = track.album.name;
        
        player.track.artist = [];
        track.artists.forEach((artist) => {
            player.track.artist.push(artist.name);
        })
        return ;
    })
}

// Handle updated parameters and send to sockets
async function handleNewParams(paramMap){
    const promises = [];

    if(paramMap.has("id")){
        // update player info
        promises.push(getPlayerInfo(paramMap.get("id")));
    }

    if(paramMap.has("vol")){
        // update volume
        player.volume = paramMap.get("vol")
    }

    if(paramMap.has("status")){
        // update status
        switch (paramMap.get) {
            case value:
                
                break;
        
            default:
                break;
        }
        player.status = paramMap.get("status")
    }

    Promise.all(promises).then(() => {
        console.log(player);

        sockets.forEach((socket) => {
            socket.send(JSON.stringify(player));
        })
    })
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
        
        // verify correct endpoint
        if (endpoint != "/set"){
            res.statusCode = 405;
            res.end();
        }
        
        // save params in Key/value pair
        let paramMap = new Map;
        par = par[0].split('&')
        par.forEach(kvPair => {
            kvPair = kvPair.split("=")
            paramMap.set(kvPair[0], kvPair[1])
        });

        console.log(paramMap);

        handleNewParams(paramMap);

        res.statusCode = 200;
        res.end("OK");

    }else{
        res.send(JSON.stringify(player));
        res.statusCode = 200;
        res.end();
    }

}).listen(8082);

var fileServer = new static.Server('./static');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
}).listen(8083);
