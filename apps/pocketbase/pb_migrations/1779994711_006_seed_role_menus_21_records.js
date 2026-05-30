/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("role_menus");

  const record0 = new Record(collection);
    const record0_role_idLookup = app.findFirstRecordByFilter("roles", "name='Admin'");
    if (!record0_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Admin'\""); }
    record0.set("role_id", record0_role_idLookup.id);
    const record0_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Dashboard'");
    if (!record0_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Dashboard'\""); }
    record0.set("menu_id", record0_menu_idLookup.id);
    record0.set("order", 1);
  app.save(record0);

  const record1 = new Record(collection);
    const record1_role_idLookup = app.findFirstRecordByFilter("roles", "name='Admin'");
    if (!record1_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Admin'\""); }
    record1.set("role_id", record1_role_idLookup.id);
    const record1_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Inventory'");
    if (!record1_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Inventory'\""); }
    record1.set("menu_id", record1_menu_idLookup.id);
    record1.set("order", 2);
  app.save(record1);

  const record2 = new Record(collection);
    const record2_role_idLookup = app.findFirstRecordByFilter("roles", "name='Admin'");
    if (!record2_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Admin'\""); }
    record2.set("role_id", record2_role_idLookup.id);
    const record2_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Sales'");
    if (!record2_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Sales'\""); }
    record2.set("menu_id", record2_menu_idLookup.id);
    record2.set("order", 3);
  app.save(record2);

  const record3 = new Record(collection);
    const record3_role_idLookup = app.findFirstRecordByFilter("roles", "name='Admin'");
    if (!record3_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Admin'\""); }
    record3.set("role_id", record3_role_idLookup.id);
    const record3_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Attendance'");
    if (!record3_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Attendance'\""); }
    record3.set("menu_id", record3_menu_idLookup.id);
    record3.set("order", 4);
  app.save(record3);

  const record4 = new Record(collection);
    const record4_role_idLookup = app.findFirstRecordByFilter("roles", "name='Admin'");
    if (!record4_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Admin'\""); }
    record4.set("role_id", record4_role_idLookup.id);
    const record4_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Payroll'");
    if (!record4_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Payroll'\""); }
    record4.set("menu_id", record4_menu_idLookup.id);
    record4.set("order", 5);
  app.save(record4);

  const record5 = new Record(collection);
    const record5_role_idLookup = app.findFirstRecordByFilter("roles", "name='Admin'");
    if (!record5_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Admin'\""); }
    record5.set("role_id", record5_role_idLookup.id);
    const record5_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Reports'");
    if (!record5_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Reports'\""); }
    record5.set("menu_id", record5_menu_idLookup.id);
    record5.set("order", 6);
  app.save(record5);

  const record6 = new Record(collection);
    const record6_role_idLookup = app.findFirstRecordByFilter("roles", "name='Admin'");
    if (!record6_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Admin'\""); }
    record6.set("role_id", record6_role_idLookup.id);
    const record6_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Settings'");
    if (!record6_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Settings'\""); }
    record6.set("menu_id", record6_menu_idLookup.id);
    record6.set("order", 7);
  app.save(record6);

  const record7 = new Record(collection);
    const record7_role_idLookup = app.findFirstRecordByFilter("roles", "name='Manager'");
    if (!record7_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Manager'\""); }
    record7.set("role_id", record7_role_idLookup.id);
    const record7_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Dashboard'");
    if (!record7_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Dashboard'\""); }
    record7.set("menu_id", record7_menu_idLookup.id);
    record7.set("order", 1);
  app.save(record7);

  const record8 = new Record(collection);
    const record8_role_idLookup = app.findFirstRecordByFilter("roles", "name='Manager'");
    if (!record8_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Manager'\""); }
    record8.set("role_id", record8_role_idLookup.id);
    const record8_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Inventory'");
    if (!record8_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Inventory'\""); }
    record8.set("menu_id", record8_menu_idLookup.id);
    record8.set("order", 2);
  app.save(record8);

  const record9 = new Record(collection);
    const record9_role_idLookup = app.findFirstRecordByFilter("roles", "name='Manager'");
    if (!record9_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Manager'\""); }
    record9.set("role_id", record9_role_idLookup.id);
    const record9_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Sales'");
    if (!record9_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Sales'\""); }
    record9.set("menu_id", record9_menu_idLookup.id);
    record9.set("order", 3);
  app.save(record9);

  const record10 = new Record(collection);
    const record10_role_idLookup = app.findFirstRecordByFilter("roles", "name='Manager'");
    if (!record10_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Manager'\""); }
    record10.set("role_id", record10_role_idLookup.id);
    const record10_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Attendance'");
    if (!record10_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Attendance'\""); }
    record10.set("menu_id", record10_menu_idLookup.id);
    record10.set("order", 4);
  app.save(record10);

  const record11 = new Record(collection);
    const record11_role_idLookup = app.findFirstRecordByFilter("roles", "name='Manager'");
    if (!record11_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Manager'\""); }
    record11.set("role_id", record11_role_idLookup.id);
    const record11_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Payroll'");
    if (!record11_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Payroll'\""); }
    record11.set("menu_id", record11_menu_idLookup.id);
    record11.set("order", 5);
  app.save(record11);

  const record12 = new Record(collection);
    const record12_role_idLookup = app.findFirstRecordByFilter("roles", "name='Manager'");
    if (!record12_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Manager'\""); }
    record12.set("role_id", record12_role_idLookup.id);
    const record12_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Reports'");
    if (!record12_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Reports'\""); }
    record12.set("menu_id", record12_menu_idLookup.id);
    record12.set("order", 6);
  app.save(record12);

  const record13 = new Record(collection);
    const record13_role_idLookup = app.findFirstRecordByFilter("roles", "name='Manager'");
    if (!record13_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Manager'\""); }
    record13.set("role_id", record13_role_idLookup.id);
    const record13_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Settings'");
    if (!record13_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Settings'\""); }
    record13.set("menu_id", record13_menu_idLookup.id);
    record13.set("order", 7);
  app.save(record13);

  const record14 = new Record(collection);
    const record14_role_idLookup = app.findFirstRecordByFilter("roles", "name='Staff'");
    if (!record14_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Staff'\""); }
    record14.set("role_id", record14_role_idLookup.id);
    const record14_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Dashboard'");
    if (!record14_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Dashboard'\""); }
    record14.set("menu_id", record14_menu_idLookup.id);
    record14.set("order", 1);
  app.save(record14);

  const record15 = new Record(collection);
    const record15_role_idLookup = app.findFirstRecordByFilter("roles", "name='Staff'");
    if (!record15_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Staff'\""); }
    record15.set("role_id", record15_role_idLookup.id);
    const record15_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Inventory'");
    if (!record15_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Inventory'\""); }
    record15.set("menu_id", record15_menu_idLookup.id);
    record15.set("order", 2);
  app.save(record15);

  const record16 = new Record(collection);
    const record16_role_idLookup = app.findFirstRecordByFilter("roles", "name='Staff'");
    if (!record16_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Staff'\""); }
    record16.set("role_id", record16_role_idLookup.id);
    const record16_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Sales'");
    if (!record16_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Sales'\""); }
    record16.set("menu_id", record16_menu_idLookup.id);
    record16.set("order", 3);
  app.save(record16);

  const record17 = new Record(collection);
    const record17_role_idLookup = app.findFirstRecordByFilter("roles", "name='Staff'");
    if (!record17_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Staff'\""); }
    record17.set("role_id", record17_role_idLookup.id);
    const record17_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Attendance'");
    if (!record17_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Attendance'\""); }
    record17.set("menu_id", record17_menu_idLookup.id);
    record17.set("order", 4);
  app.save(record17);

  const record18 = new Record(collection);
    const record18_role_idLookup = app.findFirstRecordByFilter("roles", "name='Staff'");
    if (!record18_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Staff'\""); }
    record18.set("role_id", record18_role_idLookup.id);
    const record18_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Reports'");
    if (!record18_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Reports'\""); }
    record18.set("menu_id", record18_menu_idLookup.id);
    record18.set("order", 5);
  app.save(record18);

  const record19 = new Record(collection);
    const record19_role_idLookup = app.findFirstRecordByFilter("roles", "name='Kasir'");
    if (!record19_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Kasir'\""); }
    record19.set("role_id", record19_role_idLookup.id);
    const record19_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Dashboard'");
    if (!record19_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Dashboard'\""); }
    record19.set("menu_id", record19_menu_idLookup.id);
    record19.set("order", 1);
  app.save(record19);

  const record20 = new Record(collection);
    const record20_role_idLookup = app.findFirstRecordByFilter("roles", "name='Kasir'");
    if (!record20_role_idLookup) { throw new Error("Lookup failed for role_id: no record in 'roles' matching \"name='Kasir'\""); }
    record20.set("role_id", record20_role_idLookup.id);
    const record20_menu_idLookup = app.findFirstRecordByFilter("menus", "name='Sales'");
    if (!record20_menu_idLookup) { throw new Error("Lookup failed for menu_id: no record in 'menus' matching \"name='Sales'\""); }
    record20.set("menu_id", record20_menu_idLookup.id);
    record20.set("order", 2);
  app.save(record20);
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
