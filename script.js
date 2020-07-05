var dtc = new DynamicTagController({
  "container": ".container",
  "element": ".el",
  "tag": ".tag",
  "filter": ".filter",
  "method": "sliding"
})

dtc.loadTags();

var dtc2 = new DynamicTagController({
  "container": ".container2",
  "element": ".el2",
  "tag": ".tag2",
  "filter": ".filter2",
  "noResult": "Ain't nuthin' here"
})

dtc2.loadTags();