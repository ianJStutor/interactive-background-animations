export default class Metaball {

    static className = "Metaball";
    static desc = "coffee cream";

    static setupCanvas(canvas) {
        canvas.classList.add(Metaball.className);
    }

    static destroyCanvas(canvas) {
        canvas.classList.remove(Metaball.className);
    }

    constructor(ctx, options) {
        ctx && this.setCtx(ctx);
        this.settings = Object.assign({
            x: null,
            y: null,
            color: "black",
            radius: null,
            minRadius: 25,
            maxRadius: 100,
            speed: null,
            minSpeed: 0.25,
            maxSpeed: 2,
            angle: null,
            bounds: null,
            pointEventDistance: null,
            pointEventMultiplier: 0.5,
            pointEventRecoverSpeed: 0.1
        }, options);

        //position
        this.x = this.settings.x ?? this.ctx?.canvas.width * 0.5;
        this.y = this.settings.y ?? this.ctx?.canvas.height * 0.5;

        //direction & speed
        const { minSpeed, maxSpeed } = this.settings;
        const angle = this.settings.angle ?? Math.random() * Math.PI * 2;
        const speed = this.settings.speed ?? Math.random() * (maxSpeed - minSpeed) + minSpeed;
        this.vx = this.originalVx = speed * Math.cos(angle);
        this.vy = this.originalVy = speed * Math.sin(angle);

        //radius & push distance
        const { radius, minRadius, maxRadius, pushDistance } = this.settings;
        this.radius = radius ?? Math.random() * (maxRadius - minRadius) + minRadius;
        this.pointEventDistance = this.settings.pointEventDistance ?? this.radius * 2.5;

        //color
        this.color = this.settings.color;

        //bounds
        this.setBounds();

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
        return true;
    }

    #draw() {
        const ctx = this.ctx;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
    }

    #move(dt) {
        //resistance
        if (this.vx !== this.originalVx) {
            const diff = this.originalVx - this.vx;
            if (Math.abs(diff) < 0.5) this.vx = this.originalVx;
            else {
                this.vx += diff * this.settings.pointEventRecoverSpeed;
            }
        }
        if (this.vy !== this.originalVy) {
            const diff = this.originalVx - this.vy;
            if (Math.abs(diff) < 0.5) this.vy = this.originalVy;
            else {
                this.vy += diff * this.settings.pointEventRecoverSpeed;
            }
        }
        //normal move
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        //bounce
        if (this.bounds) {
            if (this.x + this.radius < this.bounds.left) {
                this.x = this.bounds.left - this.radius;
                this.vx = this.originalVx = Math.abs(this.vx);
            }
            if (this.x - this.radius > this.bounds.right) {
                this.x = this.bounds.right + this.radius;
                this.vx = this.originalVx = -Math.abs(this.vx);
            }
            if (this.y + this.radius < this.bounds.top) {
                this.y = this.bounds.top - this.radius;
                this.vy = this.originalVy = Math.abs(this.vy);
            }
            if (this.y - this.radius > this.bounds.bottom) {
                this.y = this.bounds.bottom + this.radius;
                this.vy = this.originalVy = -Math.abs(this.vy);
            }
        }
    }

    pointEvent(x, y) {
        //flee the point
        const xDist = x - this.x;
        const yDist = y - this.y;
        const dist = Math.hypot(xDist, yDist);
        const maxDist = this.pointEventDistance;
        if (dist < maxDist) {
            const pushNorm = (maxDist - dist) / maxDist; //normalize
            const push = pushNorm * this.settings.pointEventMultiplier;
            const angle = Math.atan2(yDist, xDist);
            const dx = Math.cos(angle) * push;
            const dy = Math.sin(angle) * push;
            this.vx -= dx;
            this.vy -= dy;
        }
    }

}
