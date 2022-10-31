#!/usr/bin/sh

# Upgrade to latest
sudo apt update
sudo apt upgrade

# Install nodejs
echo "--------- Installing nodejs -------------"

sudo apt install nodejs npm curl iptables
npm install


# Install raspotify
echo "----------- Installing raspotify -----------"
curl -sL https://dtcooper.github.io/raspotify/install.sh | sh

# Install service file
echo "---------- Installing new service-------------"
sudo cp ./service/librespot-node-api.service /usr/lib/systemd/system/librespot-node-api.service
sudo systemctl daemon-reload
sudo systemctl enable librespot-node-api.service

# Install raspotify conf
echo "---------- install raspotify conf ------------"
sudo cp ./raspotify/conf /etc/raspotify/conf
sudo service raspotify restart

# Install callback file librespot-handler
echo "----------- Setup Librespot callback ------------"
sudo cp ./librespot-handler.sh /usr/local/bin/librespot-handler.sh
sudo chmod 755 /usr/local/bin/librespot-handler.sh

# Set up routing
echo "------------ Routing ------------"
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8083
sudo iptables-save

# install drivers 
echo "----------- Install ADAU1701 drivers -----------"
wget https://github.com/CASE-Association/case-AudioSystem/raw/master/adau1701-i2s.dtbo
sudo cp adau1701-i2s.dtbo /boot/overlays/
echo "dtoverlay=adau1701-i2s"

# Install snapcast
echo "----------- Install snapserver and snapclient ------------"
sudo apt install snapserver snapclient

sudo cp snapcast/snapserver.conf /etc/snapserver.conf
sudo cp snapcast/snapclient /etc/default/snapclient
