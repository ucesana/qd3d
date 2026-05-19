# Quick & Dirty 3D

By Ulpian Cesana

This project is an attempt to write a 3D raster renderer in JavaScript. 

I wrote this software renderer because I always wanted to understand the fundamentals of 3D graphics. It is a very 
crude implementation and it is not intended for production use. 

## Try it out

To build the project with NPM:

```bash
npm install
npm run build
```

This will create `dist/main.js` library module. 

To run the demo, open up `dist/index.html` in your browser or visit the [live demo](https://ucesana.github.io/qd3d/).

Just drag-and-drop an OBJ file onto the window and you should be able to see the model. You can also drop a texture 
file as a JPEG or PNG. Currently, only one texture will be loaded at any one time, so the same texture will be applied 
to all OBJ files you drop in the window. Have a look in the public directory. First try dropping the `utah-teapot.obj` 
onto the canvas. Then reload the page and try dropping the `Muschel_C.obj` and the `Muschel_C_Material.png` files.  

You can move around the scene using the WASD keys, and you can look around using the IJKL keys.

There are three directional light sources and three point light sources. Feel free to experiment with the light 
properties in the controls in the top right of the screen.

## Why 'Quick & Dirty'?

My Quick & Dirty projects are just experiments I use to learn new algorithms and programming concepts. They are quick 
to write because I will sacrifice good programming standards to just get things working, and they are dirty, because 
they are guaranteed to contain bugs.

## References

[ScratchPixel](https://www.scratchapixel.com/) 

[OneLoneCoder 3D Graphics Engine](https://www.onelonecoder.com/projects.html)

[Computer Graphics, Fall 2009 - UC Davis Acedemics](https://www.youtube.com/playlist?list=PL_w_qWAQZtAZhtzPI5pkAtcUVgmzdAP8g)
