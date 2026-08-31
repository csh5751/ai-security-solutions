var vendors=[
{name:"Zenity",color:"#FF6B35",scores:{Model:2,Agent:5,Platform:4,Identity:3,ShadowAI:2}},
{name:"Grip Security",color:"#FBBF24",scores:{Model:1,Agent:2,Platform:3,Identity:5,ShadowAI:5}},
{name:"Straiker",color:"#F43F5E",scores:{Model:4,Agent:4,Platform:3,Identity:2,ShadowAI:3}},
{name:"MS Agent 365",color:"#3B82F6",scores:{Model:3,Agent:4,Platform:5,Identity:5,ShadowAI:3}},
{name:"Noma Security",color:"#4ADE80",scores:{Model:4,Agent:4,Platform:4,Identity:3,ShadowAI:3}},
{name:"Palo Alto Prisma AIRS",color:"#C084FC",scores:{Model:5,Agent:4,Platform:5,Identity:4,ShadowAI:3}},
{name:"CrowdStrike AIDR",color:"#F472B6",scores:{Model:4,Agent:3,Platform:3,Identity:2,ShadowAI:5}},
{name:"SentinelOne",color:"#22D3EE",scores:{Model:5,Agent:4,Platform:3,Identity:2,ShadowAI:3}},
{name:"Onyx Security",color:"#A3E635",scores:{Model:1,Agent:5,Platform:2,Identity:5,ShadowAI:2}},
{name:"Airia",color:"#818CF8",scores:{Model:3,Agent:4,Platform:4,Identity:3,ShadowAI:4}},
{name:"Akto",color:"#2DD4BF",scores:{Model:3,Agent:3,Platform:5,Identity:2,ShadowAI:3}}
];

var layers=["Model","Agent","Platform","Identity","ShadowAI"];

var layerLabels={
Model:"Model",
Agent:"Agent",
Platform:"Platform",
Identity:"Identity",
ShadowAI:"Shadow AI"
};

var layerSubs={
Model:"// AI 모델 보안",
Agent:"// 행동 보안",
Platform:"// 앱/자동화",
Identity:"// NHI/자격증명",
ShadowAI:"// 비인가 AI"
};

var layerExplanations={
Model:"AI 모델 자체의 보안 - Prompt Injection, Data Leakage, Model Extraction, Hallucination 등 모델 입출력과 학습/추론 단계의 위협을 다룸",
Agent:"AI Agent의 행동 보안 - Goal Hijack, Tool Misuse, Memory Poisoning, Excessive Agency 등 Agent가 자율적으로 작업을 수행할 때의 위협 통제",
Platform:"AI 앱/자동화 플랫폼 보안 - Copilot Studio, Power Platform, SaaS Automation 환경의 Connector, API, Access Control, Supply Chain 위협을 다룸",
Identity:"비인가 자격증명(NHI) 보안 - Service Account, API Key, OAuth App의 Secret Leakage, Over-Permission, Lifecycle 관리를 다룸",
ShadowAI:"비인가 AI 사용 통제 - 임직원의 개인 ChatGPT/Claude 등 외부 AI 사용, 민감정보 입력, 브라우저 확장 등 통제 및 AI 사용의 가시성"
};

var threatDomains={
Model:["Prompt Injection","Data Leakage","Model Extraction","Hallucination"],
Agent:["Goal Hijack","Tool Misuse","Memory Poisoning","Excessive Agency"],
Platform:["Connector Abuse","API Abuse","Access Control","Supply Chain"],
Identity:["Secret Leakage","Over-Permission","Third-party NHI","NHI Lifecycle"],
ShadowAI:["Unauthorized AI Use","Sensitive Data Input","Personal Account","Visibility Gap"]
};

