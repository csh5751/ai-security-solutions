var statusLabels={
"not-started":"시작 전",
"on-track":"정상 진행",
"delayed":"지연",
"blocked":"차단됨",
"completed":"완료"
};

var statusFilters=["all","on-track","delayed","blocked","completed","not-started"];
var progressFilter="all";

document.addEventListener("DOMContentLoaded",function(){
var page=document.body.getAttribute("data-page");
if(page==="dashboard")renderDashboard();
else if(page==="progress")renderProgress();
else if(page==="timeline")renderTimeline();
else if(page==="reports")renderReports();
});

function sampleBanner(extra){
return '<div class="sample-banner">SAMPLE DATA — 아래 수치는 예시이며, JIRA 연동 전 화면 구성 확인용입니다.'+(extra?' '+extra:'')+'</div>';
}

function statusBadge(status){
return '<span class="status-badge status-'+status+'">'+statusLabels[status]+'</span>';
}

function progressBar(pct){
return '<div class="progress-bar-track"><div class="progress-bar-fill" style="width:'+pct+'%"></div></div>';
}

function phaseLabelOf(idx){
return idx===-1?"시작 전":pocPhases[idx];
}

function daysBetween(a,b){
return Math.round((b-a)/86400000);
}

function renderDashboard(){
var root=document.getElementById("root");
var avgPct=Math.round(pocVendors.reduce(function(s,v){return s+v.progressPct;},0)/pocVendors.length);
var completedCount=pocVendors.filter(function(v){return v.status==="completed";}).length;
var inProgressCount=pocVendors.filter(function(v){return v.status!=="not-started"&&v.status!=="completed";}).length;
var notStartedCount=pocVendors.filter(function(v){return v.status==="not-started";}).length;
var today=new Date();
var target=new Date(pocMeta.targetDate);
var dday=daysBetween(today,target);
var ddayText=dday>=0?("D-"+dday):("D+"+Math.abs(dday));

var html=sampleBanner();
html+='<div class="hero"><div><h1>'+pocMeta.title+' <span class="accent">대시보드</span></h1><p>// '+pocMeta.startDate+' ~ '+pocMeta.targetDate+' · Sponsor: '+pocMeta.sponsor+'</p></div><span class="badge">'+pocVendors.length+' VENDORS</span></div>';

html+='<div class="dash-stats">';
html+='<div class="dash-stat-card"><div class="dash-stat-label">전체 평균 진행률</div><div class="dash-stat-value">'+avgPct+'%</div><div class="dash-stat-sub">11개 벤더 평균</div></div>';
html+='<div class="dash-stat-card"><div class="dash-stat-label">완료 벤더</div><div class="dash-stat-value">'+completedCount+' / '+pocVendors.length+'</div><div class="dash-stat-sub">최종평가 완료 기준</div></div>';
html+='<div class="dash-stat-card"><div class="dash-stat-label">진행중 벤더</div><div class="dash-stat-value">'+inProgressCount+'</div><div class="dash-stat-sub">미착수 '+notStartedCount+'</div></div>';
html+='<div class="dash-stat-card"><div class="dash-stat-label">목표 완료일까지</div><div class="dash-stat-value">'+ddayText+'</div><div class="dash-stat-sub">'+pocMeta.targetDate+' 목표</div></div>';
html+='</div>';

html+=section("01","벤더별 진행 상태","// 상태 배지 + 진행률");
html+='<div class="vendor-status-grid">';
pocVendors.forEach(function(v){
html+='<div class="vendor-status-card"><div class="vsc-top"><span class="vsc-name">'+v.name+'</span>'+statusBadge(v.status)+'</div><div class="vsc-phase">'+phaseLabelOf(v.currentPhaseIndex)+'</div>'+progressBar(v.progressPct)+'<div class="dash-stat-sub" style="margin-top:6px;">완료예정 '+v.dueDate+'</div></div>';
});
html+='</div>';

html+=section("02","최근 업데이트","// 최신순");
recentUpdates.forEach(function(u){
html+='<div class="update-log-item"><span class="update-log-date">'+u.date+'</span><span class="update-log-vendor">'+u.vendor+'</span><span class="update-log-msg">'+u.message+'</span></div>';
});

html+=section("03","바로가기","// 메뉴별 상세 화면");
html+='<div class="quick-nav-grid">';
html+='<a class="quick-nav-card" href="map.html"><div class="qnc-title">Vendor Map</div><div class="qnc-desc">11개 벤더 5-Layer 비교, 레이더차트, 히트맵, 유사도 분석</div></a>';
html+='<a class="quick-nav-card" href="progress.html"><div class="qnc-title">PoC 진행현황</div><div class="qnc-desc">벤더 × 단계 매트릭스, 담당자/일정/메모</div></a>';
html+='<a class="quick-nav-card" href="timeline.html"><div class="qnc-title">로드맵</div><div class="qnc-desc">벤더별 타임라인 + Kickoff/중간점검/최종보고 마일스톤</div></a>';
html+='<a class="quick-nav-card" href="reports.html"><div class="qnc-title">평가 리포트</div><div class="qnc-desc">PoC 완료 벤더의 최종 스코어카드</div></a>';
html+='</div>';

root.innerHTML=html;
}

