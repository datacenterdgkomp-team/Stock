/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("roles");

  const record0 = new Record(collection);
    record0.set("name", "Admin");
    record0.set("description", "Administrator with full access");
    record0.set("status", "Aktif");
  app.save(record0);

  const record1 = new Record(collection);
    record1.set("name", "Manager");
    record1.set("description", "Manager with limited administrative access");
    record1.set("status", "Aktif");
  app.save(record1);

  const record2 = new Record(collection);
    record2.set("name", "Staff");
    record2.set("description", "Staff with basic access");
    record2.set("status", "Aktif");
  app.save(record2);

  const record3 = new Record(collection);
    record3.set("name", "Kasir");
    record3.set("description", "Cashier with sales access");
    record3.set("status", "Aktif");
  app.save(record3);
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
