var sceneA = {
    entities: [],
    onEnter: function(wiz){

    },
    update: function(wiz){

    },
    render: function(wiz){
        wiz.clear("#cc4400");
    },
    onExit: function(wiz){
        console.log("onExit SceneA");
    }
};

var sceneB = {
    x: 0,
    y: 0,
    onEnter: function(wiz){
        console.log("onEnter SceneB");
    },
    update: function(wiz){
        this.x = Math.random() * 2 - 1;
        this.y = Math.random() * 2 - 1;
        if(WIZARD.input.keyJustPressed(WIZARD.keys.SPACEBAR)){
            WIZARD.scene.setCurrent("sceneA", 0, this);
        }
    },
    render: function(wiz){
        wiz.clear("#00cc44");
        wiz.drawText("Scene B", 100 + this.x, 100 + this.y, "font");
    },
    onExit: function(wiz){
        console.log("onExit SceneB");
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
    }
}).play();
