import {
    ParticleEngine,
    animations
} from "./canvas-animations/index.js";
import { tooltips } from "https://cdn.jsdelivr.net/gh/ianJStutor/tooltips/tooltips.js";

var engine = null;
var currentAnimation = null;
var nav = null;
var fgcolor = "white";

function reset(canvas) {
    engine.stop();
    if (currentAnimation) currentAnimation.destroyCanvas?.(canvas);
}

const setup = {
    _Metaball() {
        const ctx = engine.ctx;
        const canvas = ctx.canvas;
        reset(canvas);

        const { Metaball } = animations;
        currentAnimation = Metaball;
        Metaball.setupCanvas?.(canvas);

        for (let i=0; i<75; i++) {
            engine.addParticle(new Metaball(ctx, {color: fgcolor}));
        }

        engine.start();
    },
    _Mesh() {
        const ctx = engine.ctx;
        const canvas = ctx.canvas;
        reset(canvas);

        const { Mesh } = animations;
        currentAnimation = Mesh;
        Mesh.setupCanvas?.(canvas);

        for (let i=0; i<75; i++) {
            engine.addParticle(new Mesh(ctx, {color: fgcolor}));
        }

        engine.start();
    },
    _Flag() {
        const ctx = engine.ctx;
        const canvas = ctx.canvas;
        reset(canvas);

        const { Flag } = animations;
        currentAnimation = Flag;
        Flag.setupCanvas?.(canvas);

        const simplex = new SimplexNoise(); //from <script> tag in HTML
        const points = Flag.getPointsArray(canvas.width, canvas.height, {inset: 20});
        for (let {x, y} of points) {
            engine.addParticle(new Flag(ctx, simplex, {x, y, color: fgcolor}));
        }

        engine.start();
    },
    _Chaser() {
        const ctx = engine.ctx;
        const canvas = ctx.canvas;
        reset(canvas);

        const { Chaser } = animations;
        currentAnimation = Chaser;
        Chaser.setupCanvas?.(canvas);

        for (let i=0; i<201; i++) {
            engine.addParticle(new Chaser(ctx, {color: fgcolor}));
        }
        engine.particles[0].setAsRabbit();

        engine.start();
    },
    _Square() {
        const ctx = engine.ctx;
        const canvas = ctx.canvas;
        reset(canvas);

        const { Square } = animations;
        currentAnimation = Square;
        Square.setupCanvas?.(canvas);

        for (let i=0; i<25; i++) {
            engine.addParticle(new Square(ctx, {color: fgcolor}));
        }

        engine.start();
    },
    _Parallax() {
        const ctx = engine.ctx;
        const canvas = ctx.canvas;
        reset(canvas);

        const { Parallax } = animations;
        currentAnimation = Parallax;
        Parallax.setupCanvas?.(canvas);

        for (let i=0; i<500; i++) {
            engine.addParticle(new Parallax(ctx, {color: fgcolor}));
        }

        engine.start();
    }
};

const headerAnimations = {
    init(ctx, navElement) {
        nav = navElement;
        engine = new ParticleEngine(ctx, {pointEvents: true, useParentForPointEvents: true});
        const randomAnims = [...Object.values(animations)].sort(() => Math.random() - 0.5);
        for (let i=0; i<randomAnims.length; i++) {
            const a = randomAnims[i];
            const button = document.createElement("button");
            button.setAttribute("data-tooltip", a.desc);
            nav.append(button);
            if (randomAnims[i+1] && [2, 4].includes(i)) {
                const br = document.createElement("br");
                nav.append(br);
            }
            button.addEventListener("click", () => {
                if (button.classList.contains("active")) {
                    button.classList.remove("active");
                    return engine.pause();
                }
                nav.querySelector(".active")?.classList.remove("active");
                button.classList.add("active");
                setup[`_${a.className}`]?.();
            });
        }
        tooltips(nav);
    },
    setColor(color) { fgcolor = color; },
    start(rand = true) {
        if (rand) {
            const anims = Object.values(animations);
            const a = anims[Math.floor(Math.random() * anims.length)];
            const button = nav.querySelector(`[data-tooltip="${a.desc}"]`);
            button?.click();
        }
        else engine.start();
    },
    stop() { engine.stop(); },
    pause() { engine.pause(); }
};

export default headerAnimations;
