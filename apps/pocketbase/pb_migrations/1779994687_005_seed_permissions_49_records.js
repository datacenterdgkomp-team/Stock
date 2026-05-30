/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("permissions");

  const record0 = new Record(collection);
    record0.set("name", "Dashboard View");
    record0.set("description", "View dashboard");
    record0.set("module", "Dashboard");
    record0.set("action", "view");
    record0.set("status", "Aktif");
  app.save(record0);

  const record1 = new Record(collection);
    record1.set("name", "User Management View");
    record1.set("description", "View users");
    record1.set("module", "User Management");
    record1.set("action", "view");
    record1.set("status", "Aktif");
  app.save(record1);

  const record2 = new Record(collection);
    record2.set("name", "User Management Create");
    record2.set("description", "Create users");
    record2.set("module", "User Management");
    record2.set("action", "create");
    record2.set("status", "Aktif");
  app.save(record2);

  const record3 = new Record(collection);
    record3.set("name", "User Management Edit");
    record3.set("description", "Edit users");
    record3.set("module", "User Management");
    record3.set("action", "edit");
    record3.set("status", "Aktif");
  app.save(record3);

  const record4 = new Record(collection);
    record4.set("name", "User Management Delete");
    record4.set("description", "Delete users");
    record4.set("module", "User Management");
    record4.set("action", "delete");
    record4.set("status", "Aktif");
  app.save(record4);

  const record5 = new Record(collection);
    record5.set("name", "Role Management View");
    record5.set("description", "View roles");
    record5.set("module", "Role Management");
    record5.set("action", "view");
    record5.set("status", "Aktif");
  app.save(record5);

  const record6 = new Record(collection);
    record6.set("name", "Role Management Create");
    record6.set("description", "Create roles");
    record6.set("module", "Role Management");
    record6.set("action", "create");
    record6.set("status", "Aktif");
  app.save(record6);

  const record7 = new Record(collection);
    record7.set("name", "Role Management Edit");
    record7.set("description", "Edit roles");
    record7.set("module", "Role Management");
    record7.set("action", "edit");
    record7.set("status", "Aktif");
  app.save(record7);

  const record8 = new Record(collection);
    record8.set("name", "Role Management Delete");
    record8.set("description", "Delete roles");
    record8.set("module", "Role Management");
    record8.set("action", "delete");
    record8.set("status", "Aktif");
  app.save(record8);

  const record9 = new Record(collection);
    record9.set("name", "Inventory View");
    record9.set("description", "View inventory");
    record9.set("module", "Inventory");
    record9.set("action", "view");
    record9.set("status", "Aktif");
  app.save(record9);

  const record10 = new Record(collection);
    record10.set("name", "Inventory Create");
    record10.set("description", "Create inventory items");
    record10.set("module", "Inventory");
    record10.set("action", "create");
    record10.set("status", "Aktif");
  app.save(record10);

  const record11 = new Record(collection);
    record11.set("name", "Inventory Edit");
    record11.set("description", "Edit inventory items");
    record11.set("module", "Inventory");
    record11.set("action", "edit");
    record11.set("status", "Aktif");
  app.save(record11);

  const record12 = new Record(collection);
    record12.set("name", "Inventory Delete");
    record12.set("description", "Delete inventory items");
    record12.set("module", "Inventory");
    record12.set("action", "delete");
    record12.set("status", "Aktif");
  app.save(record12);

  const record13 = new Record(collection);
    record13.set("name", "Sales View");
    record13.set("description", "View sales");
    record13.set("module", "Sales");
    record13.set("action", "view");
    record13.set("status", "Aktif");
  app.save(record13);

  const record14 = new Record(collection);
    record14.set("name", "Sales Create");
    record14.set("description", "Create sales");
    record14.set("module", "Sales");
    record14.set("action", "create");
    record14.set("status", "Aktif");
  app.save(record14);

  const record15 = new Record(collection);
    record15.set("name", "Sales Edit");
    record15.set("description", "Edit sales");
    record15.set("module", "Sales");
    record15.set("action", "edit");
    record15.set("status", "Aktif");
  app.save(record15);

  const record16 = new Record(collection);
    record16.set("name", "Sales Delete");
    record16.set("description", "Delete sales");
    record16.set("module", "Sales");
    record16.set("action", "delete");
    record16.set("status", "Aktif");
  app.save(record16);

  const record17 = new Record(collection);
    record17.set("name", "Kasir View");
    record17.set("description", "View cashier");
    record17.set("module", "Kasir");
    record17.set("action", "view");
    record17.set("status", "Aktif");
  app.save(record17);

  const record18 = new Record(collection);
    record18.set("name", "Kasir Create");
    record18.set("description", "Create cashier transactions");
    record18.set("module", "Kasir");
    record18.set("action", "create");
    record18.set("status", "Aktif");
  app.save(record18);

  const record19 = new Record(collection);
    record19.set("name", "Kasir Edit");
    record19.set("description", "Edit cashier transactions");
    record19.set("module", "Kasir");
    record19.set("action", "edit");
    record19.set("status", "Aktif");
  app.save(record19);

  const record20 = new Record(collection);
    record20.set("name", "Kasir Delete");
    record20.set("description", "Delete cashier transactions");
    record20.set("module", "Kasir");
    record20.set("action", "delete");
    record20.set("status", "Aktif");
  app.save(record20);

  const record21 = new Record(collection);
    record21.set("name", "Attendance View");
    record21.set("description", "View attendance");
    record21.set("module", "Attendance");
    record21.set("action", "view");
    record21.set("status", "Aktif");
  app.save(record21);

  const record22 = new Record(collection);
    record22.set("name", "Attendance Create");
    record22.set("description", "Create attendance");
    record22.set("module", "Attendance");
    record22.set("action", "create");
    record22.set("status", "Aktif");
  app.save(record22);

  const record23 = new Record(collection);
    record23.set("name", "Attendance Edit");
    record23.set("description", "Edit attendance");
    record23.set("module", "Attendance");
    record23.set("action", "edit");
    record23.set("status", "Aktif");
  app.save(record23);

  const record24 = new Record(collection);
    record24.set("name", "Attendance Delete");
    record24.set("description", "Delete attendance");
    record24.set("module", "Attendance");
    record24.set("action", "delete");
    record24.set("status", "Aktif");
  app.save(record24);

  const record25 = new Record(collection);
    record25.set("name", "Payroll View");
    record25.set("description", "View payroll");
    record25.set("module", "Payroll");
    record25.set("action", "view");
    record25.set("status", "Aktif");
  app.save(record25);

  const record26 = new Record(collection);
    record26.set("name", "Payroll Create");
    record26.set("description", "Create payroll");
    record26.set("module", "Payroll");
    record26.set("action", "create");
    record26.set("status", "Aktif");
  app.save(record26);

  const record27 = new Record(collection);
    record27.set("name", "Payroll Edit");
    record27.set("description", "Edit payroll");
    record27.set("module", "Payroll");
    record27.set("action", "edit");
    record27.set("status", "Aktif");
  app.save(record27);

  const record28 = new Record(collection);
    record28.set("name", "Payroll Delete");
    record28.set("description", "Delete payroll");
    record28.set("module", "Payroll");
    record28.set("action", "delete");
    record28.set("status", "Aktif");
  app.save(record28);

  const record29 = new Record(collection);
    record29.set("name", "Reports View");
    record29.set("description", "View reports");
    record29.set("module", "Reports");
    record29.set("action", "view");
    record29.set("status", "Aktif");
  app.save(record29);

  const record30 = new Record(collection);
    record30.set("name", "Reports Create");
    record30.set("description", "Create reports");
    record30.set("module", "Reports");
    record30.set("action", "create");
    record30.set("status", "Aktif");
  app.save(record30);

  const record31 = new Record(collection);
    record31.set("name", "Reports Edit");
    record31.set("description", "Edit reports");
    record31.set("module", "Reports");
    record31.set("action", "edit");
    record31.set("status", "Aktif");
  app.save(record31);

  const record32 = new Record(collection);
    record32.set("name", "Reports Delete");
    record32.set("description", "Delete reports");
    record32.set("module", "Reports");
    record32.set("action", "delete");
    record32.set("status", "Aktif");
  app.save(record32);

  const record33 = new Record(collection);
    record33.set("name", "Settings View");
    record33.set("description", "View settings");
    record33.set("module", "Settings");
    record33.set("action", "view");
    record33.set("status", "Aktif");
  app.save(record33);

  const record34 = new Record(collection);
    record34.set("name", "Settings Create");
    record34.set("description", "Create settings");
    record34.set("module", "Settings");
    record34.set("action", "create");
    record34.set("status", "Aktif");
  app.save(record34);

  const record35 = new Record(collection);
    record35.set("name", "Settings Edit");
    record35.set("description", "Edit settings");
    record35.set("module", "Settings");
    record35.set("action", "edit");
    record35.set("status", "Aktif");
  app.save(record35);

  const record36 = new Record(collection);
    record36.set("name", "Settings Delete");
    record36.set("description", "Delete settings");
    record36.set("module", "Settings");
    record36.set("action", "delete");
    record36.set("status", "Aktif");
  app.save(record36);

  const record37 = new Record(collection);
    record37.set("name", "Backup View");
    record37.set("description", "View backups");
    record37.set("module", "Backup");
    record37.set("action", "view");
    record37.set("status", "Aktif");
  app.save(record37);

  const record38 = new Record(collection);
    record38.set("name", "Backup Create");
    record38.set("description", "Create backups");
    record38.set("module", "Backup");
    record38.set("action", "create");
    record38.set("status", "Aktif");
  app.save(record38);

  const record39 = new Record(collection);
    record39.set("name", "Backup Edit");
    record39.set("description", "Edit backups");
    record39.set("module", "Backup");
    record39.set("action", "edit");
    record39.set("status", "Aktif");
  app.save(record39);

  const record40 = new Record(collection);
    record40.set("name", "Backup Delete");
    record40.set("description", "Delete backups");
    record40.set("module", "Backup");
    record40.set("action", "delete");
    record40.set("status", "Aktif");
  app.save(record40);

  const record41 = new Record(collection);
    record41.set("name", "Restore View");
    record41.set("description", "View restore");
    record41.set("module", "Restore");
    record41.set("action", "view");
    record41.set("status", "Aktif");
  app.save(record41);

  const record42 = new Record(collection);
    record42.set("name", "Restore Create");
    record42.set("description", "Create restore");
    record42.set("module", "Restore");
    record42.set("action", "create");
    record42.set("status", "Aktif");
  app.save(record42);

  const record43 = new Record(collection);
    record43.set("name", "Restore Edit");
    record43.set("description", "Edit restore");
    record43.set("module", "Restore");
    record43.set("action", "edit");
    record43.set("status", "Aktif");
  app.save(record43);

  const record44 = new Record(collection);
    record44.set("name", "Restore Delete");
    record44.set("description", "Delete restore");
    record44.set("module", "Restore");
    record44.set("action", "delete");
    record44.set("status", "Aktif");
  app.save(record44);

  const record45 = new Record(collection);
    record45.set("name", "Logs View");
    record45.set("description", "View logs");
    record45.set("module", "Logs");
    record45.set("action", "view");
    record45.set("status", "Aktif");
  app.save(record45);

  const record46 = new Record(collection);
    record46.set("name", "Logs Create");
    record46.set("description", "Create logs");
    record46.set("module", "Logs");
    record46.set("action", "create");
    record46.set("status", "Aktif");
  app.save(record46);

  const record47 = new Record(collection);
    record47.set("name", "Logs Edit");
    record47.set("description", "Edit logs");
    record47.set("module", "Logs");
    record47.set("action", "edit");
    record47.set("status", "Aktif");
  app.save(record47);

  const record48 = new Record(collection);
    record48.set("name", "Logs Delete");
    record48.set("description", "Delete logs");
    record48.set("module", "Logs");
    record48.set("action", "delete");
    record48.set("status", "Aktif");
  app.save(record48);
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
