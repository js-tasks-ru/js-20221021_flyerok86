import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  constructor(
    headerConfig,
    { data = [], sorted = {}, url, isSortLocally = true } = {}
  ) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;

    this.url = new URL(url, BACKEND_URL);
    this.start = 0;
    this.limit = 20;

    this.scrollOffset = 100;

    this.isFetching = false;

    this.render();

    this.url.searchParams.set("_sort", sorted.id);
    this.url.searchParams.set("_order", sorted.order);

    this.fetchData();

    this.subElements.header.addEventListener("pointerdown", this.headerHandler);

    document.addEventListener("scroll", this.onScroll);
  }

  onScroll = (e) => {
    const domRect = document.documentElement.getBoundingClientRect();

    if (pageYOffset > this.prevPageYOffset) {
      this.scrollDirection = "down";
    } else {
      this.scrollDirection = "up";
    }

    this.prevPageYOffset = pageYOffset;

    if (this.scrollDirection !== "down") return null;

    if (this.isFetching === true) return null;

    if (
      domRect.bottom - this.scrollOffset <=
      document.documentElement.clientHeight
    ) {
      
      this.fetchData();
    }
  };

  fetchData = () => {
    
    this.url.searchParams.set("_start", this.start);
    this.url.searchParams.set("_end", this.start + this.limit);

    this.isFetching = true;

    fetchJson(this.url)
      .then((data) => {
        this.data = data;

        this.appendBody();

        this.start = this.start + this.limit;
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.isFetching = false;
      });
  };

  headerHandler = (event) => {
    const elementId = event.target.closest("[data-id]").dataset.id;
    if (!elementId) return;

    let order = "desc";
    if (this.sorted.id === elementId) {
      order = this.sorted.order === "asc" ? "desc" : "asc";
    }
    this.sort(elementId, order);
  };

  appendBody = () => {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplateBody();
    this.subElements.body.append(element);
  };

  render = () => {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
  };

  getSubElements = () => {
    const elements = this.element.querySelectorAll("[data-element]");

    let result = {};
    for (const node of elements) {
      result[node.dataset.element] = node;
    }
    return result;
  };

  getTemplate = () => {
    const header = this.getTemplateParentBlock(
      "header",
      this.getTemplateHeader()
    );
    const body = this.getTemplateParentBlock("body", this.getTemplateBody());

    return `<div data-element="productsContainer" class="products-list__container">
                            <div class="sortable-table">${header}${body}</div>
                          </div>`;
  };

  getTemplateParentBlock = (blockName, inner) => {
    return `<div data-element="${blockName}" class="sortable-table__${blockName} ${
      blockName === "header" ? "sortable-table__row" : ""
    }">${inner}</div>`;
  };

  getTemplateHeader = () => {
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
  };

  getTemplateBody = () => {
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
  };

  sort = (fieldValue = "title", orderValue = "asc") => {
    const sortType = this.headerConfig.find(
      (item) => fieldValue === item.id && item.sortable
    )?.sortType;

    if (!sortType) return;
    
    if (this.isSortLocally) {
      this.sortOnClient(fieldValue, orderValue, sortType);
    } else {
      this.sortOnServer(fieldValue, orderValue);
    }
  };

  sortOnClient = (fieldValue, orderValue, sortType) => {
    
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
  };

  compare = (a, b) => {
    return a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" });
  };

  sortOnServer = (fieldValue, orderValue) => {
    this.start = 0;

    this.url.searchParams.set("_sort", fieldValue);
    this.url.searchParams.set("_order", orderValue);

    this.sorted.id = fieldValue;
    this.sorted.order = orderValue;

    this.sorted.id = fieldValue;
    this.sorted.order = orderValue;

    this.subElements.body.innerHTML = "";
    this.subElements.header.innerHTML = this.getTemplateHeader();

    this.fetchData()
  };


  destroy = () => {
    this.element = null;
    this.subElements.header.removeEventListener(
      "pointerdown",
      this.headerHandler
    );
  };
}
