var pocMeta={
title:"AI 보안 솔루션 PoC",
startDate:"2026-07-01",
targetDate:"2026-11-30",
sponsor:"AX Security Pivot TF"
};

var pocPhases=["계약/Kickoff","환경구성","기능테스트","보안검증","최종평가"];

/*
currentPhaseIndex: -1(시작 전) ~ 4(최종평가 진행/완료), pocPhases 인덱스와 동일
status: not-started | on-track | delayed | blocked | completed
아래 값은 전부 샘플 데이터 - 실제 JIRA 연동 전까지 화면 레이아웃 검증용
*/
var pocVendors=[
{name:"Zenity",currentPhaseIndex:2,status:"on-track",owner:"TBD",dueDate:"2026-09-15",progressPct:45,notes:"(샘플 데이터 - 실제 값으로 교체 필요)",updatedAt:"2026-08-20"},
{name:"Grip Security",currentPhaseIndex:1,status:"on-track",owner:"TBD",dueDate:"2026-09-30",progressPct:25,notes:"(샘플 데이터 - 실제 값으로 교체 필요)",updatedAt:"2026-08-18"},
{name:"Straiker",currentPhaseIndex:-1,status:"not-started",owner:"TBD",dueDate:"-",progressPct:0,notes:"(샘플 데이터 - 실제 값으로 교체 필요)",updatedAt:"-"},
{name:"MS Agent 365",currentPhaseIndex:3,status:"on-track",owner:"TBD",dueDate:"2026-09-10",progressPct:70,notes:"(샘플 데이터 - 실제 값으로 교체 필요)",updatedAt:"2026-08-22"},
{name:"Noma Security",currentPhaseIndex:2,status:"delayed",owner:"TBD",dueDate:"2026-09-20",progressPct:40,notes:"(샘플 데이터 - 실제 값으로 교체 필요)",updatedAt:"2026-08-15"},
{name:"Palo Alto Prisma AIRS",currentPhaseIndex:4,status:"completed",owner:"TBD",dueDate:"2026-08-25",progressPct:100,notes:"(샘플 데이터 - 실제 값으로 교체 필요)",updatedAt:"2026-08-25"},
{name:"CrowdStrike AIDR",currentPhaseIndex:1,status:"blocked",owner:"TBD",dueDate:"2026-09-25",progressPct:15,notes:"(샘플 데이터 - 실제 값으로 교체 필요)",updatedAt:"2026-08-10"},
{name:"SentinelOne",currentPhaseIndex:0,status:"on-track",owner:"TBD",dueDate:"2026-10-05",progressPct:10,notes:"(샘플 데이터 - 실제 값으로 교체 필요)",updatedAt:"2026-08-19"},
{name:"Onyx Security",currentPhaseIndex:-1,status:"not-started",owner:"TBD",dueDate:"-",progressPct:0,notes:"(샘플 데이터 - 실제 값으로 교체 필요)",updatedAt:"-"},
{name:"Airia",currentPhaseIndex:2,status:"on-track",owner:"TBD",dueDate:"2026-09-18",progressPct:50,notes:"(샘플 데이터 - 실제 값으로 교체 필요)",updatedAt:"2026-08-21"},
{name:"Akto",currentPhaseIndex:1,status:"delayed",owner:"TBD",dueDate:"2026-09-28",progressPct:20,notes:"(샘플 데이터 - 실제 값으로 교체 필요)",updatedAt:"2026-08-14"}
];

var recentUpdates=[
{date:"2026-08-25",vendor:"Palo Alto Prisma AIRS",message:"최종평가 완료 (샘플 데이터)"},
{date:"2026-08-22",vendor:"MS Agent 365",message:"보안검증 단계 진입 (샘플 데이터)"},
{date:"2026-08-21",vendor:"Airia",message:"기능테스트 진행 중 (샘플 데이터)"},
{date:"2026-08-20",vendor:"Zenity",message:"기능테스트 50% 완료 (샘플 데이터)"},
{date:"2026-08-19",vendor:"SentinelOne",message:"계약/Kickoff 진행 중 (샘플 데이터)"},
{date:"2026-08-18",vendor:"Grip Security",message:"환경구성 착수 (샘플 데이터)"},
{date:"2026-08-15",vendor:"Noma Security",message:"기능테스트 일정 지연 발생 (샘플 데이터)"},
{date:"2026-08-10",vendor:"CrowdStrike AIDR",message:"환경구성 단계 블로커 발생 (샘플 데이터)"}
];
