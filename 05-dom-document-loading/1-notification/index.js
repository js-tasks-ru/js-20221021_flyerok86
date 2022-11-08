export default class NotificationMessage {
  static elementNode;

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
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  show(targetElement = document.body) {
    if (NotificationMessage.elementNode) {
      NotificationMessage.elementNode.remove();
    }

    NotificationMessage.elementNode = this.element;

    targetElement.append(NotificationMessage.elementNode);

    this.timer = setTimeout(() => this.destroy(), this.duration);
  }

  destroy() {
    clearTimeout(this.timer);
    this.remove();
  }

  remove() {
    this.element.remove();
  }
}
