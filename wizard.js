/*
* - AudioContext not working on ios
* */

var WIZARD = WIZARD || {};

WIZARD.version = "0.6.2";

WIZARD.core = function(data){
    var wiz = data || {};

    if(!wiz.fillScreen && (!wiz.width || !wiz.height)){
        WIZARD.console.error("Width and Height required.");
        return;
    }

    wiz.scale = wiz.scale || 1;

    var pixelRatio = 1;

    var normal_vs = `attribute vec2 a_position;
                    uniform sampler2D u_image;
                    varying vec2 f_texcoord;
                     
                    void main(void){
                      vec2 zeroToOne = a_position;
                      vec2 zeroToTwo = zeroToOne * 2.0;
                      vec2 clipSpace = zeroToTwo - 1.0;
                      gl_Position = vec4(clipSpace * vec2(1, -1), 0.0, 1.0);
                      f_texcoord = (clipSpace + 1.0) / 2.0;
                    }
                  `;

    var normal_fs = `precision mediump float;
                    uniform sampler2D u_image;
                    varying vec2 f_texcoord;
                    
                    void main(void){
                      gl_FragColor = texture2D(u_image, f_texcoord);
                     }
                  `;

    // Create the canvas element.
    wiz.canvas = document.createElement("canvas");
    wiz.glCanvas = document.createElement("canvas");
    wiz.canvas.width = wiz.width * pixelRatio * wiz.scale;
    wiz.canvas.height = wiz.height * pixelRatio * wiz.scale;

    // Get the context of the canvas.
    wiz.ctx = wiz.canvas.getContext("2d");
    wiz.gl = wiz.glCanvas.getContext("webgl");

    // Disable context menu when right click is pressed
    wiz.canvas.oncontextmenu = function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    wiz.glCanvas.oncontextmenu = function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    //Create audio context
    try {
        wiz.actx = new AudioContext();
        visibilitychange();

        document.addEventListener("visibilitychange", visibilitychange);
        function visibilitychange() {
            if (document.hidden) {
                wiz.actx.suspend();
            } else {
                wiz.actx.resume();
            }
        }
    }catch(e){
        WIZARD.console.warn("AudioContext not available.");
    }

    window.addEventListener('resize', resize, true);

    function resize(){
        if(wiz.fillScreen) {
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;

            if(!wiz.initialScale) {
                wiz.initialWidth = wiz.width;
                wiz.initialHeight = wiz.height;
                wiz.initialScale = wiz.scale || 1;
            }

            var finalWidth, finalHeight, finalScale, ratioW, ratioH;

            if(wiz.initialWidth && !wiz.initialHeight){
                ratioW = windowWidth / wiz.initialWidth;
                finalWidth = wiz.initialWidth;
                finalHeight = windowHeight / ratioW;
                finalScale = ratioW;
            }else if(!wiz.initialWidth && wiz.initialHeight){
                ratioH = windowHeight / wiz.initialHeight;
                finalWidth = windowWidth / ratioH;
                finalHeight = wiz.initialHeight;
                finalScale = ratioH;
            }else if(!wiz.initialWidth && !wiz.initialHeight){
                finalWidth = windowWidth / wiz.initialScale;
                finalHeight = windowHeight / wiz.initialScale;
                finalScale = wiz.initialScale;
            }else if(wiz.initialWidth && wiz.initialHeight){
                ratioW = windowWidth / wiz.initialWidth;
                finalWidth = wiz.initialWidth;
                finalHeight = wiz.initialHeight;
                finalScale = ratioW;
            }

            wiz.width = finalWidth;
            wiz.height = finalHeight;
            wiz.scale = finalScale;

            var w = Math.min(wiz.width * pixelRatio * wiz.scale, windowWidth);
            var h = Math.min(wiz.height * pixelRatio * wiz.scale, windowHeight);

            wiz.canvas.width = w;
            wiz.canvas.height = h;

            wiz.glCanvas.width = w;
            wiz.glCanvas.height = h;

            wiz.ctx.scale(wiz.scale, wiz.scale);

            gl.viewport(0, 0, w, h);
        }
    }

    // Init webGL
    var gl = wiz.gl;
    wiz.glCanvas.tabIndex = 1;
    wiz.glCanvas.style.outline = "none";
    wiz.glCanvas.width = wiz.width * pixelRatio * wiz.scale;
    wiz.glCanvas.height = wiz.height * pixelRatio * wiz.scale;

    wiz.ctx.scale(wiz.scale, wiz.scale);

    gl.viewport(0, 0, wiz.width * pixelRatio * wiz.scale, wiz.height * pixelRatio * wiz.scale);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);



    // Add the canvas to the DOM.
    //document.body.appendChild(wiz.canvas);
    document.body.appendChild(wiz.glCanvas);

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
        WIZARD.console.log("WIZARD " + WIZARD.version + " ready to use.");
        resize();
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

        wiz.ctx.save();
        wiz.ctx.translate(-WIZARD.camera.x, -WIZARD.camera.y);
        //wiz.ctx.rotate(WIZARD.camera.rot * Math.PI / 180);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        wiz.render();
        wiz.ctx.restore();

        renderCanvasToWebGL(wiz.canvas);
    }

    // Render the canvas2D to a WebGL canvas
    function renderCanvasToWebGL(canvas){
        var name = WIZARD.shader.current.name;
        gl.useProgram(WIZARD.shader.current.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, WIZARD.shader.getBuffer(name, "pos"));
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(WIZARD.shader.getAttribute(name, "a_position"));
        gl.vertexAttribPointer(WIZARD.shader.getAttribute(name, "a_position"), 2, gl.FLOAT, false, 0, 0);

        gl.bindTexture(gl.TEXTURE_2D, wiz.canvasTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

        gl.uniform1i(WIZARD.shader.getUniform(name, "u_image"), wiz.canvasTexture);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    wiz.play = create;
    wiz.ready = ready;

    WIZARD.input._init(wiz);
    WIZARD.loader._init(wiz);
    WIZARD.shader._init(wiz);

    WIZARD.shader.create("default", normal_vs, normal_fs);
    WIZARD.shader.setCurrent("default");
    wiz.canvasTexture = WIZARD.shader.createTexture();

    wiz.loadImages = function(){
        WIZARD.loader.loadImages(arguments);
    };

    wiz.skipLoading = function(){
        WIZARD.loader.skipLoading();
    };

    wiz.loadSounds = function(){
        WIZARD.loader.loadSounds(arguments);
    };

    wiz.loadData = function(){
        WIZARD.loader.loadData(arguments);
    };

    wiz.loadBitmapFont = function(){
        WIZARD.loader.loadBitmapFont(arguments);
    };

    /** RENDER **/

    // Clears the screen.
    wiz.clear = function(color){
        wiz.fillRect(WIZARD.camera.x, WIZARD.camera.y, wiz.width, wiz.height, color);
    };

    wiz.fillRect = function(x, y, w, h, color){
        wiz.ctx.fillStyle = color;
        wiz.ctx.fillRect(x, y , w, h);
    };

    wiz.drawAABB = function(body, color){
        wiz.ctx.fillStyle = null;
        wiz.ctx.strokeStyle = color;
        wiz.ctx.lineWidth = 1/wiz.scale;
        wiz.ctx.strokeRect(body.x, body.y , body.w, body.h);
    };

    wiz.drawImage = function(imgName, x, y){
        var img = WIZARD.images[imgName];
        wiz.ctx.drawImage(img, x, y, img.width, img.height);
    };

    wiz.drawSprite = function(spritesheetName, x, y, xx, yy){
        var spritesheet = WIZARD.spritesheets[spritesheetName];
        var img = WIZARD.images[spritesheet.imgName];
        wiz.ctx.drawImage(img, xx * spritesheet.spriteWidth, yy * spritesheet.spriteHeight, spritesheet.spriteWidth, spritesheet.spriteHeight, x, y, spritesheet.spriteWidth, spritesheet.spriteHeight);
    };

    wiz.drawAnimation = function(spritesheetName, animName, x, y){
        var spritesheet = WIZARD.spritesheets[spritesheetName];
        var img = WIZARD.images[spritesheet.imgName];
        var anim = WIZARD.animations[animName];
        if(anim.reset){
            anim.currentFrame = 0;
            anim.reset = false;
        }
        WIZARD.time.createTimer("animation_" + animName, anim.frameDuration, function(){
            anim.currentFrame ++;
            anim.currentFrame %= anim.frames.length;
        }, "infinite");
        var xx = anim.frames[anim.currentFrame][0];
        var yy = anim.frames[anim.currentFrame][1];
        wiz.ctx.drawImage(img, xx * spritesheet.spriteWidth, yy * spritesheet.spriteHeight, spritesheet.spriteWidth, spritesheet.spriteHeight, x, y, spritesheet.spriteWidth, spritesheet.spriteHeight);
    };

    wiz.drawTextSystem = function(font, text, x, y, color){
        wiz.ctx.fillStyle = color;
        wiz.ctx.font = font;
        wiz.ctx.fillText(text, x, y);
    };

    wiz.drawText = function(text, x, y, font){
        var chars = "ABCDEFGHIJKLMNOP"+
            "QRSTUVWXYZ012345"+
            "6789!?,.*><:%   ";

        for(var i = 0; i < text.length; i++){
            for(var j = 0; j < chars.length; j++){
                var char = text.charAt(i);
                if(chars.charAt(j) == char.toUpperCase()){
                    var spritesheet = WIZARD.spritesheets[font];
                    var img = WIZARD.images[spritesheet.imgName];
                    var spriteWidth = spritesheet.spriteWidth;
                    var numSprites = img.width / spriteWidth;
                    var xx = j % numSprites;
                    var yy = Math.floor(j/numSprites);
                    wiz.drawSprite(font, x + (i * spriteWidth), y, xx, yy);
                }
            }
        }
    };

    wiz.drawBitmapText = function(text, x, y, fontName){
        var fontData = WIZARD.bitmapFonts[fontName];
        var fontImage = WIZARD.images[fontName];

        var xAcum = x;
        var yAcum = y;

        for(var i = 0; i < text.length; i++) {
            var id = text.charCodeAt(i);
            if(id == 10){
                xAcum = x;
                yAcum += fontData.lineHeight;
                continue;
            }
            var spriteX = fontData.chars.get(id).x;
            var spriteY = fontData.chars.get(id).y;
            var spriteW = fontData.chars.get(id).width;
            var spriteH = fontData.chars.get(id).height;
            var xOffset = fontData.chars.get(id).xOffset;
            var yOffset = fontData.chars.get(id).yOffset;
            var xAdvance = fontData.chars.get(id).xAdvance;

            wiz.ctx.drawImage(fontImage, spriteX, spriteY, spriteW, spriteH, xAcum + xOffset, yAcum + yOffset, spriteW, spriteH);
            xAcum += xAdvance;

            //y += spriteH + yOffset;
        }
    };

    wiz.playSound = function(soundName, loop){
        if(!wiz.actx) return;
        var sound = WIZARD.sounds[soundName];
        var source = wiz.actx.createBufferSource();
        source.buffer = sound;
        source.loop = loop;
        source.connect(wiz.actx.destination);
        source.start(0);
    };

    return wiz;
};

WIZARD.physics = {
    createAABB: function(x, y, w, h){
        return {
            x: x,
            y: y,
            w: w,
            h: h
        }
    },

    intersects: function(a, b){
        return (a!= null && b != null) && (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y );
    }
};

WIZARD.keys = {
    A: "A".charCodeAt(0),
    B: "B".charCodeAt(0),
    C: "C".charCodeAt(0),
    D: "D".charCodeAt(0),
    E: "E".charCodeAt(0),
    F: "F".charCodeAt(0),
    G: "G".charCodeAt(0),
    H: "H".charCodeAt(0),
    I: "I".charCodeAt(0),
    J: "J".charCodeAt(0),
    K: "K".charCodeAt(0),
    L: "L".charCodeAt(0),
    M: "M".charCodeAt(0),
    N: "N".charCodeAt(0),
    O: "O".charCodeAt(0),
    P: "P".charCodeAt(0),
    Q: "Q".charCodeAt(0),
    R: "R".charCodeAt(0),
    S: "S".charCodeAt(0),
    T: "T".charCodeAt(0),
    U: "U".charCodeAt(0),
    V: "V".charCodeAt(0),
    W: "W".charCodeAt(0),
    X: "X".charCodeAt(0),
    Y: "Y".charCodeAt(0),
    Z: "Z".charCodeAt(0),
    ZERO: "0".charCodeAt(0),
    ONE: "1".charCodeAt(0),
    TWO: "2".charCodeAt(0),
    THREE: "3".charCodeAt(0),
    FOUR: "4".charCodeAt(0),
    FIVE: "5".charCodeAt(0),
    SIX: "6".charCodeAt(0),
    SEVEN: "7".charCodeAt(0),
    EIGHT: "8".charCodeAt(0),
    NINE: "9".charCodeAt(0),
    NUMPAD_0: 96,
    NUMPAD_1: 97,
    NUMPAD_2: 98,
    NUMPAD_3: 99,
    NUMPAD_4: 100,
    NUMPAD_5: 101,
    NUMPAD_6: 102,
    NUMPAD_7: 103,
    NUMPAD_8: 104,
    NUMPAD_9: 105,
    NUMPAD_MULTIPLY: 106,
    NUMPAD_ADD: 107,
    NUMPAD_ENTER: 108,
    NUMPAD_SUBTRACT: 109,
    NUMPAD_DECIMAL: 110,
    NUMPAD_DIVIDE: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    F13: 124,
    F14: 125,
    F15: 126,
    COLON: 186,
    EQUALS: 187,
    COMMA: 188,
    UNDERSCORE: 189,
    PERIOD: 190,
    QUESTION_MARK: 191,
    TILDE: 192,
    OPEN_BRACKET: 219,
    BACKWARD_SLASH: 220,
    CLOSED_BRACKET: 221,
    QUOTES: 222,
    BACKSPACE: 8,
    TAB: 9,
    CLEAR: 12,
    ENTER: 13,
    SHIFT: 16,
    CONTROL: 17,
    ALT: 18,
    CAPS_LOCK: 20,
    ESC: 27,
    SPACEBAR: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    PLUS: 43,
    MINUS: 44,
    INSERT: 45,
    DELETE: 46,
    HELP: 47,
    NUM_LOCK: 144
};

WIZARD.gamepad = {
    BUTTON_0: 0,
    BUTTON_1: 1,
    BUTTON_2: 2,
    BUTTON_3: 3,
    BUTTON_4: 4,
    BUTTON_5: 5,
    BUTTON_6: 6,
    BUTTON_7: 7,
    BUTTON_8: 8,
    BUTTON_9: 9,
    UP: 10,
    DOWN: 11,
    LEFT: 12,
    RIGHT: 13
};

WIZARD.input = {
    wiz: null,
    kP: {},
    kJP: {},
    mP:{},
    mJP: {},
    mR: {},
    x: 0,
    y: 0,
    _gamepadsLastState: null,
    _init: function(wiz){
        this.wiz = wiz;
        window.onkeydown = function(e){
            if(e.keyCode == 32 || e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40){
                e.preventDefault();
            }
            WIZARD.input.kP[e.keyCode] = true;
            if(WIZARD.input.kJP[e.keyCode] != 0)WIZARD.input.kJP[e.keyCode] = true;
        };

        window.onkeyup = function(e){
            delete WIZARD.input.kP[e.keyCode];
            delete WIZARD.input.kJP[e.keyCode];
        };

        wiz.glCanvas.onmousemove = function(e){
            WIZARD.input.x = e.x;
            WIZARD.input.y = e.y;
        };

        wiz.glCanvas.onmousedown = function(e){
            WIZARD.input.mP[e.button] = true;
            if(WIZARD.input.mJP[e.button] != 0)WIZARD.input.mJP[e.button] = true;
        };

        wiz.glCanvas.onmouseup = function(e){
            delete WIZARD.input.mP[e.button];
            delete WIZARD.input.mJP[e.button];
            WIZARD.input.mR[e.button] = true;
        };

        window.addEventListener("touchmove", function(e){
            e.preventDefault();
            WIZARD.input.x = e.changedTouches[0].pageX;
            WIZARD.input.y = e.changedTouches[0].pageY;
        }, false);

        window.addEventListener("touchstart", function(e){
            WIZARD.input.mP[0] = true;
            if(WIZARD.input.mJP[0] != 0)WIZARD.input.mJP[0] = true;
        }, false);

        window.addEventListener("touchend", function(e){
            delete WIZARD.input.mP[0];
            delete WIZARD.input.mJP[0];
            WIZARD.input.mR[0] = true;
            WIZARD.input.x = 0;
            WIZARD.input.y = 0;
        }, false);
    },

    keyPressed: function(key){
        return this.kP[key];
    },

    keyJustPressed: function(key){
        if(this.kJP[key]){
            this.kJP[key] = 0;
            return true;
        }else{
            return false;
        }
    },

    mousePressed: function(button){
        return this.mP[button];
    },

    mouseJustPressed: function(button){
        if(this.mJP[button]){
            this.mJP[button] = 0;
            return true;
        }else{
            return false;
        }
    },
    mouseJustReleased: function(button){
        if(this.mR[button]){
            this.mR[button] = 0;
            return true;
        }else{
            return false;
        }
    },

    _getGamepads: function(){
        try {
            if (navigator.getGamepads) return navigator.getGamepads();
            if (navigator.webkitGetGamepads)return navigator.webkitGetGamepads();
            if (navigator.webkitGamepads) return navigator.webkitGamepads();
        }catch(e){
            WIZARD.console.error("Gamepad not supported.");
        }
    },

    _gamepadPressed: function(gamepads, index, button){
        var pressed = false;
        if(!gamepads || gamepads.length == 0) return false;

        var current = gamepads[index];
        if(!current) return false;

        var deadZone = 0.25;

        if(button >= 10){
            if(button == WIZARD.gamepad.UP){
                pressed = current.axes[1] < -deadZone || current.axes[5] < -deadZone;
            }
            else if(button == WIZARD.gamepad.DOWN){
                pressed = current.axes[1] > deadZone || current.axes[5] > deadZone;
            }
            else if(button == WIZARD.gamepad.LEFT){
                pressed = current.axes[0] < -deadZone || current.axes[4] < -deadZone;
            }
            else if(button == WIZARD.gamepad.RIGHT){
                pressed = current.axes[0] > deadZone || current.axes[4] > deadZone;
            }
        }else{
            pressed = current.buttons[button].pressed;
        }
        return pressed;
    },

    _createGamepadLastState: function(){
        var gamepads = this._getGamepads();
        var lastState = [];
        for(var i = 0; i < gamepads.length; i++){
            var gamepad = [];
            for(var j = 0; j <= 13; j++){
                var state = this._gamepadPressed(gamepads, i, j);
                gamepad.push(state);
            }
            lastState.push(gamepad);
        }
        return lastState;
    },

    _checkGamepadLastState: function(index, button){
        if(!this._gamepadsLastState ) return false;
        var gamepad = this._gamepadsLastState[index];
        var state = gamepad && gamepad[button];
        return state;
    },

    gamepadPressed: function(index, button){
        var gamepads = this._getGamepads();
        if(!gamepads) return;
        return this._gamepadPressed(gamepads, index, button);
    },

    gamepadJustPressed: function(index, button){
        var gamepads = this._getGamepads();
        if(!gamepads) return;
        var pressed = this._gamepadPressed(gamepads, index, button);
        var pressedLastState = this._checkGamepadLastState(index, button);

        this._gamepadsLastState = this._createGamepadLastState();

        return !pressedLastState && pressed;
    }
};

WIZARD.loader = {
    totalFilesToLoad: 0,
    wiz: null,

    _init: function(wiz){
        this.wiz = wiz;
    },

    _loadFileOfType: function(path, type){
        if(type == "image"){
            this._loadImage(path);
        }else if(type == "sound"){
            this._loadSound(path);
        }else if(type == "data"){
            this._loadData(path);
        }else if(type == "bitmapFont"){
            this._loadBitmapFont(path);
        }
    },

    skipLoading: function(){
        WIZARD.loader.wiz.ready();
    },

    loadImages: function(paths){
        WIZARD.console.log("Loading images...");
        this.totalFilesToLoad += paths.length;
        for (var i = 0; i < paths.length; i++) {
            this._loadFileOfType(paths[i], "image");
        }
    },

    loadBitmapFont: function(paths){
        WIZARD.console.log("Loading fonts...");
        this.totalFilesToLoad += paths.length;
        for (var i = 0; i < paths.length; i++) {
            this._loadFileOfType(paths[i], "bitmapFont");
        }
    },

    loadSounds: function(paths){
        WIZARD.console.log("Loading sounds...");
        this.totalFilesToLoad += paths.length;
        for (var i = 0; i < paths.length; i++) {
            this._loadFileOfType(paths[i], "sound");
        }
    },

    loadData: function(paths){
        WIZARD.console.log("Loading data...");
        this.totalFilesToLoad += paths.length;
        for (var i = 0; i < paths.length; i++) {
            this._loadFileOfType(paths[i], "data");
        }
    },

    _loadImage: function(path){
        var image = new Image();
        image.onload = function(){
            WIZARD.console.log("Image file loaded: " + path);
            var name = path.substr(0, path.lastIndexOf('.'));
            WIZARD.images[name] = image;
            WIZARD.loader.totalFilesToLoad--;
            if(WIZARD.loader.totalFilesToLoad == 0){
                WIZARD.loader.wiz.ready();
            }
        };
        image.src = WIZARD.paths.images + path;
    },

    _loadSound: function(path){
        var req = new XMLHttpRequest();
        req.open("GET",  WIZARD.paths.sounds + path, true);
        req.responseType = 'arraybuffer';

        req.onload = function(){
            if(!WIZARD.loader.wiz.actx){
                WIZARD.loader.totalFilesToLoad--;
                if(WIZARD.loader.totalFilesToLoad == 0){
                    WIZARD.loader.wiz.ready();
                }
                return;
            }
            WIZARD.loader.wiz.actx.decodeAudioData(req.response, function(audio){
                WIZARD.console.log("Audio file loaded: " + path);
                var name = path.substr(0, path.lastIndexOf('.'));
                WIZARD.sounds[name] = audio;
                WIZARD.loader.totalFilesToLoad--;
                if(WIZARD.loader.totalFilesToLoad == 0){
                    WIZARD.loader.wiz.ready();
                }
            }, null);
        };
        req.send();
    },

    _loadData: function(path){
        var req = new XMLHttpRequest();
        req.open("GET",  WIZARD.paths.data + path, true);

        req.onreadystatechange = function(){
            if (req.readyState == 4) {
                WIZARD.console.log("Data file loaded: " + path);
                var name = path.substr(0, path.lastIndexOf('.'));
                WIZARD.data[name] = req.responseText;
                WIZARD.loader.totalFilesToLoad--;
                if(WIZARD.loader.totalFilesToLoad == 0){
                    WIZARD.loader.wiz.ready();
                }
            }
        };
        req.send();
    },

    _loadBitmapFont: function(path){
        var req = new XMLHttpRequest();
        req.open("GET",  WIZARD.paths.data + path, true);

        req.onreadystatechange = function(){
            if (req.readyState == 4) {
                WIZARD.console.log("Font file loaded: " + path);
                var name = path.substr(0, path.lastIndexOf('.'));

                if (window.DOMParser){
                    var parser = new DOMParser();
                    var xmlDoc = parser.parseFromString(req.responseText, "text/xml");

                    var chars = xmlDoc.getElementsByTagName("chars")[0];
                    var count = chars.getAttribute("count");

                    WIZARD.bitmapFonts[name] = {};
                    WIZARD.bitmapFonts[name].chars = new Map();
                    WIZARD.bitmapFonts[name].lineHeight = parseInt(xmlDoc.getElementsByTagName("common")[0].getAttribute("lineHeight"));

                    for(var i = 0; i < count; i++){
                        var char = chars.getElementsByTagName("char")[i];
                        var id = parseInt(char.getAttribute("id"));

                        var o = {
                            id: id,
                            x: parseInt(char.getAttribute("x")),
                            y: parseInt(char.getAttribute("y")),
                            width: parseInt(char.getAttribute("width")),
                            height: parseInt(char.getAttribute("height")),
                            xOffset: parseInt(char.getAttribute("xoffset")),
                            yOffset: parseInt(char.getAttribute("yoffset")),
                            xAdvance: parseInt(char.getAttribute("xadvance"))
                        };

                        WIZARD.bitmapFonts[name].chars.set(id, o);
                    }
                }

                WIZARD.loader.totalFilesToLoad--;
                if(WIZARD.loader.totalFilesToLoad == 0){
                    WIZARD.loader.wiz.ready();
                }
            }
        };
        req.send();
    }

};

WIZARD.shader = {
    shaders: new Map(),
    gl: null,
    current: null,

    _init: function(wiz){
        this.gl = wiz.gl;

    },
    create: function(name, vsCode, fsCode){
        var vs = this._createShader(this.gl.VERTEX_SHADER, vsCode);
        var fs = this._createShader(this.gl.FRAGMENT_SHADER, fsCode);

        var program = this._createProgram(vs, fs);

        var shader = {
            name: name,
            program: program,
            buffers: new Map(),
            locations: new Map()
        };

        this.shaders.set(name, shader);

        // console.log(gl.getShaderInfoLog(vs));
        // console.log(gl.getShaderInfoLog(fs));
        // console.log(gl.getProgramParameter(program, gl.LINK_STATUS));
        // console.log(gl.getProgramInfoLog(program));
        return shader;
    },

    setCurrent: function(name){
        this.current = this.shaders.get(name);
    },

    createTexture:function(){
        var gl = this.gl;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
    },

    getBuffer: function(shaderName, bufferName){
        var shader = this.shaders.get(shaderName);
        if(shader.buffers.has(bufferName)){
            return shader.buffers.get(bufferName);
        }
        else{
            shader.buffers.set(bufferName, this.gl.createBuffer());
            return this.getBuffer(shaderName, bufferName);
        }
    },

    getUniform: function(shaderName, uniformName){
        var shader = this.shaders.get(shaderName);
        if(shader.locations.has(uniformName)){
            return shader.locations.get(uniformName);
        }
        else{
            this.gl.useProgram(shader.program);
            var a = this.gl.getUniformLocation(shader.program, uniformName);
            shader.locations.set(uniformName, a);
            return shader.locations.get(uniformName);
        }
    },

    getAttribute: function(shaderName, attributeName){
        var shader = this.shaders.get(shaderName);
        if(shader.locations.has(attributeName)){
            return shader.locations.get(attributeName);
        }
        else{
            this.gl.useProgram(shader.program);
            var a = this.gl.getAttribLocation(shader.program, attributeName);
            shader.locations.set(attributeName, a);
            return shader.locations.get(attributeName);
        }
    },

    _createShader: function(type, source){
        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        var error = this.gl.getShaderInfoLog(shader);
        if (error.length > 0) {
            throw error;
        }
        return shader;
    },

    _createProgram: function(vs, fs){
        var program = this.gl.createProgram();
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);
        var error = this.gl.getProgramInfoLog(program);
        if (error.length > 0) {
            throw error;
        }
        return program;
    }
};

