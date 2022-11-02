export default class ColumnChart {
  constructor({
    data = [],
    label = "",
    value,
    link,
    formatHeading = (data) => data,
    chartHeight = 50,
  } = {}) {
    this.data = this.getColumnProps(data);
    this.label = label;
    this.value = value;
    this.link = link;
    this.heading = formatHeading.call(this, value);
    this.chartHeight = chartHeight;

    this.update = this.update;

    this.render();
    this.initEventListeners();
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map((item) => {
      return {
        percent: ((item / maxValue) * 100).toFixed(0) + "%",
        value: String(Math.floor(item * scale)),
      };
    });
  }

  update(data) {
    this.data = this.getColumnProps(data);
    this.render();
    this.initEventListeners();
  }

  getTemplate() {
    return `<div class="dashboard__chart_orders ${
      this.data.length === 0 ? " column-chart_loading" : ""}
      ">
        <div class="column-chart" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
              ${this.label}
                ${
                  this.link
                    ? '<a href="/" class="column-chart__link">View all</a>'
                    : ""
                }
             </div>
             <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">
                  ${this.heading}
                </div>
                  <div data-element="body" class="column-chart__chart">
                    ${this.data
                      .map((item) => {
                        return `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`;
                       }).join("")}
                </div>
          </div>
        </div>
      </div> `;
  }

  render() {
    const element = document.createElement("div"); // (*)

    element.innerHTML = this.getTemplate();

    // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
    // который мы создали на строке (*)
    this.element = element.firstElementChild;
  }

  initEventListeners() {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }
}
