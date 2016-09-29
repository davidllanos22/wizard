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

                      vec3 color1In = vec3(0, 0, 0);
                      vec3 color2In = vec3(0.4078431373, 0.4078431373, 0.4078431373);
                      vec3 color3In = vec3(0.7176470588, 0.7176470588, 0.7176470588);
                      vec3 color4In = vec3(1, 1, 1);
                      
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
    //wiz.canvas.style.backgroundColor = "black";

    // Get the context of the canvas.
    wiz.ctx = wiz.canvas.getContext("2d");
    wiz.gl = wiz.glCanvas.getContext("webgl");

    var gl = wiz.gl;

    // Web GL init
    wiz.glCanvas.tabIndex = 1;
    wiz.glCanvas.style.outline = "none";

    wiz.glCanvas.width = wiz.width * pixelRatio * wiz.scale;
    wiz.glCanvas.height = wiz.height * pixelRatio * wiz.scale;

    gl.viewport(0, 0, wiz.width * pixelRatio * wiz.scale, wiz.height * pixelRatio * wiz.scale);
    gl.clearColor(0.4078431373, 0.4078431373, 0.4078431373, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    //create the default shader
    var vs = createShader(gl.VERTEX_SHADER, normal_vs);
    var fs = createShader(gl.FRAGMENT_SHADER, normal_fs);

    var shader_stuff = {
        buffers: new Map(),
        locations: new Map(),
        currentProgram: createProgram(vs, fs),
        canvasTexture: createTexture()
    };

    console.log(gl.getShaderInfoLog(vs));
    console.log(gl.getShaderInfoLog(fs));
    console.log(gl.getProgramParameter(shader_stuff.currentProgram, gl.LINK_STATUS));
    console.log(gl.getProgramInfoLog(shader_stuff.currentProgram));

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

    function createShader(type, source){
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    function createProgram(vs, fs){
        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        return program;
    }

    function renderCanvasToWebGL(canvas){
        gl.useProgram(shader_stuff.currentProgram);
        gl.uniform2f(getUniform("u_resolution"), wiz.width, wiz.height);

        gl.bindBuffer(gl.ARRAY_BUFFER, getBuffer("pos"));
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(getAttribute("a_position"));
        gl.vertexAttribPointer(getAttribute("a_position"), 2, gl.FLOAT, false, 0, 0);

        gl.bindTexture(gl.TEXTURE_2D, shader_stuff.canvasTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

        gl.uniform1i(getUniform("u_image"), shader_stuff.canvasTexture);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function getBuffer(){
        if(shader_stuff.buffers.has(name)){
            return shader_stuff.buffers.get(name);
        }
        else{
            shader_stuff.buffers.set(name, gl.createBuffer());
            return getBuffer(name);
        }
    }

    function getUniform(name){
        if(shader_stuff.locations.has(name)){
            return shader_stuff.locations.get(name);
        }
        else{
            gl.useProgram(shader_stuff.currentProgram);
            var a = gl.getUniformLocation(shader_stuff.currentProgram, name);
            shader_stuff.locations.set(name, a);
            return shader_stuff.locations.get(name);
        }
    }

    function getAttribute(name){
        if(shader_stuff.locations.has(name)){
            return shader_stuff.locations.get(name);
        }
        else{
            gl.useProgram(shader_stuff.currentProgram);
            var a = gl.getAttribLocation(shader_stuff.currentProgram, name);
            shader_stuff.locations.set(name, a);
            return shader_stuff.locations.get(name);
        }
    }

    function createTexture(){
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        return texture;
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
