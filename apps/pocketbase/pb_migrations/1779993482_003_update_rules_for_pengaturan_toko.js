/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pengaturan_toko");
  collection.viewRule = "@request.auth.id != \"\"";
  collection.createRule = "@request.auth.role = 'Admin' || @request.auth.role = 'Manager'";
  collection.updateRule = "@request.auth.role = 'Admin' || @request.auth.role = 'Manager'";
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("pengaturan_toko");
  collection.viewRule = "";
  collection.createRule = "@request.auth.role = 'Admin'";
  collection.updateRule = "@request.auth.role = 'Admin'";
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
