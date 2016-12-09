
var leftPressed = false;
var rightPressed = false;
var upPressed = false;
var downPressed = false;

var b0Pressed = false;
var b1Pressed = false;
var b2Pressed = false;
var b3Pressed = false;
var b4Pressed = false;
var b5Pressed = false;
var b6Pressed = false;
var b7Pressed = false;
var b8Pressed = false;
var b9Pressed = false;

wizard({
    width: 500,
    height: 200,
    fillScreen:true,
    pixelArt: true,
    create: function(){
        WIZARD.paths.setImagesPath("../assets/img/");

        WIZARD.loader.noLoading();

        //this.loadImages("bitmap_font.png", "bitmap_font2.png", "bitmap_font3.png");
    },

    update: function(){

        leftPressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.LEFT);
        rightPressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.RIGHT);
        upPressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.UP);
        downPressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.DOWN);

        b0Pressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.BUTTON_0);
        b1Pressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.BUTTON_1);
        b2Pressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.BUTTON_2);
        b3Pressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.BUTTON_3);
        b4Pressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.BUTTON_4);
        b5Pressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.BUTTON_5);
        b6Pressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.BUTTON_6);
        b7Pressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.BUTTON_7);
        b8Pressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.BUTTON_8);
        b9Pressed = WIZARD.input.gamepadPressed(0, WIZARD.gamepad.BUTTON_9);

        if(WIZARD.input.gamepadJustPressed(0, WIZARD.gamepad.BUTTON_0)){
            console.log("JUST PRESSED BUTTON 0");
        }

    },
    render: function(){
        this.clear("#f4f5f0");

        var top = 25;
        var left = 10;

        if(leftPressed) {
            this.fillRect(left + 0, top + 50, 50, 50, "#ccc");
        }else{
            this.fillRect(left + 0, top + 50, 50, 50,"#4a5053");
        }

        if(rightPressed) {
            this.fillRect(left + 100, top + 50, 50, 50, "#ccc");
        }else{
            this.fillRect(left + 100, top + 50, 50, 50,"#4a5053");
        }

        if(upPressed) {
            this.fillRect(left + 50, top + 0, 50, 50, "#ccc");
        }else{
            this.fillRect(left + 50, top + 0, 50, 50,"#4a5053");
        }

        if(downPressed) {
            this.fillRect(left + 50, top + 100, 50, 50, "#ccc");
        }else{
            this.fillRect(left + 50, top + 100, 50, 50,"#4a5053");
        }

        left = this.width - 150 - 10;

        if(b3Pressed) {
            this.fillRect(left + 0, top + 50, 50, 50, "#ccc");
        }else{
            this.fillRect(left + 0, top + 50, 50, 50,"#00e8ac");
        }

        if(b1Pressed) {
            this.fillRect(left + 100, top + 50, 50, 50, "#ccc");
        }else{
            this.fillRect(left + 100, top + 50, 50, 50,"#ff4755");
        }

        if(b0Pressed) {
            this.fillRect(left + 50, top + 0, 50, 50, "#ccc");
        }else{
            this.fillRect(left + 50, top + 0, 50, 50,"#0071f8");
        }

        if(b2Pressed) {
            this.fillRect(left + 50, top + 100, 50, 50, "#ccc");
        }else{
            this.fillRect(left + 50, top + 100, 50, 50,"#ffbc5b");
        }
    }
}).play();
