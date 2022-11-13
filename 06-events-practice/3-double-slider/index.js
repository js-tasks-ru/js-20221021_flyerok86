export default class DoubleSlider {
  constructor({
    min = 0,
    max = 100,
    formatValue = (data) => data,
    selected = {
      from: 0,
      to: 100,
    },
  } = {}) {
    this.min = min;
    this.max = max;
    this.selected = selected;
    this.formatValue = formatValue;

    this.movableElement;

    this.render();
    this.initListeners();
  }

  initListeners() {
    this.element.addEventListener("pointerdown", this.onPointerDown);
  }

  onPointerDown = (event) => {
    console.log(event.target.dataset.element);
    this.dataset = event.target.dataset.element;

    if (!this.dataset) return;

    //this.pressedButton = event.target.dataset.element === "from" ? "left" : "right";

    this.boundary = this.element.querySelector(".range-slider__progress");
    this.thumbLeft = this.element.querySelector(
      `span[data-element="from"]`
    );
    this.thumbRight = this.element.querySelector(
        `span[data-element="to"]`
      );

    this.thumbRightRect = this.thumbRight.getBoundingClientRect();
    
    console.log(this.thumbRect)

    this.sliderInerRect = this.element
      .querySelector(".range-slider__inner")
      ?.getBoundingClientRect();

    //console.log(this.thumb.offsetWidth / 2);

    this.prevClientX = event.clientX;

    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);
  };

  onPointerMove = (event) => {
    if (event.clientX > this.sliderInerRect.right + this.thumbRight.offsetWidth) {
      this.thumbRight.style.right = "0%";
      this.boundary.style.right = "0%";
      return;
    }

    if (event.clientX < this.sliderInerRect.left - this.thumbLeft.offsetWidth / 2) {
      this.thumbLeft.style.left = "0%";
      this.boundary.style.left = "0%";
      return;
    }

    const relatedValue = this.convertPxToValue(
      event.clientX - this.prevClientX
    ); // пройденое расстояние в пиксилях приводим к относительным единицам с учетом текущей ширины прогресс бара слайдера

    let percentageValue;

  
    if (this.dataset === "from") {
        if(this.selected.from >= this.selected.to || event.clientX >=this.thumbRightRect.left) {
            if(relatedValue > 0 ) {
                return
            }
        }
      this.selected.from += relatedValue;
      percentageValue = this.convertValueToPercent(this.selected.from);
      this.thumbLeft.style.left = percentageValue + "%";
      this.boundary.style.left = percentageValue + "%";
    }

    if (this.dataset === "to") {
      //console.log(relatedValue >= this.max)
      //console.log(this.selected.to)

      console.log(event.clientX);

      this.selected.to += relatedValue;

      if (this.selected.to > this.max) {
        // если указательмыши вышел за пределы прогесс бара
        this.selected.to = this.max;
        //return
      }

      //if(relatedValue < 0 )     // если указатель мыши находится за пределами прогресс бара и

      percentageValue = this.convertValueToPercent(this.selected.to);
      this.thumbRight.style.right = 100 - percentageValue + "%";
      this.boundary.style.right = 100 - percentageValue + "%";
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

  convertValueToPercent(value) {
    return ((value - this.min) * 100) / (this.max - this.min);
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = `<div class="range-slider">${this.getTemplate()}</div>`;
    this.element = element.firstElementChild;
    //console.log();
  }

  getTemplate() {
    //console.log(this.selected.from);
    return `
        
            <span>${this.formatValue.call(this, this.selected.from)}</span>
            <div class="range-slider__inner">
            <span class="range-slider__progress" data-elem="progress" style="left: ${this.convertValueToPercent(
              this.selected.from
            )}%; right: ${
      100 - this.convertValueToPercent(this.selected.to)
    }%"></span>
            <span class="range-slider__thumb-left" data-element="from" style="left: ${this.convertValueToPercent(
              this.selected.from
            )}%"></span>
            <span class="range-slider__thumb-right" data-element="to" style="right: ${
              100 - this.convertValueToPercent(this.selected.to)
            }%"></span>
            </div>
            <span>${this.formatValue.call(this, this.selected.to)}</span>
     
        `;
  }
}
