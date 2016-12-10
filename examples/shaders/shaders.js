var basic_vs = `attribute vec2 a_position;
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

var bw_fs = `precision mediump float;
                    uniform sampler2D u_image;
                    varying vec2 f_texcoord;
                    
                    void main(void){
                        vec4 color = texture2D(u_image, f_texcoord);
                        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                        gl_FragColor = vec4(vec3(gray), color.a);
                     }
                  `;

var sepia_fs = `precision mediump float;
                    uniform sampler2D u_image;
                    varying vec2 f_texcoord;
                    
                    void main(void){
                        vec4 color = texture2D(u_image, f_texcoord);
                        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                        vec3 SEPIA = vec3(1.2, 1.0, 0.8); 
                        gl_FragColor = vec4(vec3(gray) * SEPIA, color.a);
                        //gl_FragColor = vec4( vec3(dot( Color.rgb, lum)), Color.a);
                     }
                  `;

var count = 0;
var shaders = ["default", "blackAndWhite", "sepia"];

wizard({
    width: 272,
    height: 176,
    scale: 2,
    pixelArt: true,
    create: function(){
        WIZARD.paths.setImagesPath("../assets/img/");
        WIZARD.paths.setSoundsPath("../assets/sound/");
        WIZARD.paths.setDataPath("../assets/data/");

        this.loadImages("wizard.png", "font.png");

        WIZARD.spritesheet.create("font", 8, 8);

        WIZARD.spritesheet.create("wizard", 32, 32);

        WIZARD.shader.create("blackAndWhite", basic_vs, bw_fs);
        WIZARD.shader.create("sepia", basic_vs, sepia_fs);

        WIZARD.animation.createFrameAnimation("wizard_idle", [[0,0], [1,0], [2,0]], 200);

    },

    update: function(){
        if(WIZARD.input.keyJustPressed(WIZARD.keys.SPACEBAR)){
            count++;
            if(count >= shaders.length) count = 0;
            WIZARD.shader.setCurrent(shaders[count]);
        }
    },
    render: function(){
        this.clear("#686868");
        this.drawAnimation("wizard", "wizard_idle", this.width / 2 - 16, this.height / 2 - 16);

        this.drawText("Press space to toggle shaders!", 16, 16, "font");

        var text = "Current shader: " + shaders[count];
        this.drawText(text, this.width / 2 - (text.length * 8) / 2, 32, "font");
    }
}).play();
