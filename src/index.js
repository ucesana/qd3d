export * from "./core/common";
export * from "./core/document";
export { Colour } from "./graphics/colour";
export { Engine } from "./engine";
export { Light } from "./graphics/light";
export { ObjectFactory } from "./graphics/object-factory";
export { RasterRenderer } from "./graphics/raster-renderer";
export { RaytraceRenderer } from "./graphics/raytrace-renderer";
export { VectorRenderer } from "./graphics/vector-renderer";
export { Vec3 } from "./mathematics/vec3";
export { World } from "./graphics/world";
export { LightColourGuiAdaptor } from "./gui/light-colour-gui-adaptor";
export { LightPositionGuiAdaptor } from "./gui/light-position-gui-adaptor";

import * as dat from 'dat.gui';
export const gui = new dat.GUI();
