class Slider{
    constructor(element, sendCallback, updateCallback){
        this.element = element;
        this.sendCallback = sendCallback;
        this.updateCallback = updateCallback;
        this.sliding = false;
    }

    sendVolume(){
        this.sliding = true;
        // leave control over slider after 1000 ms
        if(this.slideStopTimer != null) {clearTimeout(this.slideStopTimer);}
        this.slideStopTimer = setTimeout(() => {this.stopSliding()}, 1000);

        // Send API calls every 100 ms
        if(this.slideSendTimer == null) {this.slideSendTimer = setTimeout(() => {this.sendFinalVolume()}, 100);}
        
    }

    sendFinalVolume(){
        var newVol = this.element.value;
        this.sendCallback(newVol);
        this.slideSendTimer = null;
    }

    stopSliding(){
        this.sliding = false;
        this.updateCallback();
    }
}