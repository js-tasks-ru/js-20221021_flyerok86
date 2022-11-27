import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  constructor() {}

  components = {};

  render = () => {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.getTemplate();

    const element = wrapper.firstElementChild;

    this.element = element;

    this.subElements = this.getSubElements(element);

    this.initComponents();

    this.componentsMount();

    this.initListeners();

    this.updateComponents();
    return this.element;
  };

  initListeners = () => {
    this.element.addEventListener("date-select", (event) => {
      if (event.detail) {
        const { from, to } = event.detail;

        this.updateComponents(from, to);
      }
    });
  };

  updateComponents = async (from, to) => {
    const components = [
      "ordersChart",
      "salesChart",
      "customersChart",
      "sortableTable",
    ];

    if (!from || !to) {
      return null;
    }

    for (const component of components) {
      if (component === "sortableTable") {
        this.components[component].updateWithDate(new Date(from), new Date(to));
      } else {
        this.components[component].update(new Date(from), new Date(to));
      }
    }
  };

  componentsMount = () => {
    for (const element of Object.entries(this.subElements)) {
      const elementName = element.at(0);
      if (Object.hasOwn(this.components, elementName)) {
        const component = this.components[elementName].element;
        this.subElements[elementName].append(component);
      }
    }
  };

  initComponents = () => {
    this.components["rangePicker"] = new RangePicker();

    const header = [
      {
        id: "images",
        title: "Image",
        sortable: false,
        template: (data = []) => {
          return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0]?.url}">
          </div>
        `;
        },
      },
      {
        id: "title",
        title: "Name",
        sortable: true,
        sortType: "string",
      },
      {
        id: "quantity",
        title: "Quantity",
        sortable: true,
        sortType: "number",
      },
      {
        id: "price",
        title: "Price",
        sortable: true,
        sortType: "number",
      },
      {
        id: "status",
        title: "Status",
        sortable: true,
        sortType: "number",
        template: (data) => {
          return `<div class="sortable-table__cell">
          ${data > 0 ? "Active" : "Inactive"}
        </div>`;
        },
      },
    ];

    const sortableTable = new SortableTable(header, {
      url: "api/dashboard/bestsellers",
      isSortLocally: true,
      sorted: {
        id: header.find((item) => item.sortable).id,
        order: "asc",
      },
    });

    this.components["sortableTable"] = sortableTable;

    const getRange = () => {
      const now = new Date();
      const to = new Date();
      const from = new Date(now.setMonth(now.getMonth() - 1));

      return { from, to };
    };

    const { from, to } = getRange();

    const ordersChart = new ColumnChart({
      url: "api/dashboard/orders",
      range: {
        from,
        to,
      },
      label: "orders",
      link: "#",
    });

    const salesChart = new ColumnChart({
      url: "api/dashboard/sales",
      range: {
        from,
        to,
      },
      label: "sales",
      formatHeading: (data) => `$${data}`,
    });

    const customersChart = new ColumnChart({
      url: "api/dashboard/customers",
      range: {
        from,
        to,
      },
      label: "customers",
    });

    this.components["ordersChart"] = ordersChart;
    this.components["salesChart"] = salesChart;
    this.components["customersChart"] = customersChart;
  };

  getSubElements = (element) => {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  };

  getTemplate = () => {
    return `
            <div class="dashboard">
                <div class="content__top-panel">
                    <h2 class="page-title">Dashboard</h2>
                    <!-- RangePicker component -->
                    <div data-element="rangePicker"></div>
                </div>
                <div data-element="chartsRoot" class="dashboard__charts">
                    <!-- column-chart components -->
                    <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                    <div data-element="salesChart" class="dashboard__chart_sales"></div>
                    <div data-element="customersChart" class="dashboard__chart_customers"></div>
                </div>

                <h3 class="block-title">Best sellers</h3>

                <div data-element="sortableTable">
                    <!-- sortable-table component -->
                </div>
            </div>
            `;
  };

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
