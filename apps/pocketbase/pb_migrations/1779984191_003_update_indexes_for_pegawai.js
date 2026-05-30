/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pegawai");
  collection.indexes.push("CREATE UNIQUE INDEX idx_pegawai_id_pegawai ON pegawai (id_pegawai)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("pegawai");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_pegawai_id_pegawai"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