var domainDesc={
"Prompt Injection":"악의적인 프롬프트로 모델 응답/조작 시도",
"Data Leakage":"학습 데이터/응답을 통한 민감정보 유출",
"Model Extraction":"반복 쿼리로 모델 가중치/구조 탈취",
"Hallucination":"AI가 사실과 다른 거짓 정보 생성",
"Goal Hijack":"Agent의 원래 목적을 변조하여 악용",
"Tool Misuse":"API/결제/삭제 등 위험 도구 오남용",
"Memory Poisoning":"Agent 컨텍스트/메모리 오염으로 동작 왜곡",
"Excessive Agency":"승인 없이 Agent가 무단 실행하는 권한 남용",
"Connector Abuse":"SaaS 커넥터 악용한 데이터 이동/유출",
"API Abuse":"비정상 API 호출/오용 패턴",
"Access Control":"공개 링크/익명 접근/과도 공유 노출",
"Supply Chain":"Plugin/Extension/LoRA 등 외부 컴포넌트 위험",
"Secret Leakage":"API Key/Token/Password 등 자격증명 노출",
"Over-Permission":"비인가 계정의 과도한 권한 부여",
"Third-party NHI":"외부 SaaS/OAuth 앱에 부여된 자격증명 위험",
"NHI Lifecycle":"Secret Rotation/Offboarding 등 수명 관리",
"Unauthorized AI Use":"승인되지 않은 외부 AI(ChatGPT 등) 사용",
"Sensitive Data Input":"외부 AI에 민감정보 입력/붙여넣기",
"Personal Account":"개인 계정으로 AI 서비스 사용",
"Visibility Gap":"Shadow AI 사용 가시성 부재"
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
"Akto":"API 보안에서 피벗한 Agentic Security Platform - LLM/MCP/Agent 종합 테스트"
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
"Akto":["API"]
};

var vendorExtRationale={
"Grip Security":{
SaaS:{type:["pos","pos"],bullets:["<strong>Agentless Identity 신호 기반 SaaS Discovery 시장 선도</strong>","OAuth Grant 자동 회수 등 SSPM 자동 조치 강함"]}
},
"MS Agent 365":{
DLP:{type:["pos","pos"],bullets:["<strong>Purview Information Protection 네이티브 연계로 민감 데이터 자동 분류</strong>","정책 기반 Agent 출력 차단"]},
SaaS:{type:["pos","neu"],bullets:["<strong>Defender for Cloud Apps로 SaaS Posture 통합 관리</strong>","MS 생태계 밖 SaaS는 가시성 제한적"]}
},
"Noma Security":{
MLOps:{type:["pos","pos"],bullets:["<strong>AI-SPM으로 모델 레지스트리/학습 데이터 취약점 스캔</strong>","배포 파이프라인 보안 점검 포함"]},
DLP:{type:["pos","neu"],bullets:["<strong>AI 관련 민감 데이터 흐름 추적</strong>","AI-DR과 연계한 런타임 데이터 유출 탐지"]}
},
"Palo Alto Prisma AIRS":{
MLOps:{type:["pos","pos"],bullets:["<strong>Protect AI 인수로 확보한 모델 스캐닝 - 업계 최대 규모 MLOps 보안 커버리지</strong>","모델 저장소/학습 파이프라인 취약점 스캔"]},
API:{type:["pos","pos"],bullets:["<strong>Portkey AI Gateway 기반 API 트래픽 심층 검사</strong>","AI Observability로 API 호출 패턴 분석"]}
},
"CrowdStrike AIDR":{
Browser:{type:["pos","pos"],bullets:["<strong>Chrome/Edge/Firefox 확장 기반 전사 AI 사용 실시간 통제 핵심</strong>","브라우저 레벨 Prompt 유출 차단"]},
DLP:{type:["pos","neu"],bullets:["<strong>모델 도달 전 민감정보 마스킹/암호화</strong>","데이터 보호 정책을 Falcon 콘솔에서 통합 관리"]}
},
"SentinelOne":{
API:{type:["pos","neu"],bullets:["<strong>MCP Gateway가 13,000개 이상 MCP 서버 트래픽을 프록시/스코어링</strong>","API 수준 위험 평가는 MCP 중심으로 한정"]}
},
"Airia":{
SaaS:{type:["pos","neu"],bullets:["<strong>Copilot/Bedrock/Salesforce/n8n Cross-Platform Discovery</strong>","SaaS Posture 심층 스캔보다는 AI 사용 발견에 초점"]},
DLP:{type:["pos","neu"],bullets:["<strong>Runtime Data Leakage Controls로 민감정보 이동 제한</strong>","컴플라이언스 매핑(EU AI Act 등)과 연계"]}
},
"Akto":{
API:{type:["pos","pos"],bullets:["<strong>API Discovery/Shadow API 탐지 시장 검증 기술을 AI 계층까지 확장한 원조 강점</strong>","Zombie API/AI Endpoint 자동 식별"]}
}
};

