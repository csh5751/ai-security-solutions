import { verifyToken } from "../_lib/auth.js";

var KV_KEY = "poc-progress";

var SEED = {
  pocMeta: {
    title: "AI 보안 솔루션 PoC",
    startDate: "2026-07-01",
    targetDate: "2026-11-30",
    sponsor: "AX Security Pivot TF"
  },
  pocPhases: ["계약/Kickoff", "환경구성", "기능테스트", "보안검증", "최종평가"],
  pocVendors: [
    { name: "Zenity", currentPhaseIndex: 2, status: "on-track", owner: "TBD", dueDate: "2026-09-15", progressPct: 45, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "2026-08-20" },
    { name: "Grip Security", currentPhaseIndex: 1, status: "on-track", owner: "TBD", dueDate: "2026-09-30", progressPct: 25, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "2026-08-18" },
    { name: "Straiker", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" },
    { name: "MS Agent 365", currentPhaseIndex: 3, status: "on-track", owner: "TBD", dueDate: "2026-09-10", progressPct: 70, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "2026-08-22" },
    { name: "Noma Security", currentPhaseIndex: 2, status: "delayed", owner: "TBD", dueDate: "2026-09-20", progressPct: 40, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "2026-08-15" },
    { name: "Palo Alto Prisma AIRS", currentPhaseIndex: 4, status: "completed", owner: "TBD", dueDate: "2026-08-25", progressPct: 100, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "2026-08-25" },
    { name: "CrowdStrike AIDR", currentPhaseIndex: 1, status: "blocked", owner: "TBD", dueDate: "2026-09-25", progressPct: 15, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "2026-08-10" },
    { name: "SentinelOne", currentPhaseIndex: 0, status: "on-track", owner: "TBD", dueDate: "2026-10-05", progressPct: 10, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "2026-08-19" },
    { name: "Onyx Security", currentPhaseIndex: -1, status: "not-started", owner: "TBD", dueDate: "-", progressPct: 0, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "-" },
    { name: "Airia", currentPhaseIndex: 2, status: "on-track", owner: "TBD", dueDate: "2026-09-18", progressPct: 50, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "2026-08-21" },
    { name: "Akto", currentPhaseIndex: 1, status: "delayed", owner: "TBD", dueDate: "2026-09-28", progressPct: 20, notes: "(샘플 데이터 - 실제 값으로 교체 필요)", updatedAt: "2026-08-14" }
  ],
  recentUpdates: [
    { date: "2026-08-25", vendor: "Palo Alto Prisma AIRS", message: "최종평가 완료 (샘플 데이터)" },
    { date: "2026-08-22", vendor: "MS Agent 365", message: "보안검증 단계 진입 (샘플 데이터)" },
    { date: "2026-08-21", vendor: "Airia", message: "기능테스트 진행 중 (샘플 데이터)" },
    { date: "2026-08-20", vendor: "Zenity", message: "기능테스트 50% 완료 (샘플 데이터)" },
    { date: "2026-08-19", vendor: "SentinelOne", message: "계약/Kickoff 진행 중 (샘플 데이터)" },
    { date: "2026-08-18", vendor: "Grip Security", message: "환경구성 착수 (샘플 데이터)" },
    { date: "2026-08-15", vendor: "Noma Security", message: "기능테스트 일정 지연 발생 (샘플 데이터)" },
    { date: "2026-08-10", vendor: "CrowdStrike AIDR", message: "환경구성 단계 블로커 발생 (샘플 데이터)" }
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

  if (!body || !body.vendorName) {
    return json({ error: "vendorName is required" }, 400);
  }

  var doc = await loadDoc(kv);
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
