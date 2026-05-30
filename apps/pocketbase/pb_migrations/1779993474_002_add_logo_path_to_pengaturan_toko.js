/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pengaturan_toko");

  const existing = collection.fields.getByName("logo_path");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("logo_path"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "logo_path"
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pengaturan_toko");
    collection.fields.removeByName("logo_path");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
