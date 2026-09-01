export var KV_KEY = "poc-progress-v2";

export var SEED = {
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
  ],
  mapVendors: [],
  covRows: []
};

export function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json" }
  });
}

export async function loadDoc(kv) {
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

export async function saveDoc(kv, doc) {
  await kv.put(KV_KEY, JSON.stringify(doc));
}
