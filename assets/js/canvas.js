const canvases = [...document.querySelectorAll("canvas")];
const contexts = canvases.map(c => c.getContext("2d"));

const debounceTime = 100; //milliseconds
var debouncer;

canvasResize();
window.addEventListener("resize", () => {
    debouncer = setTimeout(canvasResize, debounceTime);
});

function canvasResize() {
    for (let c of canvases) {
        const section = c.closest("section");
        c.width = section.clientWidth;
        c.height = section.clientHeight;
    }
}

export default contexts;
