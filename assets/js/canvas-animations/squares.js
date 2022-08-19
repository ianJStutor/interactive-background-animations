export default class Square {

    static className = "Square";
    static desc = "floating squares";

    static setupCanvas(canvas) {
        canvas.classList.add(Square.className);
    }

    static destroyCanvas(canvas) {
        canvas.classList.remove(Square.className);
    }

    static getSmallSquare(square) {
        const { explosionNewParticleSizeMultiplierMin: minSize, explosionNewParticleSizeMultiplierMax: maxSize } = square.settings;
        const sizeMultiplier = Math.random() * (maxSize - minSize) + minSize;
        const s = new Square(square.ctx, {
            x: square.x,
            y: square.y,
            color: square.color,
            size: Math.max(1, square.size * sizeMultiplier),
            trajectory: null,
            shouldWrap: false
        });
        s.vx += square.vx;
        s.vy += square.vy;
        s.enteredBounds = true;
        return s;
    }

    constructor(ctx, options) {
        ctx && this.setCtx(ctx);
        this.settings = Object.assign({
            x: null,
            y: null,
            color: "black",
            size: null,
            minSize: 20,
            maxSize: 75,
            minOffscreen: 10,
            maxOffscreen: 500,
            speed: null,
            minSpeed: 1,
            maxSpeed: 5,
            angle: null,
            angularVelocity: null,
            angularVelocityMin: -0.05,
            angularVelocityMax: 0.05,
            trajectory: 0, //moving right by default
            bounds: null,
            explosionNewParticlesMin: 5,
            explosionNewParticlesMax: 25,
            explosionNewParticleSizeMultiplierMin: 0.1,
            explosionNewParticleSizeMultiplierMax: 0.25,
            shouldExplode: true, //explodable by default
            shouldExplodeMinSize: 15,
            shouldRender: true, //rendered by default
            shouldWrap: true, //reset location (etc.) when exiting bounds
            pointEventDistanceMultiplier: 1.1, //times size for hit circle
            pointEventMultiplier: 0.75
        }, options);

        //bounds
        this.setBounds();

        //color
        this.color = this.settings.color;

        //size, postion, etc.
        this.#reset();

    }

    #reset() {
        //size, halfsize
        const { size, minSize, maxSize } = this.settings;
        this.size = size ?? Math.random() * (maxSize - minSize) + minSize;
        this.halfsize = this.size * 0.5;

        //position
        const { minOffscreen, maxOffscreen } = this.settings;
        this.x = this.settings.x ?? this.bounds.left - this.size - Math.random() * (maxOffscreen - minOffscreen) - minOffscreen;
        this.y = this.settings.y ?? Math.random() * (this.ctx.canvas.height - this.size * 2.5) + this.size * 1.25;

        //direction & speed, rotation
        const { minSpeed, maxSpeed, angularVelocityMin, angularVelocityMax } = this.settings;
        const trajectory = this.settings.trajectory ?? Math.random() * Math.PI * 2;
        const speed = this.settings.speed ?? Math.random() * (maxSpeed - minSpeed) + minSpeed;
        this.vx = speed * Math.cos(trajectory);
        this.vy = speed * Math.sin(trajectory);
        this.angle = this.settings.angle ?? Math.random() * Math.PI * 2;
        this.va = this.settings.angularVelocity ?? Math.random() * (angularVelocityMax - angularVelocityMin) + angularVelocityMin;

        //hit circle
        this.pointEventDistance = this.size * this.settings.pointEventDistanceMultiplier;

        //state tracking
        this.enteredBounds = false;
        this.exitedBounds = false;
        this.settings.shouldRender = true; //can be changed AFTER reset()
    }

    referenceEngine(engine) {
        this.engine = engine;
    }

    setCtx(ctx) {
        this.ctx = ctx;
    }

    setBounds(bounds) {
        if (bounds) this.bounds = bounds;
        else if (this.settings.bounds) this.bounds = this.settings.bounds;
        else if (this.ctx) {
            this.bounds = {
                left: 0, top: 0, right: this.ctx.canvas.width, bottom: this.ctx.canvas.height
            };
        }
        else this.bounds = null;
    }

    update(dt) {
        //must have a context
        if (!this.ctx) return false;
        this.#draw();
        this.#move(dt);
        //only the full-size squares reset
        if (!this.settings.shouldRender && !this.settings.shouldWrap) return false;
        if (this.enteredBounds && this.exitedBounds) {
            if (!this.settings.shouldWrap) return false;
            this.#reset();
        }
        return true;
    }

    #draw() {
        if (!this.settings.shouldRender) return;
        const ctx = this.ctx;
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillRect(-this.halfsize, -this.halfsize, this.size, this.size);
        ctx.restore();
    }

    #move(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.angle += this.va * dt;
        if (!this.enteredBounds) this.enteredBounds = this.#inBounds();
        if (this.enteredBounds && !this.exitedBounds) this.exitedBounds = !this.#inBounds();
    }

    #inBounds() {
        const {top, right, bottom, left} = this.bounds;
        return this.x - this.size > left &&
               this.x - this.size < right &&
               this.y - this.size > top &&
               this.y - this.size < bottom;
    }

    pointEvent(x, y) {
        if (!this.settings.shouldRender) return;
        const xDist = x - this.x;
        const yDist = y - this.y;
        const dist = Math.hypot(xDist, yDist);
        const maxDist = this.pointEventDistance;
        if (dist < maxDist) {
            //hide this particle
            this.settings.shouldRender = false;
            if (this.size > this.settings.shouldExplodeMinSize) {
                //create smaller particles as "explosion"
                const { explosionNewParticlesMin, explosionNewParticlesMax } = this.settings;
                const qty = Math.floor(Math.random() * (explosionNewParticlesMax - explosionNewParticlesMin) + explosionNewParticlesMin);
                for (let i=0; i<qty; i++) {
                    const s = Square.getSmallSquare(this);
                    this.engine.addParticle(s);
                }
            }
        }
    }

}
