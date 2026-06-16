import { ShirtScene } from './scene.js';
import { UIController } from './ui.js';

const container = document.getElementById('scene');
const scene = new ShirtScene(container);
new UIController(scene);
