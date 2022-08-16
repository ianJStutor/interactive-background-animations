import {
    ParticleEngine,
    animations
} from "./canvas-animations/index.js";

var engine = null;
var currentAnimation = null;
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

        for (let i=0; i<100; i++) {
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

        for (let i=0; i<50; i++) {
            engine.addParticle(new Mesh(ctx, {color: fgcolor}));
        }

        engine.start();
    }
};

const headerAnimations = {
    init(ctx, nav) {
        engine = new ParticleEngine(ctx, {pointEvents: true, useParentForPointEvents: true});
        for (let a of Object.values(animations)) {
            const button = document.createElement("button");
            button.setAttribute("title", a.desc);
            nav.append(button);
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
    },
    setColor(color) { fgcolor = color; },
    start(rand = true) {
        if (rand) {
            const anims = Object.values(animations);
            const a = anims[Math.floor(Math.random() * anims.length)];
            const button = document.querySelector(`[title="${a.desc}"]`);
            button?.click();
        }
        else engine.start();
    },
    stop() { engine.stop(); },
    pause() { engine.pause(); }
};

export default headerAnimations;
