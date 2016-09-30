var body = WIZARD.physics.createAABB(0, 55, 16, 16);
var body2 = WIZARD.physics.createAABB(100, 48, 32, 32);

var speed = 0.2;

wizard({
    width: 160,
    height: 144,
    scale: 5,
    pixelArt: true,
    create: function(){
        this.loadImages("wizard.png", "bw.png", "spritesheet.png");
        this.loadSounds("sound01.wav");
        this.loadData("a.txt");
        WIZARD.animation.create("random", [[0,0], [1,0], [0,1], [1,1]], 500);
        WIZARD.animation.create("random2", [[0,0], [1,0], [0,1], [1,1]], 200);
    },

    update: function(){

        if(body.x > this.width) body.x = - 16;

        if(WIZARD.input.keyPressed(WIZARD.keys.A)){
            body.x -= speed;
        }else if(WIZARD.input.keyPressed(WIZARD.keys.D)){
            body.x += speed;
        }if(WIZARD.input.keyPressed(WIZARD.keys.W)){
            body.y -= speed;
        }if(WIZARD.input.keyPressed(WIZARD.keys.S)){
            body.y += speed;
        }
    },
    render: function(){
        this.clear("#686868");
        this.drawImage("bw", body.x, body.y);
        //this.drawSprite("spritesheet", 16, 16, 1, 1);
        this.drawAnimation("spritesheet", "random", 16, 16);
        this.drawAnimation("spritesheet", "random2", 32, 16);
        if(WIZARD.physics.intersects(body, body2)){
            this.drawAABB(body, "#ff0000");
            this.drawAABB(body2, "#ff0000");
        }else{
            this.drawAABB(body, "#00ff00");
            this.drawAABB(body2, "#00ff00");
        }
    }
}).play();
