import contexts from "./canvas.js";
import headerAnimations from "./headerAnimations.js";

const [headerCtx] = contexts;



const style = getComputedStyle(document.documentElement);
const colorDark = style.getPropertyValue("--canvas-color-dark");
const colorMid = style.getPropertyValue("--canvas-color-mid");
const colorLight = style.getPropertyValue("--canvas-color-light");



headerAnimations.init(headerCtx, document.querySelector("section:nth-of-type(1) nav"));
headerAnimations.setColor(colorLight);
headerAnimations.start();
