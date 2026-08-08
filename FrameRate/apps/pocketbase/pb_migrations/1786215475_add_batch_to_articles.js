/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("articles");

    const existing = collection.fields.getByName("batch");
    if (existing) {
      if (existing.type === "text") return; // correct type already, skip
      collection.fields.removeByName("batch"); // wrong type, replace
    }

    collection.fields.add(
      new TextField({
        name: "batch",
        required: false,
        max: 50,
      }),
    );
    app.save(collection);
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId("articles");
      collection.fields.removeByName("batch");
      app.save(collection);
    } catch (e) {
      if (e.message.includes("no rows in result set")) {
        console.log("Collection not found, skipping revert");
        return;
      }
      throw e;
    }
  },
);
