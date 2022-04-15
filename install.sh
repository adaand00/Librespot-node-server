#!/usr/bin/sh

# Upgrade to latest
sudo apt update
sudo apt upgrade

# Install raspotify
sudo apt install raspotify

# Install service file
sudo cp ./service/librespot-node-api.service /usr/lib/systemd/system/librespot-node-api.service
sudo systemctl daemon-reload
sudo systemctl enable librespot-node-api.service

# Install raspotify conf
sudo cp ./raspotify/conf /etc/raspotify/conf

# Install callback file librespot-handler
sudo cp ./librespot-handler.sh /usr/local/bin/librespot-handler.sh
sudo chmod 755 /usr/local/bin/librespot-handler.sh

# Set up routing
sudo apt install iptables
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8083
sudo iptables-save