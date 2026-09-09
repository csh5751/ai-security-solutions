import { NAV_PAGES } from "./store.js";

export var VENDOR_STATUS = ["not-started", "on-track", "delayed", "completed", "pending", "cancelled"];
export var COVERAGE_VALUES = ["full", "partial", "none", "unknown"];
export var BULLET_TYPES = ["pos", "neg", "neu"];
export var KNOWN_BADGES = ["SaaS", "API", "DLP", "MLOps", "Browser"];
/* map.html(js/data.js) 기준 축 */
export var MAP_LAYERS = ["Model", "Agent", "Platform", "Identity", "ShadowAI"];
/* map2.html(js/data2.js) 기준 축 */
export var MAP2_LAYERS = ["AISPM", "AIDR", "ShadowAI", "RedTeaming", "Ops"];

export var COLLECTIONS = [
  "pocMeta", "pocPhases", "pocVendors", "recentUpdates",
  "mapVendors", "covRows", "navConfig", "map2Overrides"
];

function str(v, max) {
  if (v === null || v === undefined) return "";
  return String(v).slice(0, max || 500);
}

function intIn(v, min, max, fallback) {
  var n = parseInt(v, 10);
  if (isNaN(n)) return fallback;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function oneOf(v, list, fallback) {
  return list.indexOf(v) !== -1 ? v : fallback;
}

function normBulletBlock(entry) {
  if (!entry || typeof entry !== "object") return null;
  var bullets = Array.isArray(entry.bullets) ? entry.bullets : [];
  bullets = bullets
    .filter(function (b) { return typeof b === "string" && b.trim(); })
    .slice(0, 8)
    .map(function (b) { return str(b, 600); });
  if (!bullets.length) return null;
  var type = Array.isArray(entry.type) ? entry.type : [];
  var normType = bullets.map(function (b, i) { return oneOf(type[i], BULLET_TYPES, "neu"); });
  return { type: normType, bullets: bullets };
}

/* 컬렉션별 검증 + 정규화.
   반환: { ok, errors:[문자열], value: 저장할 값 }
   errors가 비어 있지 않으면 저장하지 않음(경고가 아니라 거부) */
export function validateCollection(name, value, ctx) {
  var errors = [];
  ctx = ctx || {};

  if (name === "pocMeta") {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, errors: ["pocMeta는 객체여야 합니다"], value: null };
    }
    var title = str(value.title, 120).trim();
    if (!title) errors.push("제목(title)은 비워둘 수 없습니다");
    return {
      ok: !errors.length, errors: errors,
      value: {
        title: title,
        startDate: str(value.startDate, 20).trim(),
        targetDate: str(value.targetDate, 20).trim(),
        sponsor: str(value.sponsor, 120).trim()
      }
    };
  }

  if (name === "pocPhases") {
    if (!Array.isArray(value)) return { ok: false, errors: ["pocPhases는 배열이어야 합니다"], value: null };
    var phases = value
      .map(function (p) { return str(p, 80).trim(); })
      .filter(function (p) { return p; });
    if (!phases.length) errors.push("단계는 최소 1개 필요합니다");
    if (phases.length > 30) errors.push("단계는 최대 30개까지입니다 (현재 " + phases.length + "개)");
    return { ok: !errors.length, errors: errors, value: phases };
  }

  if (name === "pocVendors") {
    if (!Array.isArray(value)) return { ok: false, errors: ["pocVendors는 배열이어야 합니다"], value: null };
    if (value.length > 60) errors.push("벤더는 최대 60개까지입니다");
    var phaseCount = Array.isArray(ctx.pocPhases) ? ctx.pocPhases.length : 9;
    var seen = {};
    var vendors = value.map(function (v, i) {
      v = v && typeof v === "object" ? v : {};
      var nm = str(v.name, 80).trim();
      if (!nm) errors.push((i + 1) + "번째 행: 업체명이 비어 있습니다");
      else if (seen[nm.toLowerCase()]) errors.push("업체명 중복: " + nm);
      else seen[nm.toLowerCase()] = true;
      return {
        name: nm,
        currentPhaseIndex: intIn(v.currentPhaseIndex, -1, phaseCount - 1, -1),
        status: oneOf(v.status, VENDOR_STATUS, "not-started"),
        owner: str(v.owner, 40).trim() || "TBD",
        dueDate: str(v.dueDate, 20).trim() || "-",
        progressPct: intIn(v.progressPct, 0, 100, 0),
        notes: str(v.notes, 800),
        updatedAt: str(v.updatedAt, 20).trim() || "-"
      };
    });
    return { ok: !errors.length, errors: errors, value: vendors };
  }

  if (name === "recentUpdates") {
    if (!Array.isArray(value)) return { ok: false, errors: ["recentUpdates는 배열이어야 합니다"], value: null };
    var ups = value.slice(0, 100).map(function (u) {
      u = u && typeof u === "object" ? u : {};
      return {
        date: str(u.date, 20).trim(),
        vendor: str(u.vendor, 80).trim() || "System",
        message: str(u.message, 400)
      };
    }).filter(function (u) { return u.message; });
    return { ok: true, errors: [], value: ups };
  }

  if (name === "mapVendors") {
    if (!Array.isArray(value)) return { ok: false, errors: ["mapVendors는 배열이어야 합니다"], value: null };
    if (value.length > 40) errors.push("Vendor Map 추가 벤더는 최대 40개까지입니다");
    var seen2 = {};
    var mvs = value.map(function (v, i) {
      v = v && typeof v === "object" ? v : {};
      var nm = str(v.name, 80).trim();
      if (!nm) errors.push((i + 1) + "번째 벤더: 이름이 비어 있습니다");
      else if (seen2[nm.toLowerCase()]) errors.push("Vendor Map 벤더명 중복: " + nm);
      else seen2[nm.toLowerCase()] = true;

      var color = /^#[0-9A-Fa-f]{6}$/.test(str(v.color, 7)) ? v.color : "#94A3B8";
      var scores = {};
      MAP_LAYERS.forEach(function (l) {
        scores[l] = intIn(v.scores && v.scores[l], 0, 5, 1);
      });
      var badges = Array.isArray(v.badges)
        ? v.badges.filter(function (b) { return KNOWN_BADGES.indexOf(b) !== -1; })
        : [];

      var rationale = {};
      MAP_LAYERS.forEach(function (l) {
        var blk = normBulletBlock(v.rationale && v.rationale[l]);
        if (blk) rationale[l] = blk;
        else errors.push(nm + " / " + l + ": 근거를 최소 1줄 입력해주세요");
      });

      var extRationale = {};
      badges.forEach(function (b) {
        var blk = normBulletBlock(v.extRationale && v.extRationale[b]);
        if (blk) extRationale[b] = blk;
      });

      return {
        name: nm, color: color, scores: scores,
        specialty: str(v.specialty, 400).trim(),
        badges: badges, rationale: rationale, extRationale: extRationale,
        estimated: v.estimated === true
      };
    });
    return { ok: !errors.length, errors: errors, value: mvs };
  }

  if (name === "covRows") {
    if (!Array.isArray(value)) return { ok: false, errors: ["covRows는 배열이어야 합니다"], value: null };
    if (value.length > 400) errors.push("통제 매트릭스 행은 최대 400개까지입니다");
    var seenId = {};
    var rows = value.map(function (r, i) {
      r = r && typeof r === "object" ? r : {};
      var id = str(r.id, 60).trim() || ("row-" + Date.now() + "-" + i);
      if (seenId[id]) errors.push("행 id 중복: " + id);
      seenId[id] = true;
      var cov = {};
      if (r.coverage && typeof r.coverage === "object") {
        Object.keys(r.coverage).slice(0, 60).forEach(function (k) {
          var vn = str(k, 80).trim();
          if (vn) cov[vn] = oneOf(r.coverage[k], COVERAGE_VALUES, "unknown");
        });
      }
      return {
        id: id,
        category: str(r.category, 120).trim(),
        subCategory: str(r.subCategory, 120).trim(),
        example: str(r.example, 200).trim(),
        description: str(r.description, 1200),
        controlTarget: str(r.controlTarget, 600),
        controlMethod: str(r.controlMethod, 900),
        solutionMeans: str(r.solutionMeans, 400),
        coverage: cov
      };
    });
    return { ok: !errors.length, errors: errors, value: rows };
  }

  if (name === "navConfig") {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, errors: ["navConfig는 객체여야 합니다"], value: null };
    }
    var out = {};
    NAV_PAGES.forEach(function (p, i) {
      var e = value[p.page];
      e = e && typeof e === "object" ? e : {};
      var label = str(e.label, 30).trim() || p.label;
      out[p.page] = {
        visible: p.locked ? true : e.visible !== false,
        label: label,
        order: intIn(e.order, 0, 99, i)
      };
    });
    var anyVisible = Object.keys(out).some(function (k) { return out[k].visible; });
    if (!anyVisible) errors.push("최소 1개 메뉴는 보이도록 남겨두어야 합니다");
    return { ok: !errors.length, errors: errors, value: out };
  }

  if (name === "map2Overrides") {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, errors: ["map2Overrides는 객체여야 합니다"], value: null };
    }
    var ov = {};
    Object.keys(value).slice(0, 60).forEach(function (k) {
      var vn = str(k, 80).trim();
      if (!vn) return;
      var src = value[k] && typeof value[k] === "object" ? value[k] : {};
      var entry = {};
      MAP2_LAYERS.forEach(function (l) {
        if (src[l] === null || src[l] === undefined || src[l] === "") return;
        entry[l] = intIn(src[l], 0, 5, 0);
      });
      if (Object.keys(entry).length) ov[vn] = entry;
    });
    return { ok: true, errors: [], value: ov };
  }

  return { ok: false, errors: ["알 수 없는 컬렉션: " + name], value: null };
}
