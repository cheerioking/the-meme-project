var game = new Phaser.Game(800, 400, Phaser.AUTO, 'main_content', {preload: preload, create: create, update: update});

var ball;
var paddle;
var bricks;
var newBrick;
var brickInfo;
var scoreText;
var score = 0;
var lives = 3;
var livesText;
var lifeLostText;
var playing = false;
var startButton;
var pepeGreen = '#4C813B';
var yellow = '#e3da13';

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = '#1a1a1a';
    game.load.spritesheet('ball', 'assets/breakout/pepe-wobble.png', 50, 42);
    game.load.image( 'background', 'assets/breakout/rebel.png');


var bmd = this.game.add.bitmapData(150, 15);
    bmd.ctx.fillStyle = pepeGreen;
    bmd.ctx.strokeStyle = 'black';
    bmd.ctx.lineWidth = 2;
    bmd.ctx.fillRect(0, 0, 150, 14);
    bmd.ctx.strokeRect(0, 0, 150, 14);
    this.game.cache.addBitmapData('brick', bmd);

    var bmd = this.game.add.bitmapData(200, 10);
    bmd.ctx.fillStyle = pepeGreen;
    bmd.ctx.strokeStyle = 'black';
    bmd.ctx.lineWidth = 2;
    bmd.ctx.fillRect(0, 0, 200, 9);
    bmd.ctx.strokeRect(0, 0, 200, 9);
    this.game.cache.addBitmapData('paddle', bmd);

    var bmd = this.game.add.bitmapData(200, 50);
    bmd.ctx.fillStyle = yellow;
    bmd.ctx.strokeStyle = 'black';
    bmd.ctx.lineWidth = 2;
    bmd.ctx.fillRect(0, 0, 200, 49);
    bmd.ctx.strokeRect(0, 0, 200, 49);
    this.game.cache.addBitmapData('button', bmd);
}
function create() {
    game.add.tileSprite(0, 0, 1000, 600, 'background');
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.down = false;
    ball = game.add.sprite(game.world.width*0.5, game.world.height-35, 'ball');
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
    ball.anchor.set(0.5);
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);
    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(ballLeaveScreen, this);

    var paddleBmd = game.cache.getBitmapData('paddle');

    paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, paddleBmd);
    paddle.anchor.set(0.5,1);
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    paddle.body.immovable = true;

    initBricks();

    var textStyle = { font: '32px Bangers', fill: yellow };
    scoreText = game.add.text(5, 5, textSpacing( 'Points: 0' ), textStyle);
    livesText = game.add.text(game.world.width-5, 5, textSpacing( 'Lives: ' + lives ), textStyle);
    livesText.anchor.set(1,0);
    lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, textSpacing('Life lost, tap to continue'), textStyle);
    lifeLostText.anchor.set(0.5);
    lifeLostText.visible = false;

    startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, game.cache.getBitmapData('button'), startGame, this, 1, 0, 2);
    startButton.text = startButton.addChild( game.add.text( -35, -25, textSpacing('START'), {font: '36px Bangers'}).addColor( 'black', 0 ));
    startButton.anchor.set(0.5);

    }
function update() {
    game.physics.arcade.collide(ball, paddle, ballHitPaddle);
    game.physics.arcade.collide(ball, bricks, ballHitBrick);
    if(playing) {
        paddle.x = game.input.x || game.world.width*0.5;
    }
}
function initBricks() {
    brickInfo = {
        width: 150,
        height: 15,
        count: {
            row: 5,
            col: 6
        },
        offset: {
            top: 60,
            left: 85
        },
        padding: 9
    };
    bricks = game.add.group();
    for(c=0; c<brickInfo.count.col; c++) {
        for(r=0; r<brickInfo.count.row; r++) {
            var brickX = (r*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
            var brickY = (c*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;

            var brickbmd = game.cache.getBitmapData('brick');
            newBrick = game.add.sprite(brickX, brickY, brickbmd);
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);
            newBrick.body.immovable = true;
            newBrick.anchor.set(0.5);
            bricks.add(newBrick);
        }
    }
}
function ballHitBrick(ball, brick) {
    var killTween = game.add.tween(brick.scale);
    killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
    killTween.onComplete.addOnce(function(){
        brick.kill();
    }, this);
    killTween.start();
    score += 10;
    scoreText.setText(textSpacing( 'Points: ' + score ));
    if(score === brickInfo.count.row*brickInfo.count.col*10) {
        alert('You won the game, congratulations!');
        location.reload();
    }
}
function ballLeaveScreen() {
    lives--;
    if(lives) {
        livesText.setText('Lives: '+lives);
        lifeLostText.visible = true;
        ball.reset(game.world.width*0.5, game.world.height-25);
        paddle.reset(game.world.width*0.5, game.world.height-5);
        game.input.onDown.addOnce(function(){
            lifeLostText.visible = false;
            ball.body.velocity.set(150, -150);
        }, this);
    }
    else {
        alert('You lost, game over!');
        location.reload();
    }
}
function ballHitPaddle(ball, paddle) {
    ball.animations.play('wobble');
    ball.body.velocity.x = -1*5*(paddle.x-ball.x);
}
function startGame() {
    startButton.destroy();
    ball.body.velocity.set(150, -150);
    playing = true;
}

function textSpacing( text ) {
    return text + '\u200A\u200A\u200A';
    return charCopy
}
