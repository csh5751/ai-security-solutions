import { verifyToken } from "../_lib/auth.js";
import { json, loadDoc, saveDoc } from "../_lib/store.js";

export async function onRequestGet(context) {
  var kv = context.env.POC_KV;
  var doc = await loadDoc(kv);
  return json(doc);
}

export async function onRequestPut(context) {
  var request = context.request;
  var env = context.env;
  var kv = env.POC_KV;

  var authHeader = request.headers.get("Authorization") || "";
  var token = authHeader.replace(/^Bearer\s+/i, "");
  var valid = await verifyToken(token, env.SESSION_SECRET);
  if (!valid) {
    return json({ error: "unauthorized" }, 401);
  }

  var body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "invalid request body" }, 400);
  }

  if (!body || (!body.vendorName && !Array.isArray(body.reorder))) {
    return json({ error: "vendorName or reorder is required" }, 400);
  }

  var doc = await loadDoc(kv);

  if (Array.isArray(body.reorder)) {
    var currentNames = doc.pocVendors.map(function (v) { return v.name; });
    var sameSet =
      body.reorder.length === currentNames.length &&
      currentNames.every(function (n) { return body.reorder.indexOf(n) !== -1; }) &&
      body.reorder.every(function (n) { return currentNames.indexOf(n) !== -1; });
    if (!sameSet) {
      return json({ error: "reorder must contain exactly the current vendor names" }, 400);
    }
    var byName = {};
    doc.pocVendors.forEach(function (v) { byName[v.name] = v; });
    doc.pocVendors = body.reorder.map(function (n) { return byName[n]; });

    var reorderToday = new Date().toISOString().slice(0, 10);
    doc.recentUpdates.unshift({
      date: reorderToday,
      vendor: "System",
      message: "벤더 순서 변경"
    });
    doc.recentUpdates = doc.recentUpdates.slice(0, 20);

    await saveDoc(kv, doc);
    return json(doc);
  }

  var vendor = null;
  for (var i = 0; i < doc.pocVendors.length; i++) {
    if (doc.pocVendors[i].name === body.vendorName) {
      vendor = doc.pocVendors[i];
      break;
    }
  }
  if (!vendor) {
    return json({ error: "vendor not found" }, 404);
  }

  var editableFields = ["currentPhaseIndex", "status", "owner", "dueDate", "progressPct", "notes"];
  var changed = [];
  editableFields.forEach(function (field) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      vendor[field] = body[field];
      changed.push(field);
    }
  });

  var today = new Date().toISOString().slice(0, 10);
  vendor.updatedAt = today;

  if (changed.length) {
    doc.recentUpdates.unshift({
      date: today,
      vendor: vendor.name,
      message: changed.join(", ") + " 변경"
    });
    doc.recentUpdates = doc.recentUpdates.slice(0, 20);
  }

  await saveDoc(kv, doc);
  return json(doc);
}
