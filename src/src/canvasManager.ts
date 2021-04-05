import {
  Axis,
  Color3,
  Color4,
  Engine,
  GlowLayer,
  Mesh,
  NoiseProceduralTexture,
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

    const gl = new GlowLayer('glow', this.scene);
    gl.intensity = 1;

    this.scene.clearColor = new Color4(0.144, 0.171, 0.21);

    const particleSystem = new ParticleSystem('particle', 5000, this.scene);
    particleSystem.emitter = new Vector3(0, 0, 0);
    particleSystem.particleTexture = new Texture(
        'https://playground.babylonjs.com/textures/flare.png',
        this.scene,
    );
    particleSystem.maxSize = 0.01;
    particleSystem.minSize = 0.01;
    particleSystem.color1 = new Color4(5, 5, 5);
    particleSystem.direction1 = new Vector3(0);
    particleSystem.direction2 = new Vector3(0);

    const noiseTexture =
            new NoiseProceduralTexture('perlin', 256, this.scene);
    noiseTexture.animationSpeedFactor = 5;
    noiseTexture.persistence = 2;
    noiseTexture.brightness = 0.5;
    noiseTexture.octaves = 2;

    particleSystem.noiseTexture = noiseTexture;
    particleSystem.noiseStrength = new Vector3(1, 1, 1);

    particleSystem.emitRate = 20;

    particleSystem.start();

    SceneLoader.ImportMeshAsync(
        'trophy',
        '/babylon-lowpoly-showcase/scenes/',
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
        const mat = <StandardMaterial>trophy.material;
        mat.emissiveColor = new Color3(0.05, 0.05, 0.05);
      }
    });
  }

  /**
   * reder scene.
   */
  private update() {
    this.scene.render();
  }
}