var vendorRationale={
"Zenity":{
Model:{type:["neg","neg","neu"],bullets:["<strong>모델 자체의 Adversarial/Extraction 방어는 제공 X</strong>","Prompt Injection은 Agent 행동 관점에서만 간접 탐지","Output 단계 일부 정책 위반 탐지"]},
Agent:{type:["pos","pos","pos"],bullets:["<strong>AI-DFIR(디지털 포렌식) 기반 Agent 결정 체인 추적 핵심 차별점</strong>","<strong>Guardian Agents로 정책 지속 강제(Runtime Boundaries) 강함</strong>","Copilot/Agentforce 등 SaaS 관리형 Agent부터 자체 개발 Agent까지 전 구간 커버"]},
Platform:{type:["pos","pos","neu"],bullets:["<strong>MS Foundry Runtime Enforcement GA(2026.3) - Copilot Studio/Power Platform 통합 강함</strong>","<strong>Surface 기능으로 Connector/Flow 노출 가시화</strong>","Plugin Supply Chain 검증은 제한적"]},
Identity:{type:["pos","neu","neg"],bullets:["<strong>Agent Identity 및 권한 사용 패턴 추적</strong>","Device 기반 Agent(Cursor/Claude Desktop) 식별 지원","Secret Rotation/Offboarding 등 Lifecycle 자체 관리는 미지원"]},
ShadowAI:{type:["neg","neg","neu"],bullets:["<strong>Enterprise 관리형/디바이스 기반 Agent 중심 - 개인 브라우저 ChatGPT 사용은 Scope 밖</strong>","SaaS 섀도 Agent 발견은 관리형 앱 범위로 한정","MCP Gateway로 일부 개인 AI 도구 트래픽 가시화"]}
},
"Grip Security":{
Model:{type:["neg","neg","neg"],bullets:["<strong>AI 모델 자체 보안 영역 다루지 않음</strong>","Prompt Injection/Extraction 대응 X","모델 계층 위협은 Scope 밖"]},
Agent:{type:["neg","neg","neu"],bullets:["Agent 행동/Runtime 통제 기능 없음","Tool Misuse/Goal Hijack 탐지 부재","OAuth 기반 Agent 접근 권한은 Identity 관점에서 일부 포착"]},
Platform:{type:["neu","neu","pos"],bullets:["SaaS 자동화 앱의 커넥터 권한을 Identity 신호로 간접 파악","Power Platform 등 LCNC 자체 심층 분석은 약함","<strong>OAuth Grant 기반 위험 앱 자동 식별</strong>"]},
Identity:{type:["pos","pos","pos"],bullets:["<strong>Identity 신호 기반 Agentless SaaS/OAuth App 전체 인벤토리 핵심 강점</strong>","<strong>과도 권한 OAuth Grant 자동 회수/암호 로테이션 등 원격 조치 지원</strong>","Third-party NHI 리스크 등급화 + 역할 변경 시 자동 오프보딩"]},
ShadowAI:{type:["pos","pos","pos"],bullets:["<strong>Identity/인증 신호 기반 Shadow SaaS+AI 통합 탐지(설정 스캔 아님) 핵심 차별점</strong>","<strong>2025 리포트 기준 AI 도구 91% 미관리, ChatGPT 96% 조직에서 발견</strong>","개인 계정 AI 사용까지 자동 식별 + 즉시 원격 조치"]}
},
"Straiker":{
Model:{type:["pos","pos","neu"],bullets:["<strong>Ascend AI: 67개 이상 통제/10개 이상 공격 카테고리 지속 레드팀</strong>","<strong>OWASP LLM Top 10/MITRE ATLAS 매핑 검증</strong>","Model Extraction은 적대적 테스트 범위 내 부분 커버"]},
Agent:{type:["pos","pos","pos"],bullets:["<strong>Defend AI Runtime Action Tracing으로 Tool-Chain 위험 실시간 탐지</strong>","<strong>Discover AI: 12,000개 이상 MCP 취약점 DB 기반 Agent/Tool 인벤토리</strong>","98%+ 탐지 정확도 + 300ms 이하 지연(벤더 자체 수치)"]},
Platform:{type:["neu","neu","neg"],bullets:["Bedrock/Copilot Studio API 연동한 패시브 모니터링 지원","인라인 차단 게이트웨이 배포 옵션 제공","LCNC/SaaS 자동화 자체 심층 통합은 제한적"]},
Identity:{type:["neg","neg","neg"],bullets:["NHI Inventory/Lifecycle 관리 영역 아님","자격증명 로테이션/오프보딩 미지원","Agent 신원 관리는 Scope 밖"]},
ShadowAI:{type:["neu","neu","neg"],bullets:["Data Exfiltration Prevention으로 민감정보 유출 일부 차단","Agent/MCP 사용 흐름 가시화는 Enterprise 배포 Agent 중심","개인 브라우저 기반 Shadow AI 탐지는 미지원"]}
},
"MS Agent 365":{
Model:{type:["neu","pos","neu"],bullets:["Azure AI Content Safety/Prompt Shield와 연계한 Injection 차단","<strong>Defender 통합으로 모델 입출력 위협 탐지</strong>","타사 LLM(OpenAI API 직접 호출 등)에는 커버리지 제한적"]},
Agent:{type:["pos","pos","neu"],bullets:["<strong>Entra Agent ID로 모든 Agent에 고유 신원 부여 - Registry에서 전사 Agent 목록화</strong>","<strong>Conditional Access 정책을 Agent 행동에도 동일 적용</strong>","타사 플랫폼(AWS/GCP) Agent는 가시성 위주, 심층 Runtime 제어는 제한적"]},
Platform:{type:["pos","pos","pos"],bullets:["<strong>Vendor-Agnostic Control Plane - MS/AWS/GCP/Adobe/Databricks/ServiceNow/SAP Agent까지 통합 거버넌스</strong>","<strong>Copilot Studio/Power Platform 등 MS 생태계 네이티브 통합 최고 수준</strong>","Interoperability 계층으로 타 플랫폼 Agent 간 상호운용 지원"]},
Identity:{type:["pos","pos","pos"],bullets:["<strong>Entra Agent ID - Agent를 1급 시민(First-class Identity)으로 관리하는 핵심 차별점</strong>","<strong>Conditional Access, 라이프사이클 자동화(생성-권한부여-폐기) 전 구간 지원</strong>","Purview/Defender와 연계한 Agent 자격증명 통합 가시성"]},
ShadowAI:{type:["neu","neu","neg"],bullets:["Defender for Cloud Apps로 미승인 SaaS/AI 사용 일부 탐지","Edge for Business 브라우저 사용에 의존적","비-MS 생태계에서의 개인 AI 사용 탐지는 제한적"]}
},
"Noma Security":{
Model:{type:["pos","pos","pos"],bullets:["<strong>AI-SPM으로 Bedrock/Azure OpenAI/SageMaker 등 모델 자산·설정 취약점 자동 발견</strong>","<strong>AI Red Teaming으로 배포 전 Prompt Injection/Jailbreak 사전 검증</strong>","Data Poisoning/학습 데이터 무결성 탐지"]},
Agent:{type:["pos","pos","neu"],bullets:["<strong>AI-DR(런타임 탐지·대응)로 Agent 이상행동 실시간 모니터링</strong>","Copilot Studio/Agentforce 등 SaaS Agent와 자체 개발 Agent 모두 커버","코딩 어시스턴트/MCP 서버 보안은 최근 확장 영역"]},
Platform:{type:["pos","pos","neu"],bullets:["<strong>80개 이상 통합 - 클라우드 3사 + 주요 SaaS Agent 빌더 광범위 커버</strong>","<strong>AWS Security Hub Extended Plan 정식 편입(2026.2)</strong>","Power Platform 등 MS LCNC 심층 통합은 상대적으로 약함"]},
Identity:{type:["neu","neu","neg"],bullets:["AI 관련 Service Account/API Key 일부 가시화","Access Control 모듈로 과도 권한 탐지 지원","전체 NHI Lifecycle(회전/폐기 자동화)은 제한적"]},
ShadowAI:{type:["neu","neg","neg"],bullets:["AI 자산 Inventory 기반 미승인 AI 사용 일부 식별","실시간 브라우저 레벨 차단 기능은 약함","개인 계정 기반 사용 탐지는 부차적 기능"]}
},
"Palo Alto Prisma AIRS":{
Model:{type:["pos","pos","pos"],bullets:["<strong>Protect AI 인수(약 5억 달러, 2025.7 완료)로 모델 스캐닝/AI-SPM 확보 - 업계 최대 규모</strong>","<strong>Portkey AI Gateway로 런타임 트래픽 검사 + AI Observability</strong>","Model Extraction/Data Poisoning 탐지를 스캐너 단계에서 수행"]},
Agent:{type:["pos","pos","neu"],bullets:["<strong>Koi Security 인수(약 4억 달러, 2026.4 완료) 기반 'Agentic Endpoint Security' - 브라우저 확장/패키지/MCP를 엔드포인트에서 직접 통제</strong>","<strong>Portkey의 'Idira' 기술로 Agent Identity 부여 및 추적</strong>","'Wings' 리스크 엔진으로 Supply Chain 리스크 실시간 평가"]},
Platform:{type:["pos","pos","pos"],bullets:["<strong>기존 Prisma Cloud/SASE 고객 기반 위에 AI 보안 전 계층을 하나의 플랫폼으로 통합</strong>","<strong>3개 인수(Protect AI/Koi/Portkey)를 Prisma AIRS 단일 브랜드로 재편 - 최광범위 커버리지</strong>","커넥터/API/Supply Chain을 Wings 엔진이 통합 스코어링"]},
Identity:{type:["pos","pos","neu"],bullets:["<strong>Portkey Idira로 Agent 단위 신원 및 권한 추적</strong>","AI 트래픽 게이트웨이를 통한 자격증명 사용 패턴 가시화","NHI Lifecycle 전 구간 자동화는 통합 초기 단계"]},
ShadowAI:{type:["neu","neu","pos"],bullets:["엔드포인트(Koi) 기반 브라우저 확장 설치 현황 파악으로 섀도 도구 일부 식별","AI Gateway를 우회하는 개인 기기 사용은 탐지 범위 밖일 수 있음","<strong>브라우저 확장/패키지/데이터셋까지 엔드포인트 레벨 가시성 확보(Koi 강점)</strong>"]}
},
"CrowdStrike AIDR":{
Model:{type:["pos","pos","neu"],bullets:["<strong>Prompt Injection 탐지율 최대 99%(벤더 자체 수치) 실시간 차단</strong>","<strong>민감 데이터 마스킹/암호화를 모델 도달 전 단계에서 수행</strong>","Model Extraction 자체 탐지는 제한적"]},
Agent:{type:["neu","neu","neu"],bullets:["User-Prompt-Model-Agent-MCP 관계 맵핑으로 Agent 행동 가시화","MCP Proxy로 Tool 호출 흐름 추적","Agent Runtime 심층 개입(정책 강제)은 상대적으로 얕음"]},
Platform:{type:["neu","neu","neg"],bullets:["AI Gateway 연동을 통한 API/트래픽 가시성 확보","Falcon 플랫폼과의 통합 배포(SDK/브라우저 확장)","Copilot Studio/Power Platform 등 LCNC 심층 통합은 제한적"]},
Identity:{type:["neg","neg","neu"],bullets:["NHI Lifecycle 관리 기능은 제공하지 않음","Service Account/OAuth App Inventory는 부차적","Agent 신원은 MCP 관계 맵 안에서만 부분 파악"]},
ShadowAI:{type:["pos","pos","pos"],bullets:["<strong>브라우저 확장(Chrome/Edge/Firefox) 기반 전사 AI 사용 가시성 핵심 강점</strong>","<strong>승인되지 않은 AI 서비스 사용 및 민감정보 입력을 실시간 탐지·차단</strong>","Shadow AI 거버넌스를 Falcon 콘솔에서 통합 관리"]}
},
"SentinelOne":{
Model:{type:["pos","pos","pos"],bullets:["<strong>Prompt Security 인수(2025.9 완료, 약 1.34억 달러+주식)로 주요 LLM 전반의 Prompt Injection/Jailbreak/유출 탐지 확보</strong>","<strong>RSAC 2026에서 'Prompt AI Red Teaming' 신규 공개</strong>","AWS Bedrock AgentCore 런타임 가드레일 통합"]},
Agent:{type:["pos","pos","neu"],bullets:["<strong>MCP Gateway로 13,000개 이상 알려진 MCP 서버를 프록시하며 동적 위험 스코어링</strong>","<strong>Purple AI(AI SOC 분석가)와 연계해 Agent 위협 탐지-대응 자동화</strong>","Goal Hijack/Memory Poisoning 등 세부 행동 통제는 게이트웨이 레벨에 한정"]},
Platform:{type:["neu","neu","neg"],bullets:["MCP Gateway를 통한 API 트래픽 가시성 확보","Bedrock 등 클라우드 AI 런타임과의 통합 확대 중","Copilot Studio/Power Platform 등 LCNC 통합은 약함"]},
Identity:{type:["neg","neg","neu"],bullets:["NHI Inventory/Lifecycle 전용 기능 부재","자격증명 로테이션/오프보딩 미지원","MCP 서버 단위 접근 권한은 게이트웨이에서 부분 파악"]},
ShadowAI:{type:["neu","neu","neu"],bullets:["MCP Gateway가 다루지 않는 순수 브라우저 기반 개인 AI 사용은 별도 커버 필요","Purple AI 콘솔에서 AI 사용 이벤트 통합 조회 가능","전사 Shadow AI 전용 브라우저 확장 통제는 부차적"]}
},
"Onyx Security":{
Model:{type:["neg","neg","neg"],bullets:["모델 자체 방어(Prompt Injection/Extraction) 영역 아님","Hallucination 검증 기능 없음","모델 계층은 Scope 밖"]},
Agent:{type:["pos","pos","pos"],bullets:["<strong>Guardian Agent가 Agent 행동을 실시간 모니터링하고 위험 액션 차단</strong>","<strong>권한 자동 축소(Least Privilege) 및 Human-in-the-loop 승인 요구 핵심 차별점</strong>","Anthropic이 자사 엔터프라이즈 고객 대상 Onyx 기술 통합 발표(2026.6)"]},
Platform:{type:["neg","neg","neu"],bullets:["LCNC/SaaS 자동화 플랫폼 심층 통합은 초기 단계","Connector/Supply Chain 위험 분석은 제한적","Agent가 호출하는 API/Tool 목록은 권한 관리 관점에서 일부 파악"]},
Identity:{type:["pos","pos","pos"],bullets:["<strong>자율 Agent에 IAM과 동등한 신원/권한 거버넌스 최초 적용 - 핵심 포지셔닝</strong>","<strong>과도 권한 자동 탐지 및 축소 적용</strong>","Agent 권한 변경 이력 감사 추적 지원"]},
ShadowAI:{type:["neg","neg","neg"],bullets:["브라우저 기반 개인 AI 사용 탐지 기능 없음","Enterprise Agent 권한 거버넌스에 집중, Shadow AI 가시성은 부차적","비승인 AI 서비스 자체 탐지는 지원하지 않음"]}
},
"Airia":{
Model:{type:["neu","neu","neg"],bullets:["Runtime Security Enforcement로 Prompt Injection 방어 정책 적용","모델 라우팅 과정에서 일부 안전 필터링 수행","Model Extraction/Hallucination 전용 탐지는 제한적"]},
Agent:{type:["pos","pos","neu"],bullets:["<strong>Tool Misuse 방지 및 Runtime 정책 강제</strong>","<strong>A2A/MCP 프로토콜 거버넌스로 Agent 간 통신 통제</strong>","Memory Poisoning 세부 탐지는 상대적으로 약함"]},
Platform:{type:["pos","pos","neu"],bullets:["<strong>Copilot/Bedrock/Salesforce/n8n 등 Cross-Platform Discovery로 여러 자동화 플랫폼 통합 가시화</strong>","<strong>RBAC + EU AI Act/NIST AI RMF/HIPAA/ISO 42001/SOC 2 컴플라이언스 매핑</strong>","Model Routing 기능은 보안보다 오케스트레이션에 더 초점"]},
Identity:{type:["neu","neu","neg"],bullets:["RBAC 기반 Agent/사용자 권한 관리 지원","Cross-Platform Discovery로 Agent 신원 일부 파악","NHI Lifecycle 자동화(로테이션/오프보딩)는 제한적"]},
ShadowAI:{type:["pos","pos","neu"],bullets:["<strong>여러 플랫폼(Copilot/Bedrock/Salesforce/n8n)에 흩어진 Shadow AI 사용 통합 발견</strong>","<strong>데이터 유출 통제(Data Leakage Controls)로 민감정보 이동 제한</strong>","개인 브라우저 기반 사용 탐지는 플랫폼 연동 범위로 한정"]}
},
"Akto":{
Model:{type:["neu","neu","neg"],bullets:["60개 이상 자동화된 LLM/OWASP Top 10 테스트 케이스로 모델 응답 취약점 점검","1,000개 이상 Exploit 테스트로 Prompt Injection 등 실제 공격 시뮬레이션","Hallucination 등 정성적 품질 이슈는 커버 범위 밖"]},
Agent:{type:["pos","neu","neu"],bullets:["<strong>MCP/Agent 자동 발견 및 Agentic Posture Management 신규 기능(2025.9~)</strong>","OWASP ASI(Agentic Security Initiative) 매핑 가드레일 제공","Runtime 개입(차단)보다 테스트/포스처 관리 중심"]},
Platform:{type:["pos","pos","pos"],bullets:["<strong>API Discovery/Shadow API/Zombie API 탐지에서 시장 검증된 강점을 AI 계층까지 확장</strong>","<strong>엔드포인트 레벨 AI/MCP/LLM 트래픽 추적(2026.2~7 기능 확대) - MS Defender for Endpoint 연동</strong>","EU AI Act 컴플라이언스 매핑 지원"]},
Identity:{type:["neg","neg","neg"],bullets:["NHI/API Key Inventory는 API 보안 관점의 부차적 기능","Agent 신원 관리 전용 기능 없음","Lifecycle 자동화(로테이션/오프보딩) 미지원"]},
ShadowAI:{type:["neu","neg","neg"],bullets:["엔드포인트 기반 미승인 LLM/MCP 사용 흔적 일부 탐지","브라우저 레벨 실시간 차단 기능은 약함","개인 계정 기반 사용 통제는 Scope 밖"]}
}
};

