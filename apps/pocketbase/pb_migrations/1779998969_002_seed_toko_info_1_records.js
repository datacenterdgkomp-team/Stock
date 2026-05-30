/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("toko_info");

  const record0 = new Record(collection);
    record0.set("nama_toko", "DG Komputer");
    record0.set("alamat_toko", "-");
    record0.set("kota", "-");
    record0.set("provinsi", "-");
    record0.set("kode_pos", "-");
    record0.set("nomor_telepon", "-");
    record0.set("email_toko", "info@dgkomputer.com");
  app.save(record0);
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
