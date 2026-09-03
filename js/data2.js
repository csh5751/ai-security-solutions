/* Vendor Map II 전용 데이터 - 평가 기준: AISPM / AIDR / Shadow AI / AI Red Teaming / Ops
   원본 map.html(js/data.js)은 건드리지 않고 이 파일만 사용합니다.
   점수는 2026-09 공개 자료 재확인 기반. Palo Alto의 AISPM=1은 지정값. */

var vendors=[
{name:"Zenity",color:"#FF6B35",scores:{AISPM:4,AIDR:5,ShadowAI:3,RedTeaming:1,Ops:3}},
{name:"Grip Security",color:"#FBBF24",scores:{AISPM:4,AIDR:1,ShadowAI:5,RedTeaming:1,Ops:3}},
{name:"Straiker",color:"#F43F5E",scores:{AISPM:3,AIDR:5,ShadowAI:1,RedTeaming:5,Ops:2}},
{name:"MS Agent 365",color:"#3B82F6",scores:{AISPM:4,AIDR:3,ShadowAI:4,RedTeaming:2,Ops:5}},
{name:"Noma Security",color:"#4ADE80",scores:{AISPM:4,AIDR:5,ShadowAI:3,RedTeaming:3,Ops:3}},
{name:"Palo Alto Prisma AIRS",color:"#C084FC",scores:{AISPM:1,AIDR:5,ShadowAI:3,RedTeaming:5,Ops:4}},
{name:"CrowdStrike AIDR",color:"#F472B6",scores:{AISPM:1,AIDR:5,ShadowAI:5,RedTeaming:1,Ops:4}},
{name:"SentinelOne",color:"#22D3EE",scores:{AISPM:3,AIDR:5,ShadowAI:5,RedTeaming:4,Ops:4}},
{name:"Onyx Security",color:"#A3E635",scores:{AISPM:4,AIDR:4,ShadowAI:2,RedTeaming:1,Ops:2}},
{name:"Airia",color:"#818CF8",scores:{AISPM:3,AIDR:4,ShadowAI:4,RedTeaming:1,Ops:3}},
{name:"Akto",color:"#2DD4BF",scores:{AISPM:3,AIDR:4,ShadowAI:3,RedTeaming:5,Ops:3}},
{name:"Check Point Workforce AI Security",color:"#EF4444",scores:{AISPM:3,AIDR:4,ShadowAI:5,RedTeaming:2,Ops:4}}
];

var layers=["AISPM","AIDR","ShadowAI","RedTeaming","Ops"];

var layerLabels={
AISPM:"AISPM",
AIDR:"AIDR",
ShadowAI:"Shadow AI",
RedTeaming:"AI Red Teaming",
Ops:"Ops"
};

var layerShort={
AISPM:"SPM",
AIDR:"AIDR",
ShadowAI:"Shad",
RedTeaming:"Red",
Ops:"Ops"
};

var layerSubs={
AISPM:"// AI 보안 태세관리",
AIDR:"// AI 탐지·대응",
ShadowAI:"// 비인가 AI 가시성",
RedTeaming:"// 공격 검증",
Ops:"// 배포·운영 적합성"
};

var layerExplanations={
AISPM:"AI 앱·Agent·LLM·SaaS의 권한, 설정, 데이터 흐름, 시크릿, 공급망 리스크를 지속적으로 식별·정량화·조치하는 보안 태세관리 영역. Inventory만 제공하는 경우 엄격하게 감점",
AIDR:"Prompt/Tool/Agent 런타임에서 발생하는 위협을 실제로 탐지하고 차단·격리·감사까지 수행하는 탐지/대응 영역. 단순 로그 수집이나 사후 리포팅만으로는 높은 점수를 부여하지 않음",
ShadowAI:"승인되지 않은 SaaS AI, 로컬 LLM, Agent/MCP, AI 자산과 소유자·연결구조를 식별하는 가시성 영역. 탐지만 하고 차단/원격조치 매핑이 약하면 감점",
RedTeaming:"Prompt Injection, Jailbreak, RAG Poisoning, Agent Abuse 등 실제 공격 시나리오를 반복 자동화하고 결과를 취약점 리포트로 제공하는 검증 영역",
Ops:"구축 모델, 관리 UI, 정책관리, 성능 영향, 개선 가이드, 표준 매핑, 복구 체계 등 이관·운영 적합성 영역. PoC 이후 실제 운영 전환 가능성을 엄격하게 평가"
};

var threatDomains={
AISPM:["과도 권한 탐지","설정 취약점 탐지","데이터 흐름 추적","NHI/시크릿 관리"],
AIDR:["Prompt Injection 탐지","Data Leakage 탐지","Tool Abuse 탐지","실시간 차단·격리"],
ShadowAI:["SaaS AI 탐지","로컬 LLM 탐지","Agent/MCP 탐지","AI 자산 인벤토리"],
RedTeaming:["Prompt Injection 시뮬레이션","Jailbreak 테스트","RAG Poisoning 테스트","자동화 Red Teaming"],
Ops:["구축 모델 적합성","정책 관리 UI","표준 매핑","성능 영향·복구"]
};

