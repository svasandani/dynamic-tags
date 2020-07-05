var dtc = new DynamicTagController({
  "container": "container",
  "card": "el",
  "tag": "tag",
  "filter": "filter",
  // "useDataset": "true",
  "dataTag": "tag"
})

dtc.loadTags();

var dtc2 = new DynamicTagController({
  "container": "container2",
  "card": "el2",
  "tag": "tag2",
  "filter": "filter2",
  "noResult": "Ain't nuthin' here"
})

dtc2.loadTags();