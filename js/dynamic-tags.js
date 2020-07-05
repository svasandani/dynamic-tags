class DynamicTagController {
  /*  PARAMS

      -- selectors --
      container: CSS selector for the container, defaults to "container"
      filter: CSS selector for the filter, defaults to "filter"
      card: class selector for each card to be filtered, defaults to "card"
      tag: class selector for each tag, defaults to "tag"

      -- config --
      useDataset: set to any value to use "data-X" attribute instead of innerHTML, defaults to false
      dataTag: defines the "X" in the "data-X" attribute, defaults to "tag" as in "data-tag"
      filterTagType: defines what type of element to add to filter, defaults to "span"
      activeTagClass: defines what class to assign to active tags, defaults to "active"

      -- no result behavior --
      noResultError: defined whether to show an error when no result, defaults to true
      noResultType: defines what type of element to use as the no result error, defaults to "h4"
      noResultText: defines custom text for no result error, defaults to "Sorry, nothing matches your filters."

  */

  constructor(params) {
    this.containerClass = params["container"] != null ? params["container"] : "container";
    this.filterClass = params["filter"] != null ? params["filter"] : "filter";
    this.cardClass = params["card"] != null ? params["card"] : "card";
    this.tagClass = params["tag"] != null ? params["tag"] : "tag";

    this.useDataset = params["useDataset"] != null;
    this.dataTag = params["dataTag"] != null ? params["dataTag"] : "tag";
    this.filterTagType = params["filterTagType"] != null ? params["filterTagType"] : "span";
    this.activeTagClass = params["activeTagClass"] != null ? params["activeTagClass"] : "active";

    this.noResultError = params["noResultError"] == "false" ? false : true;
    this.noResult = this.noResultError ? document.createElement(params["noResultType"] != null ? params["noResultType"] : "h4") : "";
    if (this.noResultError) this.noResult.appendChild(params["noResultText"] != null ? document.createTextNode(params["noResultText"]) : document.createTextNode("Sorry, nothing matches your filters."));

    this.filter = document.querySelector("." + this.filterClass);
    this.container = document.querySelector("." + this.containerClass);
    this.allCards = this.container.querySelectorAll("." + this.cardClass) || [];
    this.activeCards = this.allCards;
    this.tagDict = {};
    this.tagFilter = [];
  }

  getTag(el) {
    if (this.useDataset) return el.getAttribute("data-" + this.dataTag);
    else return el.innerHTML;
  }

  refreshElements() {
    this.allCards = this.container.querySelectorAll("." + this.cardClass) || [];
  }

  loadTags() {
    this.refreshElements();

    this.allCards.forEach(el => {
      el.querySelectorAll("." + this.tagClass).forEach(tag => {
        let dataTag = this.getTag(tag);
        if (typeof this.tagDict[dataTag] == "undefined") {
          this.tagDict[dataTag] = [el];
        } else {
          this.tagDict[dataTag].push(el);
        }
      });
    });

    for (let tag in this.tagDict) {
      let el = document.createElement(this.filterTagType);
      el.appendChild(document.createTextNode(tag));
      el.classList.add(this.tagClass);
      if (this.useDataset) el.setAttribute("data-" + this.dataTag, tag);
      this.filter.append(el);
    }

    this.filter.querySelectorAll("." + this.tagClass).forEach(tag => {
      tag.addEventListener('click', () => {
        this.toggleTag(this.getTag(tag));
      }, false);
    });

    this.container.querySelectorAll("." + this.tagClass).forEach(tag => {
      tag.addEventListener('click', () => {
        this.toggleTag(this.getTag(tag));
      }, false);
    });
  }

  filterElements() {
    this.activeCards = Array.from(this.allCards);
    this.tagFilter.forEach(tag => {
      this.activeCards = this.activeCards.filter(el => this.tagDict[tag].includes(el));
    });
  }

  updateElements() {
    while (this.container.childNodes.length > 0) {
      this.container.removeChild(this.container.lastChild);
    }

    if (this.activeCards.length == 0) {
      this.container.append(this.noResult);
    } else {
      this.activeCards.forEach(el => {
        this.container.append(el);
      });
    }
  }

  updateTagActive() {
    document.querySelectorAll("." + this.tagClass).forEach(tag => {
      if (this.tagFilter.includes(this.getTag(tag))) {
        tag.classList.add(this.activeTagClass);
      } else {
        tag.classList.remove(this.activeTagClass);
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
      this.activeCards = this.allCards;
      this.updateElements();
      this.updateTagActive();
      return;
    }

    this.filterElements();
    this.updateElements();
    this.updateTagActive();
  }
}