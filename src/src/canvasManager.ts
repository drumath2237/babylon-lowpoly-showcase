import {
  ArcRotateCamera,
  Axis,
  Color3,
  Color4,
  DefaultRenderingPipeline,
  Effect,
  Engine,
  Mesh,
  MeshBuilder,
  NoiseProceduralTexture,
  ParticleSystem,
  PostProcess,
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
  private mainCamera: ArcRotateCamera;

  /**
   * constrcutor.
   * @param {HTMLCanvasElement} _canvas canvas element
   */
  public constructor(_canvas: HTMLCanvasElement) {
    this.canvas = _canvas;
    this.engine = new Engine(this.canvas, true, {antialias: true});
    this.scene = new Scene(this.engine);

    this.mainCamera = new ArcRotateCamera(
        'mainCamera',
        -Math.PI / 2,
        Math.PI / 2,
        1.3,
        new Vector3(0, 0, 0),
        this.scene,
        true,
    );
    this.mainCamera.minZ = 0;
    this.mainCamera.fov = 1.2;

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
    this.configureLatheObjects();

    SceneLoader.ImportMeshAsync(
        'mask',
      process.env.GH_PAGES === 'true' ?
        '/babylon-lowpoly-showcase/scenes/' :
        '/scenes/',
      'mask.babylon',
      this.scene,
      (event) => {
        if (event.lengthComputable) {
          const progress = event.loaded / event.total;
          console.log(`loading progress: ${Math.ceil(progress * 100)}%`);
        }
      },
    ).then((_scene) => {
      const obj = <Mesh>_scene.meshes[0];

      if (obj) {
        // obj.position = new Vector3(0, -0.2, 0);
        obj.scaling = obj.scaling.multiplyByFloats(0.4, 0.4, 0.4);
        obj.rotate(Axis.Y, 1.5 * Math.PI, Space.WORLD);
        obj.convertToFlatShadedMesh();
      }
    });

    document.body.addEventListener('mousemove', (event) => {
      const posX = event.pageX / this.engine.getRenderWidth();
      const posY = event.pageY / this.engine.getRenderHeight();
      const range = Math.PI / 15;
      this.mainCamera.alpha = -Math.PI / 2 + range / 2 - posX * range;
      this.mainCamera.beta = Math.PI / 2 + range / 2 - posY * range;
    });
    // this.mainCamera.attachControl();

    this.scene.clearColor = new Color4(0.014, 0.017, 0.021, 1);
  }

  private configureLatheObjects() {
    const shapes = [
      [new Vector3(0.45 + 0.25), new Vector3(0.48 + 0.25)],
      [new Vector3(0.5 + 0.25), new Vector3(0.55 + 0.25)],
      [new Vector3(0.57 + 0.25), new Vector3(0.58 + 0.25)],
      [new Vector3(0.65 + 0.25), new Vector3(0.69 + 0.25)],
    ];

    const arcs = [0.5, 0.2, 0.95, 0.3];

    const speeds = [1, -3, 0.4, 1.5];

    const mat = new StandardMaterial('latheMat', this.scene);
    mat.emissiveColor = new Color3(1.0, 1.0, 1.0);
    mat.backFaceCulling = false;

    shapes.forEach((shape, i, _) => {
      const latheMesh = MeshBuilder.CreateLathe(
          `lathe${i}`,
          {
            shape: shape,
            arc: arcs[i],
            closed: false,
            tessellation: 128,
          },
          this.scene,
      );
      latheMesh.material = mat;
      latheMesh.rotate(new Vector3(1, -3, 2), -0.95, Space.WORLD);
      // latheMesh.translate(
      //     new Vector3(0, -1, 0),
      //     0.1,
      //     Space.WORLD,
      // );
      latheMesh.onBeforeRenderObservable.add((event) => {
        event.rotate(new Vector3(0, 1, 0), 0.002 * speeds[i], Space.LOCAL);
      });
    });
  }

  private configureParticles() {
    const particleSystem = new ParticleSystem('particle', 5000, this.scene);
    particleSystem.emitter = new Vector3(0, 0, 0);
    particleSystem.minEmitBox = new Vector3(-1, -1, -1);
    particleSystem.maxEmitBox = new Vector3(1, 1, 1);
    particleSystem.particleTexture = new Texture(
        'https://playground.babylonjs.com/textures/flare.png',
        this.scene,
    );
    particleSystem.maxSize = 0.005;
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
    particleSystem.noiseStrength = new Vector3(0.04, 0.1, 0.04);

    particleSystem.emitRate = 10;

    particleSystem.preWarmCycles = 300;

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
    pipeline.imageProcessing.vignetteWeight = 13;
  }

  private customPP() {
    const postProcess = new PostProcess(
        'glitch',
      process.env.GH_PAGES === 'true' ?
        '/babylon-lowpoly-showcase/postprocess/glitch' :
        '/postprocess/glitch',
      ['resolution', 'time'],
      null,
      1.0,
      this.mainCamera,
    );
    postProcess.onApply = (effect: Effect) => {
      effect.setFloat2('resolution', postProcess.width, postProcess.height);
      effect.setFloat('time', this.scene.getFrameId() / this.engine.getFps());
    };
  }
  /**
   * reder scene.
   */
  private update() {
    this.scene.render();
  }

  public resize() {
    this.engine.resize();
  }
}
