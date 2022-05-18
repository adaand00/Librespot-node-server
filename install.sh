#!/usr/bin/sh

# Upgrade to latest
sudo apt update
sudo apt upgrade

# Install nodejs
sudo apt install nodejs npm curl iptables
npm install

# Install raspotify
curl -sL https://dtcooper.github.io/raspotify/install.sh | sh

# Install service file
sudo cp ./service/librespot-node-api.service /usr/lib/systemd/system/librespot-node-api.service
sudo systemctl daemon-reload
sudo systemctl enable librespot-node-api.service

# Install raspotify conf
sudo cp ./raspotify/conf /etc/raspotify/conf
sudo service raspotify restart

# Install callback file librespot-handler
sudo cp ./librespot-handler.sh /usr/local/bin/librespot-handler.sh
sudo chmod 755 /usr/local/bin/librespot-handler.sh

# Set up routing
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8083
sudo iptables-save

# install drivers 
wget https://github.com/CASE-Association/case-AudioSystem/raw/master/adau1701-i2s.dtbo
sudo cp adau1701-i2s.dtbo /boot/overlays/

# Install snapcast
sudo apt install snapserver snapclient

sudo cp snapcast/snapserver.conf /etc/snapserver.conf
sudo cp snapcast/snapclient /etc/default/snapclient
