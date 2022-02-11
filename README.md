# Librespot API 
Node.js server that communicates with librespot ("--onevent" through http) and clients (http or websocket)


# Standard JSON status message
This is the standard representation of the player state

´
player: {
    status: "playing | paused | stopped",
    volume: 0 - 100,
    track: {
        artist: ["string", "string"... ],
        album: "string",
        title: "string",
        artUrl
    }
}
´

# http server

## GET /status/
Get status of player.

returns JSON status message

## POST /set[?id={spotify track id}][?vol={0-100}][?status={playing | paused | stopped}]
Set the current status. All parameters are optional. Only accepts requests from localhost.

This method is used by the librespotHandle command to sync the player and server.

# websocket server

## from server

JSON status message on update

## to server

any message will be answered with JSON status message

