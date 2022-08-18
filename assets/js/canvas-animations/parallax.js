export default class Parallax {

    static className = "Parallax";
    static desc = "parallax hexagons";

    static setupCanvas(canvas) {
        canvas.classList.add(Parallax.className);
    }

    static destroyCanvas(canvas) {
        canvas.classList.remove(Parallax.className);
    }

    constructor(ctx, options) {
        ctx && this.setCtx(ctx);
        this.settings = Object.assign({
            x: null,
            y: null,
            defaultPositionOnCanvas: true,
            minOffscreen: 0,
            maxOffscreen: 0,
            color: "black",
            lineWidth: 2,
            opacity: 0.25,
            radius: null,
            minRadius: 25,
            maxRadius: 200,
            maxSpeed: 5,
            bounds: null,
            pointEventMultiplier: 0.1,
            pointEventRecoverSpeed: 0.01
        }, options);

        //radius and point array
        const { radius, minRadius, maxRadius, pushDistance } = this.settings;
        this.radius = radius ?? Math.random() * (maxRadius - minRadius) + minRadius;
        this.points = [];
        for (let a = 0; a < 6; a++) {
            const angle = Math.PI/3 * a;
            const x = this.radius * Math.cos(angle);
            const y = this.radius * Math.sin(angle);
            this.points.push({x, y});
        }

        //position
        this.setPosition();

        //speed
        this.vx = this.originalVx = 0;
        this.vy = this.originalVy = 0;

        //color
        this.color = this.settings.color;

        //bounds
        this.setBounds();

    }

    setPosition(side) {
        if (this.settings.x) this.x = this.settings.x;
        if (this.settings.y) return this.y = this.settings.y;
        if (this.settings.defaultPositionOnCanvas || !side) {
            this.x = Math.random() * this.ctx.canvas.width;
            return this.y = Math.random() * this.ctx.canvas.height;
        }
        const { width, height } = this.ctx.canvas;
        const { minOffscreen, maxOffscreen } = this.settings;
        switch(side) {
            case "top":
                this.x = Math.random() * width;
                this.y = -this.radius - (Math.random() * (maxOffscreen - minOffscreen) + minOffscreen);
                break;
            case "bottom":
                this.x = Math.random() * width;
                this.y = height + this.radius + (Math.random() * (maxOffscreen - minOffscreen) + minOffscreen);
                break;
            case "left":
                this.x = -this.radius - (Math.random() * (maxOffscreen - minOffscreen) + minOffscreen);
                this.y = Math.random() * height;
                break;
            case "right":
                this.x = width + this.radius + (Math.random() * (maxOffscreen - minOffscreen) + minOffscreen);
                this.y = Math.random() * height;
                break;
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
        //predefine center point
        this.bounds.width = this.bounds.right - this.bounds.left;
        this.bounds.height = this.bounds.bottom - this.bounds.top;
        this.bounds.centerX = this.bounds.width * 0.5 + this.bounds.left;
        this.bounds.centerY = this.bounds.height * 0.5 + this.bounds.top;
    }

    update(dt, particles) {
        //must have a context
        if (!this.ctx) return false;
        this.draw();
        this.move(dt);
        return true;
    }

    draw(particles) {
        const ctx = this.ctx;
        const { centerX, centerY, width, height } = this.bounds;
        const xScale = Math.abs(centerX - this.x) / width;
        const yScale = Math.abs(centerY - this.y) / height;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(xScale, yScale);
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        ctx.lineTo(this.points[1].x, this.points[1].y);
        ctx.lineTo(this.points[2].x, this.points[2].y);
        ctx.lineTo(this.points[3].x, this.points[3].y);
        ctx.lineTo(this.points[4].x, this.points[4].y);
        ctx.lineTo(this.points[5].x, this.points[5].y);
        ctx.lineTo(this.points[0].x, this.points[0].y);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.settings.opacity;
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.settings.lineWidth;
        ctx.globalAlpha = 1;
        ctx.stroke();
        ctx.restore();
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
        //wrap
        if (this.bounds) {
            if (this.x + this.radius < this.bounds.left) {
                this.settings.defaultPositionOnCanvas = false;
                this.setPosition("right");
            }
            else if (this.x - this.radius > this.bounds.right) {
                this.settings.defaultPositionOnCanvas = false;
                this.setPosition("left");
            }
            if (this.y + this.radius < this.bounds.top) {
                this.settings.defaultPositionOnCanvas = false;
                this.setPosition("bottom");
            }
            else if (this.y - this.radius > this.bounds.bottom) {
                this.settings.defaultPositionOnCanvas = false;
                this.setPosition("top");
            }
        }
    }

    pointEvent(x, y) {
        const { maxSpeed, pointEventMultiplier } = this.settings;
        const { centerX, centerY, width, height } = this.bounds;
        const dist = Math.hypot(centerX - x, centerY - y);
        const speedMultiplier = dist / Math.min(width, height);
        const posXMultiplier = x < centerX ? -1 : 1;
        const posYMultiplier = y < centerY ? -1 : 1;
        this.vx = posXMultiplier * speedMultiplier * pointEventMultiplier * this.radius;
        this.vy = posYMultiplier * speedMultiplier * pointEventMultiplier * this.radius;
    }

}
