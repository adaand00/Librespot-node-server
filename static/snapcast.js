

function handleMessage(mess){
    
    if(typeof mess.result != "undefined"){
        // Message is a response to last request
        switch(lastRequest.method){
            case 'Server.GetStatus':
                //get all groups
                groups = mess.result.server.groups;
                groups.forEach(group => {
                    // Get clients of the group
                    group.clients.forEach(client => {
                        // Save connected clients
                        if(client.connected){
                            cli = new Client(client);
                            connectedClients.set(cli.id, cli);
                            cli.addDiv();
                        }
                    } )
                });

                console.log(connectedClients);
                break;
            case 'Client.SetVolume':
                var cli = connectedClients.get(lastRequest.params.id);
                cli.volume = mess.result.volume.percent;
                break;
            default:
                console.log(mess);
        }
    }
    
    else {
        // Message is a notification
        // Something has changed in the network
        switch(mess.method){
            case "Client.OnVolumeChanged":
                // Volume change

                // Check if id is connected
                id = mess.params.id;
                if(connectedClients.has(id)){
                    // update volume to new
                    cli = connectedClients.get(id);
                    if(!cli.slider.sliding){
                        cli.volume = mess.params.volume.percent;
                        cli.muted = mess.params.volume.muted;
                    }
                    
                    cli.updateDisplay()
                    
                    console.log(cli.name + " vol: " + cli.volume + ", muted: " + cli.muted);
                }
                break;
            case "Client.OnConnect":
                // New connected client
                cli = new Client(mess.params.client);
                connectedClients.set(cli.id, cli)
                cli.addDiv();

                console.log(cli.name + " Connected");
                break;
            
            case "Client.OnDisconnect":
                // Remove client from connected list
                cli = connectedClients.get(mess.params.id);
                cli.removeDiv();
                connectedClients.delete(cli.id);

                console.log(cli.name + " Disconnected") 
                break;

            default:
                console.log(mess);
        }
    }
}

class Client {
    constructor(clientObj){
        this.id = clientObj.id;
        this.name = clientObj.host.name;
        this.volume = clientObj.config.volume.percent;
        this.muted = clientObj.config.volume.muted;
        this.div = null;
        this.slider = null;
    }

    updateDisplay(){
        if(this.div != null){
            this.div.querySelector("input").value = this.volume;
            this.div.querySelector("button i").classList = this.muted ? ["fas fa-volume-mute"] : ["fas fa-volume-up"];
            this.div.querySelector("p").innerHTML = (this.name == "CASE-AUDIO") ? "Projectroom" : this.name;
        }
    }

    addDiv(){
        // If div is already loaded, do nothing.
        if(this.div != null) {return};

        // copy div from template
        try {
            this.div = document.querySelector("template").content.firstElementChild.cloneNode(true);
        } catch (TypeError) {
            this.div = null;
            return;
        }
        
        // set ID
        this.div.id = this.name + "Div";

        // setup slider
        this.slider = new Slider(
            this.div.querySelector("input"),
            (vol) => {this.sendVolume(vol);},
            () => {this.updateDisplay();}
            )
        
        this.div.querySelector("input").oninput = () => {this.slider.sendVolume()};


        // setup button binding
        this.div.querySelector("button").onclick = () => {this.sendMute()};
        
        // add to document
        this.updateDisplay();
        document.getElementById("devicelist").appendChild(this.div)
    }

    sendCommand(method, params){
        lastRequest = {
            'id': ++lastRequest.id,
            'jsonrpc': '2.0',
            'method': method
        }

        if(params != null){lastRequest.params = params;};

        snapsock.send(JSON.stringify(lastRequest));
    }

    removeDiv(){
        // do nothing if div is removed
        if(this.div == null) {return}

        this.div.parentNode.removeChild(this.div);
        this.div = null;
    }

    sendMute(){
        this.muted = !this.muted;

        var params = {
            "id" : this.id,
            "volume": {
                "muted": this.muted,
                "percent": this.volume
            }
        }

        this.sendCommand("Client.SetVolume", params);
        this.updateDisplay();
    }

    sendVolume(vol){
        this.volume = vol;
        var params = {
            "id" : this.id,
            "volume": {
                "muted": this.muted,
                "percent": parseInt(vol)
            }
        }

        this.sendCommand("Client.SetVolume", params);
    }
}
