var sceneA = {
    entities: [],
    onEnter: function(wiz){
    },
    update: function(wiz){
        if(WIZARD.input.keyJustPressed(WIZARD.keys.SPACEBAR)){
            WIZARD.scene.setCurrent("sceneB", 0, wiz);
        }
        if(WIZARD.input.keyJustPressed(WIZARD.keys.A)){
            WIZARD.entity.instantiate("test", {x: 100, y: 100});
        }
    },
    render: function(wiz){
        wiz.clear("#cc4400");
        wiz.drawText("Entities: " + this.entities.length, 0, 0, "font");
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
        if(WIZARD.input.keyJustPressed(WIZARD.keys.A)){
            WIZARD.entity.instantiate("test", {x: 100, y: 100});
        }
    },
    render: function(wiz){
        wiz.clear("#00cc44");
        wiz.drawText("Entities: " + this.entities.length, 0, 0, "font");
    },
    onExit: function(wiz){
    }
};

var entityA = function(params){
    this.x = params.x;
    this.y = params.y;
};

wizard({
    width: 200,
    height: 200,
    scale: 2,
    pixelArt: true,
    create: function(){
        WIZARD.paths.setImagesPath("../assets/img/");

        this.loadImages("font.png");

        WIZARD.spritesheet.create("font", 8, 8);

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
        this.drawText("Add entity with A", 0, this.height - 32, "font");
        this.drawText("Change scene with Space", 0, this.height - 16, "font");
    }
}).play();
