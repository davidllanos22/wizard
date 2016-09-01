/**
 * Created by davidllanos22 on 1/9/16.
 */

var w = wizard({
    width: 256,
    height: 256,
    scale: 1,
    pixelArt: false,
    create: create,
    update: update,
    render: render
});

w.play();

function create(){
    //w.loadData("map");
    //w.loadImages("soldier", "tank", "base");
    //w.loadSounds("fire", "medikit", "music");
}

var x = 0;

function update(){
    x++;
}

function render(){
    w.clear("#000");
    w.fillRect(x, 0, 50, 50, "#F00");
}