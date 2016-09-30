/**
 * Created by davidllanos22 on 1/9/16.
 */

var x = 0;

wizard({
    width: 160,
    height: 144,
    scale: 3,
    pixelArt: true,
    create: function(){
        this.loadImages("wizard.png", "bw.png");
        //w.loadData("map");
        this.loadSounds("sound01.wav");
    },

    update: function(){
        x+=0.2;
        if(x > 2 & x < 2.5){
            this.playSound(this.sounds["sound01"]);
        }
    },
    render: function(){
        this.clear("#686868");
        this.drawImage(this.images["bw"], x, 100, 64, 64);
    }
}).play();
