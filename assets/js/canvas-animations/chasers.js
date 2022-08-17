export default class Chaser {

    static className = "Chaser";
    static desc = "flocking background";

    static setupCanvas(canvas) {
        canvas.classList.add(Chaser.className);
    }

    static destroyCanvas(canvas) {
        canvas.classList.remove(Chaser.className);
    }

    constructor(ctx, options) {
        ctx && this.setCtx(ctx);
        this.settings = Object.assign({
            x: null,
            y: null,
            color: "black",
            radius: 0,
            speed: null,
            minSpeed: 1,
            maxSpeed: 5,
            angle: null,
            bounds: null,
            lineWidth: 0.5,
            isRabbit: false, //the particles chase the rabbit(s)
            rabbitMinSpeed: 4,
            rabbitMaxSpeed: 10,
            rabbitRadius: 0,
            chaseStrength: 10, //higher numbers slower
            tailLength: 25,
            slowDownMultiplier: 0.9,
            pointEventDistance: 200,
            pointEventMultiplier: 0.75
        }, options);

        //position
        this.x = this.settings.x ?? Math.random() * this.ctx.canvas.width;
        this.y = this.settings.y ?? Math.random() * this.ctx.canvas.height;

        //direction & speed
        const { minSpeed, maxSpeed } = this.settings;
        const angle = this.settings.angle ?? Math.random() * Math.PI * 2;
        const speed = this.settings.speed ?? Math.random() * (maxSpeed - minSpeed) + minSpeed;
        this.vx = speed * Math.cos(angle);
        this.vy = speed * Math.sin(angle);

        //radius & push distance
        const { radius, minRadius, maxRadius, pushDistance } = this.settings;
        this.radius = radius ?? Math.random() * (maxRadius - minRadius) + minRadius;
        this.pointEventDistance = this.settings.pointEventDistance ?? this.radius * 2.5;

        //color
        this.color = this.settings.color;

        //tail
        this.tail = [{x: this.x, y: this.y}];

        //rabbit
        this.isRabbit = this.settings.isRabbit;

        //bounds
        this.setBounds();

    }

    setAsRabbit(bool = true) {
        this.isRabbit = bool;
        if (this.isRabbit) {
            //recalculate speed
            const { rabbitMinSpeed, rabbitMaxSpeed } = this.settings;
            const angle = this.settings.angle ?? Math.random() * Math.PI * 2;
            const speed = this.settings.speed ?? Math.random() * (rabbitMaxSpeed - rabbitMinSpeed) + rabbitMinSpeed;
            this.vx = speed * Math.cos(angle);
            this.vy = speed * Math.sin(angle);
        }
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
        this.draw();
        this.move(dt, particles);
        return true;
    }

    draw() {
        const ctx = this.ctx;
        if (this.isRabbit) {
            if (this.settings.rabbitRadius) {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.settings.rabbitRadius, 0, Math.PI*2);
                ctx.fill();
            }
            return;
        }
        const { lineWidth, tailLength } = this.settings;
        if (this.radius) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = lineWidth;
        const alphaIncrement = 1 / tailLength;
        let alpha = 1;
        let point = {x: this.x, y: this.y};
        for (let p of this.tail) {
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            alpha -= alphaIncrement;
            point.x = p.x;
            point.y = p.y;
        }
        ctx.globalAlpha = 1;
    }

    move(dt, particles) {
        //tail
        if (!this.isRabbit) {
            const { tailLength } = this.settings;
            this.tail.unshift({x: this.x, y: this.y});
            if (this.tail.length > tailLength) {
                this.tail.length = tailLength;
            }
        }
        if (this.isRabbit) {
            //rabbit move, chaotic wander
            const { rabbitMaxSpeed } = this.settings;
            this.vx += Math.random() * rabbitMaxSpeed - rabbitMaxSpeed * 0.5;
            this.vy += Math.random() * rabbitMaxSpeed - rabbitMaxSpeed * 0.5;
        }
        //normal move
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        //wrap
        if (this.bounds) {
            if (this.x + this.radius < this.bounds.left) {
                this.x = this.bounds.right + this.radius;
                this.tail = [{x: this.x, y: this.y}];
            }
            else if (this.x - this.radius > this.bounds.right) {
                this.x = -this.radius;
                this.tail = [{x: this.x, y: this.y}];
            }
            if (this.y + this.radius < this.bounds.top) {
                this.y = this.bounds.bottom + this.radius;
                this.tail = [{x: this.x, y: this.y}];
            }
            else if (this.y - this.radius > this.bounds.bottom) {
                this.y = -this.radius;
                this.tail = [{x: this.x, y: this.y}];
            }
        }
        //chase
        if (!this.isRabbit) {
            const rabbits = particles.filter(p => p.isRabbit);
            if (rabbits.length) {
                const { chaseStrength } = this.settings;
                for (let r of rabbits) {
                    //move toward
                    const dx = r.x - this.x;
                    const dy = r.y - this.y;
                    const dist = Math.hypot(dx, dy);
                    this.vx += dx / (dist * chaseStrength);
                    this.vy += dy / (dist * chaseStrength);
                }
            }
        }
        //speed limiter
        const { maxSpeed, rabbitMaxSpeed, slowDownMultiplier } = this.settings;
        const max = this.isRabbit ? rabbitMaxSpeed : maxSpeed;
        if (Math.abs(this.vx) > max) this.vx *= slowDownMultiplier;
		if (Math.abs(this.vy) > max) this.vy *= slowDownMultiplier;
    }

    pointEvent(x, y) {
        //rabbits ignore point events
        if (this.isRabbit) return;
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
