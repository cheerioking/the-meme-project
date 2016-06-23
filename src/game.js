// jscs:disable
var game = new Phaser.Game(900, 600, Phaser.AUTO, '');

game.state.add('play', {

	preload: function () {
		/**
		 * Background.
		 */
		this.game.load.image('wc', 'assets/background/wc.png');

		/**
		 * Monsters.
		 *
		 * These need to match the monster names
		 * in var monsterData inside create().
		 */
		this.game.load.image('john-cena', 'assets/meme-enemies/john-cena.png');
		this.game.load.image('dat-boi', 'assets/meme-enemies/dat-boi.png');
		this.game.load.image('lenny-face', 'assets/meme-enemies/lenny-face.png');
		this.game.load.image('spongegar', 'assets/meme-enemies/spongegar.png');
		this.game.load.image('dang-daniel', 'assets/meme-enemies/dang-daniel.png');
		this.game.load.image('nyan-cat', 'assets/meme-enemies/nyan-cat.png');
		this.game.load.image('doge', 'assets/meme-enemies/doge.png');
		this.game.load.image('trollface', 'assets/meme-enemies/trollface.png');
		this.game.load.image('yuno', 'assets/meme-enemies/yuno.png');
		this.game.load.image('grumpy-cat', 'assets/meme-enemies/grumpy-cat.png'),
		this.game.load.image('pepe', 'assets/meme-enemies/pepe.png');
		this.game.load.image('patrick', 'assets/meme-enemies/patrick.png');
		this.game.load.image('spoderman', 'assets/meme-enemies/spoderman.png');


		/**
		 * Coin.
		 */
		this.game.load.image('pepe-coin', 'assets/coin-ideas/pepe-coin.png');

		/**
		 * Upgrades.
		 */ 
		this.game.load.image('auto-memes',          'assets/buttons/auto-memes.png');
		this.game.load.image('better-memes',        'assets/buttons/better-memes.png');
        this.game.load.image('dogebutton',          'assets/buttons/doge.png');
		this.game.load.image('doge-wizard',         'assets/buttons/doge-wizard.png');
		
		// build panel for upgrades
		var bmd = this.game.add.bitmapData(245, 500);
		bmd.ctx.fillStyle = '#eee';
		bmd.ctx.strokeStyle = '#aaa';
		bmd.ctx.lineWidth = 2;
		bmd.ctx.fillRect(0, 0, 245, 500);
		bmd.ctx.strokeRect(0, 0, 245, 500);
		this.game.cache.addBitmapData('upgradePanel', bmd);

		var buttonImage = this.game.add.bitmapData(225, 75);
		buttonImage.ctx.fillStyle = '#9BF780';
		buttonImage.ctx.strokeStyle = '#00000';
		buttonImage.ctx.lineWidth = 2;
		buttonImage.ctx.fillRect(0, 0, 225, 75);
		buttonImage.ctx.strokeRect(0, 0, 225, 75);
		this.game.cache.addBitmapData('button', buttonImage);
   
		// the main player
		this.player = {
			clickDmg: 1,
			gold: 0,
			dps: 0
		};

		// world progression
		this.level = 1;
		// how many monsters have we killed during this level
		this.levelKills = 0;
		// how many monsters are required to advance a level
		this.levelKillsRequired = 10;
	},

	create: function () {
		var state = this;

		/**
		 * Background.
		 */
		this.background = this.game.add.group();
		// setup each of our background layers to take the full screen
		['wc']
			.forEach(function (image) {
				var bg = state.game.add.tileSprite(0, 0, state.game.world.width,
					state.game.world.height, image, '', state.background);
				bg.tileScale.setTo(1, 1);
			});


		/**
		 * Upgrades.
		 */
		this.upgradePanel = this.game.add.image(10, 70, this.game.cache.getBitmapData('upgradePanel'));
		var upgradeButtons = this.upgradePanel.addChild(this.game.add.group());
		upgradeButtons.position.setTo(8, 8);

		var upgradeButtonsData = [
			{
				icon: 'auto-memes', 
				name: 'Hax', 
				level: 0, 
				cost: 5, 
				desc: '+1 Damage per Click', 
				purchaseHandler: function (button, player) {
					player.clickDmg += 1;
				}
			},
			{
				icon: 'better-memes', 
				name: 'Auto Hax', 
				level: 0, 
				cost: 15, 
				desc: '+1 DPS', 
				purchaseHandler: function (button, player) {
					player.dps += 1;
				}
			},
			{
				icon: 'dogebutton', 
				name: 'Attack Doggo', 
				level: 0, 
				cost: 150, 
				desc: '+1 Critical Strike Chance', 
				purchaseHandler: function (button, player) {
					player.clickDmg += 10;
				}
			},
		    {
				icon: 'doge-wizard', 
				name: 'Doggo Wizard', 
				level: 0, 
				cost: 300, 
				desc: 'Supercharge your DPS for 30 secs', 
				purchaseHandler: function (button, player) {
					player.dps += 10;
				}
			}
            

		];


		var button;
		upgradeButtonsData.forEach(function (buttonData, index) {
			button = state.game.add.button(0, (77 * index), state.game.cache.getBitmapData('button'));
			button.icon = button.addChild(state.game.add.image(6, 6, buttonData.icon));
			button.text = button.addChild(state.game.add.text(48, 6, buttonData.name + ': ' + buttonData.level, {font: '16px Oswald'}));
			button.details = buttonData;
			button.costText = button.addChild(state.game.add.text(48, 24, 'Cost: ' + buttonData.cost, {font: '16px Oswald'}));
			button.desc = button.addChild(state.game.add.text(6, 42, buttonData.desc, {font: '13px Oswald'}).addColor( '#000', 0 ));
			button.events.onInputDown.add(state.onUpgradeButtonClick, state);

			upgradeButtons.addChild(button);
		});

		/**
		 * Monsters.
		 */
		var monsterData = [
			{name: 'John Cena',      image: 'john-cena',      maxHealth: 10},
			{name: 'Dat Boi',        image: 'dat-boi',        maxHealth: 35},
			{name: 'Lenny',          image: 'lenny-face',     maxHealth: 2},
			{name: 'Spongegar',      image: 'spongegar',      maxHealth: 10},
			{name: 'Dang Daniel',    image: 'dang-daniel',    maxHealth: 5},
			{name: 'Nyan Cat',       image: 'nyan-cat',       maxHealth: 15},
			{name: 'Doggo',          image: 'doge',           maxHealth: 15},
			{name: 'Troll Face',     image: 'trollface',      maxHealth: 10},
			{name: 'Y U NO',         image: 'yuno',           maxHealth: 30},
			{name: 'Grumpy Cat',     image: 'grumpy-cat',     maxHealth: 10},
			{name: 'Pepe',           image: 'pepe',           maxHealth: 40},
			{name: 'Patrick',        image: 'patrick',        maxHealth: 25},
			{name: 'Spoderman',     image: 'spoderman',      maxHealth: 15}
		];
		this.monsters = this.game.add.group();

		var monster;
		monsterData.forEach(function (data) {
			// create a sprite for them off screen
			monster = state.monsters.create(1500, state.game.world.centerY, data.image);
			// use the built in health component
			monster.health = monster.maxHealth = data.maxHealth;
			// center anchor
			monster.anchor.setTo(0.5, 1);
			// reference to the database
			monster.details = data;
			//enable input so we can click it!
			monster.inputEnabled = true;
			monster.events.onInputDown.add(state.onClickMonster, state);

			// hook into health and lifecycle events
			monster.events.onKilled.add(state.onKilledMonster, state);
			monster.events.onRevived.add(state.onRevivedMonster, state);
		});

		// display the monster front and center
		this.currentMonster = this.monsters.getRandom();
		this.currentMonster.position.set(this.game.world.centerX + 100, this.game.world.centerY + 300);

		this.monsterInfoUI = this.game.add.group();
		this.monsterInfoUI.position.setTo(this.currentMonster.x - 220, 30);
		this.monsterNameText = this.monsterInfoUI.addChild(this.game.add.text(0, 0, this.currentMonster.details.name, {
			font: '64px Bangers',
			fill: '#fff',
			strokeThickness: 4
		}));
		this.monsterHealthText = this.monsterInfoUI.addChild(this.game.add.text(0, 75, this.currentMonster.health + ' HP', {
			font: '32px Bangers',
			fill: '#1dbf1d',
			strokeThickness: 4
		}));

		this.dmgTextPool = this.add.group();
		var dmgText;
		for (var d = 0; d < 50; d++) {
			dmgText = this.add.text(0, 0, '1', {
				font: '64px Bangers',
				fill: '#fff',
				strokeThickness: 4
			});
			// start out not existing, so we don't draw it yet
			dmgText.exists = false;
			dmgText.tween = game.add.tween(dmgText)
				.to({
					alpha: 0,
					y: 100,
					x: this.game.rnd.integerInRange(100, 700)
				}, 1000, Phaser.Easing.Cubic.Out);

			dmgText.tween.onComplete.add(function (text, tween) {
				text.kill();
			});
			this.dmgTextPool.add(dmgText);
		}

		// create a pool of gold coins
		this.coins = this.add.group();
		this.coins.createMultiple(50, 'pepe-coin', '', false);
		this.coins.setAll('inputEnabled', true);
		this.coins.setAll('goldValue', 1);
		this.coins.callAll('events.onInputDown.add', 'events.onInputDown', this.onClickCoin, this);

		this.playerGoldText = this.add.text(30, 30, 'Memes: ' + this.player.gold, {
			font: '24px Oswald',
			fill: '#fff',
			strokeThickness: 4
		});

		// 100ms 10x a second
		this.dpsTimer = this.game.time.events.loop(100, this.onDPS, this);

		// setup the world progression display
		this.levelUI = this.game.add.group();
		this.levelUI.position.setTo(this.game.world.width - 200, 30);
		this.levelText = this.levelUI.addChild(this.game.add.text(0, 0, 'Level: ' + this.level, {
			font: '24px Oswald',
			fill: '#fff',
			strokeThickness: 4
		}));
		this.levelKillsText = this.levelUI.addChild(this.game.add.text(0, 30, 'Kills: ' + this.levelKills + '/' + this.levelKillsRequired, {
			font: '24px Oswald',
			fill: '#fff',
			strokeThickness: 4
		}));
	},

	onDPS: function () {
		if (this.player.dps > 0) {
			if (this.currentMonster && this.currentMonster.alive) {
				var dmg = this.player.dps / 10;
				this.currentMonster.damage(dmg);

				this.colorHealthText();

				// update the health text
				this.monsterHealthText.text = this.currentMonster.alive ? Math.round(this.currentMonster.health) + ' HP' : 'DEAD';
			}
		}
	},

	onUpgradeButtonClick: function (button, pointer) {
		// make this a function so that it updates after we buy
		function getAdjustedCost() {
			return Math.ceil(button.details.cost + (button.details.level * 1.46));
		}

		if (this.player.gold - getAdjustedCost() >= 0) {
			this.player.gold -= getAdjustedCost();
			this.playerGoldText.text = 'Memes: ' + this.player.gold;
			button.details.level++;
			button.text.text = button.details.name + ': ' + button.details.level;
			button.costText.text = 'Cost: ' + getAdjustedCost();
			button.details.purchaseHandler.call(this, button, this.player);
		}
	},

	onClickCoin: function (coin) {
		if (!coin.alive) {
			return;
		}
		// give the player gold
		this.player.gold += coin.goldValue;
		// update UI
		this.playerGoldText.text = 'Memes: ' + this.player.gold;
		// remove the coin
		coin.kill();
	},

	onKilledMonster: function (monster) {
		// move the monster off screen again
		monster.position.set(1000, this.game.world.centerY);

		var coin;
		// spawn a coin on the ground
		coin = this.coins.getFirstExists(false);
		coin.reset(this.game.world.centerX + this.game.rnd.integerInRange(-100, 100), this.game.world.centerY);
		coin.goldValue = Math.round(this.level * 1.33);
		this.game.time.events.add(Phaser.Timer.SECOND * 3, this.onClickCoin, this, coin);

		this.levelKills++;

		if (this.levelKills >= this.levelKillsRequired) {
			this.level++;
			this.levelKills = 0;
		}

		this.levelText.text = 'Level: ' + this.level;
		this.levelKillsText.text = 'Kills: ' + this.levelKills + '/' + this.levelKillsRequired;

		// pick a new monster
		this.currentMonster = this.monsters.getRandom();
		// upgrade the monster based on level
		this.currentMonster.maxHealth = Math.ceil(this.currentMonster.details.maxHealth + ((this.level - 1) * 10.6));
		// make sure they are fully healed
		this.currentMonster.revive(this.currentMonster.maxHealth);
	},

	onRevivedMonster: function (monster) {
		monster.position.set(this.game.world.centerX + 100, this.game.world.centerY + 170);
		// update the text display
		this.monsterHealthText.addColor( '#1dbf1d', 0 );
		this.monsterNameText.text = monster.details.name;
		this.monsterHealthText.text = monster.health + 'HP';
	},

	onClickMonster: function (monster, pointer) {
		// apply click damage to monster
		this.currentMonster.damage(this.player.clickDmg);

		// grab a damage text from the pool to display what happened
		var dmgText = this.dmgTextPool.getFirstExists(false);
		if (dmgText) {
			dmgText.text = this.player.clickDmg;
			dmgText.reset(pointer.positionDown.x, pointer.positionDown.y);
			dmgText.alpha = 1;
			dmgText.tween.start();
		}
		this.colorHealthText();


		// update the health text
		this.monsterHealthText.text = this.currentMonster.alive ? this.currentMonster.health + ' HP' : 'DEAD';
	},

	colorHealthText: function() {
		/**
		 * Green/Yellow/Red Color Change.
		 */
		var medHealth = Math.ceil(this.currentMonster.maxHealth * 0.6);
		var lowHealth = Math.ceil(this.currentMonster.maxHealth * 0.3);
		if (this.currentMonster.health <= lowHealth ) {
			this.monsterHealthText.addColor( '#ea5311', 0 );
		} else if ( this.currentMonster.health <= medHealth ) {
			this.monsterHealthText.addColor( '#e3da13', 0 );
		}
	}
});

game.state.start('play');
