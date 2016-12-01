var body = WIZARD.physics.createAABB(32, 48, 32, 32);
var body2 = WIZARD.physics.createAABB(160 - 64, 48, 32, 32);

var speed = 0.2;

wizard({
    width: 160,
    height: 144,
    scale: 3,
    pixelArt: true,
    create: function(){
        WIZARD.paths.setImagesPath("../assets/img/");
        WIZARD.paths.setSoundsPath("../assets/sound/");
        WIZARD.paths.setDataPath("../assets/data/");

        this.loadImages("wizard.png", "bw.png", "spritesheet.png", "font.png");
        this.loadSounds("sound01.wav");
        this.loadData("a.txt");

        WIZARD.spritesheet.create("font", 8, 8);

        WIZARD.spritesheet.create("spritesheet", 32, 32);

        WIZARD.animation.createFrameAnimation("wizard_idle", [[0,0], [1,0], [2,0]], 200);
    },

    update: function(){
        if(body.x > this.width) body.x = - 16;
        else if(body.x < - 16) body.x = this.width;
        if(body.y > this.height) body.y = - 16;
        else if(body.y < - 16) body.y = this.height;

        if(WIZARD.input.keyPressed(WIZARD.keys.LEFT)){
            body.x -= speed;
        }else if(WIZARD.input.keyPressed(WIZARD.keys.RIGHT)){
            body.x += speed;
        }if(WIZARD.input.keyPressed(WIZARD.keys.UP)){
            body.y -= speed;
        }if(WIZARD.input.keyPressed(WIZARD.keys.DOWN)){
            body.y += speed;
        }
    },
    render: function(){
        this.clear("#686868");
        this.drawAnimation("spritesheet", "wizard_idle", body.x, body.y);
        if(WIZARD.physics.intersects(body, body2)){
            this.drawAABB(body, "#ff0000");
            this.drawAABB(body2, "#ff0000");
        }else{
            this.drawAABB(body, "#00ff00");
            this.drawAABB(body2, "#00ff00");
        }

        this.drawText("Hello Wizard!", 0, 0, "font");
    }
}).play();