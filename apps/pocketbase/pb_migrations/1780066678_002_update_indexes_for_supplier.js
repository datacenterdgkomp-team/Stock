/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("supplier");
  collection.indexes.push("CREATE UNIQUE INDEX idx_supplier_nama_supplier ON supplier (nama_supplier)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("supplier");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_supplier_nama_supplier"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
