var tooltip;

function initTooltips(root = document){
	root.querySelectorAll("[data-tooltip]").forEach(setupTooltip);
}

function setupTooltip(el){
	el.addEventListener("mouseover", tooltipOn);
	el.addEventListener("pointerover", tooltipOn);
}

function tooltipOn(e){
	e.target.removeEventListener("mouseover", tooltipOn);
	e.target.removeEventListener("pointerover", tooltipOn);
	e.target.addEventListener("mousemove", tooltipMove);
	e.target.addEventListener("pointermove", tooltipMove);
	e.target.addEventListener("mouseout", tooltipOff);
	e.target.addEventListener("pointerout", tooltipOff);
	tooltip = document.createElement("div");
	tooltip.id = "tooltip";
	tooltip.innerHTML = e.target.getAttribute("data-tooltip");
	tooltipMove(e);
	document.body.appendChild(tooltip);
}

function tooltipMove(e){
	tooltip.style.left = e.clientX + "px";
	tooltip.style.top = e.clientY + "px";
}

function tooltipOff(e){
	e.target.removeEventListener("mousemove", tooltipMove);
	e.target.removeEventListener("pointermove", tooltipMove);
	e.target.addEventListener("mouseover", tooltipOn);
	e.target.addEventListener("pointerover", tooltipOn);
	e.target.removeEventListener("mouseout", tooltipOff);
	e.target.removeEventListener("pointerout", tooltipOff);
	document.body.removeChild(tooltip);
}

export { initTooltips };
