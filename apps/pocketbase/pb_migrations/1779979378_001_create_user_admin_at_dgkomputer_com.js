/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  const record = new Record(collection);
  record.set("email", "admin@dgkomputer.com");
  record.setPassword("Admin@123456");
  record.set("nama_lengkap", "Administrator DG Komputer");
  record.set("role", "Admin");
  record.set("status", "active");
  return app.save(record);
}, (app) => {
  try {
    const record = app.findFirstRecordByData("users", "email", "admin@dgkomputer.com");
    app.delete(record);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Auth record not found, skipping rollback");
      return;
    }
    throw e;
  }
})
