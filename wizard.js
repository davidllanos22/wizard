/**
 * Created by davidllanos22 on 1/9/16.
 */

var WIZARD = WIZARD || {};

WIZARD.version = "0.0.0";

WIZARD.create = function(data){
    var wiz = data || {};

    var pixelRatio = window.devicePixelRatio;

    // Create the canvas element.
    wiz.canvas = document.createElement("canvas");
    wiz.canvas.width = wiz.width * pixelRatio * wiz.scale;
    wiz.canvas.height = wiz.height * pixelRatio * wiz.scale;
    //wiz.canvas.style.backgroundColor = "black";

    // Add the canvas to the DOM.
    document.body.appendChild(wiz.canvas);

    // Get the context of the canvas.
    wiz.ctx = wiz.canvas.getContext("2d");

    // Game loop.
    var desiredFPS = 60;
    var dt = 0;
    var step = 10 / desiredFPS;
    var lastLoop = new Date();
    var start = new Date().getTime();

    function loop(){
        var now = new Date().getTime();
        var elapsed = now - start;

        var thisLoop = new Date();
        wiz.fps = 1000 / (thisLoop - lastLoop) | 0;
        lastLoop = thisLoop;

        dt += Math.min(1, (elapsed) / 1000);

        while(dt > step){
            dt -= step;
            update();
        }

        render();

        window.requestAnimationFrame(loop);
    }

    function create(){
        wiz.create();
    }

    function update(){
        wiz.update();
    }

    function render(){
        wiz.ctx.imageSmoothingEnabled = !wiz.pixelart;
        wiz.ctx.mozImageSmoothingEnabled = !wiz.pixelart;
        wiz.ctx.msImageSmoothingEnabled = !wiz.pixelart;
        wiz.render();
    }

    wiz.play = loop;

    // Render functions.

    wiz.clear = function(color){
        wiz.fillRect(0, 0 , wiz.width * pixelRatio * wiz.scale, wiz.height * pixelRatio *  wiz.scale, color);
    };

    wiz.fillRect = function(x, y, w, h, color){
        wiz.ctx.fillStyle = color;
        wiz.ctx.fillRect(x, y , w, h);
    };

    return wiz;
};

window.wizard = WIZARD.create;
