#!/usr/bin/node

const http = require('http');
const websocket = require('ws');
const axios = require('axios');
const static = require('node-static')

const keys = require('./API-keys');

const noPlayer = JSON.stringify({
    status: "stopped",
    volume: 0,
    track: {
        artist: [],
        album: "",
        title: "",
        artUrl: "case-audio.com/noplayer.png"
    }
})

var player = JSON.parse(noPlayer);

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
        console.log(track.album.images)
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

    var updateID = true;
    if(paramMap.has("status")){
        // Handle status changes 
        console.log(paramMap.get("status"));
        
        switch (paramMap.get("status")) {
            case "playing":
                player.status = "playing";

                break;

            //Set to default, save volume and paused
            case "paused":
                // var v = player.volume;
                // player = JSON.parse(noPlayer);
                // player.volume = v;
                player.status = "paused";
                break;

            //Set to default
            case "stopped":
                player = JSON.parse(noPlayer); 
                updateID = false;
                break;

            //Ignore these statuses
            case "preloading":
                updateID = false;
            case "volume_set":
            case "changed":
            case "started":
                break;

            //Some other status
            default:
                console.log("unknown status: "+paramMap.get("status"))
                break;
        }     
    }
    
    if(paramMap.has("id") && updateID){
        // update player info
        await getPlayerInfo(paramMap.get("id"));
    }

    if(paramMap.has("vol")){
        // update volume
        console.log("new volume");
        player.volume = Math.round(paramMap.get("vol")*100 / 65536);
    }

    sockets.forEach((socket) => {
        socket.send(JSON.stringify(player));
    });
}

var sockets = [];

// websocket port 8081, sends message.
const wsServer = new websocket.Server({port: 8081}).on('connection', function(socket) {
    //save socket as connected
    sockets.push(socket);
    //console.log(sockets);
  
    // on message recieved, send back the status
    socket.on('message', function(msg) {
      socket.send(JSON.stringify(player))
    });
  
    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function() {
      sockets = sockets.filter(s => s !== socket);
    });
  });

// http API server, port 8082
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

        //console.log(paramMap);

        handleNewParams(paramMap);

        res.statusCode = 200;
        res.end("OK");

    }else{
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(player));
        res.statusCode = 200;
        res.end();
    }

}).listen(8082);

var fileServer = new static.Server('/home/pi/Librespot-node-server/static')

// http static server port 8082, forwarded from :80. 
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
        console.log("Static connection")
    }).resume();
}).listen(8083);
