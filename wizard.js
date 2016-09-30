/**
 * Created by davidllanos22 on 1/9/16.
 */

/*
* - Spritesheet (pivot??)
* - Input
* - Colision básica
* */

var WIZARD = WIZARD || {};

WIZARD.version = "0.1.0";

WIZARD.core = function(data){
    var wiz = data || {};

    var pixelRatio = 1;

    var normal_vs = `attribute vec2 a_position;
                    uniform sampler2D u_image;
                    varying vec2 f_texcoord;
                    uniform vec2 u_resolution;
                     
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
                    
                    bool colorEqual(vec3 a, vec3 b){
                        vec3 eps = vec3(0.009, 0.009, 0.009);
                        return all(greaterThanEqual(a, b - eps)) && all(lessThanEqual(a, b + eps));
                    }
                    
                    void main(void){
                      vec2 texcoord = f_texcoord;
                      vec3 colorIn = texture2D(u_image, texcoord).rgb;
                      vec3 colorOut = colorIn;

                      vec3 color1In = vec3(0.0, 0.0, 0.0);
                      vec3 color2In = vec3(0.4078431373, 0.4078431373, 0.4078431373);
                      vec3 color3In = vec3(0.7176470588, 0.7176470588, 0.7176470588);
                      vec3 color4In = vec3(1.0, 1.0, 1.0);
                      
                      vec3 color1Out = vec3(0.1254901961, 0.07058823529, 0.01176470588);
                      vec3 color2Out = vec3(0.1254901961, 0.3568627451, 0.3411764706);
                      vec3 color3Out = vec3(0.6745098039, 0.4392156863, 0.4549019608);
                      vec3 color4Out = vec3(0.8431372549, 0.9294117647, 0.8745098039);
                      
                      if(colorEqual(colorIn, color1In)){
                         colorOut = color1Out;
                      }
                      if(colorEqual(colorIn, color2In)){
                         colorOut = color2Out;
                      }
                      if(colorEqual(colorIn, color3In)){
                         colorOut = color3Out;
                      }
                      if(colorEqual(colorIn, color4In)){
                         colorOut = color4Out;
                      }
                      
                      gl_FragColor = vec4(colorOut, 1.0);
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

    // Init webGL
    var gl = wiz.gl;
    wiz.glCanvas.tabIndex = 1;
    wiz.glCanvas.style.outline = "none";
    wiz.glCanvas.width = wiz.width * pixelRatio * wiz.scale;
    wiz.glCanvas.height = wiz.height * pixelRatio * wiz.scale;

    gl.viewport(0, 0, wiz.width * pixelRatio * wiz.scale, wiz.height * pixelRatio * wiz.scale);
    gl.clearColor(0.4078431373, 0.4078431373, 0.4078431373, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    wiz.currentProgram = WIZARD.shader.create(gl, normal_vs, normal_fs);
    wiz.canvasTexture = WIZARD.shader.createTexture();

    // console.log(gl.getShaderInfoLog(vs));
    // console.log(gl.getShaderInfoLog(fs));
    // console.log(gl.getProgramParameter(shader_stuff.currentProgram, gl.LINK_STATUS));
    // console.log(gl.getProgramInfoLog(shader_stuff.currentProgram));

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
        wiz.render();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        renderCanvasToWebGL(wiz.canvas);
    }

    // Render the canvas2D to a WebGL canvas
    function renderCanvasToWebGL(canvas){
        gl.useProgram(wiz.currentProgram);
        gl.uniform2f(WIZARD.shader.getUniform("u_resolution"), wiz.width, wiz.height);

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

    /** LOAD **/
    WIZARD.loader._init(wiz);

    wiz.loadImages = function(){
        WIZARD.loader.loadImages(arguments);
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
        wiz.fillRect(0, 0 , wiz.width * pixelRatio * wiz.scale, wiz.height * pixelRatio *  wiz.scale, color);
    };

    wiz.fillRect = function(x, y, w, h, color){
        wiz.ctx.fillStyle = color;
        wiz.ctx.fillRect(x, y , w, h);
    };

    wiz.drawImage = function(imgName, x, y){
        var img = WIZARD.images[imgName];
        wiz.ctx.drawImage(img, x, y, img.width * wiz.scale * pixelRatio, img.height * wiz.scale * pixelRatio);
    };

    wiz.drawSprite = function(imgName, x, y, w, h, xx, yy, ww, hh){
        var img = WIZARD.images[imgName];
        wiz.ctx.drawImage(img, xx * ww, yy * hh, ww, hh, x, y, w, h);
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

WIZARD.paths = {
    images: "assets/img/",
    sounds: "assets/sound/",
    data: "assets/data/"
};

WIZARD.images = {};
WIZARD.sounds = {};
WIZARD.data = {};

window.wizard = WIZARD.core;