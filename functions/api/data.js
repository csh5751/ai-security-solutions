import { verifyToken } from "../_lib/auth.js";

var KV_KEY = "poc-progress-v2";

var SEED = {
  pocMeta: {
    title: "AI 보안 솔루션 PoC",
    startDate: "2026-07-01",
    targetDate: "2026-11-30",
    sponsor: "AX Security Pivot TF"
  },
  pocPhases: ["업체 선정", "업체 컨택 및 사전 미팅 진행", "PoC 담당부서 지정", "NDA 체결", "PoC Kick Off", "PoC 환경 구성", "PoC 진행 중", "결과 보고 진행 중", "완료"],
  pocVendors: [
    { name: "Zenity", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" },
    { name: "Grip Security", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" },
    { name: "Straiker", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" },
    { name: "MS Agent 365", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" },
    { name: "Noma Security", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" },
    { name: "Palo Alto Prisma AIRS", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" },
    { name: "CrowdStrike AIDR", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" },
    { name: "SentinelOne", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" },
    { name: "Onyx Security", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" },
    { name: "Airia", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" },
    { name: "Akto", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" }
  ],
  recentUpdates: [
    { date: "2026-08-31", vendor: "System", message: "PoC 진행 단계 체계가 9단계로 재정비되었습니다 (샘플 데이터)" }
  ]
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json" }
  });
}

async function loadDoc(kv) {
  var raw = await kv.get(KV_KEY);
  if (!raw) {
    await kv.put(KV_KEY, JSON.stringify(SEED));
    return SEED;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return SEED;
  }
}

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

    await kv.put(KV_KEY, JSON.stringify(doc));
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

  await kv.put(KV_KEY, JSON.stringify(doc));
  return json(doc);
}
