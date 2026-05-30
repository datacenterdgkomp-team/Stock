/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("payment_methods");

  const record0 = new Record(collection);
    record0.set("name", "Tunai");
    record0.set("code", "TUN");
    record0.set("status", true);
    record0.set("admin_fee", 0);
  app.save(record0);

  const record1 = new Record(collection);
    record1.set("name", "Transfer");
    record1.set("code", "TRF");
    record1.set("status", true);
    record1.set("admin_fee", 0);
  app.save(record1);

  const record2 = new Record(collection);
    record2.set("name", "QRIS");
    record2.set("code", "QRIS");
    record2.set("status", true);
    record2.set("admin_fee", 0);
  app.save(record2);
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
