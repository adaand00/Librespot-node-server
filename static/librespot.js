class librespot {
    
    constructor(url){
        this.url = url;

        this.player = {
            status: "stopped",
            volume: 0,
            track: {
                artist: [],
                album: "",
                title: "",
                artUrl: ""
            }
        }

        fetch("http://" + url + ":8082")
            .then(response => response.json())
            .then(data => {
                this.player = data;
                this.updateDisplay();}
            );
    }

    handleMessage(mess){
        console.log("New message from spotify: " + JSON.stringify(mess))
        this.player = mess;
        this.updateDisplay();
    }

    updateDisplay(){
        var track = this.player.track;

        document.getElementById("title").innerHTML = track.title;
        document.getElementById("subtitle").innerHTML = "Album: " + track.album +" by: "+ track.artist.join(", ");
        document.getElementById("spotify").style.backgroundImage = "url('" + track.artUrl + "')";
        document.getElementById("paused").style.visibility = (this.player.status != "paused") ? "hidden" : "visible";
        //document.getElementById("spotVolume").value = this.player.volume;
        //document.getElementById("spotMute").children[0].classList = (volume == 0) ? ["fas fa-volume-mute"] : ["fas fa-volume-up"] ;
        //document.getElementById("playPause").children[0].classList = (status == "playing") ? ["fas fa-pause"] : ["fas fa-play"]

    }
}