WIZARD.time = {
    getCurrent: function(){
        return new Date();
    },

    createTimer: function(name, time, callback, numRepetitions, recreate){
        var timer = WIZARD.timers[name];
        if(timer == null || recreate) {
            WIZARD.timers[name] = {
                time: time,
                callback: callback,
                numRepetitions: numRepetitions,
                stop: false,
            };
            WIZARD.time._callTimer(name);
        }
    },

    removeTimer: function(name){
        var timer = WIZARD.timers[name];
        clearTimeout(timer.timeout);
    },

    _callTimer: function(name){
        var timer = WIZARD.timers[name];
        timer.timeout = setTimeout(function () {
            timer.callback();
            if(!timer.stop) {
                if (timer.numRepetitions == "infinite") {
                    WIZARD.time._callTimer(name);
                }else if (!isNaN(timer.numRepetitions)) {
                    timer.numRepetitions--;
                    if(timer.numRepetitions > 0)WIZARD.time._callTimer(name);
                }
            }
        }, timer.time);
    }

};

WIZARD.animation = {
    createFrameAnimation: function(name, frames, frameDuration){
        WIZARD.animations[name] = {
            frames: frames,
            frameDuration: frameDuration,
            currentFrame: 0,
            reset: false
        }
    },
    reset: function(name){
        var animation =  WIZARD.animations[name];
        if(animation != null){
            animation.reset = true;
        }
    }
};

