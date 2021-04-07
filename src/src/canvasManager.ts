import {
  Axis,
  Color3,
  Color4,
  Engine,
  GlowLayer,
  Mesh,
  NoiseProceduralTexture,
  Particle,
  ParticleSystem,
  Scene,
  SceneLoader,
  Space,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';

/**
 * Canvas Manager.
 */
export default class CanvasManager {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;

  /**
   * constrcutor.
   * @param {HTMLCanvasElement} _canvas canvas element
   */
  public constructor(_canvas: HTMLCanvasElement) {
    this.canvas = _canvas;
    this.engine = new Engine(this.canvas);
    this.scene = new Scene(this.engine);

    this.initScene();

    this.engine.runRenderLoop(() => {
      this.update();
    });
  }

  /**
   * init scene
   */
  private initScene() {
    this.scene.createDefaultCameraOrLight(true, true, true);

    // particle system settings
    const particleSystem = new ParticleSystem('particle', 5000, this.scene);
    particleSystem.emitter = new Vector3(0, 0, 0);
    particleSystem.particleTexture = new Texture(
        '/img/particle.png',
        this.scene,
    );
    particleSystem.maxSize = 0.003;
    particleSystem.minSize = 0.003;
    particleSystem.color1 = new Color4(1, 1, 1, 1);
    particleSystem.color2 = new Color4(1, 1, 1, 1);
    particleSystem.colorDead = new Color4(1, 1, 1, 0);
    particleSystem.direction1 = new Vector3(0);
    particleSystem.direction2 = new Vector3(0);
    particleSystem.maxLifeTime = 10;
    particleSystem.minLifeTime = 10;

    const noiseTexture = new NoiseProceduralTexture('perlin', 256, this.scene);
    noiseTexture.animationSpeedFactor = 1;
    noiseTexture.persistence = 1;
    noiseTexture.brightness = 0.5;
    noiseTexture.octaves = 2;

    particleSystem.noiseTexture = noiseTexture;
    particleSystem.noiseStrength = new Vector3(0.03, 0.03, 0.03);

    particleSystem.emitRate = 20;

    particleSystem.blendMode = ParticleSystem.BLENDMODE_STANDARD;

    particleSystem.preWarmCycles = 100;

    particleSystem.start();

    SceneLoader.ImportMeshAsync(
        'trophy',
        '/scenes/',
        'scene.babylon',
        this.scene,
        (event) => {
          if (event.lengthComputable) {
            const progress = event.loaded / event.total;
            console.log(`loading progress: ${Math.ceil(progress * 100)}%`);
          }
        },
    ).then((_scene) => {
      const trophy = <Mesh>_scene.meshes[0];
      if (trophy !== null) {
        trophy.position = new Vector3(0, -0.2, 0);
        trophy.scaling = trophy.scaling.multiplyByFloats(0.5, 0.5, 0.5);
        trophy.rotate(Axis.Y, 1.5 * Math.PI, Space.WORLD);
        trophy.convertToFlatShadedMesh();
      }
    });

    this.scene.clearColor = new Color4(0.144, 0.171, 0.21, 0);
  }

  /**
   * reder scene.
   */
  private update() {
    this.scene.render();
  }
}
