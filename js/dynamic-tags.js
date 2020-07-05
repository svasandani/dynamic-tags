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
      filterSelectionMethod: defines whether to use input or list for filter, defaults to "list"
      filterTagType: defines what type of element to add to filter, defaults to "span"
      activeTagClass: defines what class to assign to active tags, defaults to "active"

      -- input behavior --
      filterInputClass: defines what class to assign to the filter input, if filterSelectionMethod is set to "input", defaults to "filter-input"
      filterInputPlaceholder: defines what test to use as the placeholder, if filterSelectionMethod is set to "input", defaults to "Filter by tags:"
      useAutocomplete: defines whether to show an autocomplete box under the filter input, if filterSelectionMethod is set to "input", defaults to "true"
      autocompleteClass: defines what class to assign to the autcomplete box, if filterSelectionMethod is set to "input" and autocomplete is set to true, defaults to "filter-input"

      -- no result behavior --
      noResultError: defined whether to show an error when no result, defaults to true
      noResultType: defines what type of element to use as the no result error, defaults to "h4"
      noResultText: defines custom text for no result error, defaults to "Sorry, nothing matches your filters."

  */
  /*
      ROADMAP:

      - implement input method
      - add more param options (input placeholder, autocomplete style tags, optional style classes?, ???)
  */

  constructor(params) {
    this.containerClass = params["container"] != null ? params["container"] : "container";
    this.filterClass = params["filter"] != null ? params["filter"] : "filter";
    this.cardClass = params["card"] != null ? params["card"] : "card";
    this.tagClass = params["tag"] != null ? params["tag"] : "tag";

    this.useDataset = params["useDataset"] != null;
    this.dataTag = params["dataTag"] != null ? params["dataTag"] : "tag";
    this.filterSelectionMethod = params["filterSelectionMethod"] != null ? params["filterSelectionMethod"] : "list";
    this.filterTagType = params["filterTagType"] != null ? params["filterTagType"] : "span";
    this.activeTagClass = params["activeTagClass"] != null ? params["activeTagClass"] : "active";


    this.filterInputClass = params["filterInputClass"] != null ? params["filterInputClass"] : "filter-input";
    this.filterInputPlaceholder = params["filterInputPlaceholder"] != null ? params["filterInputPlaceholder"] : "Filter by tags:";
    this.useAutocomplete = params["useAutocomplete"] != null ? params["useAutocomplete"] : "true";
    this.autocompleteClass = params["autocompleteClass"] != null ? params["autocompleteClass"] : "autocomplete";

    this.noResultError = params["noResultError"] == "false" ? false : true;
    this.noResult = this.noResultError ? document.createElement(params["noResultType"] != null ? params["noResultType"] : "h4") : "";
    if (this.noResultError) this.noResult.appendChild(params["noResultText"] != null ? document.createTextNode(params["noResultText"]) : document.createTextNode("Sorry, nothing matches your filters."));

    this.filter = document.querySelector("." + this.filterClass);
    this.container = document.querySelector("." + this.containerClass);
    this.allCards = this.container.querySelectorAll("." + this.cardClass) || [];
    this.activeCards = this.allCards;
    this.tagDict = {};
    this.tagFilter = [];
    this.allTags = [];
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
      if (this.filterSelectionMethod == "list") {
        let el = document.createElement(this.filterTagType);
        el.appendChild(document.createTextNode(tag));
        el.classList.add(this.tagClass);
        if (this.useDataset) el.setAttribute("data-" + this.dataTag, tag);
        this.filter.append(el);
      } else this.allTags.push(tag);
    }

    if (this.filterSelectionMethod == "input") {
      while (this.filter.childNodes.length > 0) {
        this.filter.removeChild(this.filter.lastChild);
      }

      let el = document.createElement("span");
      el.classList.add(this.filterInputClass);
      el.innerHTML = this.filterInputPlaceholder;
      el.dataset.empty = true;
      el.setAttribute("contenteditable", "true");
      this.filter.append(el);

      el.addEventListener('keydown', (e) => {
        el.style.removeProperty("color");
        e = e || window.event;
        this.filterInputListener(e, el, 'keydown');
      });

      el.addEventListener('keyup', (e) => {
        e = e || window.event;
        this.filterInputListener(e, el, 'keyup');
      });
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

  filterInputListener(e, el, method) {
    if (el.dataset.empty == "true" && e.keyCode == 8) e.preventDefault();

    if (method == "keydown" && el.dataset.empty == "true" && e.keyCode != 8) {
      el.innerHTML = "";
      el.dataset.empty = false;
      if (this.useAutocomplete == "true") {
        let autocomplete = document.createElement("div");
        autocomplete.classList.add(this.autocompleteClass);
        el.after(autocomplete);
      }
    } else if (method == "keyup" && el.innerHTML == "" && el.dataset.empty == "false") {
      el.dataset.empty = "true"
      el.innerHTML = this.filterInputPlaceholder;
      if (this.useAutocomplete == "true") this.filter.removeChild(this.filter.querySelector("." + this.autocompleteClass));
    }

    if (e.keyCode == 13) {
      e.preventDefault();
      let tag = el.innerHTML;
      if (method == "keyup" && this.allTags.includes(tag)) {
        this.toggleTag(tag);
      } else if (method == "keyup") {
        el.style.color = "red";
      }
    } else if (method == "keyup") {
      if (this.useAutocomplete == "true") this.populateAutocomplete(el);
    }
  }

  resetInput() {
    let el = this.filter.querySelector("." + this.filterInputClass);
    el.dataset.empty = "true"
    el.innerHTML = this.filterInputPlaceholder;
    if (this.useAutocomplete == "true") this.filter.removeChild(this.filter.querySelector("." + this.autocompleteClass));
  }

  populateAutocomplete(el) {
    let searches = this.allTags.filter(tag => tag.toLowerCase().includes(el.innerHTML.toLowerCase()));

    let autocomplete = this.filter.querySelector("." + this.autocompleteClass);
    if (autocomplete != null) {
      autocomplete.innerHTML = "";

      searches.forEach(search => {
        if (!this.tagFilter.includes(search)) this.addTagTo(search, autocomplete, false);
      });
    }
  }

  addTagTo(tag, element, active) {
    let el = document.createElement(this.filterTagType);
    el.appendChild(document.createTextNode(tag));
    el.classList.add(this.tagClass);
    if (active) el.classList.add(this.activeTagClass);
    if (this.useDataset) el.setAttribute("data-" + this.dataTag, tag);
    el.addEventListener('click', () => {
      this.toggleTag(this.getTag(el));
    }, false);
    element.append(el);
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

  removeFromFilter(tag) {
    this.filter.querySelectorAll("." + this.tagClass).forEach(tagEl => {
      if (this.useDataset) {
        if (tagEl.getAttribute("data-" + this.dataTag) == tag) this.filter.removeChild(tagEl);
      } else {
        if (tagEl.innerHTML == tag) this.filter.removeChild(tagEl);
      }
    });
  }

  toggleTag(tag) {
    let index = this.tagFilter.indexOf(tag);
    if (index > -1) {
      if (this.filterSelectionMethod == "input") {
        this.removeFromFilter(tag);
        this.resetInput();
      }
      this.tagFilter.splice(index, 1);
    } else {
      if (this.filterSelectionMethod == "input") {
        this.addTagTo(tag, this.filter, true);
        this.resetInput();
      }
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