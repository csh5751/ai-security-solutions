import { verifyToken } from "../_lib/auth.js";
import { json, loadDoc, saveDoc } from "../_lib/store.js";

var EDITABLE_FIELDS = ["category", "subCategory", "example", "description", "controlTarget", "controlMethod", "solutionMeans", "coverage"];
var COVERAGE_VALUES = ["full", "partial", "none", "unknown"];

function makeRowId() {
  return "row-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
}

function blankRow() {
  return {
    id: makeRowId(),
    category: "",
    subCategory: "",
    example: "",
    description: "",
    controlTarget: "",
    controlMethod: "",
    solutionMeans: "",
    coverage: {}
  };
}

function normalizeCoverage(input) {
  var out = {};
  if (!input || typeof input !== "object") return out;
  Object.keys(input).forEach(function (name) {
    var v = input[name];
    out[name] = COVERAGE_VALUES.indexOf(v) !== -1 ? v : "unknown";
  });
  return out;
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

  var doc = await loadDoc(kv);
  if (!Array.isArray(doc.covRows)) doc.covRows = [];

  var action = body && body.action;

  if (action === "reorder") {
    var currentIds = doc.covRows.map(function (r) { return r.id; });
    var order = Array.isArray(body.order) ? body.order : [];
    var sameSet =
      order.length === currentIds.length &&
      currentIds.every(function (id) { return order.indexOf(id) !== -1; }) &&
      order.every(function (id) { return currentIds.indexOf(id) !== -1; });
    if (!sameSet) {
      return json({ error: "order must contain exactly the current row ids" }, 400);
    }
    var byId = {};
    doc.covRows.forEach(function (r) { byId[r.id] = r; });
    doc.covRows = order.map(function (id) { return byId[id]; });
    await saveDoc(kv, doc);
    return json(doc);
  }

  if (action === "update") {
    var row = null;
    for (var i = 0; i < doc.covRows.length; i++) {
      if (doc.covRows[i].id === body.rowId) { row = doc.covRows[i]; break; }
    }
    if (!row) return json({ error: "row not found" }, 404);
    var fields = (body && body.fields) || {};
    EDITABLE_FIELDS.forEach(function (field) {
      if (!Object.prototype.hasOwnProperty.call(fields, field)) return;
      if (field === "coverage") {
        row.coverage = normalizeCoverage(fields.coverage);
      } else {
        row[field] = String(fields[field] == null ? "" : fields[field]);
      }
    });
    await saveDoc(kv, doc);
    return json(doc);
  }

  if (action === "add") {
    doc.covRows.push(blankRow());
    await saveDoc(kv, doc);
    return json(doc);
  }

  if (action === "delete") {
    doc.covRows = doc.covRows.filter(function (r) { return r.id !== body.rowId; });
    await saveDoc(kv, doc);
    return json(doc);
  }

  return json({ error: "unknown action" }, 400);
}
