#!/bin/sh

URL="localhost:8082/set?"

if [ -n "$PLAYER_EVENT" ]; then
    URL="${URL}status=${PLAYER_EVENT}&" 
fi

if [ -n "$TRACK_ID" ]; then
    URL="${URL}id=${TRACK_ID}&" 
fi

if [ -n "$VOLUME" ]; then
    URL="${URL}vol=${VOLUME}&" 
fi

echo $URL

curl -X POST "$URL"