# Interactive Background Animations

## Ian Marshall

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

### Live Site

> [https://ianjstutor.github.io/interactive-background-animations/](https://ianjstutor.github.io/interactive-background-animations/)

### Description

An assortment of canvas animations intended to run behind a hero or header or entire web page.

These are all built with vanilla JavaScript, my favorite flavor!

### Contents

* [<code>ParticleEngine</code> class](#particleengine)
* [<code>Particle</code> interface](#particle)

### ParticleEngine

This class manages an HTML canvas element, its 2d context, an animation loop with fps smoothing, and an array of independent particles. Each particle contains its own update, move, lifecycle, interaction, and drawing functionality. The engine just calls that functionality every animation frame.

> [class ParticleEngine](https://github.com/ianJStutor/interactive-background-animations/blob/main/assets/js/canvas-animations/particle-engine.js)

#### Instantiation

The ParticleEngine class requires a canvas 2d context to instantiate. It also accepts the options in a single object as the second argument to the constructor:

```js
const ctx = document.querySelector("canvas").getContext("2d");
const options = {};
const engine = new ParticleEngine(ctx, options);
```

#### Options

* **particles**: *[]*,<br>You can pre-install an array of particles.
* **animate**: *true*,<br>Toggle the animation cycle; when <code>true</code> the animation runs.
* **stopWhenNoParticles**: *true*,<br>Trigger an end to the animation when the last particle has been removed from the particles array.
* **clearEveryFrame**: *true*,<br>Erase the canvas between each animation frame?
* **bgcolor**: *null*,<br>When set, the color is painted between each animation frame instead of just clearing the canvas (<code>ctx.fillRect</code> instead of <code>ctx.clearRect</code>).
* **fgcolor**: *"black"*,<br>Single color passed down to each particle for drawing; the particle code could override this setting if needed.
* **bounds**: *null*,<br>The bounds are the pixel measurements for the top, right, bottom, and left of the canvas frame; if <code>null</code> then the entire canvas width and height are used to establish bounds, which are passed down to each particle (to enable bounce, wrap, deletion if off screen, and other movement effects or constraints).
* **targetFps**: *60*,<br>60 frames per second is a decent goal for web animations.
* **pointEvents**: *false*,<br>Enable interaction with the mouse cursor, touch events, or pointer/pen/stylus device; the actions taken are defined in each particle (some might be pulled toward the cursor and some might flee, for example).
* **useParentForPointEvents**: *false*<br>If using point events, then to which element is attached the event listener? Usually it would be the canvas element itself but background canvases might be absolutely positioned behind other elements that get in the way of pointer events. If this is the case, then using <code>addEventListener</code> on the canvas's parent element should do the trick. Only use this for a background canvas that has HTML elements positioned on top of it.

#### Methods

* **setSize()**<br>Uses the current canvas dimensions to establish local width, height, and bounds; if the browser viewport is resized then this might need to be called manually but usually not. The loop function does check for canvas size changes automatically.
* **setBounds()**<br>Unless overridden by an option, this uses the current canvas dimensions to establish bounding constraints (top, right, bottom, left) that will be passed down to each particle (to enable bounce, wrap, deletion if off screen, and other movement effects or constraints).
* **addParticle(*particle*, *beginning = false*)**<br>Add a particle to the <code>ParticleEngine</code> system. The particle expected follows an implied interface (see below). Particles are pushed to the end of the particles array unless <code>beginning = true</code>, in which case it is unshifted to the beginning of the particles array. The engine also passes a reference to itself to the Particle (if it has a <code>referenceEngine()</code> function).
* **#loop(*timestamp*)**<br>A single animation frame that calculates the delta time since the last call to improve smoothness at a target FPS setting. It then calls an update for each particle in the particle array, filtering out dead particles, if any. It might erase or repaint the canvas first. When done, unless specifically set to stop animation, <code>loop</code> will call itself with another <code>requestAnimationFrame</code>.
* **erase()**<br>Before every animation frame, <code>erase</code> will clear the canvas if no <code>bgcolor</code> setting is given, otherwise will paint a solid color. If <code>clearEveryFrame = false</code> then this function will not be called.
* **start()**<br>Public function to get the animation engine started.
* **stop()**<br>Public function to stop the animation engine and clear out the particles array.
* **pause()**<br>Public function to freeze the animation engine without affecting the particles array.
* **handlePointEvents(*event*)**<br>Public function passing in the mouse/touch/pointer event that could affect the individual particles. The event's <code>{x, y}</code> position is passed to each particle, which contains the interaction code.

### Particle

JavaScript doesn't actually have an interface like real object-oriented languages. Of course, classes can extend other classes, but since every property and method would have to be overridden, this doesn't actually provide any benefit. An interface is really just a pattern to follow, and in this case the documentation will provide the pattern instead.

Below, I'll use <code>Particle</code> to represent the interface.

A Particle contains the functionality to manage a single point in 2d space, move it around, draw it to an HTML canvas, define its lifecycle, and optionally provide the means of user interaction. It does not have its own animation loop; that functionality belongs to the ParticleEngine class above.

> [sample Particle ("Mesh") that uses the Particle interface](https://github.com/ianJStutor/interactive-background-animations/blob/main/assets/js/canvas-animations/mesh.js)

#### Instantiation

```js
const ctx = document.querySelector("canvas").getContext("2d");
const options = {};
const engine = new Particle(ctx, options);
```

#### Options

Not all of these options will be needed for every specific Particle. Particles rendered as squares, for example, likely don't need a radius. Additionally, specific Particles may need more options: a spinning square, for example, would need to track current angle and rotational velocity.

* **x**: *null*,<br>Starting <code>x</code> location for the Particle. If <code>null</code>, the specific Particle will assign a value (random, start in a corner, start in the center, etc.).
* **y**: *null*,<br>Starting <code>y</code> location for the Particle. If <code>null</code>, the specific Particle will assign a value (random, start in a corner, start in the center, etc.).
* **color**: *"black"*,<br>Color value used by the <code>draw()</code> method.
* **radius**: *null*,<br>If the Particle requires a circle, this may be important. If <code>null</code>, the specific Particle will assign a value (random between <code>minRadius</code> and <code>maxRadius</code>, for example).
* **minRadius**: *null*,<br>Minimum value when randomizing a radius.
* **maxRadius**: *null*,<br>Maximum value when randomizing a radius.
* **speed**: *null*,<br>If the Particle is moving, this may be important. If <code>null</code>, the specific Particle will assign a value (random between <code>minSpeed</code> and <code>maxSpeed</code>, for example).
* **minSpeed**: *null*,<br>Minimum value when randomizing speed.
* **maxSpeed**: *null*,<br>Maximum value when randomizing speed.
* **angle**: *null*,<br>Starting trajectory measured in radians. If <code>null</code>, the specific Particle will assign a value (random between zero and two-PI, for example).
* **bounds**: *null*,<br>An object <code>{top, right, bottom, left}</code> defining the edges of the drawing box specific to this Particle. When outside of bounds, for example, a Particle may trigger its destruction, "bounce" off the wall, or "wrap" to the opposite edge. Each specific Particle will define how it responds to its bounds. If <code>null</code>, the specific Particle will assign a value for bounds as the edges of the canvas element.
* **pointEventDistance**: *0*,<br>If the Particle interacts with user input, this is the maximum distance the pointer must be from the Particle for an effect to occur. If set to <code>50</code>, for example, then the Particle only reacts to the cursor if the cursor is within 50 pixels of the Particle. If <code>0</code>, the Particle will not interact with user input.
* **pointEventMultiplier**: *1*,<br>The strength of the effect of user interaction. If <code>1</code> then there will be no change to the strength of the effect. Values less than one will reduce the effect; values greater than one will increase the effect. Negative numbers may reverse the effect, depending on the algorithm used. A value of zero will negate any effect.
* **pointEventRecoverSpeed**: *1*,<br>This makes the user interaction temporary, simulating "friction," perhaps. For example, if a Particle flees the cursor, it might eventually stop fleeing after a moment. A value of zero will force the Particle to never recover from user interaction. Higher numbers increase the speed of recovery.

#### Static Properties and Methods

* **className**<br>Contains the actual name for the class. This is useful for management as well as for applying custom CSS to the canvas element itself.
* **desc**<br>Text that describes the Particle.
* **setupCanvas(*canvas*)**<br>Adds the Particle's <code>className</code> as a class to the canvas element.
* **destroyCanvas(*canvas*)**<br>Removes the Particle's <code>className</code> from the classes of the canvas element.

#### Methods

* **setCtx(*ctx*)**<br>Assigns a canvas 2d context to the Particle. This could be used to replace the context used when the Particle was first instantiated.
* **referenceEngine(*engine*)**<br>Receives a reference to the ParticleEngine that "owns" the Particle. This enables effects like creating new Particles from within the Particle class and adding them to the engine.
* **setBounds(*bounds*)**<br>Assigns a bounds object <code>{top, right, bottom, left}</code> to the Particle. If no parameter value is given, then the Particle uses the dimensions of the canvas element to establish its bounds.
* **update(*deltaTime*, *particleArray*)**<br>The main controller function for an entire animation frame for this Particle. This is the only function called by the ParticleEngine. <code>update()</code> calls any other method needed move and draw the Particle, then return a Boolean value representing whether or not the Particle is "alive" and should be kept in or removed from the particle array. Returning <code>true</code> means the Particle is still alive; returning <code>false</code> means the Particle should no longer be tracked by the ParticleEngine. The <code>deltaTime</code> parameter is a multiplier that should affect the movement of a Particle. If the perfect FPS is achieved, this value should always be <code>1</code>. But life isn't that perfect, so some variability should be taken into account. The <code>particleArray</code> is the entire array of Particles maintained by the ParticleEngine. This could be important if the Particles need to interact with one another.
* **#draw(*particleArray*)**<br>This renders the Particle to the canvas using its 2d context. The <code>particleArray</code> may be needed to draw connections, for example, between Particles.
* **#move(*deltaTime*, *particleArray*)**<br>The algorithm for moving the particle in 2d space. Usually this means applying forces (speed, acceleration, friction, gravity, etc.) and changing the Particle's position. Additionally, this may take into account the effects of user interaction, the bounds object and edge interaction, and adjustment of net forces for FPS smoothing by multiplying by <code>deltaTime</code>, and/or an interaction among the Particles in the <code>particleArray</code>.
* **pointerEvent(*x*, *y*)**<br>The algorithm for handling an interaction with the user's mouse, touch, or pointer device. The <code>x</code> and <code>y</code> parameters represent the 2d location of the event. Some possible interactions include chasing, fleeing, orbiting, etc.