WIZARD.spritesheet = {
    create: function(name, spriteWidth, spriteHeight){
        WIZARD.spritesheets[name] = {
            imgName: name,
            spriteWidth: spriteWidth,
            spriteHeight: spriteHeight
        }
    }
};

WIZARD.paths = {
    images: "assets/img/",
    sounds: "assets/sound/",
    data: "assets/data/",
    setImagesPath: function(path){
        this.images = path;
    },
    setSoundsPath: function(path){
        this.sounds = path;
    },
    setDataPath: function(path){
        this.data = path;
    }
}
;

WIZARD.utils = {
    hexToRgb: function(hex){
        var r = (hex & 0xFF0000) >> 16;
        var g = (hex & 0x00FF00) >> 8;
        var b = hex & 0x0000FF;
        return {r: r, g: g, b: b};
    },
    getLanguage: function(){
        return navigator.language || navigator.userLanguage;
    }
};

WIZARD.camera = {
    setPosition: function(x, y){
        this.x = x;
        this.y = y;
    },
    setRotation: function(rot){
        this.rot = rot;
    },
    x: 0,
    y: 0,
    rot: 0
};

WIZARD.math = {
    lerp: function(a, b, t){
        return (a * (1.0 - t)) + (b * t);
    },
    randomBetween: function(min, max){
        return (Math.random() * max) + min;
    },
    angleBetween: function(a, b){
        return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    }
};

