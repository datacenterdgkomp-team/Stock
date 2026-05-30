/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const usersCollection = app.findCollectionByNameOrId("users");
  const collection = app.findCollectionByNameOrId("pengaturan_toko");

  const existing = collection.fields.getByName("logo_uploaded_by");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("logo_uploaded_by"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "logo_uploaded_by",
    collectionId: usersCollection.id
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pengaturan_toko");
    collection.fields.removeByName("logo_uploaded_by");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
