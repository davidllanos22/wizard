var WIZARD = WIZARD || {};

WIZARD.version = "0.2.0";

WIZARD.core = function(data){
    var wiz = data || {};

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

    // Create audio context
    wiz.actx = new AudioContext();
    visibilitychange();

    document.addEventListener("visibilitychange", visibilitychange);

    function visibilitychange(){
        if(document.hidden){
            wiz.actx.suspend();
        }else{
            wiz.actx.resume();
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

    wiz.currentProgram = WIZARD.shader.create(gl, normal_vs, normal_fs);
    wiz.canvasTexture = WIZARD.shader.createTexture();

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
        gl.useProgram(wiz.currentProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, WIZARD.shader.getBuffer("pos"));
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(WIZARD.shader.getAttribute("a_position"));
        gl.vertexAttribPointer(WIZARD.shader.getAttribute("a_position"), 2, gl.FLOAT, false, 0, 0);

        gl.bindTexture(gl.TEXTURE_2D, wiz.canvasTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

        gl.uniform1i(WIZARD.shader.getUniform("u_image"), wiz.canvasTexture);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    wiz.play = create;
    wiz.ready = ready;

    /** INPUT **/
    WIZARD.input._init(wiz);

    /** LOAD **/
    WIZARD.loader._init(wiz);

    wiz.loadImages = function(){
        WIZARD.loader.loadImages(arguments);
    };

    wiz.noLoading = function(){
        WIZARD.loader.noLoading();
    };

    wiz.loadSounds = function(){
        WIZARD.loader.loadSounds(arguments);
    };

    wiz.loadData = function(){
        WIZARD.loader.loadData(arguments);
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
            "6789!?,.*><:    ";

        for(var i = 0; i < text.length; i++){
            for(var j = 0; j < chars.length; j++){
                var char = text.charAt(i);
                if(chars.charAt(j) == char.toUpperCase()){
                    var xx = j % 16;
                    var yy = Math.floor(j/16);
                    wiz.drawSprite(font, x + (i * 8), y, xx, yy);
                }
            }
        }
    };

    wiz.playSound = function(soundName, loop){
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

WIZARD.input = {
    wiz: null,
    kP: {},
    kJP: {},

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
        }
    },

    noLoading: function(){
        WIZARD.loader.wiz.ready();
    },

    loadImages: function(paths){
        console.log("Loading images...");
        this.totalFilesToLoad += paths.length;
        for (var i = 0; i < paths.length; i++) {
            this._loadFileOfType(paths[i], "image");
        }
    },

    loadSounds: function(paths){
        console.log("Loading sounds...");
        this.totalFilesToLoad += paths.length;
        for (var i = 0; i < paths.length; i++) {
            this._loadFileOfType(paths[i], "sound");
        }
    },

    loadData: function(paths){
        console.log("Loading data...");
        this.totalFilesToLoad += paths.length;
        for (var i = 0; i < paths.length; i++) {
            this._loadFileOfType(paths[i], "data");
        }
    },

    _loadImage: function(path){
        var image = new Image();
        image.onload = function(){
            console.log("Image file loaded: " + path);
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
            WIZARD.loader.wiz.actx.decodeAudioData(req.response, function(audio){
                console.log("Audio file loaded: " + path);
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
                console.log("Data file loaded: " + path);
                var name = path.substr(0, path.lastIndexOf('.'));
                WIZARD.data[name] = req.responseText;
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
    buffers: new Map(),
    locations: new Map(),
    gl: null,
    program: null,
    create: function(gl, vsCode, fsCode){
        this.gl = gl;
        //Create the default shader
        var vs = this._createShader(gl.VERTEX_SHADER, vsCode);
        var fs = this._createShader(gl.FRAGMENT_SHADER, fsCode);
        program = this._createProgram(vs, fs);

        // console.log(gl.getShaderInfoLog(vs));
        // console.log(gl.getShaderInfoLog(fs));
        // console.log(gl.getProgramParameter(program, gl.LINK_STATUS));
        // console.log(gl.getProgramInfoLog(program));
        return program;
    },

    createTexture:function(gl){
        var texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        return texture;
    },

    getBuffer: function(){
        if(this.buffers.has(name)){
            return this.buffers.get(name);
        }
        else{
            this.buffers.set(name, this.gl.createBuffer());
            return this.getBuffer(name);
        }
    },

    getUniform: function(name){
        if(this.locations.has(name)){
            return this.locations.get(name);
        }
        else{
            this.gl.useProgram(program);
            var a = this.gl.getUniformLocation(program, name);
            this.locations.set(name, a);
            return this.locations.get(name);
        }
    },

    getAttribute: function(name){
        if(this.locations.has(name)){
            return this.locations.get(name);
        }
        else{
            this.gl.useProgram(program);
            var a = this.gl.getAttribLocation(program, name);
            this.locations.set(name, a);
            return this.locations.get(name);
        }
    },

    _createShader: function(type, source){
        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        return shader;
    },

    _createProgram: function(vs, fs){
        var program = this.gl.createProgram();
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);
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

WIZARD.state = {
    save: function(key, value){
        if(key == null || value == null){
            console.error("Key or value can't be null.");
            return;
        }
        localStorage.setItem(key, value);
    },

    load: function(key){
        if(key == null){
            console.error("Key can't be null.");
            return;
        }
        return localStorage.getItem(key);
    },

    clear: function(){
        localStorage.clear();
    }
};

WIZARD.sound = {

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
    }
};

WIZARD.scene = {
    current: null,
    scenes: [],
    create: function(name, data){
        this.scenes[name] = data;
    },
    setCurrent: function(name, delay, wiz){
        var scene = this.scenes[name];
        if(this.current != null && this.current.onExit != null){
            scene.onExit(wiz);
        }
        if(delay != null && delay != 0) {

            WIZARD.time.createTimer("sceneTransition", delay, function () {
                if (scene != null && scene != null) {
                    this.current = scene;
                    scene.onEnter(wiz);
                }
            }, 1, true);
        }else{
            this.current = scene;
            scene.onEnter(wiz);
        }
    },
};

WIZARD.entity = {
    _idCount: 0,
    _entities: [],
    create: function(name, data){
        if(this._entities[name]){
            console.error("Entity " + name + "already exists.");
        }
        this._entities[name] = data;
    },
    instantiate: function(name, params){
        var entity = new this._entities[name](params);
        WIZARD.scene.current.entities.push(entity);
        entity.id = this._idCount;
        this._idCount++;
        if(entity._onAdded){
            entity._onAdded();
        }
        //this.sortEntities(list);
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
            console.error("Component " + name + "already exists.");
        }
        this.components[name] = data;
    },
    add: function(name, entity){
        var component = this.components[name];
        if(entity.components[name]){
            console.error("Component " + name + "already added to entity " + entity.name);
        }
        //si ya está en la entidad no añadir.

    },
};

WIZARD.images = {};
WIZARD.sounds = {};
WIZARD.data = {};
WIZARD.timers = {};
WIZARD.animations = {};
WIZARD.spritesheets = {};

window.wizard = WIZARD.core;