import { verifyToken } from "../_lib/auth.js";
import { json, loadDoc, saveDoc } from "../_lib/store.js";

var LAYERS = ["Model", "Agent", "Platform", "Identity", "ShadowAI"];
var KNOWN_BADGES = ["SaaS", "API", "DLP", "MLOps", "Browser"];

var EXISTING_VENDORS = [
  { name: "Zenity", color: "#FF6B35" },
  { name: "Grip Security", color: "#FBBF24" },
  { name: "Straiker", color: "#F43F5E" },
  { name: "MS Agent 365", color: "#3B82F6" },
  { name: "Noma Security", color: "#4ADE80" },
  { name: "Palo Alto Prisma AIRS", color: "#C084FC" },
  { name: "CrowdStrike AIDR", color: "#F472B6" },
  { name: "SentinelOne", color: "#22D3EE" },
  { name: "Onyx Security", color: "#A3E635" },
  { name: "Airia", color: "#818CF8" },
  { name: "Akto", color: "#2DD4BF" }
];

var LAYER_EXPLANATIONS = {
  Model: "AI 모델 자체의 보안 - Prompt Injection, Data Leakage, Model Extraction, Hallucination 등 모델 입출력과 학습/추론 단계의 위협을 다룸",
  Agent: "AI Agent의 행동 보안 - Goal Hijack, Tool Misuse, Memory Poisoning, Excessive Agency 등 Agent가 자율적으로 작업을 수행할 때의 위협 통제",
  Platform: "AI 앱/자동화 플랫폼 보안 - Copilot Studio, Power Platform, SaaS Automation 환경의 Connector, API, Access Control, Supply Chain 위협을 다룸",
  Identity: "비인가 자격증명(NHI) 보안 - Service Account, API Key, OAuth App의 Secret Leakage, Over-Permission, Lifecycle 관리를 다룸",
  ShadowAI: "비인가 AI 사용 통제 - 임직원의 개인 ChatGPT/Claude 등 외부 AI 사용, 민감정보 입력, 브라우저 확장 등 통제 및 AI 사용의 가시성"
};

var EXT_CAPABILITIES = {
  SaaS: "SaaS Security / SSPM - SaaS 앱 섀도 발견, OAuth 앱 위험 평가, 설정 오류 탐지",
  API: "API Security - API Discovery, Shadow/Zombie API 탐지, API 취약점 테스트",
  DLP: "DLP / Data Governance - 민감 데이터 자동 분류, 데이터 이동 추적, 외부 전송 차단",
  MLOps: "MLOps Pipeline Security - 학습 데이터 무결성, 모델 저장소 보안, 배포 파이프라인 보호",
  Browser: "Browser Security - 브라우저 확장 위험, 웹 페이지 내 데이터 입력 통제, Prompt-level DLP"
};

var FEWSHOT_EXAMPLE = {
  name: "Grip Security",
  specialty: "Identity-First SSPM - Shadow SaaS/AI 발견 + 자동 원격 조치",
  badges: ["SaaS"],
  rationale: {
    Model: { type: ["neg", "neg", "neg"], bullets: ["<strong>AI 모델 자체 보안 영역 다루지 않음</strong>", "Prompt Injection/Extraction 대응 X", "모델 계층 위협은 Scope 밖"] },
    Agent: { type: ["neg", "neg", "neu"], bullets: ["Agent 행동/Runtime 통제 기능 없음", "Tool Misuse/Goal Hijack 탐지 부재", "OAuth 기반 Agent 접근 권한은 Identity 관점에서 일부 포착"] },
    Platform: { type: ["neu", "neu", "pos"], bullets: ["SaaS 자동화 앱의 커넥터 권한을 Identity 신호로 간접 파악", "Power Platform 등 LCNC 자체 심층 분석은 약함", "<strong>OAuth Grant 기반 위험 앱 자동 식별</strong>"] },
    Identity: { type: ["pos", "pos", "pos"], bullets: ["<strong>Identity 신호 기반 Agentless SaaS/OAuth App 전체 인벤토리 핵심 강점</strong>", "<strong>과도 권한 OAuth Grant 자동 회수/암호 로테이션 등 원격 조치 지원</strong>", "Third-party NHI 리스크 등급화 + 역할 변경 시 자동 오프보딩"] },
    ShadowAI: { type: ["pos", "pos", "pos"], bullets: ["<strong>Identity/인증 신호 기반 Shadow SaaS+AI 통합 탐지(설정 스캔 아님) 핵심 차별점</strong>", "<strong>2025 리포트 기준 AI 도구 91% 미관리, ChatGPT 96% 조직에서 발견</strong>", "개인 계정 AI 사용까지 자동 식별 + 즉시 원격 조치"] }
  },
  extRationale: {
    SaaS: { type: ["pos", "pos"], bullets: ["<strong>Agentless Identity 신호 기반 SaaS Discovery 시장 선도</strong>", "OAuth Grant 자동 회수 등 SSPM 자동 조치 강함"] }
  }
};

