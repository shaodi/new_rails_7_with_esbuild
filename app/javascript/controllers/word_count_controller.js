import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['input', 'message'];

  inputTargetConnected(element) {
    element.addEventListener('keyup', this.count.bind(this));
    this.count();
  }

  count() {
    const length = this.inputTarget.value.length;
    const maxLength = this.inputTarget.maxLength;
    let count = maxLength - length;
    if (count < 0) {
      count = 0;
    }

    this.messageTarget.textContent = this.messageTarget.dataset.messageFormat
      .replace('{count}', count)
      .replace('#{totalCount}', maxLength);
  }
}

