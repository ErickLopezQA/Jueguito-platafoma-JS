let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade:{
            gravity: {y: 300},
            debug: false
        }
    },


    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

//Iremos declarando variables por aqui
let score = 0;
let scoreText;
let game = new Phaser.Game(config);
let cursors;
let player;
let platform;
let stars;
let bombs;
let gameOver = false;
let bombsCreated = false;

//Funcion para Pre Cargar los archivos 
function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('star', 'assets/star.png');
    this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48});
}

//Funcion para crear los archivos en el juego 
function create() {
    this.add.image(400, 300, 'sky');
    
    //le añadimos las fisicas a las plataformas
    platform = this.physics.add.staticGroup();

    //Agregamos plataformas al juego 
    platform.create(400, 568, 'ground').setScale(2).refreshBody();
    platform.create(600, 400, 'ground');
    platform.create(50, 250, 'ground');
    platform.create(750, 220, 'ground');

    //le añadimos las fisicas al personaje(sprite)
    player = this.physics.add.sprite(100, 450, 'dude');

    //Seteamos los limites del juego
    player.setCollideWorldBounds(true);
    
    //Seteamos un rebote al jugador
    player.setBounce(0.2);

    //Creamos una animacion
    this.anims.create({
        key: 'left', //nombre de la animacion 
        frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}), //Cantidad de fotogramas que tomara la animacion
        frameRate: 10, //Velocidad de fotogramas por sec
        repeat: -1 //Esto significa que el personaje debe volver cuando termine
    });

    this.anims.create({
        key: 'turn', 
        frames: [ { key: 'dude', frame: 4 } ], //en este caso no repite ya que solo estara usando ese fotograma
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}), 
        frameRate: 10,
        repeat: -1
    });

    //Podemos variar la gravedad de los personajes
    player.body.setGravityY(500);

    this.physics.add.collider(player, platform);

    //Controles
    cursors = this.input.keyboard.createCursorKeys();

    //Añadimos las estrellas y las fisicas de ellas mismas
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {x: 12, y:0, stepX: 70}
    });

    stars.children.iterate(function(child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(stars, platform);

    this.physics.add.overlap(player, stars, collectStar, null, true);

    //Aqui esta la hacemos que aparezca la puntuacion en la patalla
    scoreText = this.add.text(16, 16, 'Puntuación: 0', { fontSize: '30px', fill: '#000' });

    //hacemos el grupo de fisicas para bombas
    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platform);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update () {
    
    if (gameOver) {
        return
    }

    //Definimos los controles y lo que haran en pantalla
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if(cursors.right.isDown){
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn', true);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-600);
    }
}


// Función para colectar las estrellas y sumar el puntaje
function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Puntuación: ' + score);

    // Contamos el número de estrellas recolectadas
    let collectedStars = stars.countActive(true);

    // Si no hay estrellas restantes
    if (collectedStars === 0 && !bombsCreated) {
        // Creamos la bomba
        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        let bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bombsCreated = true; // Actualizamos la variable booleana

        // Reactivamos todas las estrellas
        stars.children.iterate(function(child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }

    // Restablecemos la variable bombsCreated a false para permitir la creación de más bombas
    if (collectedStars > 0) {
        bombsCreated = false;
    }
}
//Funcion para cuando el personaje toque una bomba se tinte de rojo y Game Over 
function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;

    // Mostrar mensaje de GAME OVER
    this.add.text(400, 300, 'GAME OVER', {fontSize: '64px', fill: '#FF0000', fontFamily: 'Bodoni'}).setOrigin(0.5);
}