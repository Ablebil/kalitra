import Phaser from "phaser";
import { buildLevel } from "../systems/LevelBuilder.ts";
import { createWalkingAnimations } from "../objects/Character.ts";
import { levels } from "../data/levels.ts";
import { levelOrigin } from "../utils/helpers.ts";

export class MainScene extends Phaser.Scene {
  worldLayer!: Phaser.GameObjects.Container;
  levelOrigin!: { x: number; y: number };
  charSprite!: Phaser.GameObjects.Sprite;
  charScale!: number;
  footprints: Phaser.GameObjects.Image[] = [];
  collectibleSprites: Record<string, Phaser.GameObjects.Image> = {};

  constructor() {
    super("MainScene");
  }

  preload(): void {
    this.load.image("grass0", "/assets/grass0.png");
    this.load.image("grass1", "/assets/grass1.png");
    this.load.image("grass2", "/assets/grass2.png");
    this.load.image("dirt0", "/assets/dirt0.png");
    this.load.image("bush0", "/assets/bush0.png");
    this.load.image("bush1", "/assets/bush1.png");
    this.load.image("bush2", "/assets/bush2.png");
    this.load.image("tree0", "/assets/tree0.png");
    this.load.image("tree1", "/assets/tree1.png");
    this.load.image("tree2", "/assets/tree2.png");
    this.load.image("rock0", "/assets/rock0.png");
    this.load.image("rock1", "/assets/rock1.png");
    this.load.image("rock2", "/assets/rock2.png");
    this.load.image("fence0", "/assets/fence0.png");
    this.load.image("fence1", "/assets/fence1.png");
    this.load.image("fence2", "/assets/fence2.png");
    this.load.image("bridge", "/assets/bridge.png");
    this.load.image("house", "/assets/house.png");
    this.load.image("school", "/assets/school.png");
    this.load.image("book", "/assets/book.png");
    this.load.image("success", "/assets/success.png");
    this.load.spritesheet("character", "/assets/character.png", {
      frameWidth: 256,
      frameHeight: 384,
    });
  }

  create(): void {
    this.worldLayer = this.add.container(0, 0);
    this.footprints = [];
    this.collectibleSprites = {};
    this.charSprite = null!;

    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

    createWalkingAnimations(this);

    const cb = this.game.registry.get("onSceneReadyCallback") as
      | ((scene: this) => void)
      | undefined;
    if (cb) cb(this);

    this.loadLevel(0);
  }

  loadLevel(levelIndex: number): void {
    const level = levels[levelIndex];
    if (!level) return;
    this.levelOrigin = levelOrigin(level);
    buildLevel(this, level);
  }
}
