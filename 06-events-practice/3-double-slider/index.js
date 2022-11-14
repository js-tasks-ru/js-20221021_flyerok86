export default class DoubleSlider {
  constructor({
    min = 0,
    max = 100,
    formatValue = (data) => data,
    selected = {
      from: min,
      to: max,
    },
  } = {}) {
    this.min = min;
    this.max = max;
    this.selected = selected;
    this.formatValue = formatValue;

    this.render();
    this.initListeners();
  }

  initListeners() {
    this.element.addEventListener("pointerdown", this.onPointerDown);
  }

  onPointerDown = (event) => {
    this.dataset = event.target.dataset.element;

    if (!this.dataset) return;

    this.boundary = this.element.querySelector(".range-slider__progress");

    this.leftBoundary = this.element.querySelector('span[data-element="from"]');
    this.rightBoundary = this.element.querySelector('span[data-element="to"]');
    this.innerBoundary = this.element.querySelector('[data-element="inner"]');

    this.thumbCurrent = this.element.querySelector(
      `span[data-element="${event.target.dataset.element}"]`
    );

    this.thumbLeft = this.element.querySelector(
      `span[data-element="thumbLeft"]`
    );
    this.thumbRight = this.element.querySelector(
      `span[data-element="thumbRight"]`
    );

    this.thumbLeftRect = this.thumbLeft.getBoundingClientRect();
    this.thumbRightRect = this.thumbRight.getBoundingClientRect();
    this.sliderInerRect = this.innerBoundary.getBoundingClientRect();

    this.prevClientX = event.clientX;

    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);
  };

  onPointerMove = (event) => {
    if (
      event.clientX >
      this.sliderInerRect.right + this.thumbRight.offsetWidth &&
      this.thumbCurrent === this.thumbRight
    ) {
      this.thumbRight.style.right = "0%";
      this.boundary.style.right = "0%";

      this.rightBoundary.innerHTML = this.formatValue.call(this, this.max);
      return;
    }

    if (
      event.clientX <
      this.sliderInerRect.left - this.thumbLeft.offsetWidth / 2 &&
      this.thumbCurrent === this.thumbLeft
    ) {
      this.thumbLeft.style.left = "0%";
      this.boundary.style.left = "0%";

      this.leftBoundary.innerHTML = this.formatValue.call(this, this.min);
      return;
    }

    const relatedValue = this.convertPxToValue(
      event.clientX - this.prevClientX
    ); // пройденое расстояние в пиксилях приводим к относительным единицам с учетом текущей ширины прогресс бара слайдера

    let percentageValue;

    if (this.thumbCurrent === this.thumbLeft) {
      if (
        this.selected.from >= this.selected.to ||
        event.clientX >= this.thumbRightRect.left
      ) {
        if (relatedValue > 0) {
          return;
        }
      }
      this.selected.from += relatedValue;
      percentageValue = this.convertValueToPercent(this.selected.from);
      this.thumbLeft.style.left = percentageValue + "%";
      this.boundary.style.left = percentageValue + "%";

      this.leftBoundary.innerHTML = this.formatValue.call(
        this,
        Math.floor(this.selected.from)
      );
    }


    if (this.thumbCurrent === this.thumbRight) {
      if (
        this.selected.from >= this.selected.to ||
        event.clientX <= this.thumbLeftRect.right
      ) {
        if (relatedValue < 0) {
          return;
        }
      }

      this.selected.to += relatedValue;

      percentageValue = this.convertValueToPercent(this.selected.to);
      this.thumbRight.style.right = 100 - percentageValue + "%";
      this.boundary.style.right = 100 - percentageValue + "%";

      this.rightBoundary.innerHTML = this.formatValue.call(
        this,
        Math.ceil(this.selected.to)
      );
    }

    this.prevClientX = event.clientX;
  };

  onPointerUp = (event) => {
    this.boundary = null;
    this.prevClientX = null;

    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
  };

  convertPxToValue = (pxCount) => {
    return (pxCount * 100) / this.sliderInerRect.width;
  };

  convertValueToPercent = (value) => {
    return ((value - this.min) * 100) / (this.max - this.min);
  };

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  getTemplate() {
    return `
    <div class="range-slider">
            <span data-element="from">${this.formatValue.call(
              this,
              this.selected.from
            )}</span>
            <div data-element="inner" class="range-slider__inner">
            <span class="range-slider__progress" data-element="progress" style="left: ${this.convertValueToPercent(
              this.selected.from
            )}%; right: ${
      100 - this.convertValueToPercent(this.selected.to)
    }%"></span>
            <span class="range-slider__thumb-left" data-element="thumbLeft" style="left: ${this.convertValueToPercent(
              this.selected.from
            )}%"></span>
            <span class="range-slider__thumb-right" data-element="thumbRight" style="right: ${
              100 - this.convertValueToPercent(this.selected.to)
            }%"></span>
            </div>
            <span data-element="to">${this.formatValue.call(
              this,
              this.selected.to
            )}</span>
        </div>
        `;
  }

  destroy = () => {
    this.element.remove();
    document.removeEventListener("pointerdown", this.onPointerMove);
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerUp);
  };
}
