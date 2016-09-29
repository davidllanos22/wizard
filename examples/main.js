/**
 * Created by davidllanos22 on 1/9/16.
 */

var w = wizard({
    width: 256,
    height: 256,
    scale: 2,
    pixelArt: true,
    create: function(){
        this.loadImages("wizard.png");
        //w.loadData("map");
        //w.loadSounds("fire", "medikit", "music");
    },
    update: update,
    render: render
});

w.play();

var x = 0;

function update(){
    x++;
}

function render(){
    w.clear("#000");
    //w.fillRect(x, 0, 50, 50, "#F00");
    //console.log(w.images["wizard"]);
    w.drawImage(w.images["wizard"], 100, 100, 64, 64);
}