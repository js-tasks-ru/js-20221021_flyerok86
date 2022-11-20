import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  constructor(productId) {
    this.productId = productId;

    this.urlProducts = new URL("api/rest/products", BACKEND_URL);
    this.urlProducts.searchParams.set("id", this.productId);

    this.urlCategories = new URL("api/rest/categories", BACKEND_URL);
    this.urlCategories.searchParams.set("_sort", "weight");
    this.urlCategories.searchParams.set("_refs", "subcategory");
  }

  onClickSortableList = (event) => {
    if (event.target.closest("button")) {
      event.target.closest("li").remove();
      this.dispatchEvent("updated");
    }

    if (event.target.closest("[data-grab-handle]")) {
      console.log("click drag icon");
    }
  };

  onSubmit = (event) => {
    event.preventDefault();
    this.getFormParams();
    this.dispatchEvent("saved");
  };

  onUploadImages = (event) => {
    console.log(event);
  };

  initListeners = () => {
    this.subElements.sortablelist.addEventListener(
      "pointerdown",
      this.onClickSortableList
    );
    this.element.addEventListener("submit", this.onSubmit);
    this.element
      .querySelector('button[name="uploadImage"]')
      .addEventListener("pointerdown", this.onUploadImages);
  };

  dispatchEvent = (event, params) => {
    if (event === "updated") {
      const eventUpdated = new CustomEvent("product-updated", {
        bubbles: true,
      });
      this.element.dispatchEvent(eventUpdated);
    }

    if (event === "saved") {
      const eventUpdated = new CustomEvent("product-saved", { bubbles: true });
      this.element.dispatchEvent(eventUpdated);
    }
  };

  fetchData = () => {
    if (this.productId) {
      const fetchProducts = fetchJson(this.urlProducts);
      const fetchCategories = fetchJson(this.urlCategories);

      return Promise.all([fetchProducts, fetchCategories]);
    } else {
      return fetchJson(this.urlCategories);
    }
  };
  async render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    const data = await this.fetchData();

    if (this.productId) {
      this.products = data[0][0];
      this.categories = data[1];
      this.update();
    } else {
      this.categories = data;
      this.updateCategories();
    }
    this.initListeners();
  }

  save = () => {};

  update = () => {
    if (!this.products) return;

    Object.keys(this.subElements).forEach((element) => {
      if (this.products.hasOwnProperty(element)) {
        if (
          this.subElements[element].nodeName === "INPUT" ||
          this.subElements[element].nodeName === "TEXTAREA"
        ) {
          this.subElements[element].value = this.products[element];
        }
        if (this.subElements[element].nodeName === "SELECT") {
          this.subElements[element].name = this.products[element];

          if (element === "subcategory") {
            this.updateCategories();
          }
        }
      }
    });

    if (this.products.images?.length) {
      this.updateFoto();
    }
  };

  updateFoto = () => {
    const photoTemplate = this.products.images
      .map((item) => {
        return `<li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${item.url}">
          <input type="hidden" name="source" value="${item.source}">
          <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
        <span>${item.source}</span>
      </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
      </li>`;
      })
      .join("");

    this.subElements["sortablelist"].innerHTML = photoTemplate;
  };

  updateCategories = () => {
    this.subElements["subcategory"].innerHTML = this.categories
      .map((item) => `<option value="${item.id}">${item.title}</option>`)
      .join("");
  };

  getTemplate = () => {
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"><ul class="sortable-list"></ul></div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100" value="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0" value="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1" value="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
         ${this.productId ? "Сохранить" : "Добавить"} товар
        </button>
      </div>
    </form>
  </div>`;
  };

  getSubElements = () => {
    const elements = this.element.querySelectorAll(".form-control");

    let result = {};
    for (const node of elements) {
      result[node.getAttribute("name")] = node;
    }

    result["sortablelist"] = this.element.querySelector(".sortable-list");

    return result;
  };

  getFormParams = () => {
    const result = {};
    for (const node of Object.keys(this.subElements)) {
      if (node === "sortablelist") {
        const imgResult = [];
        Array.from(this.subElements[node].children).forEach((item) => {
          const acc = {};
          imgResult.push(acc);
          return Array.from(item.children).forEach((subItem) => {
            if (subItem.name) {
              acc[subItem.name] = subItem.value;
            }
          });
        });
        result["images"] = imgResult;
      } else {
        result[node] =
          this.subElements[node].value || this.subElements[node].name;
      }
      if (this.productId) {
        result["id"] = this.productId;
      }
    }
    return result;
  };

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    this.subElements.sortablelist.removeEventListener(
      "pointerdown",
      this.onClickSortableList
    );
    this.element.removeEventListener("submit", this.onSubmit);
    this.element
      .querySelector('button[name="uploadImage"]')
      .removeEventListener("pointerdown", this.onUploadImages);
    this.remove();
    this.element = null;
  };
}
