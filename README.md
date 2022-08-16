# Interactive Background Animations

## Ian Marshall

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

### Live Site

> [https://ianjstutor.github.io/interactive-background-animations/](https://ianjstutor.github.io/interactive-background-animations/)

### Description

An assortment of canvas animations intended to run behind a hero or header or entire web page.

These are all built with vanilla JavaScript.

### Particle Engine

> [code](https://github.com/ianJStutor/interactive-background-animations/blob/main/assets/js/canvas-animations/particle-engine.js)

The ParticleEngine class requires a canvas 2d context to instantiate. It also accepts the following options in a single object as the second argument to the constructor:

* **particles**: *[]*,<br>You can pre-install an array of particles
* **animate**: *true*,<br>Toggle the animation cycle; when <code>true</code> the animation runs
* **stopWhenNoParticles**: *true*,<br>Trigger an end to the animation when the last particle has been removed from the particles array
* **clearEveryFrame**: *true*,<br>Erase the canvas between each animation frame?
* **bgcolor**: *null*,<br>When set, the color is painted between each animation frame instead of just clearing the canvas (<code>ctx.fillRect</code> instead of <code>ctx.clearRect</code>)
* **fgcolor**: *"black"*,<br>Single color passed down to each particle for drawing; the particle code could override this setting if needed
* **bounds**: *null*,<br>The bounds are the pixel measurements for the top, right, bottom, and left of the canvas frame; if <code>null</code> then the entire canvas width and height are used to establish bounds, which are passed down to each particle (to enable bounce, wrap, deletion if off screen, and other movement effects or constraints)
* **targetFps**: *60*,<br>60 frames per second is a decent goal for web animations
* **pointEvents**: *false*,<br>Enable interaction with the mouse cursor, touch events, or pointer/pen/stylus device; the actions taken are defined in each particle (some might be pulled toward the cursor and some might flee, for example)
* **useParentForPointEvents**: *false*<br>If using point events, then to which element is attached the event listener? Usually it would be the canvas element itself but background canvases might be absolutely positioned behind other elements that get in the way of pointer events. If this is the case, then using <code>addEventListener</code> on the canvas's parent element should do the trick. Only use this for a background canvas that has HTML elements positioned on top of it.
