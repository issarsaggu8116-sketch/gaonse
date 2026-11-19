// Ensure FormData is polyfilled early for React Native / Hermes New Architecture
if (typeof global.FormData === "undefined") {
  global.FormData = class FormData {
    constructor() {
      this._parts = [];
    }
    append(name, value) {
      this._parts.push([name, value]);
    }
    getParts() {
      return this._parts;
    }
    toString() {
      return "[object FormData]";
    }
  };
}

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);