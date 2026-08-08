/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    let records = [];
    try {
      records = app.findRecordsByFilter("articles", "status = 'draft'");
    } catch (e) {
      if (e.message.includes("no rows in result set")) return;
      throw e;
    }
    for (const r of records) {
      r.set("status", "published");
      app.save(r);
    }
  },
  (app) => {
    // One-way: previous draft/published state per record is not recorded.
  },
);
