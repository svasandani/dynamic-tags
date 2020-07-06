class DynamicTagController {
  /*  PARAMS

      -- selectors --
      container: CSS selector for the container, defaults to "container"
      filter: CSS selector for the filter, defaults to "filter"
      card: class selector for each card to be filtered, defaults to "card"
      tag: class selector for each tag, defaults to "tag"
      selectorExclusivity: defines whether to combine all selectors for an object via intersection or union, defaults to "union"

      -- config --
      useDataset: set to any value to use "data-X" attribute instead of innerHTML, defaults to false
      dataTag: defines the "X" in the "data-X" attribute, defaults to "tag" as in "data-tag"
      filterSelectionMethod: defines whether to use input or list for filter, defaults to "list"
      filterTagType: defines what type of element to add to filter, defaults to "span"
      activeTagClass: defines what class to assign to active tags, defaults to "active"

      -- input behavior --
      filterInputClass: defines what class to assign to the filter input, if filterSelectionMethod is set to "input", defaults to "filter-input"
      filterInputPlaceholder: defines what text to use as the placeholder, if filterSelectionMethod is set to "input", defaults to "Filter by tags:"
      useAutocomplete: defines whether to show an autocomplete box under the filter input, if filterSelectionMethod is set to "input", defaults to "true"
      autocompleteClass: defines what class to assign to the autcomplete box, if filterSelectionMethod is set to "input" and autocomplete is set to true, defaults to "filter-input"

      -- no result behavior --
      noResultError: defined whether to show an error when no result, defaults to true
      noResultType: defines what type of element to use as the no result error, defaults to "h4"
      noResultText: defines custom text for no result error, defaults to "Sorry, nothing matches your filters."

      -- styling --
      useDefaultStyling: determines whether to use dynamic-tags' default styling, defaults to "false"
      styling: hash of styling parameters, see DynamicTagStyler for options

  */

  constructor(params) {
    this.containerClass = params.container || "container";
    this.filterClass = params.filter || "filter";
    this.cardClass = params.card || "card";
    this.tagClass = params.tag || "tag";

    this.useDataset = params.useDataset != null;
    this.dataTag = params.dataTag || "tag";
    this.filterSelectionMethod = params["filterSelectionMethod"] || "list";
    this.filterTagType = params.filterTagType || "span";
    this.activeTagClass = params.activeTagClass || "active";
    this.selectorExclusivity = params["selectorExclusivity"] || "union";

    this.filterInputClass = params["filterInputClass"] || "filter-input";
    this.filterInputPlaceholder = params["filterInputPlaceholder"] || "Filter by tags:";
    this.useAutocomplete = params.useAutocomplete || "true";
    this.autocompleteClass = params["autocompleteClass"] || "autocomplete";

    this.noResultError = params.noResultError == "false" ? false : true;
    this.noResult = this.noResultError ? document.createElement(params.noResultType != null ? params.noResultType : "h4") : "";
    if (this.noResultError) this.noResult.appendChild(params.noResultText != null ? document.createTextNode(params["noResultText"]) : document.createTextNode("Sorry, nothing matches your filters."));

    /* STYLING */
    if (params["useDefaultStyling"] == "true") {
      let dts = new DynamicTagStyler(params);
    }

    this.filter = document.querySelector(this.classListToSelector(this.filterClass));
    this.container = document.querySelector(this.classListToSelector(this.containerClass));
    this.allCards = this.container.querySelectorAll(this.classListToSelector(this.cardClass)) || [];
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
    this.allCards = this.container.querySelectorAll(this.classListToSelector(this.cardClass)) || [];
  }

  loadTags() {
    this.refreshElements();

    this.allCards.forEach(el => {
      el.querySelectorAll(this.classListToSelector(this.tagClass)).forEach(tag => {
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
        this.tagClass.split(" ").forEach(tagClass => {
          el.classList.add(tagClass);
        });
        if (this.useDataset) el.setAttribute("data-" + this.dataTag, tag);
        this.filter.append(el);
      } else this.allTags.push(tag);
    }

    if (this.filterSelectionMethod == "input") {
      while (this.filter.childNodes.length > 0) {
        this.filter.removeChild(this.filter.lastChild);
      }

      let el = document.createElement("span");
      this.filterInputClass.split(" ").forEach(filterInputClass => {
        el.classList.add(filterInputClass);
      });
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

    this.filter.querySelectorAll(this.classListToSelector(this.tagClass)).forEach(tag => {
      tag.addEventListener('click', () => {
        this.toggleTag(this.getTag(tag));
      }, false);
    });

    this.container.querySelectorAll(this.classListToSelector(this.tagClass)).forEach(tag => {
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
        this.autocompleteClass.split(" ").forEach(autocompleteClass => {
          autocomplete.classList.add(autocompleteClass);
        });
        el.after(autocomplete);
      }
    } else if (method == "keyup" && el.innerHTML == "" && el.dataset.empty == "false") {
      el.dataset.empty = "true"
      el.innerHTML = this.filterInputPlaceholder;
      if (this.useAutocomplete == "true") this.filter.removeChild(this.filter.querySelector(this.classListToSelector(this.autocompleteClass)));
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

  classListToSelector(classList) {
    let selector = "";
    classList.split(" ").forEach(className => {
      if (this.selectorExclusivity == "intersection") selector += "." + className;
      else selector += "." + className + ", ";
    });

    if (this.selectorExclusivity != "intersection") selector = selector.substring(0, selector.length - 2);

    return selector;
  }

  resetInput() {
    let el = this.filter.querySelector(this.classListToSelector(this.filterInputClass));
    el.dataset.empty = "true"
    el.innerHTML = this.filterInputPlaceholder;
    if (this.useAutocomplete == "true") {
      let autocomplete = this.filter.querySelector(this.classListToSelector(this.autocompleteClass));
      if (autocomplete) this.filter.removeChild(autocomplete);
    }
  }

  populateAutocomplete(el) {
    let searches = this.allTags.filter(tag => tag.toLowerCase().includes(el.innerHTML.toLowerCase()));

    let autocomplete = this.filter.querySelector(this.classListToSelector(this.autocompleteClass));
    if (autocomplete) {
      autocomplete.innerHTML = "";

      searches.forEach(search => {
        if (!this.tagFilter.includes(search)) this.addTagTo(search, autocomplete, false);
      });
    }
  }

  addTagTo(tag, element, active) {
    let el = document.createElement(this.filterTagType);
    el.appendChild(document.createTextNode(tag));
    this.tagClass.split(" ").forEach(tagClass => {
      el.classList.add(tagClass);
    });
    if (active) this.activeTagClass.split(" ").forEach(activeClass => {
      el.classList.add(activeClass)
    });
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
    let notCards = [];
    let allCards = Array.from(this.allCards);
    while (this.container.childNodes.length > 0) {
      let el = this.container.lastChild;
      if (!allCards.includes(el) && el != this.noResult) notCards.push(el);
      this.container.removeChild(el);
    }

    notCards.forEach(el => {
      this.container.prepend(el);
    })

    if (this.activeCards.length == 0) {
      this.container.append(this.noResult);
    } else {
      this.activeCards.forEach(el => {
        this.container.append(el);
      });
    }
  }

  updateTagActive() {
    document.querySelectorAll(this.classListToSelector(this.tagClass)).forEach(tag => {
      if (this.tagFilter.includes(this.getTag(tag))) {
        this.activeTagClass.split(" ").forEach(activeClass => {
          tag.classList.add(activeClass)
        });
      } else {
        this.activeTagClass.split(" ").forEach(activeClass => {
          tag.classList.remove(activeClass)
        });
      }
    });
  }

  removeFromFilter(tag) {
    this.filter.querySelectorAll(this.classListToSelector(this.tagClass)).forEach(tagEl => {
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

class DynamicTagStyler {
  /*  PARAMS

      cssPath: determines where the dynamic-tags.css file is located, defaults to "dynamic-tags.css"
      baseTheme: determines whether to use orange, blue, or green theme, defaults to "orange"
      colors {
        containerColor: custom color for container, defaults to "#efefef"
        cardColor: custom color for cards, defaults to "#cfcfcf"
        tagColor: custom color for tags, default depends on baseTheme
        tagShadowColor: custom color for tag shadows, default depends on baseTheme
        activeTagColor: custom color for active tags, default depends on baseTheme
        activeTagShadowColor: custom color for active tag shadows, default depends on baseTheme
        filterInputColor: custom color for filter input, if filterSelectionMethod is set to "input", defaults to "#efefef"
        filterInputFocusColor: custom color for filter input when focused, if filterSelectionMethod is set to "input", defaults to "#cfcfcf"
        autocompleteColor: custom color for filter autocomplete, if filterSelectionMethod is set to "input" and useAutocomplete is set to "true", defaults to "#cfcfcf"
      }
      filter {
        stickyFilter: determines whether to make the filter position sticky, defaults to "false"
        top: determines the top offset of the filter position, defaults to "0"
      }

  */
  constructor(params) {
    let styling = params.styling;
    this.cssPath = styling.cssPath || "dynamic-tags.css";
    let el = this.createLinkTag(this.cssPath);

    window.addEventListener('load', () => {
      this.modifyStyleSheet(params, el)
    });
  }

  classListToSelector(classList) {
    let selector = "";
    classList.split(" ").forEach(className => {
      if (this.selectorExclusivity == "intersection") selector += "." + className;
      else selector += "." + className + ", ";
    });

    if (this.selectorExclusivity != "intersection") selector = selector.substring(0, selector.length - 2);

    return selector;
  }

  createLinkTag(cssPath) {
    let el = document.createElement("link");
    el.rel = "stylesheet";
    el.type = "text/css";
    el.href = cssPath;
    document.head.prepend(el);

    return el;
  }

  modifyStyleSheet(params, el) {
    let styling = params.styling;
    let stylesheet = el.sheet;

    if (styling.baseTheme == "blue") {
      stylesheet.insertRule(":root { --tag-color: var(--pastel-blue); }", 1);
      stylesheet.insertRule(":root { --tag-shadow-color: var(--blue); }", 1);
      stylesheet.insertRule(":root { --active-tag-color: var(--blue); }", 1);
      stylesheet.insertRule(":root { --active-tag-shadow-color: var(--blue); }", 1);
    } else if (styling.baseTheme == "green") {
      stylesheet.insertRule(":root { --tag-color: var(--pastel-green); }", 1);
      stylesheet.insertRule(":root { --tag-shadow-color: var(--green); }", 1);
      stylesheet.insertRule(":root { --active-tag-color: var(--green); }", 1);
      stylesheet.insertRule(":root { --active-tag-shadow-color: var(--green); }", 1);
    } else {
      stylesheet.insertRule(":root { --tag-color: var(--pastel-orange); }", 1);
      stylesheet.insertRule(":root { --tag-shadow-color: var(--orange); }", 1);
      stylesheet.insertRule(":root { --active-tag-color: var(--orange); }", 1);
      stylesheet.insertRule(":root { --active-tag-shadow-color: var(--orange); }", 1);

    }

    let filter = styling.filter;
    if (filter) {
      if (filter.stickyFilter == "true") stylesheet.insertRule(this.classListToSelector(params.filterSelector || "filter") + "{ position: sticky }", stylesheet.cssRules.length - 1);
      if (filter.top) stylesheet.insertRule(this.classListToSelector(params.filterSelector || "filter") + "{ top: " + filter.top + " }", stylesheet.cssRules.length - 1);
    }

    let colors = styling.colors;
    if (colors) {
      if (colors.containerColor) stylesheet.insertRule(":root { --container-color: " + colors.containerColor + "; }", 5);
      if (colors.cardColor) stylesheet.insertRule(":root { --card-color: " + colors.cardColor + "; }", 5);
      if (colors.tagColor) stylesheet.insertRule(":root { --tag-color: " + colors.tagColor + "; }", 5);
      if (colors.tagShadowColor) stylesheet.insertRule(":root { --tag-shadow-color: " + colors.tagShadowColor + "; }", 5);
      if (colors.activeTagColor) stylesheet.insertRule(":root { --active-tag-color: " + colors.activeTagColor + "; }", 5);
      if (colors.activeTagShadowColor) stylesheet.insertRule(":root { --active-tag-shadow-color: " + colors.activeTagShadowColor + "; }", 5);
      if (colors.filterInputColor) stylesheet.insertRule(":root { --filter-input-color: " + colors.filterInputColor + "; }", 5);
      if (colors.filterInputFocusColor) stylesheet.insertRule(":root { --filter-input-focus-color: " + colors.filterInputFocusColor + "; }", 5);
      if (colors.autocompleteColor) stylesheet.insertRule(":root { --autocomplete-color: " + colors.autocompleteColor + "; }", 5);
    }

  }
}