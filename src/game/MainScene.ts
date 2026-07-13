import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  private character!: Phaser.GameObjects.Sprite;
  private gridSize = 64;
  private startPos = { x: 2, y: 2, angle: 0 };

  constructor() {
    super('MainScene');
  }

  preload() {
    // Memuat aset dari folder public
    this.load.image('prompt', '/assets/characters/prompt.png');
    this.load.image('grass', '/assets/environment/grass-tile.png');
  }

  create() {
    // Membuat grid statis sebagai prototipe level
    for(let y = 0; y < 8; y++) {
      for(let x = 0; x < 8; x++) {
        this.add.image(x * this.gridSize + 32, y * this.gridSize + 32, 'grass').setDisplaySize(64,64);
      }
    }
    
    // Meletakkan karakter
    this.character = this.add.sprite(this.startPos.x * this.gridSize + 32, this.startPos.y * this.gridSize + 32, 'prompt');
    this.character.setDisplaySize(48, 48);
  }

  resetLevel() {
    this.character.setPosition(this.startPos.x * this.gridSize + 32, this.startPos.y * this.gridSize + 32);
    this.character.setAngle(this.startPos.angle);
  }

  async runProgram(program: any[], callbacks: any) {
    this.resetLevel();
    callbacks.onStatusChange('Menjalankan program...');

    // "Flattening" blok Repeat (Looping Unroll)
    const execQueue: any[] = [];
    for (const block of program) {
      if (block.type === 'repeat') {
        for (let i = 0; i < block.count; i++) {
          execQueue.push(...block.children.map((c: any) => ({ ...c, originalId: block.id })));
        }
      } else {
        execQueue.push(block);
      }
    }

    // Mengeksekusi blok langkah demi langkah secara asynchronous
    for (const cmd of execQueue) {
      callbacks.onBlockActive(cmd.id || cmd.originalId);
      await this.executeCommand(cmd.type);
      await new Promise(resolve => setTimeout(resolve, 350)); // Jeda antar blok
    }

    callbacks.onComplete(true, 3); // Simulasi: Mengembalikan 3 bintang jika selesai
  }

  executeCommand(type: string): Promise<void> {
    return new Promise(resolve => {
      if (type === 'forward') {
        const rad = Phaser.Math.DegToRad(this.character.angle);
        const dx = Math.round(Math.cos(rad));
        const dy = Math.round(Math.sin(rad));
        
        this.tweens.add({
          targets: this.character,
          x: this.character.x + (dx * this.gridSize),
          y: this.character.y + (dy * this.gridSize),
          duration: 350,
          onComplete: () => resolve()
        });
      } else if (type === 'left') {
        this.tweens.add({ targets: this.character, angle: this.character.angle - 90, duration: 250, onComplete: () => resolve() });
      } else if (type === 'right') {
        this.tweens.add({ targets: this.character, angle: this.character.angle + 90, duration: 250, onComplete: () => resolve() });
      } else {
        resolve();
      }
    });
  }
}