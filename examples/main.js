var x = -16;

wizard({
    width: 160,
    height: 144,
    scale: 3,
    pixelArt: true,
    create: function(){
        this.loadImages("wizard.png", "bw.png", "spritesheet.png");
        this.loadSounds("sound01.wav");
        this.loadData("a.txt");
    },

    update: function(){
        x+=0.2;
        if(x > this.width) x = - 16;

        if(WIZARD.input.keyJustPressed(WIZARD.keys.A)){
            this.playSound("sound01");
        }
    },
    render: function(){
        this.clear("#686868");
        this.drawImage("bw", x, 72);
        this.drawSprite("spritesheet", 16, 16, 1, 1);
    }
}).play();
