type Scene = any;

declare global {
  // eslint-disable-next-line no-var
  var __SCENES__: Map<string, Scene> | undefined;
}

export function getStore() {
  if (!globalThis.__SCENES__) {
    globalThis.__SCENES__ = new Map<string, Scene>();
  }
  return globalThis.__SCENES__;
}