WIZARD.scene = {
    current: null,
    scenes: [],
    create: function(name, data){
        this.scenes[name] = data;
        this.scenes[name].name = name;
    },
    setCurrent: function(name, delay, wiz){
        var scene = this.scenes[name];
        if(this.current != null && this.current.onExit != null){
            scene.onExit(wiz);
        }
        if(delay != null && delay != 0) {

            WIZARD.time.createTimer("sceneTransition", delay, function () {
                if (scene != null && scene != null) {
                    WIZARD.scene.current = scene;
                    scene.onEnter(wiz);
                }
            }, 1, true);
        }else{
            WIZARD.scene.current = scene;
            scene.onEnter(wiz);
        }
    },
    updateEntities: function(scene, wiz){
        for(var i = 0; i < scene.entities.length; i++){
            scene.entities[i].update(wiz);
        }
    },
    renderEntitiesAndLayers: function(scene, wiz){
        if(scene.tiles && scene.tiles["layer0"]) {
            for (var i = 0; i < scene.tiles["layer0"].length; i++) {
                scene.tiles["layer0"][i].render(wiz);
            }
        }

        if(scene.tiles && scene.tiles["layer1"]) {
            for (var i = 0; i < scene.tiles["layer1"].length; i++) {
                scene.tiles["layer1"][i].render(wiz);
            }
        }

        WIZARD.entity.sort(scene.entities);
        for(var i = 0; i < scene.entities.length; i++){
            scene.entities[i].render(wiz);
        }

        if(scene.tiles && scene.tiles["layer2"]) {
            for (var i = 0; i < scene.tiles["layer2"].length; i++) {
                scene.tiles["layer2"][i].render(wiz);
            }
        }
    }
};

