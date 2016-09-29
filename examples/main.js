/**
 * Created by davidllanos22 on 1/9/16.
 */

var w = wizard({
    width: 160,
    height: 144,
    scale: 3,
    pixelArt: true,
    create: function(){
        this.loadImages("wizard.png", "bw.png");
        //w.loadData("map");
        //w.loadSounds("fire", "medikit", "music");
    },
    update: update,
    render: render
});

w.play();

var x = 0;

function update(){
    x+=0.2;
}

function render(){
    w.clear("#686868");
    //w.fillRect(x, 0, 50, 50, "#F00");
    //console.log(w.images["wizard"]);
    w.drawImage(w.images["bw"], x, 100, 64, 64);
}