var vendorClusters=[
{name:"Agent Behavior & Runtime Defense",trait:"// Agent 행동/Runtime 방어에 강점, Identity/Shadow AI 거버넌스는 상대적으로 약함",members:["Zenity","Straiker","Noma Security"],pattern:{Model:3.33,Agent:4.33,Platform:3.67,Identity:2.67,ShadowAI:2.67}},
{name:"Identity & Agent Governance (IAM-for-Agents)",trait:"// Agent/NHI에 IAM 수준 거버넌스 적용, 모델 자체 방어는 약함",members:["Grip Security","MS Agent 365","Onyx Security"],pattern:{Model:1.67,Agent:3.67,Platform:3.33,Identity:5.0,ShadowAI:3.33}},
{name:"Platform Giants - Converged AI Security Suites",trait:"// 대형 보안 플랫폼의 인수 기반 AI 보안 확장 - Model/Platform 전방위 강함",members:["Palo Alto Prisma AIRS","CrowdStrike AIDR","SentinelOne"],pattern:{Model:4.67,Agent:3.67,Platform:3.67,Identity:2.67,ShadowAI:3.67}},
{name:"Automation/API-Adjacent Builders",trait:"// 오케스트레이션/API 계층에서 AI 자산을 발견하고 보호, Identity는 부차적",members:["Airia","Akto"],pattern:{Model:3.0,Agent:3.5,Platform:4.5,Identity:2.5,ShadowAI:3.5}}
];

vendors.forEach(function(v){
v.threatScores={};
layers.forEach(function(layer){
threatDomains[layer].forEach(function(d){
v.threatScores[d]=v.scores[layer];
});
});
});
