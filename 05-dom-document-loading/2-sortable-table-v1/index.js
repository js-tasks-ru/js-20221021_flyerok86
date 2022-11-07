export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sortableParam = { id: null, direction: null };
    this.render();
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = {
      body: this.element.querySelector('[data-element="body"]'),
      header: this.element.querySelector('[data-element="header"]'),
    };
  }

  // reRender() {
  //   const rootNode = "#root";
  //   document.querySelector(rootNode).innerHTML = this.getTemplate();
  // }

  getTemplate() {
    const header = this.getTemplateParentBlock(
      "header",
      this.getTemplateHeader()
    );
    const body = this.getTemplateParentBlock("body", this.getTemplateBody());

    return `<div data-element="productsContainer" class="products-list__container">
                            <div class="sortable-table">${header}${body}</div>
                          </div>`;
  }

  getTemplateParentBlock(blockName, inner) {
    return `<div data-element="${blockName}" class="sortable-table__${blockName} ${
      blockName === "header" ? "sortable-table__row" : ""
    }">${inner}</div>`;
  }

  getTemplateHeader() {
    return this.headerConfig
      .map(({ id, sortable, title, template }) => {
        return `
      <div class="sortable-table__cell" data-id="${id}" ${
          this.sortableParam.id === id
            ? `data-sortable="true" data-order=${this.sortableParam.direction}`
            : ""
        }">
        <span>${title}</span>
      </div>`;
      })
      .join("");
  }

  getTemplateBody() {
    return this.data
      .map((dataRow) => {
        return `<a href="/products/${dataRow.id}" class="sortable-table__row">
      ${this.headerConfig
        .map((headerColumn) => {
          if (headerColumn.template) {
            return headerColumn.template.call(null, dataRow[headerColumn.id]);
          }
          return `<div class="sortable-table__cell">${
            dataRow[headerColumn.id]
          }</div>`;
        })
        .join("")}
    </a>`;
      })
      .join("");
  }

  sort(fieldValue, orderValue) {
    let fn = (a, b) =>
      orderValue === "asc"
        ? a[fieldValue] - b[fieldValue]
        : b[fieldValue] - a[fieldValue];
    if (fieldValue === "title") {
      fn = (a, b) =>
        orderValue === "asc"
          ? this.compare(a[fieldValue], b[fieldValue])
          : this.compare(b[fieldValue], a[fieldValue]);
    }

    this.data.sort(fn);

    this.sortableParam.id = fieldValue;
    this.sortableParam.direction = orderValue;
    //this.reRender();
    this.subElements.body.innerHTML = this.getTemplateBody();
    this.subElements.header.innerHTML = this.getTemplateHeader();
  }

  compare = (a, b) => {
    return a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" });
  };

  destroy() {
    this.element = null;
  }
}
