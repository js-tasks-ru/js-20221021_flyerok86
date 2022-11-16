import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  chartHeight = 50;

  constructor({
    data = [],
    label = "",
    value = "",
    link = "",
    formatHeading = (data) => `$${data}`,
    url,
  } = {}) {
    this.data = this.getColumnProps(data);
    this.label = label;
    this.value = value;
    this.link = link;
    this.heading = formatHeading.call(this, value);
    this.url = url;

    this.loadingClassName = "column-chart_loading";

    this.render();
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

  update(from, to) {
    const url = new URL(this.url, BACKEND_URL);

    url.searchParams.set("from", from);
    url.searchParams.set("to", to);

    return fetchJson(url)
      .then((data) => {
        this.element.classList.add(this.loadingClassName);

        const backendData = Object.values(data);
        this.data = this.getColumnProps(backendData);

        this.subElements.body.innerHTML = this.getBodyInner();
        return data;
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.element.classList.remove(this.loadingClassName);
      });
  }

  getTemplate() {
    return `
    <div class="column-chart${
      this.data.length === 0 ? ` ${this.loadingClassName}` : ""
    }" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    ${this.label}
                    ${
                      this.link &&
                      `<a href="${this.link}" class="column-chart__link">View All</a>`
                    }
                 </div>
                 <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">
                        ${this.heading}
                    </div>
                      <div data-element="body" class="column-chart__chart">
                        ${this.getBodyInner()}
                      </div>
              </div>
            </div>
        `;
  }

  getBodyInner() {
    return this.data
      .map((item) => {
        return `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`;
      })
      .join("");
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");

    let result = {};
    for (const node of elements) {
      result[node.dataset.element] = node;
    }
    return result;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
