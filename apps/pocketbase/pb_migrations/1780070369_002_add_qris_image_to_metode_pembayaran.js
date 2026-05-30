/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("metode_pembayaran");

  const existing = collection.fields.getByName("qris_image");
  if (existing) {
    if (existing.type === "file") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("qris_image"); // exists with wrong type, remove first
  }

  collection.fields.add(new FileField({
    name: "qris_image",
    required: false,
    maxSelect: 1,
    maxSize: 5242880
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("metode_pembayaran");
    collection.fields.removeByName("qris_image");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