function renderProgress(){
var root=document.getElementById("root");
var html=sampleBanner();
html+='<div class="hero"><div><h1>PoC <span class="accent">진행현황</span></h1><p>// 벤더 × 단계 매트릭스</p></div><span class="badge">'+pocVendors.length+' VENDORS</span></div>';

html+='<div class="filter-chips">';
statusFilters.forEach(function(f){
var label=f==="all"?"전체":statusLabels[f];
html+='<span class="filter-chip'+(f===progressFilter?' active':'')+'" data-filter="'+f+'">'+label+'</span>';
});
html+='</div>';

html+='<div class="progress-table-wrap"><table class="progress-matrix"><thead><tr><th>Vendor</th>';
pocPhases.forEach(function(p){html+='<th>'+p+'</th>';});
html+='<th>Status</th><th>진행률</th><th>담당자</th><th>완료예정일</th><th>메모</th></tr></thead><tbody id="progressBody"></tbody></table></div>';

root.innerHTML=html;
renderProgressBody();

var chips=document.querySelectorAll(".filter-chip");
for(var i=0;i<chips.length;i++){
chips[i].onclick=function(){
progressFilter=this.getAttribute("data-filter");
var all=document.querySelectorAll(".filter-chip");
for(var j=0;j<all.length;j++)all[j].className="filter-chip";
this.className="filter-chip active";
renderProgressBody();
};
}
}

function renderProgressBody(){
var tbody=document.getElementById("progressBody");
var rows=pocVendors.filter(function(v){return progressFilter==="all"||v.status===progressFilter;});
var html="";
rows.forEach(function(v){
html+='<tr><td style="font-weight:700;">'+v.name+'</td>';
pocPhases.forEach(function(p,idx){
var cls="phase-cell";
if(v.status==="completed"||idx<v.currentPhaseIndex)cls+=" done";
else if(idx===v.currentPhaseIndex)cls+=" current";
html+='<td class="'+cls+'">●</td>';
});
html+='<td>'+statusBadge(v.status)+'</td><td>'+progressBar(v.progressPct)+'</td><td>'+v.owner+'</td><td>'+v.dueDate+'</td><td class="progress-note">'+v.notes+'</td></tr>';
});
if(!rows.length)html='<tr><td colspan="'+(pocPhases.length+5)+'" class="report-empty">해당 상태의 벤더가 없습니다.</td></tr>';
tbody.innerHTML=html;
}