var VENDOR_TOOL = {
  name: "submit_vendor_profile",
  description: "웹 검색으로 조사한 벤더의 정확한 공식 명칭과 AI 보안 5-Layer 평가 데이터를 제출합니다. 반드시 정확히 한 번만 호출하세요.",
  input_schema: {
    type: "object",
    properties: {
      resolvedName: { type: "string", description: "웹 검색으로 확인한 벤더의 정확한 공식 명칭 (사용자가 입력한 이름이 오타/약칭이면 정정)" },
      color: { type: "string", description: "#RRGGBB 형식의 밝고 선명한 hex color. 기존 벤더 색상과 최대한 겹치지 않게 선택" },
      scores: {
        type: "object",
        description: "5개 Layer 각각 0(전혀 없음)~5(업계 최상위) 정수 점수",
        properties: {
          Model: { type: "integer" },
          Agent: { type: "integer" },
          Platform: { type: "integer" },
          Identity: { type: "integer" },
          ShadowAI: { type: "integer" }
        },
        required: ["Model", "Agent", "Platform", "Identity", "ShadowAI"]
      },
      specialty: { type: "string", description: "벤더의 핵심 포지셔닝을 한국어 한 문장으로 요약" },
      badges: {
        type: "array",
        description: "AI 보안 5-Layer 외에 벤더가 추가로 커버하는 영역. 근거 없으면 빈 배열",
        items: { type: "string", enum: KNOWN_BADGES }
      },
      rationale: {
        type: "object",
        description: "5개 Layer(Model/Agent/Platform/Identity/ShadowAI) 각각에 대한 근거. 각 Layer는 2~3개의 type(pos/neg/neu)과 같은 개수의 bullets(한국어 문장, 핵심 문구는 <strong> 태그로 강조)로 구성",
        properties: {
          Model: { type: "object", properties: { type: { type: "array", items: { type: "string", enum: ["pos", "neg", "neu"] } }, bullets: { type: "array", items: { type: "string" } } }, required: ["type", "bullets"] },
          Agent: { type: "object", properties: { type: { type: "array", items: { type: "string", enum: ["pos", "neg", "neu"] } }, bullets: { type: "array", items: { type: "string" } } }, required: ["type", "bullets"] },
          Platform: { type: "object", properties: { type: { type: "array", items: { type: "string", enum: ["pos", "neg", "neu"] } }, bullets: { type: "array", items: { type: "string" } } }, required: ["type", "bullets"] },
          Identity: { type: "object", properties: { type: { type: "array", items: { type: "string", enum: ["pos", "neg", "neu"] } }, bullets: { type: "array", items: { type: "string" } } }, required: ["type", "bullets"] },
          ShadowAI: { type: "object", properties: { type: { type: "array", items: { type: "string", enum: ["pos", "neg", "neu"] } }, bullets: { type: "array", items: { type: "string" } } }, required: ["type", "bullets"] }
        },
        required: ["Model", "Agent", "Platform", "Identity", "ShadowAI"]
      },
      extRationale: {
        type: "object",
        description: "badges 배열에 포함된 항목에 한해서만 작성. 키는 badge 이름(SaaS/API/DLP/MLOps/Browser 중 하나), 값은 {type:[pos/neg/neu], bullets:[문자열]}"
      }
    },
    required: ["resolvedName", "color", "scores", "specialty", "badges", "rationale"]
  }
};

