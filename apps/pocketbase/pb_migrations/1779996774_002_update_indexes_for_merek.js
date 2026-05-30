/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("merek");
  collection.indexes.push("CREATE UNIQUE INDEX idx_merek_nama ON merek (nama)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("merek");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_merek_nama"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
