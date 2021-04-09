import {
  ArcRotateCamera,
  Axis,
  Color4,
  DefaultRenderingPipeline,
  Effect,
  Engine,
  Mesh,
  NoiseProceduralTexture,
  ParticleSystem,
  PostProcess,
  Scene,
  SceneLoader,
  Space,
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
  private mainCamera: ArcRotateCamera;

  /**
   * constrcutor.
   * @param {HTMLCanvasElement} _canvas canvas element
   */
  public constructor(_canvas: HTMLCanvasElement) {
    this.canvas = _canvas;
    this.engine = new Engine(this.canvas);
    this.scene = new Scene(this.engine);

    this.mainCamera = new ArcRotateCamera(
        'mainCamera',
        -Math.PI / 2,
        Math.PI / 2,
        1.5,
        new Vector3(0, 0, 0),
        this.scene,
        true,
    );

    this.initScene();

    this.engine.runRenderLoop(() => {
      this.update();
    });
  }

  /**
   * init scene
   */
  private initScene() {
    this.configurePostProcessings();
    this.configureParticles();

    SceneLoader.ImportMeshAsync(
        'trophy',
      process.env.GH_PAGES === 'true' ?
        '/babylon-lowpoly-showcase/scenes/' :
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

    document.body.addEventListener('mousemove', (event)=>{
      const posX = event.pageX / this.engine.getRenderWidth();
      const posY = event.pageY / this.engine.getRenderHeight();
      const range = Math.PI/12;
      this.mainCamera.alpha = ((-Math.PI / 2) + (range / 2)) - (posX * range);
      this.mainCamera.beta = ((Math.PI / 2) + (range / 2)) - (posY * range);
    });

    this.scene.clearColor = new Color4(0.014, 0.017, 0.021, 1);
  }

  private configureParticles() {
    const particleSystem = new ParticleSystem('particle', 5000, this.scene);
    particleSystem.emitter = new Vector3(0, 0, 0);
    particleSystem.minEmitBox = new Vector3(-1, -1, -1);
    particleSystem.maxEmitBox = new Vector3(1, 1, 1);
    particleSystem.particleTexture = new Texture(
      process.env.GH_PAGES === 'true' ?
        'https://playground.babylonjs.com/textures/flare.png' :
        'https://playground.babylonjs.com/textures/flare.png',
      this.scene,
    );
    particleSystem.maxSize = 0.010;
    particleSystem.minSize = 0.007;
    particleSystem.color1 = new Color4(3, 3, 3, 1);
    particleSystem.color2 = new Color4(3, 3, 3, 1);
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

    particleSystem.preWarmCycles = 200;

    particleSystem.start();
  }

  private configurePostProcessings() {
    this.customPP();

    const pipeline = new DefaultRenderingPipeline(
        'defaultRP',
        true,
        this.scene,
    );

    pipeline.samples = 16;

    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.7;
    pipeline.bloomWeight = 0.7;
    pipeline.bloomScale = 0.7;
    pipeline.bloomKernel = 64;

    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.colorGradingEnabled = true;
    pipeline.imageProcessing.toneMappingEnabled = true;
    pipeline.imageProcessing.colorCurvesEnabled = true;
    if (pipeline.imageProcessing.colorCurves !== null) {
      pipeline.imageProcessing.colorCurves.globalSaturation = 70;
      pipeline.imageProcessing.contrast = 1.2;
    }
    pipeline.imageProcessing.vignetteEnabled = true;
    pipeline.imageProcessing.vignetteWeight = 10;
  }

  private customPP() {
    const postProcess = new PostProcess(
        'glitch',
        process.env.GH_PAGES==='true' ?
        '/babylon-lowpoly-showcase/postprocess/glitch' :
        '/postprocess/glitch',
        ['resolution', 'time'],
        null,
        1.0,
        this.mainCamera,
    );
    postProcess.onApply = (effect:Effect)=>{
      effect.setFloat2('resolution', postProcess.width, postProcess.height);
      effect.setFloat('time', this.scene.getFrameId()/this.engine.getFps());
    };
  }
  /**
   * reder scene.
   */
  private update() {
    this.scene.render();
  }
}
