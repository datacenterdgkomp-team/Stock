/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("activity_log");
  collection.indexes.push("CREATE INDEX idx_activity_log_user_id ON activity_log (user_id)");
  collection.indexes.push("CREATE INDEX idx_activity_log_timestamp ON activity_log (timestamp)");
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("activity_log");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_activity_log_user_id"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_activity_log_timestamp"));
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