var domainDesc={
"과도 권한 탐지":"OAuth/API/Admin 등 과도하게 부여된 권한 식별",
"설정 취약점 탐지":"Public/External 공유 등 위험 설정 오류 탐지",
"데이터 흐름 추적":"입력에서 출력까지 AI 데이터 흐름 가시화",
"NHI/시크릿 관리":"API Key/Token 등 비인가 자격증명 수명 관리",
"Prompt Injection 탐지":"Direct/Indirect 프롬프트 인젝션 실시간 탐지",
"Data Leakage 탐지":"PII/API Key 등 민감정보 유출 탐지·마스킹",
"Tool Abuse 탐지":"Agent의 API/Automation 도구 오남용 탐지",
"실시간 차단·격리":"인라인 차단, 격리, 자동 조치 수행 가능 여부",
"SaaS AI 탐지":"미승인 SaaS AI 서비스 사용 식별",
"로컬 LLM 탐지":"엔드포인트의 로컬 LLM/AI 앱 설치 식별",
"Agent/MCP 탐지":"비인가 Agent 및 MCP 서버 연결 식별",
"AI 자산 인벤토리":"전사 AI 자산 목록화 및 소유자 매핑",
"Prompt Injection 시뮬레이션":"실제 인젝션 공격 시나리오 반복 실행",
"Jailbreak 테스트":"정책 우회/가드레일 무력화 테스트",
"RAG Poisoning 테스트":"참조 데이터 오염을 통한 응답 조작 검증",
"자동화 Red Teaming":"지속 반복 자동화 및 취약점 리포트 제공",
"구축 모델 적합성":"SaaS/On-prem/Hybrid, 리전, 망분리 환경 대응",
"정책 관리 UI":"관리 콘솔 성숙도 및 정책 설정 편의성",
"표준 매핑":"NIST AI RMF / ISO 42001 등 표준 대응",
"성능 영향·복구":"지연 영향 측정 및 백업/롤백 복구 체계"
};

var vendorSpecialty={
"Zenity":"Agent 거버넌스 + Runtime 정책 집행(AI-DFIR) 특화",
"Grip Security":"Identity-First SSPM - Shadow SaaS/AI 발견 + 자동 원격 조치",
"Straiker":"Discover-Ascend-Defend: Agent/MCP 적대적 레드팀 + Runtime 방어",
"MS Agent 365":"Entra Agent ID 기반 Agent 전용 Control Plane - Registry/Access/Security 통합",
"Noma Security":"AI-SPM + Access Control + Red Teaming + AI-DR 통합 4-in-1 플랫폼",
"Palo Alto Prisma AIRS":"Protect AI + Koi Security + Portkey 인수 통합 - Model Scan부터 Agentic Endpoint, AI Gateway까지 풀스택",
"CrowdStrike AIDR":"Falcon AI Detection and Response - Prompt 계층 가시성부터 Shadow AI 거버넌스까지",
"SentinelOne":"Prompt Security 인수 기반 Prompt/MCP 방어 + Purple AI 연계",
"Onyx Security":"Onyx Guardian Agent - 자율 Agent를 위한 IAM형 행동 거버넌스",
"Airia":"Orchestration + Governance + Security 통합 엔터프라이즈 AI 플랫폼",
"Akto":"API 보안에서 피벗한 Agentic Security Platform - LLM/MCP/Agent 종합 테스트",
"Check Point Workforce AI Security":"브라우저 기반 Workforce AI 사용 통제 - 임직원의 생성형 AI 사용 전반을 Discover-Govern-Protect 구조로 발견·거버넌스·차단"
};

var extCapabilities={
"SaaS":{fullName:"SaaS Security / SSPM",desc:"SaaS 환경의 보안 상태 관리 - SaaS 앱 섀도 발견, OAuth 앱 위험 평가, 설정 오류 탐지, SaaS 간 데이터 흐름 가시화"},
"API":{fullName:"API Security",desc:"API Discovery, Schema 검증, Shadow/Zombie API 탐지, API 취약점 테스트, API 호출 패턴 분석"},
"DLP":{fullName:"DLP / Data Governance",desc:"데이터 분류 및 유출 방지 - 민감 데이터 자동 분류, 데이터 이동 추적, 외부 전송 차단"},
"MLOps":{fullName:"MLOps Pipeline Security",desc:"ML 학습/배포 파이프라인 보안 - 학습 데이터 무결성, 모델 저장소 보안, 배포 파이프라인 보호"},
"Browser":{fullName:"Browser Security",desc:"브라우저 레벨 보안 통제 - 브라우저 확장 위험, 웹 페이지 내 데이터 입력 통제, Prompt-level DLP"}
};

var vendorBadges={
"Zenity":[],
"Grip Security":["SaaS"],
"Straiker":[],
"MS Agent 365":["DLP","SaaS"],
"Noma Security":["MLOps","DLP"],
"Palo Alto Prisma AIRS":["MLOps","API"],
"CrowdStrike AIDR":["Browser","DLP"],
"SentinelOne":["API"],
"Onyx Security":[],
"Airia":["SaaS","DLP"],
"Akto":["API"],
"Check Point Workforce AI Security":["Browser","DLP"]
};