function buildSystemPrompt() {
  var layerLines = LAYERS.map(function (l) { return "- " + l + ": " + LAYER_EXPLANATIONS[l]; }).join("\n");
  var badgeLines = KNOWN_BADGES.map(function (b) { return "- " + b + ": " + EXT_CAPABILITIES[b]; }).join("\n");
  var existingNames = EXISTING_VENDORS.map(function (v) { return v.name + "(" + v.color + ")"; }).join(", ");

  return (
    "당신은 AI 보안 솔루션 벤더를 조사해 정형 데이터로 정리하는 리서치 분석가입니다.\n\n" +
    "이 프로젝트는 AI 보안 솔루션을 5개 Layer로 평가하는 Vendor Map을 운영 중입니다:\n" + layerLines + "\n\n" +
    "Layer 외에 추가로 인정하는 Extended Capability 5종:\n" + badgeLines + "\n\n" +
    "이미 등록된 벤더(이름과 색상, 새 벤더는 이 이름들과 겹치지 않고 색상도 최대한 구분되게):\n" + existingNames + "\n\n" +
    "작업 순서:\n" +
    "1. 먼저 web_search로 사용자가 입력한 벤더명을 조사해 정확한 공식 명칭과 실제 제품/기능을 확인하세요. 입력된 이름이 약칭, 오타, 부정확한 표기일 수 있으니 공식 명칭으로 정정하세요.\n" +
    "2. 조사 결과를 바탕으로 5개 Layer 각각에 대해 점수(0~5)와 근거를 작성하세요. 실제로 확인되지 않은 강점을 지어내지 말고, 정보가 부족하면 점수를 보수적으로 낮게 주고 그 사실을 중립적으로(type: neu) 서술하세요.\n" +
    "3. submit_vendor_profile 도구를 정확히 한 번 호출해 결과를 제출하세요.\n\n" +
    "톤/구조는 아래 기존 벤더 예시(Grip Security)와 동일하게 맞추세요 - 각 Layer bullet은 2~3개, 핵심 문구는 <strong> 태그로 감싸고, 강점/약점을 균형있게 서술합니다:\n" +
    JSON.stringify(FEWSHOT_EXAMPLE, null, 2)
  );
}

function findToolUse(content) {
  if (!Array.isArray(content)) return null;
  for (var i = 0; i < content.length; i++) {
    if (content[i].type === "tool_use" && content[i].name === "submit_vendor_profile") {
      return content[i];
    }
  }
  return null;
}

function clampInt(n, min, max, fallback) {
  var v = parseInt(n, 10);
  if (isNaN(v)) v = fallback;
  if (v < min) v = min;
  if (v > max) v = max;
  return v;
}

function normalizeRationaleEntry(entry) {
  if (!entry || !Array.isArray(entry.bullets) || !entry.bullets.length) {
    return { type: ["neu"], bullets: ["조사된 정보가 제한적입니다."] };
  }
  var bullets = entry.bullets.filter(function (b) { return typeof b === "string" && b.trim(); });
  if (!bullets.length) return { type: ["neu"], bullets: ["조사된 정보가 제한적입니다."] };
  var type = Array.isArray(entry.type) ? entry.type : [];
  var validTypes = ["pos", "neg", "neu"];
  var normType = bullets.map(function (b, idx) {
    return validTypes.indexOf(type[idx]) !== -1 ? type[idx] : "neu";
  });
  return { type: normType, bullets: bullets };
}

function normalizeProfile(input) {
  var resolvedName = String(input.resolvedName || "").trim();
  var color = /^#[0-9A-Fa-f]{6}$/.test(input.color || "") ? input.color : "#94A3B8";

  var scores = {};
  LAYERS.forEach(function (l) {
    scores[l] = clampInt(input.scores && input.scores[l], 0, 5, 0);
  });

  var specialty = String(input.specialty || "").trim() || "AI 보안 솔루션";

  var badges = Array.isArray(input.badges)
    ? input.badges.filter(function (b) { return KNOWN_BADGES.indexOf(b) !== -1; })
    : [];
  badges = badges.filter(function (b, idx) { return badges.indexOf(b) === idx; });

  var rationale = {};
  LAYERS.forEach(function (l) {
    rationale[l] = normalizeRationaleEntry(input.rationale && input.rationale[l]);
  });

  var extRationale = {};
  if (input.extRationale && typeof input.extRationale === "object") {
    badges.forEach(function (b) {
      if (input.extRationale[b]) {
        extRationale[b] = normalizeRationaleEntry(input.extRationale[b]);
      }
    });
  }

  return { resolvedName: resolvedName, color: color, scores: scores, specialty: specialty, badges: badges, rationale: rationale, extRationale: extRationale };
}

