class Heap {
  // binary heap; less(a, b) returns true when a should come out first
  constructor(less) {
    this.items = [];
    this.less = less;
  }

  get size() {
    return this.items.length;
  }

  peek() {
    return this.items[0];
  }

  push(value) {
    const items = this.items;
    items.push(value);

    // move the new value up while it beats its parent
    let i = items.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (!this.less(items[i], items[parent])) {
        break;
      }
      this.swap(i, parent);
      i = parent;
    }
  }

  pop() {
    const items = this.items;
    const top = items[0];
    const last = items.pop();

    if (items.length > 0) {
      items[0] = last;

      // move the root down while a child beats it
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let best = i;

        if (left < items.length && this.less(items[left], items[best])) {
          best = left;
        }
        if (right < items.length && this.less(items[right], items[best])) {
          best = right;
        }
        if (best === i) {
          break;
        }

        this.swap(i, best);
        i = best;
      }
    }

    return top;
  }

  swap(i, j) {
    const temp = this.items[i];
    this.items[i] = this.items[j];
    this.items[j] = temp;
  }
}
