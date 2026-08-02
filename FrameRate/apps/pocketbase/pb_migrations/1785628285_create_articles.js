/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    let collection;
    try {
      collection = app.findCollectionByNameOrId("articles");
    } catch (_) {
      collection = new Collection({
        type: "base",
        name: "articles",
        listRule: "",
        viewRule: "",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: "title", type: "text", required: true, max: 500 },
          { name: "slug", type: "text", required: true, max: 200 },
          { name: "dek", type: "text", max: 1000 },
          { name: "body", type: "json" },
          { name: "image", type: "text", max: 1000 },
          { name: "author", type: "text", max: 200 },
          { name: "date", type: "text", max: 20 },
          { name: "readTime", type: "text", max: 50 },
          { name: "tags", type: "json" },
          {
            name: "platforms",
            type: "select",
            required: false,
            maxSelect: 3,
            values: ["pc", "xbox", "playstation"],
          },
          {
            name: "status",
            type: "select",
            required: true,
            maxSelect: 1,
            values: ["draft", "published"],
          },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
        indexes: [
          "CREATE UNIQUE INDEX idx_articles_slug ON articles (slug)",
        ],
      });
      app.save(collection);
    }
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId("articles");
      app.delete(collection);
    } catch (_) {}
  },
);
