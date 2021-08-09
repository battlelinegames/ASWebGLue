import ASLoader from '@assemblyscript/loader';
import {initASWebGLue, ASWebGLReady} from 'aswebglue/src/ASWebGLue.js';

import path from 'path';
import fs from 'fs';

/////////////// Setup WebGL for Node.js

import webgl from 'webgl-raub';
import glfwRaub from 'glfw-raub';

const {Document} = glfwRaub;

Document.setWebgl(webgl); // plug this WebGL impl into the Document

const doc = new Document();
global.document = global.window = doc;
const {requestAnimationFrame} = doc;

///////////// Use ASWebGLue like in a browser.

console.log('>>>>>>>>>>>', document.getElementById);
// process.exit()

const isNode = true; /*TODO*/

const wasm_file = isNode ? fs.readFileSync(path.resolve('cube.wasm')) : fetch('./cube.wasm');

var exports;
var last_time = 0;

// TODO set up window size in Node.js with webgl-raub
// var w = window.innerWidth * 0.99
// var h = window.innerHeight * 0.99
// var cnvs = document.getElementById('cnvs')
// if (w > h) {
// 	cnvs.width = h
// 	cnvs.height = h
// } else {
// 	cnvs.width = w
// 	cnvs.height = w
// }

function renderFrame() {
  let delta = 0;
  if (last_time !== 0) {
    delta = new Date().getTime() - last_time;
  }
  last_time = new Date().getTime();

  // call the displayLoop function in the WASM module
  exports.displayLoop(delta);

  // requestAnimationFrame calls renderFrame the next time a frame is rendered
  requestAnimationFrame(renderFrame);
}

async function main() {
  const importObject = {
    env: {seed: Date.now, memory: new WebAssembly.Memory({initial: 100})},
  };
  initASWebGLue(importObject);

  let module = await ASLoader.instantiate(wasm_file, importObject);

  exports = module.instance.exports;

  ASWebGLReady(module, importObject);
  requestAnimationFrame(renderFrame);
}

main();