function vendorExists(list, name) {
  var lower = name.toLowerCase();
  return list.some(function (v) { return v.name.toLowerCase() === lower; });
}

export async function onRequestPost(context) {
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

  var vendorName = String((body && body.vendorName) || "").trim();
  if (vendorName.length < 2 || vendorName.length > 60) {
    return json({ error: "업체명은 2~60자로 입력해주세요" }, 400);
  }

  var doc = await loadDoc(kv);
  if (!Array.isArray(doc.mapVendors)) doc.mapVendors = [];

  if (vendorExists(doc.pocVendors, vendorName)) {
    return json({ error: "이미 등록된 벤더입니다" }, 409);
  }

  var toolUse;

  if (body && body.profile && typeof body.profile === "object") {
    toolUse = { input: body.profile };
  } else {
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: "server not configured: ANTHROPIC_API_KEY missing" }, 500);
    }

    var systemPrompt = buildSystemPrompt();
    var messages = [
      { role: "user", content: "다음 벤더를 조사해서 등록해주세요: \"" + vendorName + "\"" }
    ];
    var tools = [
      { type: "web_search_20250305", name: "web_search", max_uses: 5 },
      VENDOR_TOOL
    ];
    var model = env.LLM_MODEL || "claude-sonnet-4-5-20250929";

    var callAnthropic = async function () {
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 4096,
          system: systemPrompt,
          tools: tools,
          messages: messages
        })
      });
      if (!res.ok) {
        var errText = await res.text();
        throw new Error("Anthropic API error " + res.status + ": " + errText.slice(0, 300));
      }
      return res.json();
    };

    try {
      var result = await callAnthropic();
      toolUse = findToolUse(result.content);
      if (!toolUse) {
        messages.push({ role: "assistant", content: result.content });
        messages.push({ role: "user", content: "반드시 submit_vendor_profile 도구를 정확히 한 번 호출해서 지금까지 조사한 내용을 제출하세요." });
        var retryResult = await callAnthropic();
        toolUse = findToolUse(retryResult.content);
      }
    } catch (e) {
      return json({ error: "LLM 호출 실패: " + e.message }, 502);
    }

    if (!toolUse) {
      return json({ error: "벤더 정보를 조사하지 못했습니다. 다시 시도해주세요." }, 502);
    }
  }

  var profile = normalizeProfile(toolUse.input || {});
  if (!profile.resolvedName) {
    return json({ error: "벤더의 정확한 이름을 확인하지 못했습니다." }, 502);
  }
  if (vendorExists(doc.pocVendors, profile.resolvedName)) {
    return json({ error: "'" + profile.resolvedName + "'은(는) 이미 등록된 벤더입니다" }, 409);
  }

  var isManual = !!(body && body.profile && typeof body.profile === "object");
  var today = new Date().toISOString().slice(0, 10);

  doc.pocVendors.push({
    name: profile.resolvedName,
    currentPhaseIndex: -1,
    status: "not-started",
    owner: "TBD",
    dueDate: "-",
    progressPct: 0,
    notes: isManual ? "" : "(AI 자동 등록 - 정보 확인 필요)",
    updatedAt: today
  });

  doc.mapVendors.push({
    name: profile.resolvedName,
    color: profile.color,
    scores: profile.scores,
    specialty: isManual ? profile.specialty : profile.specialty + " (AI 추정치)",
    badges: profile.badges,
    rationale: profile.rationale,
    extRationale: profile.extRationale,
    estimated: !isManual
  });

  doc.recentUpdates.unshift({
    date: today,
    vendor: profile.resolvedName,
    message: isManual ? "업체 추가" : "업체 추가 (AI 자동 조사)"
  });
  doc.recentUpdates = doc.recentUpdates.slice(0, 20);

  await saveDoc(kv, doc);

  var responseDoc = Object.assign({}, doc, { resolvedName: profile.resolvedName });
  return json(responseDoc);
}