WIZARD.entity = {
    _idCount: 0,
    _entities: [],
    create: function(entityName, data){
        if(this._entities[entityName]){
            WIZARD.console.error("Entity " + entityName + "already exists.");
        }
        this._entities[entityName] = data;
    },
    instantiate: function(entityName, params){
        var list = WIZARD.scene.current.entities;
        return this.instantiateToList(entityName, params, list);
    },
    instantiateToScene: function(entityName, params, sceneName){
        var list = WIZARD.scene.scenes[sceneName].entities;
        return this.instantiateToList(entityName, params, list);
    },

    instantiateToList: function(entityName, params, list){
        var entity = new this._entities[entityName](params);
        list.push(entity);
        entity.name = entityName;
        entity.id = this._idCount;
        this._idCount++;
        if(entity._onAdded){
            entity._onAdded();
        }
        return entity;
    },

    sort: function(list){
        list.sort(function(a, b){
            var aa = Math.floor(a.y);
            var bb = Math.floor(b.y);
            if(aa == bb){
                aa = Math.floor(a.x);
                bb = Math.floor(b.x);
            }
            return aa - bb;
        });
    },

    remove: function(entity, list){
        var index = -1;
        for(var i = 0; i < list.length; i++){
            if(list[i].id == entity){
                index = i;
                break;
            }
        }
        if(index != -1)list.splice(index, 1);
    },
};

