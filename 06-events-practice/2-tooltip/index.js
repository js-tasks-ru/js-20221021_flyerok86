class Tooltip {
  static instance;

  constructor() {
    this.setPos = this.setPos.bind(this);
    this.remove = this.remove.bind(this);

    this.mouseOverHandler = this.mouseOverHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseOutHandler = this.mouseOutHandler.bind(this);

    this.tooltipOffset = 5;

    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize() {
    document.addEventListener("pointerover", this.mouseOverHandler);
  }

  mouseOverHandler(event) {
    const mouseOverElement = event.target.closest("[data-tooltip]");

    if (!mouseOverElement) return;

    this.render(mouseOverElement.dataset.tooltip || "");
    this.setPos(event);

    document.addEventListener("pointermove", this.mouseMoveHandler);
    document.addEventListener("pointerout", this.mouseOutHandler);
  }

  mouseMoveHandler(event) {
    this.setPos(event);
  }

  mouseOutHandler(event) {
    document.removeEventListener("pointermove", this.mouseMoveHandler);
    document.removeEventListener("pointerout", this.mouseOutHandler);
    this.remove();
  }

  setPos(event) {
    this.element.style.left = `${event.clientX + this.tooltipOffset}px`;
    this.element.style.top = `${event.clientY + this.tooltipOffset}px`;
  }

  render(text = "") {
    this.element = document.createElement("div");
    this.element.className = "tooltip";
    this.element.innerHTML = text;
    document.body.append(this.element);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    document.removeEventListener("pointerover", this.mouseOverHandler);
    document.removeEventListener("pointermove", this.mouseMoveHandler);
    document.removeEventListener("pointerout", this.mouseOutHandler);
    this.remove();
  }
}

export default Tooltip;
