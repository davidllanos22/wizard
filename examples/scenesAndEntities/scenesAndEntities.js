var sceneA = {
    entities: [],
    onEnter: function(wiz){
    },
    update: function(wiz){
        if(WIZARD.input.keyJustPressed(WIZARD.keys.SPACEBAR)){
            WIZARD.scene.setCurrent("sceneB", 0, wiz);
        }
        if(WIZARD.input.keyJustPressed(WIZARD.keys.X)){
            this.entities = [];
        }
        if(WIZARD.input.keyPressed(WIZARD.keys.A)){
            var x = WIZARD.math.randomBetween(0, wiz.width - 32);
            var y = WIZARD.math.randomBetween(8, wiz.width - 80);
            WIZARD.entity.instantiate("test", {x: x, y: y});
        }
    },
    render: function(wiz){
        wiz.clear("#cc4400");
        wiz.drawText("Entities: " + this.entities.length, 0, 0, "font");

        WIZARD.entity.sort(this.entities);
        for(var i = 0; i < this.entities.length; i++){
            this.entities[i].render(wiz);
        }
    },
    onExit: function(wiz){
    }
};

var sceneB = {
    entities: [],
    onEnter: function(wiz){
    },
    update: function(wiz){
        if(WIZARD.input.keyJustPressed(WIZARD.keys.SPACEBAR)){
            WIZARD.scene.setCurrent("sceneA", 0, wiz);
        }
        if(WIZARD.input.keyJustPressed(WIZARD.keys.X)){
            this.entities = [];
        }
        if(WIZARD.input.keyPressed(WIZARD.keys.A)){
            var x = WIZARD.math.randomBetween(0, wiz.width - 32);
            var y = WIZARD.math.randomBetween(8, wiz.width - 80);
            WIZARD.entity.instantiate("test", {x: x, y: y});
        }
    },
    render: function(wiz){
        wiz.clear("#00cc44");
        wiz.drawText("Entities: " + this.entities.length, 0, 0, "font");

        WIZARD.entity.sort(this.entities);
        for(var i = 0; i < this.entities.length; i++){
            this.entities[i].render(wiz);
        }
    },
    onExit: function(wiz){
    }
};

var entityA = function(params){
    this.x = params.x;
    this.y = params.y;

    this.render = function(wiz){
        wiz.drawAnimation("wizard", "wizard_idle", this.x, this.y);
    }
};

wizard({
    width: 200,
    height: 200,
    scale: 2,
    pixelArt: true,
    create: function(){
        WIZARD.paths.setImagesPath("../assets/img/");

        this.loadImages("font.png", "wizard.png");

        WIZARD.spritesheet.create("font", 8, 8);
        WIZARD.spritesheet.create("wizard", 32, 32);

        WIZARD.animation.createFrameAnimation("wizard_idle", [[0,0], [1,0], [2,0]], 200);

        WIZARD.scene.create("sceneA", sceneA);
        WIZARD.scene.create("sceneB", sceneB);
        WIZARD.scene.setCurrent("sceneA", 0, this);

        WIZARD.entity.create("test", entityA);
        WIZARD.entity.instantiate("test", {x: 100, y: 100});

    },

    update: function(){
        WIZARD.scene.current.update(this);
    },
    render: function(){
        WIZARD.scene.current.render(this);
        this.drawText("Clear with X", 0, this.height - 24, "font");
        this.drawText("Add entity with A", 0, this.height - 16, "font");
        this.drawText("Change scene with Space", 0, this.height - 8, "font");
    }
}).play();