var vendorExtRationale={
"Grip Security":{
"SaaS":{type:["pos","pos"],bullets:["<strong>Agentless Identity 신호 기반 SaaS Discovery 시장 선도</strong>","OAuth Grant 자동 회수 등 SSPM 자동 조치 강함"]}
},
"MS Agent 365":{
"DLP":{type:["pos","pos"],bullets:["<strong>Purview Information Protection 네이티브 연계로 민감 데이터 자동 분류</strong>","정책 기반 Agent 출력 차단"]},
"SaaS":{type:["pos","neu"],bullets:["<strong>Defender for Cloud Apps로 SaaS Posture 통합 관리</strong>","MS 생태계 밖 SaaS는 가시성 제한적"]}
},
"Noma Security":{
"MLOps":{type:["pos","pos"],bullets:["<strong>AI-SPM으로 모델 레지스트리/학습 데이터 취약점 스캔</strong>","배포 파이프라인 보안 점검 포함"]},
"DLP":{type:["pos","neu"],bullets:["<strong>AI 관련 민감 데이터 흐름 추적</strong>","AI-DR과 연계한 런타임 데이터 유출 탐지"]}
},
"Palo Alto Prisma AIRS":{
"MLOps":{type:["pos","pos"],bullets:["<strong>Protect AI 인수로 확보한 모델 스캐닝 - 업계 최대 규모 MLOps 보안 커버리지</strong>","모델 저장소/학습 파이프라인 취약점 스캔"]},
"API":{type:["pos","pos"],bullets:["<strong>Portkey AI Gateway 기반 API 트래픽 심층 검사</strong>","AI Observability로 API 호출 패턴 분석"]}
},
"CrowdStrike AIDR":{
"Browser":{type:["pos","pos"],bullets:["<strong>Chrome/Edge/Firefox 확장 기반 전사 AI 사용 실시간 통제 핵심</strong>","브라우저 레벨 Prompt 유출 차단"]},
"DLP":{type:["pos","neu"],bullets:["<strong>모델 도달 전 민감정보 마스킹/암호화</strong>","데이터 보호 정책을 Falcon 콘솔에서 통합 관리"]}
},
"SentinelOne":{
"API":{type:["pos","neu"],bullets:["<strong>MCP Gateway가 13,000개 이상 MCP 서버 트래픽을 프록시/스코어링</strong>","API 수준 위험 평가는 MCP 중심으로 한정"]}
},
"Airia":{
"SaaS":{type:["pos","neu"],bullets:["<strong>Copilot/Bedrock/Salesforce/n8n Cross-Platform Discovery</strong>","SaaS Posture 심층 스캔보다는 AI 사용 발견에 초점"]},
"DLP":{type:["pos","neu"],bullets:["<strong>Runtime Data Leakage Controls로 민감정보 이동 제한</strong>","컴플라이언스 매핑(EU AI Act 등)과 연계"]}
},
"Akto":{
"API":{type:["pos","pos"],bullets:["<strong>API Discovery/Shadow API 탐지 시장 검증 기술을 AI 계층까지 확장한 원조 강점</strong>","Zombie API/AI Endpoint 자동 식별"]}
},
"Check Point Workforce AI Security":{
"Browser":{type:["pos","pos"],bullets:["<strong>경량 브라우저 확장(Harmony Browser 기반)만으로 즉시 배포, 복잡한 설정/다운타임 없음</strong>","웹 페이지 입력 시점의 프롬프트 레벨 DLP로 민감정보 유출 사전 차단"]},
"DLP":{type:["pos","neu"],bullets:["<strong>컨텍스트 기반 DLP + 파일/이미지 리댁션·OCR을 결합한 AI 전용 데이터 유출 방지</strong>","전통 DLP와 달리 프롬프트/AI 응답 맥락을 이해하도록 설계됨"]}
}
};

