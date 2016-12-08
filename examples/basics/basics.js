var body = WIZARD.physics.createAABB(32, 48, 32, 32);
var body2 = WIZARD.physics.createAABB(160 - 64, 48, 32, 32);

var speed = 0.2;
var intersects = false;

wizard({
    width: 200,
    height: 200,
    scale: 2,
    pixelArt: true,
    create: function(){
        WIZARD.paths.setImagesPath("../assets/img/");
        WIZARD.paths.setSoundsPath("../assets/sound/");
        WIZARD.paths.setDataPath("../assets/data/");

        this.loadImages("wizard.png", "font.png");
        this.loadSounds("sound01.wav");
        this.loadData("a.txt");

        WIZARD.spritesheet.create("font", 8, 8);

        WIZARD.spritesheet.create("wizard", 32, 32);

        WIZARD.animation.createFrameAnimation("wizard_idle", [[0,0], [1,0], [2,0]], 200);

        var load = WIZARD.progress.load("basics");
        if(load) {
            body.x = WIZARD.progress.data.x;
            body.y = WIZARD.progress.data.y;
        }
    },

    update: function(){
        if(body.x > this.width) body.x = - 16;
        else if(body.x < - 16) body.x = this.width;
        if(body.y > this.height) body.y = - 16;
        else if(body.y < - 16) body.y = this.height;

        var moved = false;

        if(WIZARD.input.keyPressed(WIZARD.keys.LEFT)){
            body.x -= speed;
            moved = true;
        }else if(WIZARD.input.keyPressed(WIZARD.keys.RIGHT)){
            body.x += speed;
            moved = true;
        }if(WIZARD.input.keyPressed(WIZARD.keys.UP)){
            body.y -= speed;
            moved = true;
        }if(WIZARD.input.keyPressed(WIZARD.keys.DOWN)){
            body.y += speed;
            moved = true;
        }

        var iTemp = WIZARD.physics.intersects(body, body2);

        if(!intersects && iTemp){
           this.playSound("sound01");
        }

        intersects = iTemp;

        if(moved) {
            WIZARD.progress.data.x = body.x;
            WIZARD.progress.data.y = body.y;
            WIZARD.progress.save("basics");
        }
    },
    render: function(){
        this.clear("#686868");
        this.drawAnimation("wizard", "wizard_idle", body.x, body.y);

        if(intersects){
            this.drawAABB(body, "#ff0000");
            this.drawAABB(body2, "#ff0000");
        }else{
            this.drawAABB(body, "#00ff00");
            this.drawAABB(body2, "#00ff00");
        }

        this.drawText("Hello Wizard!", 0, 0, "font");
    }
}).play();
