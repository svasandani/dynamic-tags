<style>
.corny {
  font-family: 'Goblin One', serif;
  font-weight: 400;
  font-size: 0.88em;
  display: inline-block;
  padding: 0.2em 0.7em;
  border-radius: 0.2em;
  background: #efad8d;
  box-shadow: 0 0.2em #8f4d1d;
  transition: 0.1s linear;
  color: black;
  margin-right: 3px;
}

.corny:hover {
  cursor: pointer;
  color:#113d7f;
  box-shadow: 0 0.25em #8f4d1d;
  transition: 0.1s linear;
}
</style>

<link href="https://fonts.googleapis.com/css2?family=Goblin+One&family=Gotu&family=DM+Mono:wght@300&family=Poppins:wght@300;400&display=swap" rel="stylesheet">

<h1 align="center">
  <a href='https://svasandani.github.io/dynamic-tags'>
    <img src="logo.svg" width="60%" />
  </a>
  <br>
  <br>
  <a href='https://simple.wikipedia.org/wiki/MIT_License'>
    <img src="https://img.shields.io/badge/license-MIT-lightgrey" />
  </a>
  <br>
  <br>
</h1>
<br>
<p class="corny" style="margin-bottom: 2px">dynamic-tags</p> is a library designed to supercharge your already existing DOM elements. Just assign any unique CSS class to your tags, and we take care of the rest.

## Demos

<p align="center">
  <img src="https://raw.githubusercontent.com/svasandani/dynamic-tags/master/demo1.gif" />
  <br>
  <br>
  <img src="https://raw.githubusercontent.com/svasandani/dynamic-tags/master/demo2.gif" />
</p>

## Feature roadmap
- [x] implement "input" filter method
- [x] implement autocomplete algorithm for input filter
- [x] add more customizable selectors
- [x] add optional default css styling
- [x] add tab-to-autocomplete feature to input filterSelectionMethod
- [ ] allow config options for autocomplete/search box
  - strict matching (both)
  - match start only (search box)
- [ ] allow for complicated sub-container structure without breaking functionality

## Maintainers
- [Shailesh Vasandani](https://www.github.com/svasandani)
- [Juily Vasandani](https://github.com/juilyvasandani)
