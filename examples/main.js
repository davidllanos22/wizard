/**
 * Created by davidllanos22 on 1/9/16.
 */

var x = -16;

wizard({
    width: 160,
    height: 144,
    scale: 3,
    pixelArt: true,
    create: function(){
        this.loadImages("wizard.png", "bw.png");
        this.loadSounds("sound01.wav");
        this.loadData("a.txt");

    },

    update: function(){
        x+=0.2;
        if(x > this.width) x = - 16;
        if(x > 0 & x < 0.2){
            console.log(WIZARD.data["a"]);
            this.playSound("sound01");
        }
    },
    render: function(){
        this.clear("#686868");
        this.drawImage("bw", x, 72, 64, 64);
    }
}).play();
