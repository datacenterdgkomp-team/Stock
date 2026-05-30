/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("payment_methods");
  collection.indexes.push("CREATE UNIQUE INDEX idx_payment_methods_name ON payment_methods (name)");
  collection.indexes.push("CREATE UNIQUE INDEX idx_payment_methods_code ON payment_methods (code)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("payment_methods");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_payment_methods_name"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_payment_methods_code"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