var vendorRationale={
"Zenity":{
AISPM:{type:["pos","pos","neg"],bullets:["<strong>Zenity Govern이 AISPM 전용 모듈로 제공 - Agent 설정·권한 리스크를 평가하고 secure-by-design 가드레일을 집행</strong>","<strong>M365/Salesforce/OpenAI ChatGPT/자체 프레임워크/엔드포인트 Agent까지 자동 발견 후 태세 평가</strong>","NHI 시크릿 로테이션·오프보딩 등 자격증명 수명 관리는 미제공"]},
AIDR:{type:["pos","pos","pos"],bullets:["<strong>Zenity Defend(AI Detection & Response)로 런타임 탐지·차단, AI-DFIR 기반 Agent 결정 체인 추적이 핵심 차별점</strong>","<strong>Guardian Agents가 정책을 런타임에 지속 강제, MS Foundry Runtime Enforcement GA(2026.3)</strong>","Copilot/Agentforce 등 관리형 Agent부터 자체 개발 Agent까지 intent-aware 탐지 적용"]},
ShadowAI:{type:["pos","neu","neg"],bullets:["<strong>Shadow Agent Discovery로 미승인 Agent를 발견하고 정책으로 완화(mitigate)까지 수행</strong>","Copilot Studio/Agentforce/Bedrock/Azure AI Foundry 범위의 citizen developer·shadow AI 거버넌스","직원 브라우저의 개인 ChatGPT 사용 등 Workforce AI 사용 통제는 Scope 밖"]},
RedTeaming:{type:["neg","neg","neg"],bullets:["<strong>공개 자료상 능동적 공격 시뮬레이션·적대적 프로브 라이브러리·자동화 레드팀 워크플로우를 제공하지 않음</strong>","배포 전 Prompt Injection/Jailbreak 사전 검증 기능 부재","취약점 리포트 형태의 검증 결과물 없음"]},
Ops:{type:["neu","pos","neu"],bullets:["SaaS 중심 배포로 도입은 빠르나 온프레미스/망분리 옵션은 제한적","<strong>Copilot Studio/Power Platform 등 MS 생태계 네이티브 통합으로 정책 관리 UI 성숙, Gartner 보고서에서 'Company to Beat'로 지목</strong>","국내 지원 조직·레퍼런스와 기술지원 SLA는 PoC에서 확인 필요"]}
},
"Grip Security":{
AISPM:{type:["pos","pos","neu"],bullets:["<strong>Identity 신호 기반 Agentless SaaS/OAuth App 전체 인벤토리 + 사용자 수명주기 관리</strong>","<strong>과도 권한 OAuth Grant 자동 회수, 세션 종료, 확장 비활성화 등 자동 조치(ITDR) 실행 가능</strong>","SSPM은 후발 도입 기능으로, 설정 태세 심층 스캔 성숙도는 전문 SSPM 벤더 대비 낮다는 평가"]},
AIDR:{type:["neg","neg","neu"],bullets:["<strong>AI 런타임(Prompt/Tool/Agent) 위협 탐지·차단 기능 없음 - 네이티브 위협 탐지 부재로 평가됨</strong>","Agent 이상행동 실시간 탐지 미지원","ITDR은 Identity 위협 대응으로, AI 계층 런타임 탐지와는 별개 영역"]},
ShadowAI:{type:["pos","pos","pos"],bullets:["<strong>Identity/인증 신호 기반 Shadow SaaS+AI 통합 탐지(설정 스캔 아님) - 핵심 차별점</strong>","<strong>2025 리포트 기준 AI 도구 91% 미관리, ChatGPT 96% 조직에서 발견</strong>","개인 계정 AI 사용까지 자동 식별 + 사용자 격리/OAuth 차단 등 즉시 원격 조치"]},
RedTeaming:{type:["neg","neg","neg"],bullets:["공격 시뮬레이션/레드팀 자동화 기능 미제공","Prompt Injection/Jailbreak 테스트 부재","<strong>검증(Offensive) 영역은 제품 포지셔닝 밖</strong>"]},
Ops:{type:["pos","neu","neu"],bullets:["<strong>Agentless 배포로 에이전트 설치 없이 즉시 도입 - 운영 부담 최소, 브라우저 기반 자격증명 통제 병행</strong>","SaaS/OAuth 정책 관리 UI는 성숙하나 AI 전용 정책 세분화는 제한적","표준 매핑(NIST AI RMF/ISO 42001) 대응은 PoC에서 확인 필요"]}
},
"Straiker":{
AISPM:{type:["neu","pos","neg"],bullets:["Discover AI가 Agent 인벤토리와 함께 posture management 제공 - 연결관계 매핑, 오설정·취약점 노출","<strong>12,000개 이상 MCP 취약점 DB 기반 공급망 리스크 평가</strong>","권한 자동 축소/회수, NHI 시크릿 수명 관리는 미제공 - 태세 '조치' 근거 부족"]},
AIDR:{type:["pos","pos","pos"],bullets:["<strong>Defend AI가 Prompt Injection·데이터 유출·Tool Abuse·Agent Hijacking을 프로덕션 속도로 탐지·차단</strong>","<strong>98%+ 탐지 정확도 + 300ms 이하 지연(벤더 자체 수치), 인라인 게이트웨이 모드로 능동 차단</strong>","Bedrock AgentCore/Azure AI Foundry/Copilot Studio는 API 모니터링 모드로도 연동 가능"]},
ShadowAI:{type:["neg","neg","neg"],bullets:["<strong>SaaS AI 서비스 사용·로컬 LLM·브라우저 기반 개인 AI 사용 탐지를 제공하지 않음</strong>","Discover AI의 발견 범위는 Enterprise가 배포한 Agent·MCP 서버·Tool 연동으로 한정 - Workforce AI 가시성으로 인정하지 않음","AI 자산 소유자 매핑·연결구조 기반 섀도 AI 거버넌스 근거 부족"]},
RedTeaming:{type:["pos","pos","pos"],bullets:["<strong>Ascend AI가 Agent 스택 전 계층에 지속 적대적 레드팀 수행 - 67개 이상 통제/10개 이상 공격 카테고리</strong>","<strong>OWASP LLM Top 10/MITRE ATLAS 매핑 기반 취약점 리포트 제공</strong>","Discover-Ascend-Defend 3모듈이 Agent 수명주기에 매핑된 구조로, 검증이 제품의 한 축"]},
Ops:{type:["neu","neg","neg"],bullets:["인라인 게이트웨이/API 모니터링 두 가지 배포 모드 제공","클라우드 플랫폼 연동 중심으로 온프레미스/망분리 배포 근거 확인 안 됨","<strong>관리 UI·정책 관리 성숙도가 대형 플랫폼 대비 낮고, 국내 지원 체계·레퍼런스 부족으로 운영 이관 리스크 높음</strong>"]}
},
"MS Agent 365":{
AISPM:{type:["pos","pos","neu"],bullets:["<strong>Entra Agent ID로 Agent에 1급 신원 부여 - 인증/인가/수명주기/정책 집행을 일관 적용(2026.5 GA)</strong>","<strong>Registry에서 전사 Agent 권한 태세 목록화 + Conditional Access 정책 동일 적용</strong>","Purview/Defender 연계로 데이터 흐름·민감정보 분류까지 커버하나 비-MS 자산은 가시성 위주"]},
AIDR:{type:["neu","pos","neu"],bullets:["Azure AI Content Safety/Prompt Shield 연계로 Injection 차단","<strong>Defender 통합으로 Agent 이상행동 탐지 및 Alert/SOAR 연계</strong>","타사 LLM(OpenAI API 직접 호출 등)·타 플랫폼 Agent는 심층 Runtime 제어 제한적"]},
ShadowAI:{type:["pos","pos","neg"],bullets:["<strong>Entra Agent ID가 미승인 AI 도구를 탐지하고 비준수 서비스를 정책으로 차단, 사용 추이 모니터링까지 제공</strong>","<strong>Defender/Intune을 활용해 로컬·클라우드 Agent를 모두 발견 - Shadow AI를 관리 대상 자산군으로 편입</strong>","브라우저 레벨 프롬프트 통제와 비-MS 생태계 개인 AI 사용은 여전히 사각지대로 지적됨"]},
RedTeaming:{type:["neu","neu","neg"],bullets:["PyRIT 등 MS 오픈소스 레드팀 도구는 별도 제공되나 Agent 365 내장 기능은 아님","AI Foundry 평가 기능으로 배포 전 일부 안전성 테스트 가능","<strong>제품 내 반복 자동화 레드팀 및 표준 매핑 취약점 리포트는 미제공</strong>"]},
Ops:{type:["pos","pos","pos"],bullets:["<strong>Vendor-Agnostic Control Plane - MS/AWS/GCP/Adobe/Databricks/ServiceNow/SAP Agent까지 단일 콘솔 거버넌스</strong>","<strong>기존 M365/Entra/Intune 운영 체계에 그대로 편입되어 운영 이관 부담 최소 - 국내 지원 체계도 성숙</strong>","EU AI Act/NIST AI RMF 등 표준 매핑 및 감사 리포팅 내장, 2026.5 GA로 제품 성숙도 확보"]}
},
"Noma Security":{
AISPM:{type:["pos","pos","neu"],bullets:["<strong>AI-SPM(발견+태세)이 4개 제품 중 한 축 - 모델·Agent·MCP 서버·데이터소스를 자동 발견하고 상호연결 관계까지 매핑</strong>","<strong>Access Control 모듈로 과도 권한 탐지, 공급망 보안 포함, AWS Security Hub Extended Plan 정식 편입(2026.2)</strong>","NHI 시크릿 회전/폐기 자동화는 제한적"]},
AIDR:{type:["pos","pos","pos"],bullets:["<strong>AI-DR(런타임 탐지·대응)이 독립 제품으로 제공 - Agent 이상행동 실시간 모니터링 및 대응</strong>","<strong>Data Poisoning/학습 데이터 무결성 등 데이터 계층 위협까지 탐지</strong>","Bedrock/Azure 자체 개발 앱, Copilot Studio/AgentForce SaaS Agent, 개발자 PC의 코딩 어시스턴트·MCP까지 커버"]},
ShadowAI:{type:["pos","neu","neg"],bullets:["<strong>환경 내 모든 AI 모델·Agent·MCP 서버·데이터소스를 자동 발견 - AI 자산 인벤토리 강점</strong>","개발자 머신의 코딩 어시스턴트·MCP 서버까지 엔드포인트 범위 확보","브라우저 레벨 실시간 차단 및 개인 계정 기반 Workforce AI 사용 통제는 부재"]},
RedTeaming:{type:["neu","neu","neg"],bullets:["Red Teaming(적대적 테스트)이 4개 제품 중 독립 한 축으로 배포 전 Prompt Injection/Jailbreak 검증 제공","통합 플랫폼의 한 모듈이라 전용 레드팀 벤더(Straiker/Akto) 대비 프로브 라이브러리 규모 근거는 얕음","<strong>프로브 규모·표준 매핑·반복 자동화 주기의 공개 근거가 부족해 엄격 기준에서 감점</strong>"]},
Ops:{type:["neu","neu","neg"],bullets:["<strong>4-in-1 통합 콘솔로 정책 관리 일원화, 클라우드 3사+주요 SaaS Agent 빌더 광범위 연동</strong>","$132M 투자 유치(Series B $100M)와 Gartner 리뷰 등재로 벤더 지속성은 개선","<strong>국내 지원 조직·레퍼런스 부재, 온프레미스/망분리 배포 근거 미확인으로 운영 이관 리스크 존재</strong>"]}
},
"Palo Alto Prisma AIRS":{
AISPM:{type:["neg","neg","neg"],bullets:["<strong>직접 PoC 검증 결과 - AI 앱/Agent의 권한·설정 태세관리를 실사용 수준으로 확인하지 못함(공개 자료의 Posture Management 소개와 차이)</strong>","Portkey Idira의 Agent 신원 추적은 게이트웨이 트래픽 관점 - NHI 인벤토리·시크릿 로테이션·권한 자동 회수 미제공","모델·파이프라인 스캐닝(Protect AI 계열)은 모델 보안 영역으로 분류하고 AISPM 축으로 인정하지 않음"]},
AIDR:{type:["pos","pos","neu"],bullets:["<strong>AI Runtime Firewall/AI Runtime API로 런타임 트래픽 인라인 검사·차단, Portkey AI Gateway 기반 AI Observability</strong>","<strong>Koi Security 인수(약 4억 달러, 2026.4) 기반 Agentic Endpoint Security - 브라우저 확장/패키지/MCP를 엔드포인트에서 직접 통제</strong>","3개 인수 기술의 탐지 룰이 단일 엔진으로 수렴되는 과정은 진행 중"]},
ShadowAI:{type:["neu","neu","pos"],bullets:["엔드포인트(Koi) 기반 브라우저 확장·패키지 설치 현황 파악으로 섀도 도구 일부 식별","AI Gateway를 우회하는 개인 기기·브라우저 세션 사용은 탐지 범위 밖일 수 있음","<strong>브라우저 확장/패키지/데이터셋까지 엔드포인트 레벨 가시성 및 차단 확보(Koi 강점)</strong>"]},
RedTeaming:{type:["pos","pos","pos"],bullets:["<strong>Prisma AIRS AI Red Teaming이 독립 제품으로 제공 - 레드팀 에이전트가 실제 공격자처럼 학습·적응하며 자동 침투 테스트 수행</strong>","<strong>LLM 및 LLM 기반 애플리케이션 전체를 대상으로 안전성·보안 취약점 자동 스캔, 전용 데이터시트 공개</strong>","2026년 Copilot Studio 네이티브 연동(Agent 보안 테스트), 다국어 검증, WebSocket 프로토콜 테스트까지 확장"]},
Ops:{type:["pos","pos","neu"],bullets:["<strong>기존 Prisma Cloud/SASE 운영 체계에 편입 - 국내 지원 조직·레퍼런스 최상위 수준</strong>","<strong>SaaS/온프레미스/하이브리드 배포 옵션 및 국내 리전 대응 가능</strong>","3개 인수 제품(Protect AI/Koi/Portkey)이 단일 콘솔로 완전 통합되기까지는 시간 필요"]}
},
"CrowdStrike AIDR":{
AISPM:{type:["neg","neg","neg"],bullets:["<strong>NHI 수명주기 관리, 권한 자동 회수, 설정 태세 스캔 모두 미제공</strong>","Service Account/OAuth App 인벤토리 기능 부재","User-Prompt-Model-Agent-MCP 관계 맵은 런타임 가시성 산출물로, 태세 정량화로 인정하기 어려움"]},
AIDR:{type:["pos","pos","pos"],bullets:["<strong>Prompt Injection 탐지율 최대 99%(벤더 자체 수치) 실시간 차단 - 제품 자체가 AIDR 포지션</strong>","<strong>민감 데이터 마스킹/암호화를 모델 도달 전 단계에서 수행</strong>","MCP Proxy로 Tool 호출 흐름 추적, Falcon 콘솔에서 탐지-대응 통합"]},
ShadowAI:{type:["pos","pos","pos"],bullets:["<strong>브라우저 확장(Chrome/Edge/Firefox) 기반 전사 AI 사용 가시성 - 핵심 강점</strong>","<strong>승인되지 않은 AI 서비스 사용 및 민감정보 입력을 실시간 탐지·차단</strong>","Shadow AI 거버넌스를 Falcon 콘솔에서 통합 관리"]},
RedTeaming:{type:["neg","neg","neg"],bullets:["공격 시나리오 자동화 레드팀 기능 미제공","배포 전 Prompt Injection/Jailbreak 사전 검증 부재","<strong>검증 영역은 제품 범위 밖</strong>"]},
Ops:{type:["pos","pos","neu"],bullets:["<strong>기존 Falcon 에이전트/콘솔에 그대로 편입 - 운영 이관 부담 최소, 국내 지원 조직 성숙</strong>","<strong>SDK/브라우저 확장 두 가지 배포 옵션 제공</strong>","AI 전용 표준 매핑(NIST AI RMF/ISO 42001) 리포팅 근거는 확인 필요"]}
},
"SentinelOne":{
AISPM:{type:["neu","pos","neg"],bullets:["Prompt AI Agent Security가 Agent/Agentic 워크플로우용 실시간 발견·거버넌스 컨트롤 플레인으로 제공(RSAC 2026 GA)","<strong>MCP 서버를 커버하며 미승인 Agent 동작을 자동 원격조치(auto-remediate)까지 수행</strong>","설정 태세 스캔, NHI 시크릿 수명 관리, 권한 인벤토리는 미제공 - 태세 '정량화' 축은 약함"]},
AIDR:{type:["pos","pos","pos"],bullets:["<strong>Prompt Security 인수(2025.9, 약 1.34억 달러+주식)로 250개 이상 LLM 모델의 Prompt Injection·Jailbreak·데이터 유출을 200ms 이하로 탐지</strong>","<strong>MCP Gateway가 13,000개 이상 MCP 서버를 프록시하며 동적 위험 스코어링·차단, Agent 상호작용 정책을 머신 스피드로 집행</strong>","Purple AI 연계 자동 조사(RSAC 2026 GA), AWS Bedrock AgentCore 가드레일 통합"]},
ShadowAI:{type:["pos","pos","pos"],bullets:["<strong>Prompt Security의 경량 에이전트+브라우저 확장이 승인/미승인 GenAI 앱을 자동 발견 - DOM 분석과 사용자 행위 추적 기반</strong>","<strong>Chrome 확장을 Intune/MDM으로 수분 내 배포, 수천 개 AI 도구의 실시간 인벤토리 유지 + 사용정책 실시간 집행</strong>","선택적 데이터 리댁션으로 민감정보가 외부 모델에 도달하지 않도록 차단, 모든 프롬프트/응답을 감사용으로 기록"]},
RedTeaming:{type:["pos","pos","neu"],bullets:["<strong>Prompt AI Red Teaming이 RSAC 2026에서 GA - Prompt Injection·Jailbreak·권한 상승·데이터 포이즈닝 등 실제 공격을 시뮬레이션</strong>","<strong>배포 전 하드닝 + 모델 드리프트/신규 공격 벡터에 대한 지속 평가(continuous evaluation) 제공</strong>","자체 개발/1st-party AI 앱 대상 기능으로 출시 시점이 최근 - 프로브 라이브러리 규모는 PoC 검증 필요"]},
Ops:{type:["pos","pos","neu"],bullets:["<strong>기존 Singularity 플랫폼/Purple AI 콘솔에 통합 운영, 국내 지원 조직 보유</strong>","<strong>브라우저 확장을 Intune/MDM으로 수분 내 배포 - 도입 부담 최소</strong>","Copilot Studio/Power Platform 등 LCNC 심층 통합은 약하고, AI 전용 표준 매핑 리포팅은 확인 필요"]}
},
"Onyx Security":{
AISPM:{type:["pos","pos","neu"],bullets:["<strong>클라우드·엔드포인트·코드·SaaS 전반에서 AI Agent를 지속 발견하고 사용 정책을 정의·실시간 집행</strong>","<strong>과도 권한 자동 탐지 및 최소권한 자동 축소(scope narrowing) - 자율 Agent에 IAM급 권한 거버넌스 적용</strong>","설정 취약점·데이터 흐름·공급망·시크릿 등 Agent 권한 외 태세 영역은 커버리지 제한적"]},
AIDR:{type:["pos","pos","neu"],bullets:["<strong>Guardian Agent가 런타임에서 Agent 액션을 다운스트림 도달 전 인터셉트해 위험 행위 차단</strong>","<strong>인가 137,000개 이상 Agent 보호, 1,000만 세션 이상 실시간 위협 분석(벤더 자체 수치)</strong>","Prompt 계층·데이터 계층 위협 탐지는 범위 밖 - Agent 액션 계층에 한정"]},
ShadowAI:{type:["neu","neg","neg"],bullets:["클라우드·엔드포인트·코드·SaaS에 걸친 AI 자산 지속 발견으로 미승인 Agent 인벤토리는 확보","SaaS AI 서비스 사용·로컬 LLM 탐지 기능 부재","<strong>브라우저 기반 개인 AI 사용 탐지 및 Workforce AI 통제는 미지원</strong>"]},
RedTeaming:{type:["neg","neg","neg"],bullets:["공격 시뮬레이션/레드팀 기능 미제공","배포 전 안전성 검증 부재","<strong>검증 영역은 제품 포지셔닝 밖</strong>"]},
Ops:{type:["neu","neg","neg"],bullets:["2026년 3월 $40M 투자 유치하며 정식 출범(Conviction/Cyberstarts), Anthropic 엔터프라이즈 고객 대상 기술 통합 발표","LCNC/SaaS 자동화 플랫폼 심층 통합은 초기 단계, 배포 옵션·복구 체계 근거 미확인","<strong>출범 6개월 규모 벤더로 국내 지원 체계·레퍼런스 부재 - 운영 이관 리스크 최상위</strong>"]}
},
"Airia":{
AISPM:{type:["neu","pos","neg"],bullets:["Agent Constraints 엔진의 컨텍스트 인식 권한으로 Agent의 접근·실행 범위 통제","<strong>중앙 집중 AI 인벤토리 + EU AI Act/NIST AI RMF/ISO 42001 정렬 컴플라이언스 리포팅</strong>","권한 자동 회수, NHI 시크릿 수명 관리(로테이션/오프보딩) 미지원"]},
AIDR:{type:["pos","pos","neu"],bullets:["<strong>Runtime Security Enforcement가 Prompt Injection 방어·Tool Misuse 방지·데이터 유출 통제를 실시간 제공</strong>","<strong>크로스 플랫폼 프록시 구조로 Copilot/Bedrock/Salesforce/자체 개발 Agent를 위치 무관 인터셉트해 가드레일 집행</strong>","탐지 정확도·지연 수치 등 성능 근거가 공개되지 않아 전문 AIDR 벤더 대비 검증 필요"]},
ShadowAI:{type:["pos","pos","neu"],bullets:["<strong>조직 전체에서 실행 중인 모든 AI 도구·모델·Agent·MCP 서버를 발견 - 아무도 승인하지 않은 것까지 포함</strong>","<strong>Data Leakage Controls로 발견된 미승인 사용의 민감정보 이동 차단</strong>","개인 브라우저 기반 사용 탐지는 플랫폼/프록시 연동 범위로 한정"]},
RedTeaming:{type:["neg","neg","neg"],bullets:["공격 시나리오 자동화 레드팀 기능 미제공","배포 전 Prompt Injection/Jailbreak 검증 부재","<strong>오케스트레이션·거버넌스 중심 제품으로 검증 영역은 범위 밖</strong>"]},
Ops:{type:["neu","pos","neg"],bullets:["SaaS 오케스트레이션 플랫폼으로 도입 자체는 빠르고, Gartner AI 거버넌스 플랫폼 Competitive Landscape에 등재","<strong>EU AI Act/NIST AI RMF/HIPAA/ISO 42001/SOC 2 컴플라이언스 매핑 내장 - 표준 대응은 강점</strong>","<strong>국내 지원 체계·레퍼런스 부재, 온프레미스/망분리 및 복구 체계 근거 미확인</strong>"]}
},
"Akto":{
AISPM:{type:["neu","pos","neg"],bullets:["Agentic Posture Management로 AI Agent·MCP 서버·LLM 연동의 설정·노출 태세 점검","<strong>Shadow/Zombie API 탐지 기술을 AI 계층까지 확장, MCP 거버넌스와 skills 인벤토리 제공(2026.4)</strong>","권한 자동 회수·NHI 시크릿 수명 관리 미지원으로 태세 '조치' 축은 약함"]},
AIDR:{type:["pos","pos","neu"],bullets:["<strong>런타임 가드레일로 위험한 Agent 행위를 실시간 차단 - Claude Cowork/Kiro CLI 가드레일 및 Human-in-the-Loop 오버라이드(2026.7)</strong>","<strong>Codex CLI/Neovim 가드레일, skills 차단, OWASP ASI 매핑 가드레일까지 확장(2026.3~4)</strong>","코딩 도구·MCP·Agent 중심 가드레일로, Prompt/데이터 계층 위협 탐지 깊이는 전문 AIDR 벤더 대비 낮음"]},
ShadowAI:{type:["pos","neu","neg"],bullets:["<strong>직원 엔드포인트 전반의 Agent/MCP/LLM 사용을 추적(2026.3)하고 미승인 skills를 차단</strong>","환경 내 LLM 애플리케이션·AI Agent·MCP 서버 연결을 지속 발견","브라우저 레벨 프롬프트 통제와 개인 계정 SaaS AI 사용 차단은 미지원"]},
RedTeaming:{type:["pos","pos","pos"],bullets:["<strong>Agentic Red Teaming이 독립 제품 - OWASP Agentic AI/MCP/LLM Top 10에 매핑된 4,000개 이상 프로브 보유</strong>","<strong>Prompt Injection·Tool Misuse·Memory Poisoning을 아우르는 대규모 프로브 라이브러리를 지속 업데이트하며 반복 실행</strong>","OWASP LLM Top 10 + OWASP Agentic AI Top 10 + MITRE ATLAS 3중 매핑 리포트, CI/CD 파이프라인 통합"]},
Ops:{type:["pos","neu","neg"],bullets:["<strong>CI/CD 파이프라인 통합과 SaaS/셀프호스팅 배포 옵션 제공 - 개발 단계 편입이 용이</strong>","EU AI Act 컴플라이언스 매핑 지원, MS Defender for Endpoint 연동","<strong>국내 지원 체계·레퍼런스 부족, 근거 대부분이 벤더 자체 공개 자료라 실측 검증 필요</strong>"]}
},
"Check Point Workforce AI Security":{
AISPM:{type:["pos","pos","neg"],bullets:["<strong>개인 계정 vs 회사 승인 계정의 로그인 컨텍스트를 구분해 동일 서비스라도 Shadow AI 여부를 식별</strong>","<strong>Cyata 인수 기술이 전 엔드포인트에서 Agent와 SaaS 연동을 매핑해 조직 내 Agent 태세관리 제공</strong>","OAuth 앱 전체 인벤토리·권한 자동 회수·시크릿 수명 관리는 Identity 전문 벤더 대비 제한적"]},
AIDR:{type:["pos","pos","neu"],bullets:["<strong>인라인 프롬프트 보호(Inline Prompt Protection)로 프롬프트 인젝션·유해 응답을 실시간 차단</strong>","<strong>브라우저에서 관찰되는 에이전트형 동작(agentic actions)에 대한 런타임 차단 정책 제공</strong>","브라우저 트래픽 레벨 검사라 API 직접 연동 모델의 심층 탐지는 자매 제품(AI Application & Agent Security) 영역"]},
ShadowAI:{type:["pos","pos","pos"],bullets:["<strong>브라우저·데스크톱 앱·IDE·MCP까지 아우르는 전사 AI 사용 현황을 Discover-Govern-Protect 구조로 통제하는 핵심 제품</strong>","<strong>승인/미승인 AI 앱을 사용자·데이터 유형별 정책으로 즉시 차단, AI 기반 데이터 분류로 민감정보 노출 축소</strong>","2026년 3월 출시된 AI Defense Plane의 핵심 축으로 ThreatCloud AI와 결합, 감사 추적 제공"]},
RedTeaming:{type:["neu","neu","neg"],bullets:["동일 AI Defense Plane 플랫폼에 지속 적대적 테스트(continuous adversarial testing) 기능이 포함(Lakera 계열)","다만 해당 기능은 자매 모듈이며 Workforce AI Security 제품 자체에는 내장되지 않음","<strong>Workforce 사용 통제 중심 제품으로 자동화 레드팀·취약점 리포트는 본 제품 범위 밖</strong>"]},
Ops:{type:["pos","pos","neu"],bullets:["<strong>경량 브라우저 확장만으로 전사 배포 - 복잡한 설정/다운타임 없음</strong>","<strong>기존 Check Point 인프라·국내 지원 조직을 활용할 수 있어 운영 이관 부담 낮음, AWS Marketplace 제공</strong>","AI 전용 표준 매핑(NIST AI RMF/ISO 42001) 리포팅 근거는 확인 필요"]}
}
};

