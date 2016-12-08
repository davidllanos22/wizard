wizard({
    width: 500,
    height: 200,
    fillScreen:true,
    pixelArt: true,
    create: function(){
        WIZARD.paths.setImagesPath("../assets/img/");
        WIZARD.paths.setSoundsPath("../assets/sound/");
        WIZARD.paths.setDataPath("../assets/data/");

        this.loadImages("bitmap_font.png", "bitmap_font2.png", "bitmap_font3.png");
        this.loadBitmapFont("bitmap_font.fnt", "bitmap_font2.fnt", "bitmap_font3.fnt");
    },

    update: function(){

    },
    render: function(){
        this.clear("#686868");
        this.drawBitmapText("Hello Wizard!", 0, 0, "bitmap_font");
        this.drawBitmapText("Two\nlines here!", 0, 20, "bitmap_font2");
        this.drawBitmapText("Pixel font :)", 200, 20, "bitmap_font3");
    }
}).play();
