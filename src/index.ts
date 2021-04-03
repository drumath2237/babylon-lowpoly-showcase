import App from './src/app';
import './style/index.scss';

window.addEventListener('DOMContentLoaded', () => {
  const renderCanvas = <HTMLCanvasElement>(
    document.getElementById('renderCanvas')
  );

  if (renderCanvas !== null) {
    App.run(renderCanvas);
  }
});
