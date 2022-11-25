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

  onSubmit = async (event) => {
    event.preventDefault();

    const savedData = await this.saveForm();
    if(savedData.id){
      this.dispatchEvent("saved");
    }
  };

  onUploadImages = () => {
    const fileInput = document.createElement("input");

    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.click();

    fileInput.addEventListener("change", async (event) => {
      const [file] = event.target.files;
      const response = await this.upload(file);

      if (response.success) {
        const url = response.data.link;
        const source = file.name;

        this.products.images.push({
          url: url,
          source: source,
        });

        const imageElement = document.createElement("div");

        imageElement.innerHTML = this.getImage(url, source);

        this.subElements.sortablelist.append(imageElement.firstElementChild);

        fileInput.remove();
      }
    });
  };

  async upload(file) {
    const formData = new FormData();

    formData.append("image", file);

    try {
      const response = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
        referrer: "",
      });
      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  }


  saveForm = async () => {
    const formData = this.getFormParams();

    return await fetchJson(`${BACKEND_URL}/api/rest/products`, {
      method: this.productId ? "PATCH" : "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(formData),
    });
  };

  updateForm = () => {
    const formData = this.getFormParams();
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

    const [categoriesData, productResponse] = data;

    if (this.productId) {
      this.products = data.at(0).at(0);
      this.categories = data.at(1);
      this.updateCategories();
      this.updateElements();
    } else {
      this.categories = data;
      this.updateCategories();
    }
    this.initListeners();
  }

  updateElements = () => {
    if (!this.products) return;

    Object.keys(this.subElements).forEach((element) => {
      if (Object.hasOwn(this.products, element)) {
        this.subElements[element].value = this.products[element];
      }
    });

    if (this.products.images?.length) {
      this.updateFoto();
    }
  };

  updateFoto = () => {
    const photoTemplate = this.products.images
      .map((item) => {
        return this.getImage(item.url, item.source);
      })
      .join("");

    this.subElements["sortablelist"].innerHTML = photoTemplate;
  };

  getImage = (url, source) => {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${url}">
          <input type="hidden" name="source" value="${source}">
          <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${url}">
        <span>${source}</span>
      </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
      </li>`;
  };

  updateCategories = () => {
    this.subElements["subcategory"].innerHTML = this.categories
      .map((categoty) => {
        return categoty.subcategories?.map((subcategory) => {
          return `<option value="${subcategory.id}">${categoty.title} -> ${subcategory.title}</option>`;
        });
      })
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

    const result = {};
    for (const node of elements) {
      result[node.getAttribute("name")] = node;
    }

    result.sortablelist = this.element.querySelector(".sortable-list");

    return result;
  };

  getFormParams = () => {
    const result = {};
    result["images"] = [];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    for (const node of Object.keys(this.subElements)) {
      if (node === "sortablelist") {
        Array.from(
          this.subElements[node].querySelectorAll(".sortable-list__item")
        ).forEach((item) => {
          const url = item.querySelector('[name="url"]').value;
          const source = item.querySelector('[name="source"]').value;
          result.images.push({
            url: url,
            source: source,
          });
        });
      } else {
 
        const value = this.subElements[node].value;

        result[node] = formatToNumber.includes(node) ? Number(value): value;
        
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
