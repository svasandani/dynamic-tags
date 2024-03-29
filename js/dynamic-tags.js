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

      -- filtering --
      customFilterFunction: define a custom function used to filter tags, taking in two parameters: an array of all elements, and an array of tags, defaults to null

      -- input behavior --
      filterInputClass: defines what class to assign to the filter input, if filterSelectionMethod is set to "input", defaults to "filter-input"
      filterInputPlaceholder: defines what text to use as the placeholder, if filterSelectionMethod is set to "input", defaults to "Filter by tags:"
      useAutocomplete: defines whether to autocomplete on Tab in the filter input, if filterSelectionMethod is set to "input", defaults to "true"
      autocompleteClass: defines what class to assign to the autocomplete element, if filterSelectionMethod is set to "input" and useAutocomplete is set to true, defaults to "autocomplete"
      useSearchBox: defines whether to show a search box under the filter input, if filterSelectionMethod is set to "input", defaults to "true"
      searchBoxClass: defines what class to assign to the search box, if filterSelectionMethod is set to "input" and useSearchBox is set to true, defaults to "search-box"

      -- no result behavior --
      noResultError: defined whether to show an error when no result, defaults to true
      noResultType: defines what type of element to use as the no result error, defaults to "h4"
      noResultText: defines custom text for no result error, defaults to "Sorry, nothing matches your filters."

      -- styling --
      useDefaultStyling: determines whether to use dynamic-tags' default styling, defaults to "false"
      styling: hash of styling parameters, see DynamicTagStyler for options

  */

  constructor(params) {
    this.containerClass = params.container ?? "container";
    this.filterClass = params.filter ?? "filter";
    this.cardClass = params.card ?? "card";
    this.tagClass = params.tag ?? "tag";

    this.useDataset = params.useDataset !== null;
    this.dataTag = params.dataTag ?? "tag";
    this.filterSelectionMethod = params.filterSelectionMethod ?? "list";
    this.filterTagType = params.filterTagType ?? "span";
    this.activeTagClass = params.activeTagClass ?? "active";
    this.selectorExclusivity = params.selectorExclusivity ?? "union";

    this.customFilterFunction = params.customFilterFunction ?? null;

    this.filterInputClass = params.filterInputClass ?? "filter-input";
    this.filterInputPlaceholder =
      params.filterInputPlaceholder ?? "Filter by tags:";
    this.useAutocomplete =
      this.filterSelectionMethod === "input"
        ? params.useAutocomplete ?? "true"
        : "false";
    this.useSearchBox =
      this.filterSelectionMethod === "input"
        ? params.useSearchBox ?? "true"
        : "false";
    this.autocompleteClass = params.autocompleteClass ?? "autocomplete";
    this.searchBoxClass = params.searchBoxClass ?? "search-box";

    this.noResultError = params.noResultError === "false" ? false : true;
    this.noResult = this.noResultError
      ? document.createElement(
          params.noResultType !== null ? params.noResultType : "h4"
        )
      : "";
    if (this.noResultError)
      this.noResult.appendChild(
        params.noResultText !== null
          ? document.createTextNode(params.noResultText)
          : document.createTextNode("Sorry, nothing matches your filters.")
      );

    /* STYLING */
    if (params.useDefaultStyling === "true") {
      let dts = new DynamicTagStyler(params);
    }

    this.filter = document.querySelector(
      this.classListToSelector(this.filterClass)
    );
    this.container = document.querySelector(
      this.classListToSelector(this.containerClass)
    );
    this.allCards =
      this.container.querySelectorAll(
        this.classListToSelector(this.cardClass)
      ) ?? [];
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
    this.allCards =
      this.container.querySelectorAll(
        this.classListToSelector(this.cardClass)
      ) ?? [];
  }

  loadTags() {
    this.refreshElements();

    this.allCards.forEach((el) => {
      el.querySelectorAll(this.classListToSelector(this.tagClass)).forEach(
        (tag) => {
          let dataTag = this.getTag(tag);
          if (typeof this.tagDict[dataTag] === "undefined") {
            this.tagDict[dataTag] = [el];
          } else {
            this.tagDict[dataTag].push(el);
          }
        }
      );
    });

    for (let tag in this.tagDict) {
      if (this.filterSelectionMethod === "list") {
        let el = document.createElement(this.filterTagType);
        el.appendChild(document.createTextNode(tag));
        this.tagClass.split(" ").forEach((tagClass) => {
          el.classList.add(tagClass);
        });
        if (this.useDataset) el.setAttribute("data-" + this.dataTag, tag);
        this.filter.append(el);
      } else this.allTags.push(tag);
    }

    if (this.filterSelectionMethod === "input") {
      while (this.filter.childNodes.length > 0) {
        this.filter.removeChild(this.filter.lastChild);
      }

      let el = document.createElement("span");
      this.filterInputClass.split(" ").forEach((filterInputClass) => {
        el.classList.add(filterInputClass);
      });
      el.innerHTML = this.filterInputPlaceholder;
      el.dataset.empty = true;
      el.setAttribute("contenteditable", "true");
      this.filter.append(el);

      if (navigator.userAgent.match(/Android/i)) {
        el.addEventListener("click", () => {
          el.innerHTML = "";
        });

        el.addEventListener("blur", () => {
          el.innerHTML = this.filterInputPlaceholder;
        });

        el.addEventListener("input", (e) => {
          this.removeLineBreaks(el);
          el.style.removeProperty("color");
          e = e || window.event;
          this.android_filterInputListener(e, el);
        });
      } else {
        el.addEventListener("keydown", (e) => {
          this.removeLineBreaks(el);
          el.style.removeProperty("color");
          e = e || window.event;
          this.filterInputListener(e, el, "keydown");
        });

        el.addEventListener("keyup", (e) => {
          e = e || window.event;
          e.preventDefault();
        });
      }
    }

    this.filter
      .querySelectorAll(this.classListToSelector(this.tagClass))
      .forEach((tag) => {
        tag.addEventListener(
          "click",
          () => {
            this.toggleTag(this.getTag(tag));
          },
          false
        );
      });

    this.container
      .querySelectorAll(this.classListToSelector(this.tagClass))
      .forEach((tag) => {
        tag.addEventListener(
          "click",
          () => {
            this.toggleTag(this.getTag(tag));
          },
          false
        );
      });
  }

  removeLineBreaks(el) {
    for (let i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeName === "BR") el.removeChild(el.childNodes[i]);
    }
  }

  android_filterInputListener(e, el) {
    if (el.childNodes.length === 0) return;

    if (e.inputType === "insertParagraph") {
      this.fillAutocomplete(el);
      let data = el.childNodes[0].data;
      this.toggleTag(data);
      el.innerHTML = "";
      return;
    }

    let data = el.childNodes[0].data;

    if (data !== undefined && data.length > 0) {
      if (this.useSearchBox === "true") {
        if (
          !this.filter.querySelector(
            this.classListToSelector(this.searchBoxClass)
          )
        ) {
          let searchBox = document.createElement("div");
          this.searchBoxClass.split(" ").forEach((searchBoxClass) => {
            searchBox.classList.add(searchBoxClass);
          });
          el.after(searchBox);
          this.populateSearchBox(el);
        }
        this.populateSearchBox(el);
      }
      if (this.useAutocomplete === "true") this.populateAutocomplete(el);
    } else {
      if (this.useSearchBox === "true")
        this.filter.removeChild(
          this.filter.querySelector(
            this.classListToSelector(this.searchBoxClass)
          )
        );
      if (this.useAutocomplete === "true")
        el.removeChild(
          this.filter.querySelector(
            this.classListToSelector(this.autocompleteClass)
          )
        );
    }
  }

  filterInputListener(e, el) {
    let key = event.key;
    let keycode = event.keyCode;
    key = key.replace(/[^\x20-\x7E]/g, "");

    if (e.repeat && keycode !== 8) e.preventDefault();

    if (el.dataset.empty === "true" && keycode === 8) e.preventDefault();

    if (el.dataset.empty === "true" && key.length > 0 && key.length <= 1) {
      e.preventDefault();
      el.innerHTML = key;
      this.setCursor(el);
      el.dataset.empty = false;
      if (this.useSearchBox === "true") {
        let searchBox = document.createElement("div");
        this.searchBoxClass.split(" ").forEach((searchBoxClass) => {
          searchBox.classList.add(searchBoxClass);
        });
        el.after(searchBox);
        this.populateSearchBox(el);
      }
      if (this.useAutocomplete === "true") this.populateAutocomplete(el);
    } else if (
      el.childNodes[0].data.length <= 1 &&
      el.dataset.empty === "false" &&
      keycode === 8
    ) {
      e.preventDefault();
      el.dataset.empty = "true";
      el.childNodes[0].data = this.filterInputPlaceholder;
      if (this.useSearchBox === "true")
        this.filter.removeChild(
          this.filter.querySelector(
            this.classListToSelector(this.searchBoxClass)
          )
        );
      if (this.useAutocomplete === "true")
        el.removeChild(
          this.filter.querySelector(
            this.classListToSelector(this.autocompleteClass)
          )
        );
    } else if (keycode === 8 && el.dataset.empty === "false") {
      e.preventDefault();
      el.childNodes[0].data = el.childNodes[0].data.substring(
        0,
        el.childNodes[0].data.length - 1
      );
      this.setCursor(el);
      if (this.useSearchBox === "true") this.populateSearchBox(el);
      if (this.useAutocomplete === "true") this.populateAutocomplete(el);
    } else if (keycode === 9) {
      e.preventDefault();
      if (this.useAutocomplete === "true") this.fillAutocomplete(el);
    } else if (keycode === 13) {
      e.preventDefault();
      let tag = el.childNodes[0].data;
      let normalizedTag = this.nonStrictTagSearch(tag);
      if (normalizedTag) {
        this.toggleTag(normalizedTag);
      } else if (method === "keyup") {
        el.style.color = "red";
      }
    } else if (key.length <= 1) {
      e.preventDefault();
      el.childNodes[0].data += key;

      this.setCursor(el);

      if (this.useSearchBox === "true") this.populateSearchBox(el);
      if (this.useAutocomplete === "true") this.populateAutocomplete(el);
    }
  }

  setCursor(el) {
    let range = document.createRange();
    let sel = window.getSelection();
    range.setStart(el.childNodes[0], el.childNodes[0].data.length);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  getAutocompleteResult(searchText) {
    let searches = this.allTags.filter((tag) =>
      tag.toLowerCase().startsWith(searchText.toLowerCase())
    );

    let primary = "";

    for (let i = 0; i < searches.length; i++) {
      if (!this.tagFilter.includes(searches[i])) {
        primary = searches[i];
        break;
      }
    }

    return [
      primary.substring(0, searchText.length),
      primary.slice(searchText.length, primary.length),
    ];
  }

  fillAutocomplete(el) {
    let remaining = document.querySelector(
      this.classListToSelector(this.autocompleteClass)
    );
    let result = "";
    this.getAutocompleteResult(el.childNodes[0].data).forEach((piece) => {
      result += piece;
    });
    if (result !== "") el.innerHTML = result;

    this.setCursor(el);

    if (remaining) remaining.remove();
  }

  populateAutocomplete(el) {
    let remainingText = this.getAutocompleteResult(el.childNodes[0].data)[1];
    let remaining = document.querySelector(
      this.classListToSelector(this.autocompleteClass)
    );
    if (remaining) {
      remaining.innerHTML = remainingText;
      el.append(remaining);

      this.setCursor(el);
    } else {
      remaining = document.createElement("span");
      this.autocompleteClass.split(" ").forEach((autocompleteClass) => {
        remaining.classList.add(autocompleteClass);
      });

      remaining.appendChild(document.createTextNode(remainingText));
      el.append(remaining);

      this.setCursor(el);
    }
  }

  nonStrictTagSearch(searchTag) {
    let lowercase = searchTag.toLowerCase();
    let toReturn = null;
    this.allTags.forEach((tag) => {
      if (tag.toLowerCase() === lowercase) {
        toReturn = tag;
      }
    });

    return toReturn;
  }

  classListToSelector(classList) {
    let selector = "";
    classList.split(" ").forEach((className) => {
      selector += "." + className;
    });

    return selector;
  }

  resetInput() {
    let el = this.filter.querySelector(
      this.classListToSelector(this.filterInputClass)
    );
    el.dataset.empty = "true";
    el.innerHTML = this.filterInputPlaceholder;
    if (this.useSearchBox === "true") {
      let autocomplete = this.filter.querySelector(
        this.classListToSelector(this.searchBoxClass)
      );
      if (autocomplete) this.filter.removeChild(autocomplete);
    }
  }

  populateSearchBox(el) {
    let searches = this.allTags.filter((tag) =>
      tag.toLowerCase().includes(el.childNodes[0].data.toLowerCase())
    );

    let searchBox = this.filter.querySelector(
      this.classListToSelector(this.searchBoxClass)
    );
    if (searchBox) {
      searchBox.innerHTML = "";

      searches.forEach((search) => {
        if (!this.tagFilter.includes(search))
          this.addTagTo(search, searchBox, false);
      });
    }
  }

  addTagTo(tag, element, active) {
    let el = document.createElement(this.filterTagType);
    el.appendChild(document.createTextNode(tag));
    this.tagClass.split(" ").forEach((tagClass) => {
      el.classList.add(tagClass);
    });
    if (active)
      this.activeTagClass.split(" ").forEach((activeClass) => {
        el.classList.add(activeClass);
      });
    if (this.useDataset) el.setAttribute("data-" + this.dataTag, tag);
    el.addEventListener(
      "click",
      () => {
        this.toggleTag(this.getTag(el));
      },
      false
    );
    element.append(el);
  }

  filterElements() {
    this.activeCards = Array.from(this.allCards);
    if (this.customFilterFunction === null) {
      this.tagFilter.forEach((tag) => {
        this.activeCards = this.activeCards.filter((el) =>
          this.tagDict[tag].includes(el)
        );
      });
    } else {
      this.activeCards = this.customFilterFunction(
        this.activeCards,
        this.tagFilter
      );
    }
  }

  updateElements() {
    let notCards = [];
    let allCards = Array.from(this.allCards);
    while (this.container.childNodes.length > 0) {
      let el = this.container.lastChild;
      if (!allCards.includes(el) && el !== this.noResult) notCards.push(el);
      this.container.removeChild(el);
    }

    notCards.forEach((el) => {
      this.container.prepend(el);
    });

    if (this.activeCards.length === 0) {
      this.container.append(this.noResult);
    } else {
      this.activeCards.forEach((el) => {
        this.container.append(el);
      });
    }
  }

  updateTagActive() {
    document
      .querySelectorAll(this.classListToSelector(this.tagClass))
      .forEach((tag) => {
        if (this.tagFilter.includes(this.getTag(tag))) {
          this.activeTagClass.split(" ").forEach((activeClass) => {
            tag.classList.add(activeClass);
          });
        } else {
          this.activeTagClass.split(" ").forEach((activeClass) => {
            tag.classList.remove(activeClass);
          });
        }
      });
  }

  removeFromFilter(tag) {
    this.filter
      .querySelectorAll(this.classListToSelector(this.tagClass))
      .forEach((tagEl) => {
        if (this.useDataset) {
          if (tagEl.getAttribute("data-" + this.dataTag) === tag)
            this.filter.removeChild(tagEl);
        } else {
          if (tagEl.innerHTML === tag) this.filter.removeChild(tagEl);
        }
      });
  }

  toggleTag(tag) {
    let index = this.tagFilter.indexOf(tag);
    if (index > -1) {
      if (this.filterSelectionMethod === "input") {
        this.removeFromFilter(tag);
        this.resetInput();
      }
      this.tagFilter.splice(index, 1);
    } else {
      if (this.filterSelectionMethod === "input") {
        this.addTagTo(tag, this.filter, true);
        this.resetInput();
      }
      this.tagFilter.push(tag);
    }

    if (this.tagFilter.length === 0) {
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
        searchBoxColor: custom color for filter search box, if filterSelectionMethod is set to "input" and useSearchBox is set to "true", defaults to "#cfcfcf"
      }
      filter {
        stickyFilter: determines whether to make the filter position sticky, defaults to "desktop" (options are "desktop", "mobile", "both", "none")
        top: determines the top offset of the filter position, defaults to "0" (if one value is passed, it will be used for both desktop and mobile. if an array is passed then it uses the first value for desktop, and the second value for mobile)
      }

  */
  constructor(params) {
    let styling = params.styling;
    this.cssPath = styling.cssPath ?? "dynamic-tags.css";
    let el = this.createLinkTag(this.cssPath);

    this.containerClass = params.container ?? "container";
    this.filterClass = params.filter ?? "filter";
    this.cardClass = params.card ?? "card";
    this.tagClass = params.tag ?? "tag";
    this.activeTagClass = params.activeTagClass ?? "active";
    this.filterInputClass = params.filterInputClass ?? "filter-input";
    this.autocompleteClass = params.autocompleteClass ?? "autocomplete";
    this.searchBoxClass = params.searchBoxClass ?? "search-box";

    el.addEventListener("load", () => {
      this.modifyStyleSheet(params, el);
    });
  }

  classListToSelector(classList) {
    let selector = "";
    classList.split(" ").forEach((className) => {
      selector += "." + className;
    });

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

  migrateStyleSheet(params, stylesheet) {
    let filter = params.styling.filter;
    let rules = stylesheet.cssRules;
    let length = rules.length;
    for (let i = 1; i < length; i++) {
      let rule = rules[i];
      let text = "";
      if (rule.selectorText !== undefined) {
        let parts = rule.cssText.split("{");
        let selector = this.replaceSelectors(parts[0]);

        if (rule.selectorText === ".filter") {
          if (
            filter.stickyFilter === "desktop" ||
            filter.stickyFilter === "both"
          ) {
            parts[1] = parts[1].replace(
              "position: relative;",
              "position: sticky;"
            );

            if (filter.top !== null && Array.isArray(filter.top)) {
              parts[1] = parts[1].replace(
                "top: 0px;",
                "top: " + filter.top[0] + ";"
              );
            } else {
              parts[1] = parts[1].replace(
                "top: 0px;",
                "top: " + filter.top + ";"
              );
            }
          }
        }

        text = selector + "{" + parts[1];
      } else {
        text = this.getMediaCSSText(rule, filter);
      }

      stylesheet.deleteRule(i);
      stylesheet.insertRule(text, i);
    }
  }

  // pass in media rule, get reconstructed cssText
  getMediaCSSText(mediaRule, filter) {
    let rules = mediaRule.cssRules;
    let cssText = mediaRule.cssText.split("{")[0] + "{ ";
    let length = rules.length;

    for (let i = 0; i < length; i++) {
      let rule = rules[i];
      let text = "";
      let parts = rule.cssText.split("{");
      let selector = this.replaceSelectors(parts[0]);

      if (rule.selectorText === ".filter") {
        if (
          filter.stickyFilter === "mobile" ||
          filter.stickyFilter === "both"
        ) {
          parts[1] = parts[1].replace(
            "position: relative;",
            "position: sticky;"
          );

          if (filter.top !== null && Array.isArray(filter.top)) {
            parts[1] = parts[1].replace(
              "top: 0px;",
              "top: " + filter.top[0] + ";"
            );
          } else {
            parts[1] = parts[1].replace(
              "top: 0px;",
              "top: " + filter.top + ";"
            );
          }
        }
      }

      text = selector + "{" + parts[1];

      cssText += text;
    }
    cssText += " }";

    return cssText;
  }

  replaceSelectors(string) {
    let output = string;

    output = output.replace(
      ".filter",
      this.classListToSelector(this.filterClass)
    );
    output = output.replace(
      ".filter-input",
      this.classListToSelector(this.filterInputClass)
    );
    output = output.replace(
      ".search-box",
      this.classListToSelector(this.searchBoxClass)
    );
    output = output.replace(
      ".autocomplete",
      this.classListToSelector(this.autocompleteClass)
    );
    output = output.replace(
      ".container",
      this.classListToSelector(this.containerClass)
    );
    output = output.replace(".card", this.classListToSelector(this.cardClass));
    output = output.replace(".tag", this.classListToSelector(this.tagClass));
    output = output.replace(
      ".active",
      this.classListToSelector(this.activeTagClass)
    );

    return output;
  }

  modifyStyleSheet(params, el) {
    let styling = params.styling;
    let stylesheet = el.sheet;

    this.migrateStyleSheet(params, stylesheet);

    if (styling.baseTheme === "blue") {
      stylesheet.insertRule(":root { --tag-color: var(--pastel-blue); }", 1);
      stylesheet.insertRule(":root { --tag-shadow-color: var(--blue); }", 1);
      stylesheet.insertRule(":root { --active-tag-color: var(--blue); }", 1);
      stylesheet.insertRule(
        ":root { --active-tag-shadow-color: var(--blue); }",
        1
      );
    } else if (styling.baseTheme === "green") {
      stylesheet.insertRule(":root { --tag-color: var(--pastel-green); }", 1);
      stylesheet.insertRule(":root { --tag-shadow-color: var(--green); }", 1);
      stylesheet.insertRule(":root { --active-tag-color: var(--green); }", 1);
      stylesheet.insertRule(
        ":root { --active-tag-shadow-color: var(--green); }",
        1
      );
    } else {
      stylesheet.insertRule(":root { --tag-color: var(--pastel-orange); }", 1);
      stylesheet.insertRule(":root { --tag-shadow-color: var(--orange); }", 1);
      stylesheet.insertRule(":root { --active-tag-color: var(--orange); }", 1);
      stylesheet.insertRule(
        ":root { --active-tag-shadow-color: var(--orange); }",
        1
      );
    }

    let colors = styling.colors;
    if (colors) {
      if (colors.containerColor)
        stylesheet.insertRule(
          ":root { --container-color: " + colors.containerColor + "; }",
          5
        );
      if (colors.cardColor)
        stylesheet.insertRule(
          ":root { --card-color: " + colors.cardColor + "; }",
          5
        );
      if (colors.tagColor)
        stylesheet.insertRule(
          ":root { --tag-color: " + colors.tagColor + "; }",
          5
        );
      if (colors.tagShadowColor)
        stylesheet.insertRule(
          ":root { --tag-shadow-color: " + colors.tagShadowColor + "; }",
          5
        );
      if (colors.activeTagColor)
        stylesheet.insertRule(
          ":root { --active-tag-color: " + colors.activeTagColor + "; }",
          5
        );
      if (colors.activeTagShadowColor)
        stylesheet.insertRule(
          ":root { --active-tag-shadow-color: " +
            colors.activeTagShadowColor +
            "; }",
          5
        );
      if (colors.filterInputColor)
        stylesheet.insertRule(
          ":root { --filter-input-color: " + colors.filterInputColor + "; }",
          5
        );
      if (colors.filterInputFocusColor)
        stylesheet.insertRule(
          ":root { --filter-input-focus-color: " +
            colors.filterInputFocusColor +
            "; }",
          5
        );
      if (colors.searchBoxColor)
        stylesheet.insertRule(
          ":root { --search-box-color: " + colors.searchBoxColor + "; }",
          5
        );
    }
  }
}
