/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("metode_pembayaran");

  const existing = collection.fields.getByName("tipe_metode");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("tipe_metode"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "tipe_metode",
    required: false,
    values: ["tunai", "transfer_bank", "kartu_kredit", "e_wallet", "qris", "cek", "lainnya"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("metode_pembayaran");
    collection.fields.removeByName("tipe_metode");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
