import CanvasManager from './canvasManager';

/**
 * app
 */
export default class App {
  public static instance: App | null;

  private manager: CanvasManager;

  /**
   * const
   * @param {HTMLCanvasElement} canvas canvas
   */
  private constructor(canvas: HTMLCanvasElement) {
    this.manager = new CanvasManager(canvas);
  }

  /**
   * run the babylon app
   * @param {HTMLCanvasElement} canvas canvas
   */
  public static run(canvas: HTMLCanvasElement) {
    this.instance = new App(canvas);
  }
}
