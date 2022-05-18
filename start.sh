#!/usr/bin/sh

sudo service raspotify stop
sudo service librespot-node-api stop
sudo service snapserver stop

sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8083
sudo iptables-save

sudo service raspotify start
sudo service snapserver start
sudo service librespot-node-api start