function renderTimeline(){
var root=document.getElementById("root");
var today=new Date();
var start=new Date(pocMeta.startDate);
var target=new Date(pocMeta.targetDate);
var mid=new Date((start.getTime()+target.getTime())/2);

var html=sampleBanner();
html+='<div class="hero"><div><h1>PoC <span class="accent">로드맵</span></h1><p>// '+pocMeta.startDate+' ~ '+pocMeta.targetDate+'</p></div><span class="badge">5 PHASES</span></div>';

html+=section("01","마일스톤","// Kickoff / 중간점검 / 최종보고");
var milestones=[
{label:"Kickoff",date:pocMeta.startDate,done:today>=start},
{label:"중간점검",date:mid.toISOString().slice(0,10),done:today>=mid},
{label:"최종보고",date:pocMeta.targetDate,done:today>=target}
];
var firstUpcomingMarked=false;
html+='<div class="milestone-row">';
milestones.forEach(function(m){
var dotCls="milestone-dot";
if(m.done)dotCls+=" done";
else if(!firstUpcomingMarked){dotCls+=" upcoming";firstUpcomingMarked=true;}
html+='<div class="milestone"><div class="'+dotCls+'"></div><div class="milestone-label">'+m.label+'</div><div class="milestone-date">'+m.date+'</div></div>';
});
html+='</div>';

html+=section("02","벤더별 타임라인","// 단계별 진행 구간");
html+='<div class="timeline-header"><div class="timeline-vendor-name"></div><div class="timeline-header-track">';
pocPhases.forEach(function(p){html+='<span>'+p+'</span>';});
html+='</div></div>';
pocVendors.forEach(function(v){
html+='<div class="timeline-row"><div class="timeline-vendor-name">'+v.name+'</div><div class="timeline-track">';
pocPhases.forEach(function(p,idx){
var cls="timeline-phase-seg";
if(v.status==="completed"||idx<v.currentPhaseIndex)cls+=" filled";
else if(idx===v.currentPhaseIndex)cls+=" current";
html+='<div class="'+cls+'"></div>';
});
html+='</div></div>';
});

root.innerHTML=html;
}

function findVendorScores(name){
for(var i=0;i<vendors.length;i++){
if(vendors[i].name===name)return vendors[i];
}
return null;
}

function totalScoreOf(v){
var sum=0;
layers.forEach(function(l){sum+=v.scores[l];});
return sum;
}

function renderReports(){
var root=document.getElementById("root");
var completed=pocVendors.filter(function(v){return v.status==="completed";});

var html=sampleBanner("완료 벤더 목록도 샘플 상태 기준입니다.");
html+='<div class="hero"><div><h1>평가 <span class="accent">리포트</span></h1><p>// PoC 완료 벤더 스코어카드</p></div><span class="badge">'+completed.length+' COMPLETED</span></div>';

if(!completed.length){
html+='<div class="report-empty">완료된 PoC가 없습니다. 벤더 PoC가 최종평가 단계를 완료하면 이곳에 스코어카드가 표시됩니다.</div>';
root.innerHTML=html;
return;
}

completed.forEach(function(poc){
var v=findVendorScores(poc.name);
if(!v)return;
var total=totalScoreOf(v);
html+='<div class="single-vendor report-card"><div class="vh"><span class="vn">'+v.name+'</span><span class="total-pill">TOTAL '+total+'/25</span></div>';
html+='<div class="vh-tag">PoC 완료일: '+poc.updatedAt+' · 담당자: '+poc.owner+'</div>';
html+='<div style="display:flex;gap:10px;margin:14px 0;flex-wrap:wrap;">';
layers.forEach(function(l){
html+='<div style="text-align:center;"><div class="mini-score s-'+v.scores[l]+'" style="margin:0 auto 6px;">'+v.scores[l]+'</div><div style="font-size:9px;color:#5A6478;font-family:monospace;text-transform:uppercase;">'+layerLabels[l]+'</div></div>';
});
html+='</div>';
html+='<div style="font-size:12px;color:#7A8499;">'+poc.notes+'</div>';
html+='<div style="margin-top:14px;"><a href="map.html" style="color:#FF6B35;font-family:monospace;font-size:11px;text-decoration:none;">→ Vendor Map에서 상세 비교 보기</a></div>';
html+='</div>';
});

root.innerHTML=html;
}

function section(num,title,sub){
return '<div class="sec-header"><span class="num">['+num+']</span><span class="title">'+title+'</span><span class="sub">'+sub+'</span></div><div class="divider"></div>';
}
