/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  const record = new Record(collection);
  record.set("email", "manager@dgkomputer.com");
  record.setPassword("Manager@123456");
  record.set("nama_lengkap", "Manager DG Komputer");
  record.set("role", "Manager");
  record.set("status", "active");
  return app.save(record);
}, (app) => {
  try {
    const record = app.findFirstRecordByData("users", "email", "manager@dgkomputer.com");
    app.delete(record);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Auth record not found, skipping rollback");
      return;
    }
    throw e;
  }
})