WIZARD.component = {
    components: [],
    create: function(name, data){
        if(this.components[name]){
            WIZARD.console.error("Component " + name + "already exists.");
        }
        this.components[name] = data;
    },
    add: function(name, entity){
        var component = this.components[name];
        if(entity.components[name]){
            WIZARD.console.error("Component " + name + "already added to entity " + entity.name);
        }
        //si ya está en la entidad no añadir.

    },
};

WIZARD.progress = {
    data: {},
    load: function(name){
        var progress = JSON.parse(this._loadKey(name));
        if(progress != null){
            WIZARD.console.log("State loaded.");
            this.data = progress;
            return true;
        }
        return false;
    },

    save: function(name){
        WIZARD.console.log("State saved.");
        this._saveKey(name, JSON.stringify(this.data));
    },

    _clear: function(){
        localStorage.clear();
    },
    _saveKey: function(key, value){
        if(key == null || value == null){
            WIZARD.console.error("Key or value can't be null.");
            return;
        }
        localStorage.setItem(key, value);
    },

    _loadKey: function(key){
        if(key == null){
            WIZARD.console.error("Key can't be null.");
            return;
        }
        return localStorage.getItem(key);
    }
};

WIZARD.map = {
    maps: [],
    create: function(mapName, mapData){
        if(this.maps[mapName]){
            WIZARD.console.error("Map " + mapName + "already exists.");
        }
        this.maps[mapName] = mapData;
    },
    loadToScene: function(mapName, sceneName, loader){
        var map = this.maps[mapName];

        for(var layer = 0; layer < map.layers.length; layer++){
            var width =  map.layers[layer].mapWidth;

            for(var j = 0; j < map.layers[layer].data.length; j++){
                var x = Math.floor(j % width);
                var y = Math.floor(j / width);
                var id = map.layers[layer].data[j] - 1;

                var w = map.layers[layer].spriteSheetWidth;
                var xx = Math.floor(id % w);
                var yy = Math.floor(id / w);

                if(loader){
                    loader(id, x, y, xx, yy, layer, sceneName);
                }
            }
        }
    }
};

WIZARD.console = {
    _print: function(message, mode){

        var color = "#FFF";
        var header = "[WIZARD]: ";

        if(mode == "error"){
            color = "#ff4755";
            header = "[WIZARD - ERROR]: "
        }
        if(mode == "log"){
            color = "#00e8ac";
            header = "[WIZARD - LOG]: "
        }
        if(mode == "warn"){
            color = "#ffbc5b";
            header = "[WIZARD - WARN]: "
        }
        console.log("%c" + header + message, "background: #222; color:" + color + ";");
    },
    error: function(message){
        this._print(message, "error");
    },
    log: function(message){
        this._print(message, "log");
    },

    warn: function(message){
        this._print(message, "warn");
    }

};

WIZARD.images = {};
WIZARD.sounds = {};
WIZARD.data = {};
WIZARD.bitmapFonts = {};
WIZARD.timers = {};
WIZARD.animations = {};
WIZARD.spritesheets = {};

window.wizard = WIZARD.core;