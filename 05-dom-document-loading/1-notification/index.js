export default class NotificationMessage {
  constructor(text = "", { duration = 2000, type = "success" } = {}) {
    this.text = text;
    this.duration = duration;
    this.type = type;
    this.getElement();
  }

  getTemplate() {
    return `
            <div class="notification ${this.type}" style="--value:${
      this.duration / 1000
    }s">
                <div class="timer"></div>
                <div class="inner-wrapper">
                    <div class="notification-header">success</div>
                    <div class="notification-body">
                        ${this.text}
                    </div>
                </div>
            </div>
        `;
  }

  getElement() {
    this.removePreviousNodes();
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  show(targetElement) {
    document.body.append(
      targetElement ? targetElement.append(this.element) : this.element
    );
    setTimeout(() => this.destroy(), this.duration);
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }

  removePreviousNodes() {
    const elements = document.querySelectorAll(".notification");
    elements.forEach((el) => {
      el.remove();
    });
  }
}
