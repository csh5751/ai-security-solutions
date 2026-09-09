import { verifyToken } from "../_lib/auth.js";
import {
  loadDoc, saveDoc, json, NAV_PAGES,
  pushSnapshot, listSnapshots, withDefaults
} from "../_lib/store.js";
import {
  validateCollection, COLLECTIONS, VENDOR_STATUS, COVERAGE_VALUES,
  BULLET_TYPES, KNOWN_BADGES, MAP_LAYERS, MAP2_LAYERS
} from "../_lib/validate.js";

async function requireAdmin(context) {
  var authHeader = context.request.headers.get("Authorization") || "";
  var token = authHeader.replace(/^Bearer\s+/i, "");
  if (!context.env.SESSION_SECRET) return "server not configured";
  var ok = await verifyToken(token, context.env.SESSION_SECRET, "admin");
  return ok ? null : "unauthorized";
}

/* 관리자 UI가 폼을 그릴 때 필요한 열거형/축 정의를 서버가 단일 출처로 제공.
   클라이언트에 하드코딩하지 않아 검증 규칙과 UI가 어긋나지 않게 한다. */
function schemaMeta() {
  return {
    collections: COLLECTIONS,
    navPages: NAV_PAGES,
    vendorStatus: VENDOR_STATUS,
    coverageValues: COVERAGE_VALUES,
    bulletTypes: BULLET_TYPES,
    knownBadges: KNOWN_BADGES,
    mapLayers: MAP_LAYERS,
    map2Layers: MAP2_LAYERS
  };
}

export async function onRequestGet(context) {
  var deny = await requireAdmin(context);
  if (deny) return json({ error: deny }, deny === "unauthorized" ? 401 : 500);

  var doc = await loadDoc(context.env.POC_KV);
  var snaps = await listSnapshots(context.env.POC_KV);
  return json({
    doc: doc,
    meta: schemaMeta(),
    snapshots: snaps.map(function (s, i) {
      return { index: i, at: s.at, label: s.label };
    })
  });
}

export async function onRequestPut(context) {
  var deny = await requireAdmin(context);
  if (deny) return json({ error: deny }, deny === "unauthorized" ? 401 : 500);

  var body;
  try {
    body = await context.request.json();
  } catch (e) {
    return json({ error: "invalid request body" }, 400);
  }

  var collection = body && body.collection;
  if (COLLECTIONS.indexOf(collection) === -1) {
    return json({ error: "collection은 다음 중 하나여야 합니다: " + COLLECTIONS.join(", ") }, 400);
  }

  var kv = context.env.POC_KV;
  var doc = await loadDoc(kv);

  var result = validateCollection(collection, body.value, doc);
  if (!result.ok) {
    return json({ error: "검증 실패", details: result.errors }, 400);
  }

  await pushSnapshot(kv, JSON.parse(JSON.stringify(doc)), collection + " 저장 전");

  doc[collection] = result.value;

  /* pocPhases가 줄어들면 벤더의 currentPhaseIndex가 범위를 벗어나므로 함께 보정 */
  if (collection === "pocPhases" && Array.isArray(doc.pocVendors)) {
    var max = result.value.length - 1;
    doc.pocVendors.forEach(function (v) {
      if (typeof v.currentPhaseIndex === "number" && v.currentPhaseIndex > max) {
        v.currentPhaseIndex = max;
      }
    });
  }

  if (collection !== "recentUpdates") {
    if (!Array.isArray(doc.recentUpdates)) doc.recentUpdates = [];
    doc.recentUpdates.unshift({
      date: new Date().toISOString().slice(0, 10),
      vendor: "Admin",
      message: collection + " 관리자 페이지에서 수정"
    });
    doc.recentUpdates = doc.recentUpdates.slice(0, 20);
  }

  await saveDoc(kv, doc);
  return json({ doc: doc, saved: collection });
}

export async function onRequestPost(context) {
  var deny = await requireAdmin(context);
  if (deny) return json({ error: deny }, deny === "unauthorized" ? 401 : 500);

  var body;
  try {
    body = await context.request.json();
  } catch (e) {
    return json({ error: "invalid request body" }, 400);
  }

  if (!body || body.action !== "restore") {
    return json({ error: "action은 'restore'만 지원합니다" }, 400);
  }

  var kv = context.env.POC_KV;
  var snaps = await listSnapshots(kv);
  var idx = parseInt(body.index, 10);
  if (isNaN(idx) || idx < 0 || idx >= snaps.length) {
    return json({ error: "존재하지 않는 스냅샷 index" }, 400);
  }

  var current = await loadDoc(kv);
  await pushSnapshot(kv, JSON.parse(JSON.stringify(current)), "복원 실행 전");

  var restored = withDefaults(snaps[idx].doc);
  if (!Array.isArray(restored.recentUpdates)) restored.recentUpdates = [];
  restored.recentUpdates.unshift({
    date: new Date().toISOString().slice(0, 10),
    vendor: "Admin",
    message: "스냅샷 복원 (" + snaps[idx].at + ")"
  });
  restored.recentUpdates = restored.recentUpdates.slice(0, 20);

  await saveDoc(kv, restored);
  return json({ doc: restored, restoredFrom: snaps[idx].at });
}
