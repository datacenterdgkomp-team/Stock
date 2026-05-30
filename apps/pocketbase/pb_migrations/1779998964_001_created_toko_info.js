/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.role = 'Admin' || @request.auth.role = 'Manager'",
    "deleteRule": "@request.auth.role = 'Admin'",
    "fields":     [
          {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text7866899436",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
          },
          {
                "hidden": false,
                "id": "text8567376731",
                "name": "nama_toko",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 100,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text5175741431",
                "name": "alamat_toko",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 200,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text2207410767",
                "name": "kota",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 50,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text5817873153",
                "name": "provinsi",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 50,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text9406404128",
                "name": "kode_pos",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 10,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text9871579727",
                "name": "nomor_telepon",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "email3113773682",
                "name": "email_toko",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "email",
                "exceptDomains": [],
                "onlyDomains": []
          },
          {
                "hidden": false,
                "id": "text5652045202",
                "name": "website",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text7383340057",
                "name": "deskripsi_toko",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 500,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "text8694605826",
                "name": "jam_operasional",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
          },
          {
                "hidden": false,
                "id": "json1009169453",
                "name": "hari_libur",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "json",
                "maxSize": 0
          },
          {
                "hidden": false,
                "id": "file9174342601",
                "name": "logo",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "file",
                "maxSelect": 1,
                "maxSize": 5242880,
                "mimeTypes": [
                      "image/jpeg",
                      "image/png",
                      "image/webp"
                ],
                "thumbs": []
          },
          {
                "hidden": false,
                "id": "autodate7604987490",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
          },
          {
                "hidden": false,
                "id": "autodate0486763514",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
          }
    ],
    "id": "pbc_9994073763",
    "indexes": [],
    "listRule": "",
    "name": "toko_info",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = 'Admin' || @request.auth.role = 'Manager'",
    "viewRule": ""
  });

  try {
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("Collection name must be unique")) {
      console.log("Collection already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("pbc_9994073763");
    return app.delete(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
