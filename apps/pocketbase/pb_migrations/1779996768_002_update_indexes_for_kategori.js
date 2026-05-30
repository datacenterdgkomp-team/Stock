/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("kategori");
  collection.indexes.push("CREATE UNIQUE INDEX idx_kategori_nama ON kategori (nama)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("kategori");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_kategori_nama"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
