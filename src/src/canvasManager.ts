import {
  Axis,
  Engine,
  Mesh,
  Scene,
  SceneLoader,
  Space,
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
    // eslint-disable-next-line new-cap
    // MeshBuilder.CreateBox('box', {}, this.scene);
    this.scene.createDefaultCameraOrLight(true, true, true);

    // eslint-disable-next-line new-cap
    SceneLoader.AppendAsync(
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
      const trophy = <Mesh>_scene.getMeshByName('trophy');
      if (trophy !== null) {
        trophy.position = new Vector3(0, -0.2, 0);
        trophy.scaling = trophy.scaling.multiplyByFloats(0.5, 0.5, 0.5);
        trophy.rotate(Axis.Y, 1.5 * Math.PI, Space.WORLD);
        trophy.convertToFlatShadedMesh();
      }
    });
    // this.scene.createDefaultEnvironment();
  }

  /**
   * reder scene.
   */
  private update() {
    this.scene.render();
  }
}
