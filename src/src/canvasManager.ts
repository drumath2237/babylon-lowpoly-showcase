import {Engine, MeshBuilder, Scene} from '@babylonjs/core';

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
    MeshBuilder.CreateBox('box', {}, this.scene);
    this.scene.createDefaultCameraOrLight(true, true, true);
    // this.scene.createDefaultEnvironment();
  }

  /**
   * reder scene.
   */
  private update() {
    this.scene.render();
  }
}
