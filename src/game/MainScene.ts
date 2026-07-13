import Phaser from 'phaser';

// MATRIX PETA LEVEL 1
// 0 = Rumput (Tidak bisa dilewati / Rintangan)
// 1 = Jalan Tanah (Bisa dilewati)
// 2 = Rumah (Garis Finish / Tujuan)
const LEVEL_MAP = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0, 0, 0],
  [0, 1, 0, 1, 0, 0, 0, 0],
  [0, 1, 0, 1, 1, 1, 2, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
];

export default class MainScene extends Phaser.Scene {
  private character!: Phaser.GameObjects.Sprite;
  private gridSize = 64;
  
  // Posisi Logis di dalam Array (Bukan Pixel)
  private startGridX = 1;
  private startGridY = 1;
  private startAngle = 90; // Menghadap ke kanan
  
  private currentGridX = 1;
  private currentGridY = 1;
  private currentAngle = 90;

  constructor() {
    super('MainScene');
  }

  preload() {
    // Memuat aset dari folder public/assets
    this.load.image('prompt', '/assets/characters/prompt.png');
    this.load.image('grass', '/assets/environment/grass-tile.png');
    this.load.image('dirt', '/assets/environment/dirt-path.png');
    this.load.image('house', '/assets/environment/house.png');
  }

  create() {
    // 1. Menggambar Peta Berdasarkan Matrix LEVEL_MAP
    for(let y = 0; y < 8; y++) {
      for(let x = 0; x < 8; x++) {
        const tileType = LEVEL_MAP[y][x];
        const texture = (tileType === 0) ? 'grass' : 'dirt';
        
        // Gambar dasar peta (rumput atau jalan)
        this.add.image(x * this.gridSize + 32, y * this.gridSize + 32, texture).setDisplaySize(64,64);
        
        // Tambahkan Rumah jika itu titik finish
        if (tileType === 2) {
          this.add.sprite(x * this.gridSize + 32, y * this.gridSize + 32, 'house').setDisplaySize(56, 56);
        }
      }
    }
    
    // 2. Menggambar Karakter Utama
    this.character = this.add.sprite(this.startGridX * this.gridSize + 32, this.startGridY * this.gridSize + 32, 'prompt');
    this.character.setDisplaySize(48, 48);
    this.character.setAngle(this.startAngle);
  }

  resetLevel() {
    this.currentGridX = this.startGridX;
    this.currentGridY = this.startGridY;
    this.currentAngle = this.startAngle;
    
    this.character.setPosition(this.currentGridX * this.gridSize + 32, this.currentGridY * this.gridSize + 32);
    this.character.setAngle(this.currentAngle);
  }

  async runProgram(program: any[], callbacks: any) {
    this.resetLevel();
    callbacks.onStatusChange('Menjalankan program...');

    // "Flattening" blok Repeat (Mengurai Loop)
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

    // Eksekusi tiap blok langkah demi langkah
    for (const cmd of execQueue) {
      callbacks.onBlockActive(cmd.id || cmd.originalId);
      
      const moveResult = await this.executeCommand(cmd.type);
      
      if (moveResult === 'hit_wall') {
        callbacks.onComplete(false, 0); // Gagal: Menabrak Rumput/Keluar Batas
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 350));
    }

    // Evaluasi Akhir: Apakah posisi terakhir karakter berada di titik 2 (Rumah)?
    const finalTile = LEVEL_MAP[this.currentGridY][this.currentGridX];
    if (finalTile === 2) {
      // Hitung efisiensi bintang (Makin sedikit blok, makin bagus)
      let stars = 3;
      if (program.length > 5) stars = 2; // Jika terlalu boros instruksi
      callbacks.onComplete(true, stars); 
    } else {
      // Sampai ujung instruksi tapi belum sampai rumah
      callbacks.onComplete(false, 0);
    }
  }

  executeCommand(type: string): Promise<string> {
    return new Promise(resolve => {
      if (type === 'forward') {
        // Kalkulasi pergerakan logika
        let nextX = this.currentGridX;
        let nextY = this.currentGridY;

        // Gunakan modulus arah untuk menentukan x dan y
        let normalizedAngle = ((this.currentAngle % 360) + 360) % 360; 
        if (normalizedAngle === 0) nextY -= 1;      // Maju ke Atas
        else if (normalizedAngle === 90) nextX += 1; // Maju ke Kanan
        else if (normalizedAngle === 180) nextY += 1;// Maju ke Bawah
        else if (normalizedAngle === 270) nextX -= 1;// Maju ke Kiri

        // Deteksi batas peta dan tembok
        if (nextX < 0 || nextX >= 8 || nextY < 0 || nextY >= 8 || LEVEL_MAP[nextY][nextX] === 0) {
           // Gagal bergerak (Animasi getar / bump error)
           this.tweens.add({
              targets: this.character,
              x: this.character.x + (nextX > this.currentGridX ? 10 : nextX < this.currentGridX ? -10 : 0),
              y: this.character.y + (nextY > this.currentGridY ? 10 : nextY < this.currentGridY ? -10 : 0),
              yoyo: true, duration: 100,
              onComplete: () => resolve('hit_wall')
           });
           return;
        }

        // Berhasil bergerak
        this.currentGridX = nextX;
        this.currentGridY = nextY;

        this.tweens.add({
          targets: this.character,
          x: this.currentGridX * this.gridSize + 32,
          y: this.currentGridY * this.gridSize + 32,
          duration: 350,
          onComplete: () => resolve('success')
        });

      } else if (type === 'left') {
        this.currentAngle -= 90;
        this.tweens.add({ targets: this.character, angle: this.currentAngle, duration: 250, onComplete: () => resolve('success') });
      } else if (type === 'right') {
        this.currentAngle += 90;
        this.tweens.add({ targets: this.character, angle: this.currentAngle, duration: 250, onComplete: () => resolve('success') });
      }
    });
  }
}