/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("jasa_service");

  const existing = collection.fields.getByName("foto_barang");
  if (existing) {
    if (existing.type === "file") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("foto_barang"); // exists with wrong type, remove first
  }

  collection.fields.add(new FileField({
    name: "foto_barang",
    required: false,
    maxSelect: 10,
    maxSize: 5242880
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("jasa_service");
    collection.fields.removeByName("foto_barang");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
