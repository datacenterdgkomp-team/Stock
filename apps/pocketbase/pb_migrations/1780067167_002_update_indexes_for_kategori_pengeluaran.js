/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("kategori_pengeluaran");
  collection.indexes.push("CREATE UNIQUE INDEX idx_kategori_pengeluaran_nama_kategori ON kategori_pengeluaran (nama_kategori)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("kategori_pengeluaran");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_kategori_pengeluaran_nama_kategori"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
