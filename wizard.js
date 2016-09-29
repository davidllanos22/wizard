/**
 * Created by davidllanos22 on 1/9/16.
 */

var WIZARD = WIZARD || {};

WIZARD.version = "0.0.0";

WIZARD.create = function(data){
    var wiz = data || {};

    /** CORE **/

    var pixelRatio = 1;//window.devicePixelRatio;

    var totalImagesToLoad = 0;

    // Create the canvas element.
    wiz.canvas = document.createElement("canvas");
    wiz.canvas.width = wiz.width * pixelRatio * wiz.scale;
    wiz.canvas.height = wiz.height * pixelRatio * wiz.scale;
    wiz.canvas.style.pixelated = true;
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

    // Load assets before the main loader.
    function preload(){
        wiz.preload();
    }

    // Load assets in the main loader.
    function create(){
        wiz.create();
    }

    // Called when assets are ready.
    function ready(){
        loop();
    }

    // Called each frame to update logic.
    function update(){
        wiz.update();
    }

    // Called each frame to update rendering.
    function render(){
        wiz.ctx.imageSmoothingEnabled = !wiz.pixelArt;
        wiz.ctx.mozImageSmoothingEnabled = !wiz.pixelArt;
        wiz.ctx.msImageSmoothingEnabled = !wiz.pixelArt;
        wiz.render();
    }

    wiz.play = create;

    /** LOAD **/
    wiz.images = {};

    wiz.loadImages = function(){
        console.log("Loading images...");
        totalImagesToLoad = arguments.length;
        for (var i = 0; i < arguments.length; i++) {
            loadImage(arguments[i]);
        }
    };

    function loadImage(path){
        var image = new Image();
        image.onload = function(){
            var name = path.substr(0, path.lastIndexOf('.'));
            wiz.images[name] = image;
            totalImagesToLoad--;
            if(totalImagesToLoad == 0){
                ready();
            }
        };
        image.src = WIZARD.paths.images + path;
    }

    /** RENDER **/

    // Clears the screen.
    wiz.clear = function(color){
        wiz.fillRect(0, 0 , wiz.width * pixelRatio * wiz.scale, wiz.height * pixelRatio *  wiz.scale, color);
    };

    wiz.fillRect = function(x, y, w, h, color){
        wiz.ctx.fillStyle = color;
        wiz.ctx.fillRect(x, y , w, h);
    };

    wiz.drawImage = function(img, x, y){
        wiz.ctx.drawImage(img, x, y, img.width * wiz.scale * pixelRatio, img.height * wiz.scale * pixelRatio);
    };

    wiz.drawSprite = function(img, x, y, w, h, xx, yy, ww, hh){
        wiz.ctx.drawImage(img, xx * ww, yy * hh, ww, hh, x, y, w, h);
    };


    return wiz;
};

WIZARD.paths = {
    images: "assets/img/"
};

window.wizard = WIZARD.create;
