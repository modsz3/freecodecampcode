migrate((app) => {
  const collection = new Collection({
    name: "newsletter_subscribers",
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: "",
    updateRule: null,
    deleteRule: null,
    fields: [
      { type: "email", name: "email", required: true },
      { type: "autodate", name: "created", onCreate: true, onUpdate: false },
    ],
    indexes: ["CREATE UNIQUE INDEX idx_newsletter_email ON newsletter_subscribers (email)"],
  });
  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("newsletter_subscribers");
  app.delete(collection);
});
