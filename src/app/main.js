import { ShirtScene } from '../scene/ShirtScene.js';
import { UIController } from '../ui/UIController.js';

const container = document.getElementById('scene');
const scene = new ShirtScene(container);
new UIController(scene);
