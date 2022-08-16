# Interactive Background Animations

## Ian Marshall

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

### Live Site

> [https://ianjstutor.github.io/interactive-background-animations/](https://ianjstutor.github.io/interactive-background-animations/)

### Description

An assortment of canvas animations intended to run behind a hero or header or entire web page.

These are all built with vanilla JavaScript.

### Contents

* [<code>ParticleEngine</code> class](#particleengine)
* [<code>Particle</code> interface](#particle)

### ParticleEngine

> [class ParticleEngine](https://github.com/ianJStutor/interactive-background-animations/blob/main/assets/js/canvas-animations/particle-engine.js)

#### Instantiation

The ParticleEngine class requires a canvas 2d context to instantiate. It also accepts the options in a single object as the second argument to the constructor:

<code>
const options = {};
const engine = new ParticleEngine(ctx, options);
</code>

#### Options

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

#### Methods

* **setSize()**<br>Uses the current canvas dimensions to establish local width, height, and bounds; if the browser viewport is resized then this might need to be called manually but usually not. The loop function does check for canvas size changes automatically
* **setBounds()**<br>Unless overridden by an option, this uses the current canvas dimensions to establish bounding constraints (top, right, bottom, left) that will be passed down to each particle (to enable bounce, wrap, deletion if off screen, and other movement effects or constraints).
* **addParticle(*particle*, *beginning = false*)**<br>Add a particle to the <code>ParticleEngine</code> system. The particle expected follows an implied interface (see below). Particles are pushed to the end of the particles array unless <code>beginning = true</code>, in which case it is unshifted to the beginning of the particles array.
* **loop(*timestamp*)**<br>A single animation frame that calculates the delta time since the last call to improve smoothness at a target FPS setting. It then calls an update for each particle in the particle array, filtering out dead particles, if any. It might erase or repaint the canvas first. When done, unless specifically set to stop animation, <code>loop</code> will call itself with another <code>requestAnimationFrame</code>. Under normal conditions this function shouldn't need to be called directly.
* **erase()**<br>Before every animation frame, <code>erase</code> will clear the canvas if no <code>bgcolor</code> setting is given, otherwise will paint a solid color. If <code>clearEveryFrame = false</code> then this function will not be called.
* **start()**<br>Public function to get the animation engine started.
* **stop()**<br>Public function to stop the animation engine and clear out the particles array.
* **pause()**<br>Public function to freeze the animation engine without affecting the particles array.
* **handlePointEvents(*event*)**<br>Public function passing in the mouse/touch/pointer event that could affect the individual particles. The event's <code>{x, y}</code> position is passed to each particle, which contains the interaction code.

### Particle
