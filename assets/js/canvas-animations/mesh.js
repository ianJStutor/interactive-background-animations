export default class Mesh {

    static className = "Mesh";
    static desc = "mesh background";

    static setupCanvas(canvas) {
        canvas.classList.add(Mesh.className);
    }

    static destroyCanvas(canvas) {
        canvas.classList.remove(Mesh.className);
    }

    constructor(ctx, options) {
        ctx && this.setCtx(ctx);
        this.settings = Object.assign({
            x: null,
            y: null,
            color: "black",
            radius: 0,
            minRadius: 2,
            maxRadius: 2,
            speed: null,
            minSpeed: 0.25,
            maxSpeed: 1.5,
            angle: null,
            bounds: null,
            minLineDistance: 10,
            maxLineDistance: 150,
            lineWidth: 0.5,
            pointEventDistance: 50,
            pointEventMultiplier: 3,
            pointEventRecoverSpeed: 1.5
        }, options);

        //position
        this.x = this.settings.x ?? Math.random() * this.ctx.canvas.width;
        this.y = this.settings.y ?? Math.random() * this.ctx.canvas.height;

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

    update(dt, particles) {
        //must have a context
        if (!this.ctx) return false;
        this.draw(particles);
        this.move(dt);
        return true;
    }

    draw(particles) {
        const ctx = this.ctx;
        const { maxLineDistance, minLineDistance, lineWidth } = this.settings;
        if (this.radius) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = lineWidth;
        for (let p of particles) {
            const dist = Math.hypot(this.x - p.x, this.y - p.y);
            if (dist < maxLineDistance && dist > minLineDistance) {
                ctx.globalAlpha = (maxLineDistance - dist) / maxLineDistance;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }

    move(dt) {
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
                this.x = this.bounds.right + this.radius;
            }
            if (this.x - this.radius > this.bounds.right) {
                this.x = -this.radius;
            }
            if (this.y + this.radius < this.bounds.top) {
                this.y = this.bounds.bottom + this.radius;
            }
            if (this.y - this.radius > this.bounds.bottom) {
                this.y = -this.radius;
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
