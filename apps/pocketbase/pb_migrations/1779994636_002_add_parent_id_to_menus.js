/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const menusCollection = app.findCollectionByNameOrId("menus");
  const collection = app.findCollectionByNameOrId("menus");

  const existing = collection.fields.getByName("parent_id");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("parent_id"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "parent_id",
    required: false,
    collectionId: menusCollection.id
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("menus");
    collection.fields.removeByName("parent_id");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
