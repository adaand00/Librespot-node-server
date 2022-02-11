const http = require('http');
const request = require('request'); // "Request" library
const websocket = require('ws');
const keys = require('./API-keys');

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

function getPlayerInfo(trackID) {
    
    console.log(trackID)

    // application requests authorization
    let auth = keys.id + ":" + keys.secret;
    let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer.alloc(auth.length, auth).toString('base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        console.log(body);
        if (!error && response.statusCode === 200) {

            // use the access token to access the Spotify Web API
            token = body.access_token;

            let reqOptions = {
                url: "https://api.spotify.com/v1/tracks/" + trackID,
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json" 
                }
            }

            request.get(reqOptions, (error, response, body) => {
                let track = JSON.parse(body);
                console.log(track);
                
                player.track = track.name;
                player.url = track.album.images[0].url;
                player.album = track.album.name;
                player.artist = [];
                track.artists.forEach((artist) => {
                    player.artist.push(artist.name);
                })
                
                console.log(player);
            });

        }
    });

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
            kvPair = kvPair.split("=")
            paramMap.set(kvPair[0], kvPair[1])
        });

        // verify correct endpoint
        if (endpoint != "/set"){
            res.statusCode = 405;
            res.end();
        }
        console.log(paramMap)

        if(paramMap.has("id")){
            // update player info
            console.log("id="+ paramMap.get("id"))
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
