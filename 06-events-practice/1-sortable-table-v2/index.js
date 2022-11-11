export default class SortableTable {
  constructor(headerConfig, { data = [], sorted = {} } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.isSortLocally = true;
    this.sorted = sorted;

    this.headerHandler = this.headerHandler.bind(this);
    this.render();
    this.sort();

    this.subElements.header.addEventListener("pointerdown", this.headerHandler);
  }

  headerHandler(event) {
    const elementId = event.target.closest("[data-id]").dataset.id;
    if (!elementId) return;

    let order = "desc";
    if (this.sorted.id === elementId) {
      order = this.sorted.order === "asc" ? "desc" : "asc";
    }
    this.sort(elementId, order);
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
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" ${
          this.sorted.id === id ? `data-order=${this.sorted.order}` : ""
        }>
        <span>${title}</span>
        ${
          this.sorted.id === id
            ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
            : ""
        }
        
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
    if (this.isSortLocally) {
      this.sortOnClient(fieldValue, orderValue);
    } else {
      this.sortOnServer(fieldValue, orderValue);
    }
  }

  sortOnClient(fieldValue, orderValue) {
    const sortType = this.headerConfig.find(
      (item) => fieldValue === item.id && item.sortable
    )?.sortType;

    if (!sortType) return;

    const direction = { asc: 1, desc: -1 };

    let fn = (a, b) =>
      sortType === "string"
        ? direction[orderValue] *
          a[fieldValue].localeCompare(b[fieldValue], ["ru", "en"], {
            caseFirst: "upper",
          })
        : direction[orderValue] *
          (parseInt(a[fieldValue]) - parseInt(b[fieldValue]));

    this.data.sort(fn);

    this.sorted.id = fieldValue;
    this.sorted.order = orderValue;

    this.subElements.body.innerHTML = this.getTemplateBody();
    this.subElements.header.innerHTML = this.getTemplateHeader();
  }

  compare(a, b) {
    return a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" });
  }

  sortOnServer() {}

  destroy() {
    this.element = null;
    this.subElements.header.removeEventListener("pointerdown", this.headerHandler);
  }
}
