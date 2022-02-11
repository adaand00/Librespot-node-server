# Librespot Node Server - WARNING: NOT WORKING
Interface for librespot (through raspotify).
Designed to run on raspberry pi os lite, probably works for others.

## Secrets
Put your spotify client ID and secret in a file called API-keys.js (https://developer.spotify.com/dashboard/applications)

#### API-keys.js:
```
module.exports = {
    id: 'your ID',
    secret: 'your secret'
}
```

## Librespot API 
Node.js server that communicates with librespot ("--onevent" through http) and clients (http and websocket)


#### Standard JSON status message
This is the standard representation of the player state

```
player: {
    status: "playing | paused | stopped",
    volume: 0 - 100,
    track: {
        artist: ["string", "string"... ],
        album: "string",
        title: "string",
        artUrl: "string",
    }
}
```

### http server: Port 8082

#### GET /status/
Get status of player.

returns JSON status message

#### POST /set[?id={spotify track id}][?vol={0-100}][?status={playing | paused | stopped}]
Set the current status. All parameters are optional. Only accepts requests from localhost.

This method is used by the librespotHandle command to sync the player and server.

### websocket server: port 8081

#### from server

JSON status message on update

#### to server

any message will be answered with JSON status message

