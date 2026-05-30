/// <reference path="../pb_data/types.d.ts" />
onRecordCreate((e) => {
  // Get all existing pegawai records to count them
  const records = $app.findCollectionByNameOrId("pegawai").getFullList({
    fields: "id"
  });
  
  // Calculate next sequence number (count + 1)
  const nextSequence = records.length + 1;
  
  // Format as DGK-[3-digit padded number]
  const paddedNumber = String(nextSequence).padStart(3, '0');
  const generatedId = `DGK-${paddedNumber}`;
  
  // Set the id_pegawai field
  e.record.set("id_pegawai", generatedId);
  
  e.next();
}, "pegawai");