var vendorClusters=[
{name:"AIDR / Runtime Defense Leaders",trait:"// 런타임에서 실제 탐지·차단이 확인된 그룹 - 인라인 차단 또는 액션 인터셉트 근거 보유",members:["Zenity","Straiker","Noma Security","Palo Alto Prisma AIRS","SentinelOne"],pattern:{AISPM:3,AIDR:5,ShadowAI:3,RedTeaming:3.6,Ops:3.2}},
{name:"AISPM / Governance Leaders",trait:"// 권한·설정 태세를 지속 정량화하고 가드레일/권한 축소까지 집행하는 그룹",members:["Zenity","Grip Security","MS Agent 365","Noma Security","Onyx Security"],pattern:{AISPM:4,AIDR:3.6,ShadowAI:3.4,RedTeaming:1.6,Ops:3.2}},
{name:"AI Red Teaming Focus",trait:"// 공격 시나리오 반복 자동화 + 표준 매핑 취약점 리포트를 제품으로 제공",members:["Straiker","Akto","Palo Alto Prisma AIRS","SentinelOne","Noma Security"],pattern:{AISPM:2.8,AIDR:4.8,ShadowAI:3,RedTeaming:4.4,Ops:3.2}},
{name:"Shadow AI Visibility Focus",trait:"// 전사 AI 사용/자산을 발견하고 차단·원격조치까지 매핑되는 그룹",members:["Grip Security","CrowdStrike AIDR","SentinelOne","Check Point Workforce AI Security","Airia"],pattern:{AISPM:2.8,AIDR:3.8,ShadowAI:4.8,RedTeaming:1.8,Ops:3.6}},
{name:"Ops / Enterprise Readiness",trait:"// 기존 보안 운영 체계 편입, 국내 지원 조직과 표준 대응이 확인되는 그룹",members:["MS Agent 365","Palo Alto Prisma AIRS","CrowdStrike AIDR","SentinelOne","Check Point Workforce AI Security"],pattern:{AISPM:2.4,AIDR:4.4,ShadowAI:4.4,RedTeaming:2.8,Ops:4.2}},
{name:"Full-Stack Coverage",trait:"// 5개 축 중 4개 이상에서 3점 이상 - 단일 벤더로 넓게 덮는 그룹",members:["Palo Alto Prisma AIRS","SentinelOne","Noma Security","Akto"],pattern:{AISPM:2.75,AIDR:4.75,ShadowAI:3.5,RedTeaming:4.25,Ops:3.5}}
];

vendors.forEach(function(v){
v.threatScores={};
layers.forEach(function(layer){
threatDomains[layer].forEach(function(d){
v.threatScores[d]=v.scores[layer];
});
});
});
