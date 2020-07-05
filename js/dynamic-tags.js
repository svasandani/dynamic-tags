class DynamicTagController {
  constructor(params) {
    this.containerSelector = params["container"];
    this.elementSelector = params["element"];
    this.tagSelector = params["tag"];
    this.filterSelector = params["filter"];

    this.useDataset = params["useDataset"] == true;
    this.dataTag = params["dataTag"];
    this.updateMethod = params["method"];

    this.noResult = document.createElement("h4");
    this.noResult.appendChild(params["noResult"] != null ? document.createTextNode(params["noResult"]) : document.createTextNode("Sorry, nothing matches your filters."));

    this.container = document.querySelector(this.containerSelector);
    this.allElements = document.querySelectorAll(this.elementSelector) || [];
    this.activeElements = this.allElements;
    this.tagDict = {};
    this.tagFilter = [];
    this.filter = document.querySelector(this.filterSelector);
  }

  getTag(el) {
    if (this.useDataset) return el.getAttribute("data-" + dataTag);
    else return el.innerHTML;
  }

  refreshElements() {
    this.allElements = document.querySelectorAll(this.elementSelector) || [];
  }

  loadTags() {
    this.refreshElements();

    this.allElements.forEach(el => {
      el.querySelectorAll(this.tagSelector).forEach(tag => {
        let dataTag = this.getTag(tag);
        if (typeof this.tagDict[dataTag] == "undefined") {
          this.tagDict[dataTag] = [el];
        } else {
          this.tagDict[dataTag].push(el);
        }
      });
    });

    for (let tag in this.tagDict) {
      let el = document.createElement("span");
      el.appendChild(document.createTextNode(tag));
      el.classList.add(this.tagSelector.split(".")[1]);
      if (this.useDataset) el.setAttribute("data-" + dataTag, tag);
      this.filter.append(el);
    }


    document.querySelectorAll(this.tagSelector).forEach(tag => {
      tag.addEventListener('click', () => {
        this.toggleTag(this.getTag(tag));
      }, false);
    });
  }

  filterElements() {
    this.activeElements = Array.from(this.allElements);
    this.tagFilter.forEach(tag => {
      this.activeElements = this.activeElements.filter(el => this.tagDict[tag].includes(el));
    });
  }

  updateElements() {
    while (this.container.childNodes.length > 0) {
      this.container.removeChild(this.container.lastChild);
    }

    if (this.activeElements.length == 0) {
      this.container.append(this.noResult);
    } else {
      this.activeElements.forEach(el => {
        this.container.append(el);
      });
    }
  }

  updateTagActive() {
    document.querySelectorAll(this.tagSelector).forEach(tag => {
      if (this.tagFilter.includes(this.getTag(tag))) {
        tag.classList.add("active");
      } else {
        tag.classList.remove("active");
      }
    });
  }

  toggleTag(tag) {
    let index = this.tagFilter.indexOf(tag);
    if (index > -1) {
      this.tagFilter.splice(index, 1);
    } else {
      this.tagFilter.push(tag);
    }

    if (this.tagFilter.length == 0) {
      this.activeElements = this.allElements;
      this.updateElements();
      this.updateTagActive();
      return;
    }

    this.filterElements();
    this.updateElements();
    this.updateTagActive();
  }
}