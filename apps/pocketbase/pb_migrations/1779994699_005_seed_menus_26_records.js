/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("menus");

  const record0 = new Record(collection);
    record0.set("name", "Dashboard");
    record0.set("path", "/dashboard");
    record0.set("icon", "dashboard");
    record0.set("order", 1);
    record0.set("status", "Aktif");
  app.save(record0);

  const record1 = new Record(collection);
    record1.set("name", "Inventory");
    record1.set("path", "/inventory");
    record1.set("icon", "inventory");
    record1.set("order", 2);
    record1.set("status", "Aktif");
  app.save(record1);

  const record2 = new Record(collection);
    record2.set("name", "Produk");
    record2.set("path", "/inventory/produk");
    record2.set("icon", "product");
    const record2_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Inventory'");
    if (!record2_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Inventory'\""); }
    record2.set("parent_id", record2_parent_idLookup.id);
    record2.set("order", 1);
    record2.set("status", "Aktif");
  app.save(record2);

  const record3 = new Record(collection);
    record3.set("name", "Kategori");
    record3.set("path", "/inventory/kategori");
    record3.set("icon", "category");
    const record3_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Inventory'");
    if (!record3_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Inventory'\""); }
    record3.set("parent_id", record3_parent_idLookup.id);
    record3.set("order", 2);
    record3.set("status", "Aktif");
  app.save(record3);

  const record4 = new Record(collection);
    record4.set("name", "Supplier");
    record4.set("path", "/inventory/supplier");
    record4.set("icon", "supplier");
    const record4_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Inventory'");
    if (!record4_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Inventory'\""); }
    record4.set("parent_id", record4_parent_idLookup.id);
    record4.set("order", 3);
    record4.set("status", "Aktif");
  app.save(record4);

  const record5 = new Record(collection);
    record5.set("name", "Sales");
    record5.set("path", "/sales");
    record5.set("icon", "sales");
    record5.set("order", 3);
    record5.set("status", "Aktif");
  app.save(record5);

  const record6 = new Record(collection);
    record6.set("name", "Penjualan");
    record6.set("path", "/sales/penjualan");
    record6.set("icon", "sales");
    const record6_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Sales'");
    if (!record6_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Sales'\""); }
    record6.set("parent_id", record6_parent_idLookup.id);
    record6.set("order", 1);
    record6.set("status", "Aktif");
  app.save(record6);

  const record7 = new Record(collection);
    record7.set("name", "Kasir");
    record7.set("path", "/sales/kasir");
    record7.set("icon", "cashier");
    const record7_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Sales'");
    if (!record7_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Sales'\""); }
    record7.set("parent_id", record7_parent_idLookup.id);
    record7.set("order", 2);
    record7.set("status", "Aktif");
  app.save(record7);

  const record8 = new Record(collection);
    record8.set("name", "Invoice");
    record8.set("path", "/sales/invoice");
    record8.set("icon", "invoice");
    const record8_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Sales'");
    if (!record8_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Sales'\""); }
    record8.set("parent_id", record8_parent_idLookup.id);
    record8.set("order", 3);
    record8.set("status", "Aktif");
  app.save(record8);

  const record9 = new Record(collection);
    record9.set("name", "Attendance");
    record9.set("path", "/attendance");
    record9.set("icon", "attendance");
    record9.set("order", 4);
    record9.set("status", "Aktif");
  app.save(record9);

  const record10 = new Record(collection);
    record10.set("name", "Absen");
    record10.set("path", "/attendance/absen");
    record10.set("icon", "checkin");
    const record10_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Attendance'");
    if (!record10_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Attendance'\""); }
    record10.set("parent_id", record10_parent_idLookup.id);
    record10.set("order", 1);
    record10.set("status", "Aktif");
  app.save(record10);

  const record11 = new Record(collection);
    record11.set("name", "Laporan Absen");
    record11.set("path", "/attendance/laporan");
    record11.set("icon", "report");
    const record11_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Attendance'");
    if (!record11_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Attendance'\""); }
    record11.set("parent_id", record11_parent_idLookup.id);
    record11.set("order", 2);
    record11.set("status", "Aktif");
  app.save(record11);

  const record12 = new Record(collection);
    record12.set("name", "Payroll");
    record12.set("path", "/payroll");
    record12.set("icon", "payroll");
    record12.set("order", 5);
    record12.set("status", "Aktif");
  app.save(record12);

  const record13 = new Record(collection);
    record13.set("name", "Gaji");
    record13.set("path", "/payroll/gaji");
    record13.set("icon", "salary");
    const record13_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Payroll'");
    if (!record13_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Payroll'\""); }
    record13.set("parent_id", record13_parent_idLookup.id);
    record13.set("order", 1);
    record13.set("status", "Aktif");
  app.save(record13);

  const record14 = new Record(collection);
    record14.set("name", "Slip Gaji");
    record14.set("path", "/payroll/slip");
    record14.set("icon", "slip");
    const record14_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Payroll'");
    if (!record14_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Payroll'\""); }
    record14.set("parent_id", record14_parent_idLookup.id);
    record14.set("order", 2);
    record14.set("status", "Aktif");
  app.save(record14);

  const record15 = new Record(collection);
    record15.set("name", "Reports");
    record15.set("path", "/reports");
    record15.set("icon", "reports");
    record15.set("order", 6);
    record15.set("status", "Aktif");
  app.save(record15);

  const record16 = new Record(collection);
    record16.set("name", "Laporan Penjualan");
    record16.set("path", "/reports/penjualan");
    record16.set("icon", "sales_report");
    const record16_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Reports'");
    if (!record16_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Reports'\""); }
    record16.set("parent_id", record16_parent_idLookup.id);
    record16.set("order", 1);
    record16.set("status", "Aktif");
  app.save(record16);

  const record17 = new Record(collection);
    record17.set("name", "Laporan Inventory");
    record17.set("path", "/reports/inventory");
    record17.set("icon", "inventory_report");
    const record17_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Reports'");
    if (!record17_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Reports'\""); }
    record17.set("parent_id", record17_parent_idLookup.id);
    record17.set("order", 2);
    record17.set("status", "Aktif");
  app.save(record17);

  const record18 = new Record(collection);
    record18.set("name", "Laporan Absen");
    record18.set("path", "/reports/absen");
    record18.set("icon", "attendance_report");
    const record18_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Reports'");
    if (!record18_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Reports'\""); }
    record18.set("parent_id", record18_parent_idLookup.id);
    record18.set("order", 3);
    record18.set("status", "Aktif");
  app.save(record18);

  const record19 = new Record(collection);
    record19.set("name", "Laporan Keuangan");
    record19.set("path", "/reports/keuangan");
    record19.set("icon", "finance_report");
    const record19_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Reports'");
    if (!record19_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Reports'\""); }
    record19.set("parent_id", record19_parent_idLookup.id);
    record19.set("order", 4);
    record19.set("status", "Aktif");
  app.save(record19);

  const record20 = new Record(collection);
    record20.set("name", "Settings");
    record20.set("path", "/settings");
    record20.set("icon", "settings");
    record20.set("order", 7);
    record20.set("status", "Aktif");
  app.save(record20);

  const record21 = new Record(collection);
    record21.set("name", "Profil Toko");
    record21.set("path", "/settings/profil");
    record21.set("icon", "store");
    const record21_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Settings'");
    if (!record21_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Settings'\""); }
    record21.set("parent_id", record21_parent_idLookup.id);
    record21.set("order", 1);
    record21.set("status", "Aktif");
  app.save(record21);

  const record22 = new Record(collection);
    record22.set("name", "Pengaturan Pembayaran");
    record22.set("path", "/settings/pembayaran");
    record22.set("icon", "payment");
    const record22_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Settings'");
    if (!record22_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Settings'\""); }
    record22.set("parent_id", record22_parent_idLookup.id);
    record22.set("order", 2);
    record22.set("status", "Aktif");
  app.save(record22);

  const record23 = new Record(collection);
    record23.set("name", "Backup/Restore");
    record23.set("path", "/settings/backup");
    record23.set("icon", "backup");
    const record23_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Settings'");
    if (!record23_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Settings'\""); }
    record23.set("parent_id", record23_parent_idLookup.id);
    record23.set("order", 3);
    record23.set("status", "Aktif");
  app.save(record23);

  const record24 = new Record(collection);
    record24.set("name", "Management User");
    record24.set("path", "/settings/users");
    record24.set("icon", "users");
    const record24_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Settings'");
    if (!record24_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Settings'\""); }
    record24.set("parent_id", record24_parent_idLookup.id);
    record24.set("order", 4);
    record24.set("status", "Aktif");
  app.save(record24);

  const record25 = new Record(collection);
    record25.set("name", "Role Management");
    record25.set("path", "/settings/roles");
    record25.set("icon", "roles");
    const record25_parent_idLookup = app.findFirstRecordByFilter("menus", "name='Settings'");
    if (!record25_parent_idLookup) { throw new Error("Lookup failed for parent_id: no record in 'menus' matching \"name='Settings'\""); }
    record25.set("parent_id", record25_parent_idLookup.id);
    record25.set("order", 5);
    record25.set("status", "Aktif");
  app.save(record25);
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
