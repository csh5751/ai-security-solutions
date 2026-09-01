var statusLabels={
"not-started":"시작 전",
"on-track":"정상 진행",
"delayed":"지연",
"completed":"완료",
"pending":"보류",
"cancelled":"중단/취소"
};

var statusFilters=["all","on-track","delayed","completed","not-started","pending","cancelled"];
var progressFilter="all";
var dataSource="fallback";
var sortState={field:null,dir:null};

var editMode=false;
var editToken=null;
try{editToken=localStorage.getItem("pocEditToken")}catch(e){}

var covCategoryFilter="all";
var covSearchText="";
var covSortState={field:null,dir:null};
var COVERAGE_LABELS={full:"전체지원",partial:"부분지원",none:"미지원",unknown:"확인필요"};
var COVERAGE_VALUES=["full","partial","none","unknown"];

function applyServerData(d){
if(!d)return;
if(d.pocMeta)pocMeta=d.pocMeta;
if(Array.isArray(d.pocPhases))pocPhases=d.pocPhases;
if(Array.isArray(d.pocVendors))pocVendors=d.pocVendors;
if(Array.isArray(d.recentUpdates))recentUpdates=d.recentUpdates;
if(Array.isArray(d.covRows))covRows=d.covRows;
mergeMapVendors(d);
}

function rerenderCurrentPage(){
var page=document.body.getAttribute("data-page");
if(page==="progress")renderProgress();
else if(page==="coverage")renderCoverage();
}

function mergeMapVendors(doc){
if(typeof vendors==="undefined")return;
if(!doc||!Array.isArray(doc.mapVendors))return;
doc.mapVendors.forEach(function(mv){
var exists=false;
for(var i=0;i<vendors.length;i++){if(vendors[i].name===mv.name){exists=true;break;}}
if(exists)return;
var v={name:mv.name,color:mv.color,scores:mv.scores,threatScores:{}};
layers.forEach(function(layer){
threatDomains[layer].forEach(function(d2){v.threatScores[d2]=v.scores[layer];});
});
vendors.push(v);
vendorSpecialty[mv.name]=mv.specialty;
vendorBadges[mv.name]=mv.badges||[];
if(mv.extRationale)vendorExtRationale[mv.name]=mv.extRationale;
if(mv.rationale)vendorRationale[mv.name]=mv.rationale;
});
}

async function loadData(){
try{
var res=await fetch("/api/data");
if(!res.ok)throw new Error("bad status");
var d=await res.json();
applyServerData(d);
dataSource="live";
}catch(e){
dataSource="fallback";
}
}

document.addEventListener("DOMContentLoaded",function(){
var page=document.body.getAttribute("data-page");
loadData().then(function(){
if(page==="dashboard"){
renderDashboard();
var vendorNameFitTimer;
window.addEventListener("resize",function(){
clearTimeout(vendorNameFitTimer);
vendorNameFitTimer=setTimeout(fitVendorNames,150);
});
}
else if(page==="progress")renderProgress();
else if(page==="coverage")renderCoverage();
else if(page==="timeline")renderTimeline();
else if(page==="reports")renderReports();
});
});

function sampleBanner(extra){
if(dataSource==="live")return "";
return '<div class="sample-banner">SAMPLE DATA — 서버 데이터를 불러오지 못해 예시 값으로 표시 중입니다.'+(extra?' '+extra:'')+'</div>';
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

function phaseLegendHtml(){
var html='<div class="phase-legend">';
pocPhases.forEach(function(p,idx){
html+='<span class="pl-item"><span class="pl-num">'+(idx+1)+'</span>'+p+'</span>';
});
html+='</div>';
return html;
}

function sortArrowHtml(field){
if(sortState.field!==field)return '<span class="sort-arrow"></span>';
return '<span class="sort-arrow active">'+(sortState.dir==="asc"?"▲":"▼")+'</span>';
}

function onSortClick(field){
if(sortState.field!==field){
sortState.field=field;
sortState.dir="asc";
}else if(sortState.dir==="asc"){
sortState.dir="desc";
}else{
sortState.field=null;
sortState.dir=null;
}
renderProgress();
}

function sortedVendors(list){
if(!sortState.field)return list;
var field=sortState.field;
var dir=sortState.dir;
var copy=list.slice();
copy.sort(function(a,b){
var av=a[field],bv=b[field];
if(field==="status"){av=statusLabels[av]||av;bv=statusLabels[bv]||bv;}
if(typeof av==="string")av=av.toLowerCase();
if(typeof bv==="string")bv=bv.toLowerCase();
if(av<bv)return dir==="asc"?-1:1;
if(av>bv)return dir==="asc"?1:-1;
return 0;
});
return copy;
}

function daysBetween(a,b){
return Math.round((b-a)/86400000);
}

function escapeAttr(s){
return String(s==null?"":s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
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
html+='<div class="dash-stat-card"><div class="dash-stat-label">전체 평균 진행률</div><div class="dash-stat-value">'+avgPct+'%</div><div class="dash-stat-sub">'+pocVendors.length+'개 벤더 평균</div></div>';
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
html+='<a class="quick-nav-card" href="map.html"><div class="qnc-title">Vendor Map</div><div class="qnc-desc">'+pocVendors.length+'개 벤더 5-Layer 비교, 레이더차트, 히트맵, 유사도 분석</div></a>';
html+='<a class="quick-nav-card" href="progress.html"><div class="qnc-title">PoC 진행현황</div><div class="qnc-desc">벤더 × 단계 매트릭스, 담당자/일정/메모</div></a>';
html+='<a class="quick-nav-card" href="timeline.html"><div class="qnc-title">로드맵</div><div class="qnc-desc">벤더별 타임라인 + Kickoff/중간점검/최종보고 마일스톤</div></a>';
html+='<a class="quick-nav-card" href="reports.html"><div class="qnc-title">평가 리포트</div><div class="qnc-desc">PoC 완료 벤더의 최종 스코어카드</div></a>';
html+='</div>';

root.innerHTML=html;
fitVendorNames();
}

function fitVendorNames(){
var els=document.querySelectorAll(".vsc-name");
for(var i=0;i<els.length;i++){
var el=els[i];
el.style.fontSize="";
var size=16;
while(el.scrollWidth>el.clientWidth&&size>11){
size-=0.5;
el.style.fontSize=size+"px";
}
}
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
html+='<span style="margin-left:auto;display:inline-flex;gap:8px;align-items:center;"><span id="reorderStatus" class="edit-save-status"></span><span id="editLoginBox" style="display:none;gap:8px;align-items:center;"></span><span id="addVendorBox" style="display:none;gap:8px;align-items:center;"></span>'+(editMode?'<button class="filter-chip" id="addVendorToggleBtn">+ 업체 추가</button>':'')+'<button class="filter-chip" id="editToggleBtn">'+(editMode?"편집 모드 끄기":"편집 모드 켜기")+'</button></span>';
html+='</div>';

html+=phaseLegendHtml();

html+='<div class="progress-table-wrap"><table class="progress-matrix"><thead><tr>';
html+='<th class="sortable-th" data-sort="name">Vendor'+sortArrowHtml("name")+'</th>';
pocPhases.forEach(function(p,idx){html+='<th class="phase-th" title="'+escapeAttr(p)+'">'+(idx+1)+'</th>';});
html+='<th class="sortable-th" data-sort="status">Status'+sortArrowHtml("status")+'</th>';
html+='<th class="sortable-th" data-sort="progressPct">진행률'+sortArrowHtml("progressPct")+'</th>';
html+='<th>담당자</th>';
html+='<th class="sortable-th" data-sort="dueDate">완료예정일'+sortArrowHtml("dueDate")+'</th>';
html+='<th>메모</th></tr></thead><tbody id="progressBody"></tbody></table></div>';

root.innerHTML=html;
renderProgressBody();

var chips=document.querySelectorAll(".filter-chip[data-filter]");
for(var i=0;i<chips.length;i++){
chips[i].onclick=function(){
progressFilter=this.getAttribute("data-filter");
var all=document.querySelectorAll(".filter-chip[data-filter]");
for(var j=0;j<all.length;j++)all[j].className="filter-chip";
this.className="filter-chip active";
renderProgressBody();
};
}

var sortThs=document.querySelectorAll(".sortable-th");
for(var s=0;s<sortThs.length;s++){
sortThs[s].onclick=function(){
onSortClick(this.getAttribute("data-sort"));
};
}

document.getElementById("editToggleBtn").onclick=onEditToggleClick;
var addBtn=document.getElementById("addVendorToggleBtn");
if(addBtn)addBtn.onclick=showAddVendorPrompt;
}

function onEditToggleClick(){
if(editMode){
editMode=false;
rerenderCurrentPage();
return;
}
if(editToken){
editMode=true;
rerenderCurrentPage();
return;
}
showLoginPrompt();
}

function showLoginPrompt(){
var box=document.getElementById("editLoginBox");
box.style.display="inline-flex";
box.innerHTML='<input type="password" id="editPasswordInput" class="edit-field" placeholder="편집 비밀번호"><button class="filter-chip" id="editLoginSubmit">확인</button><span id="editLoginError" style="color:var(--status-bad-text);font-size:12.5px;"></span>';
document.getElementById("editLoginSubmit").onclick=submitLogin;
document.getElementById("editPasswordInput").addEventListener("keydown",function(e){
if(e.key==="Enter")submitLogin();
});
document.getElementById("editPasswordInput").focus();
}

async function submitLogin(){
var input=document.getElementById("editPasswordInput");
var errEl=document.getElementById("editLoginError");
var pw=input.value;
errEl.textContent="확인 중...";
try{
var res=await fetch("/api/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({password:pw})
});
if(!res.ok)throw new Error("login failed");
var data=await res.json();
editToken=data.token;
try{localStorage.setItem("pocEditToken",editToken)}catch(e){}
editMode=true;
rerenderCurrentPage();
}catch(e){
errEl.textContent="비밀번호가 올바르지 않습니다.";
}
}

function showAddVendorPrompt(){
var box=document.getElementById("addVendorBox");
box.style.display="inline-flex";
box.innerHTML='<input type="text" id="addVendorInput" class="edit-field" placeholder="업체명 입력"><button class="filter-chip" id="addVendorSubmit">확인</button><span id="addVendorStatus" style="color:var(--text-faint);font-size:12.5px;"></span>';
document.getElementById("addVendorSubmit").onclick=function(){
addVendor(document.getElementById("addVendorInput").value);
};
document.getElementById("addVendorInput").addEventListener("keydown",function(e){
if(e.key==="Enter")addVendor(document.getElementById("addVendorInput").value);
});
document.getElementById("addVendorInput").focus();
}

async function addVendor(name){
var statusEl=document.getElementById("addVendorStatus");
var submitBtn=document.getElementById("addVendorSubmit");
var trimmed=(name||"").trim();
if(!trimmed){
if(statusEl)statusEl.textContent="업체명을 입력해주세요.";
return;
}
if(statusEl)statusEl.textContent="검색 중... (10~20초 소요될 수 있습니다)";
if(submitBtn)submitBtn.disabled=true;
try{
var res=await fetch("/api/add-vendor",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+editToken
},
body:JSON.stringify({vendorName:trimmed})
});
if(res.status===401){
editToken=null;
editMode=false;
try{localStorage.removeItem("pocEditToken")}catch(e){}
alert("편집 세션이 만료되었습니다. 비밀번호를 다시 입력해주세요.");
renderProgress();
return;
}
var data=await res.json();
if(!res.ok){
if(statusEl)statusEl.textContent=data.error||"추가 실패";
if(submitBtn)submitBtn.disabled=false;
return;
}
applyServerData(data);
dataSource="live";
renderProgress();
var statusEl2=document.getElementById("reorderStatus");
if(statusEl2)statusEl2.textContent="'"+data.resolvedName+"' 추가 완료";
}catch(e){
if(statusEl)statusEl.textContent="추가 실패 (네트워크 오류)";
if(submitBtn)submitBtn.disabled=false;
}
}

function editableRow(v){
var phaseOptions='<option value="-1"'+(v.currentPhaseIndex===-1?" selected":"")+'>시작 전</option>';
pocPhases.forEach(function(p,idx){
phaseOptions+='<option value="'+idx+'"'+(idx===v.currentPhaseIndex?" selected":"")+'>'+p+'</option>';
});
var statusOptions="";
statusFilters.filter(function(f){return f!=="all";}).forEach(function(s){
statusOptions+='<option value="'+s+'"'+(s===v.status?" selected":"")+'>'+statusLabels[s]+'</option>';
});
return (
'<td>'+
'<select class="edit-field edit-status" data-field="status">'+statusOptions+'</select>'+
'<select class="edit-field edit-phase" data-field="currentPhaseIndex" style="margin-top:6px;display:block;max-width:170px;">'+phaseOptions+'</select>'+
'</td>'+
'<td><input class="edit-field edit-progress" data-field="progressPct" type="number" min="0" max="100" value="'+v.progressPct+'" style="width:64px;"></td>'+
'<td><input class="edit-field edit-owner" data-field="owner" type="text" value="'+escapeAttr(v.owner)+'" style="width:80px;"></td>'+
'<td><input class="edit-field edit-due" data-field="dueDate" type="text" value="'+escapeAttr(v.dueDate)+'" style="width:100px;" placeholder="YYYY-MM-DD"></td>'+
'<td><textarea class="edit-field edit-notes" data-field="notes" rows="2" style="width:100%;">'+escapeAttr(v.notes)+'</textarea>'+
'<button class="filter-chip edit-save-btn" data-vendor="'+escapeAttr(v.name)+'" style="margin-top:6px;">저장</button>'+
'<span class="edit-save-status"></span></td>'
);
}

function wireEditableRows(){
var btns=document.querySelectorAll(".edit-save-btn");
for(var i=0;i<btns.length;i++){
btns[i].onclick=function(){
var vendorName=this.getAttribute("data-vendor");
saveVendorEdit(vendorName,this);
};
}
}

async function saveVendorEdit(vendorName,btn){
var row=btn.closest("tr");
var statusEl=row.querySelector(".edit-status");
var phaseEl=row.querySelector(".edit-phase");
var progressEl=row.querySelector(".edit-progress");
var ownerEl=row.querySelector(".edit-owner");
var dueEl=row.querySelector(".edit-due");
var notesEl=row.querySelector(".edit-notes");
var statusSpan=row.querySelector(".edit-save-status");
statusSpan.textContent="저장 중...";
try{
var res=await fetch("/api/data",{
method:"PUT",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+editToken
},
body:JSON.stringify({
vendorName:vendorName,
status:statusEl.value,
currentPhaseIndex:parseInt(phaseEl.value,10),
progressPct:parseInt(progressEl.value,10)||0,
owner:ownerEl.value,
dueDate:dueEl.value,
notes:notesEl.value
})
});
if(res.status===401){
editToken=null;
editMode=false;
try{localStorage.removeItem("pocEditToken")}catch(e){}
alert("편집 세션이 만료되었습니다. 비밀번호를 다시 입력해주세요.");
renderProgress();
return;
}
if(!res.ok)throw new Error("save failed");
var updated=await res.json();
applyServerData(updated);
dataSource="live";
statusSpan.textContent="저장됨 ✓";
renderProgressBody();
}catch(e){
statusSpan.textContent="저장 실패";
}
}

function renderProgressBody(){
var tbody=document.getElementById("progressBody");
var rows=pocVendors.filter(function(v){return progressFilter==="all"||v.status===progressFilter;});
rows=sortedVendors(rows);
var dragEnabled=editMode&&progressFilter==="all"&&!sortState.field;
var html="";
rows.forEach(function(v){
var handleCls="drag-handle"+(dragEnabled?"":" disabled");
var handleTitle=dragEnabled?"드래그해서 순서 변경":"정렬 해제 후 전체 보기(편집 모드)에서만 순서 변경 가능";
html+='<tr'+(dragEnabled?' draggable="true"':'')+' data-vendor="'+escapeAttr(v.name)+'">';
html+='<td style="font-weight:700;"><span class="'+handleCls+'" title="'+handleTitle+'">⠿</span> '+v.name+'</td>';
pocPhases.forEach(function(p,idx){
var cls="phase-cell";
if(v.status==="completed"||idx<v.currentPhaseIndex)cls+=" done";
else if(idx===v.currentPhaseIndex)cls+=" current";
html+='<td class="'+cls+'" title="'+escapeAttr(p)+'">●</td>';
});
if(editMode){
html+=editableRow(v);
}else{
html+='<td>'+statusBadge(v.status)+'</td><td>'+progressBar(v.progressPct)+'</td><td>'+v.owner+'</td><td>'+v.dueDate+'</td><td class="progress-note">'+v.notes+'</td>';
}
html+='</tr>';
});
if(!rows.length)html='<tr><td colspan="'+(pocPhases.length+6)+'" class="report-empty">해당 상태의 벤더가 없습니다.</td></tr>';
tbody.innerHTML=html;
if(editMode)wireEditableRows();
wireDragRows();
}

function wireDragRows(){
var tbody=document.getElementById("progressBody");
var rows=tbody.querySelectorAll("tr[draggable='true']");
var dragSrc=null;
for(var i=0;i<rows.length;i++){
rows[i].addEventListener("dragstart",function(e){
dragSrc=this;
this.classList.add("dragging");
if(e.dataTransfer){
e.dataTransfer.effectAllowed="move";
try{e.dataTransfer.setData("text/plain",this.getAttribute("data-vendor"));}catch(err){}
}
});
rows[i].addEventListener("dragend",function(){
this.classList.remove("dragging");
var all=tbody.querySelectorAll("tr");
for(var j=0;j<all.length;j++)all[j].classList.remove("drag-over-top","drag-over-bottom");
dragSrc=null;
});
rows[i].addEventListener("dragover",function(e){
e.preventDefault();
if(e.dataTransfer)e.dataTransfer.dropEffect="move";
if(!dragSrc||this===dragSrc)return;
var rect=this.getBoundingClientRect();
var midpoint=rect.top+rect.height/2;
this.classList.remove("drag-over-top","drag-over-bottom");
if(e.clientY<midpoint)this.classList.add("drag-over-top");
else this.classList.add("drag-over-bottom");
});
rows[i].addEventListener("dragleave",function(){
this.classList.remove("drag-over-top","drag-over-bottom");
});
rows[i].addEventListener("drop",function(e){
e.preventDefault();
this.classList.remove("drag-over-top","drag-over-bottom");
if(!dragSrc||this===dragSrc)return;
var srcName=dragSrc.getAttribute("data-vendor");
var targetName=this.getAttribute("data-vendor");
var rect=this.getBoundingClientRect();
var midpoint=rect.top+rect.height/2;
var insertAfter=e.clientY>=midpoint;
reorderVendors(srcName,targetName,insertAfter);
});
}
}

function reorderVendors(srcName,targetName,insertAfter){
var srcIdx=-1;
for(var i=0;i<pocVendors.length;i++){if(pocVendors[i].name===srcName){srcIdx=i;break;}}
if(srcIdx===-1)return;
var srcItem=pocVendors[srcIdx];
pocVendors.splice(srcIdx,1);
var targetIdx=-1;
for(var j=0;j<pocVendors.length;j++){if(pocVendors[j].name===targetName){targetIdx=j;break;}}
if(targetIdx===-1){
pocVendors.push(srcItem);
}else{
var insertIdx=insertAfter?targetIdx+1:targetIdx;
pocVendors.splice(insertIdx,0,srcItem);
}
renderProgressBody();
saveReorder(pocVendors.map(function(v){return v.name;}));
}

async function saveReorder(names){
var statusEl=document.getElementById("reorderStatus");
if(statusEl)statusEl.textContent="순서 저장 중...";
try{
var res=await fetch("/api/data",{
method:"PUT",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+editToken
},
body:JSON.stringify({reorder:names})
});
if(res.status===401){
editToken=null;
editMode=false;
try{localStorage.removeItem("pocEditToken")}catch(e){}
alert("편집 세션이 만료되었습니다. 비밀번호를 다시 입력해주세요.");
renderProgress();
return;
}
if(!res.ok)throw new Error("save failed");
var updated=await res.json();
applyServerData(updated);
dataSource="live";
if(statusEl)statusEl.textContent="순서 저장됨 ✓";
renderProgressBody();
}catch(e){
if(statusEl)statusEl.textContent="순서 저장 실패";
}
}

function covSortArrowHtml(field){
if(covSortState.field!==field)return '<span class="sort-arrow"></span>';
return '<span class="sort-arrow active">'+(covSortState.dir==="asc"?"▲":"▼")+'</span>';
}

function onCovSortClick(field){
if(covSortState.field!==field){
covSortState.field=field;
covSortState.dir="asc";
}else if(covSortState.dir==="asc"){
covSortState.dir="desc";
}else{
covSortState.field=null;
covSortState.dir=null;
}
renderCoverage();
}

function filteredCovRows(){
var rows=covRows.filter(function(r){return covCategoryFilter==="all"||r.category===covCategoryFilter;});
var q=covSearchText.trim().toLowerCase();
if(q){
rows=rows.filter(function(r){
return ["category","subCategory","example","description","controlTarget","controlMethod","solutionMeans"].some(function(f){
return String(r[f]||"").toLowerCase().indexOf(q)!==-1;
});
});
}
return rows;
}

function sortedCovRows(list){
if(!covSortState.field)return list;
var field=covSortState.field;
var dir=covSortState.dir;
var copy=list.slice();
copy.sort(function(a,b){
var av=String(a[field]||"").toLowerCase();
var bv=String(b[field]||"").toLowerCase();
if(av<bv)return dir==="asc"?-1:1;
if(av>bv)return dir==="asc"?1:-1;
return 0;
});
return copy;
}

function renderCoverage(){
var root=document.getElementById("root");
var covCategories=[];
covRows.forEach(function(r){if(r.category&&covCategories.indexOf(r.category)===-1)covCategories.push(r.category);});

var html=sampleBanner();
html+='<div class="hero"><div><h1>통제 <span class="accent">매트릭스</span></h1><p>// 통제 항목 × 벤더 Coverage</p></div><span class="badge">'+covRows.length+' ITEMS</span></div>';

html+='<div class="filter-chips">';
html+='<span class="filter-chip'+(covCategoryFilter==="all"?' active':'')+'" data-cov-filter="all">전체</span>';
covCategories.forEach(function(c){
html+='<span class="filter-chip'+(c===covCategoryFilter?' active':'')+'" data-cov-filter="'+escapeAttr(c)+'">'+c+'</span>';
});
html+='<span style="margin-left:auto;display:inline-flex;gap:8px;align-items:center;"><span id="covActionStatus" class="edit-save-status"></span><span id="editLoginBox" style="display:none;gap:8px;align-items:center;"></span>'+(editMode?'<button class="filter-chip" id="addCovRowBtn">+ 항목 추가</button>':'')+'<button class="filter-chip" id="editToggleBtn">'+(editMode?"편집 모드 끄기":"편집 모드 켜기")+'</button></span>';
html+='</div>';

html+='<div style="margin-bottom:14px;"><input type="text" id="covSearchInput" class="edit-field" style="width:280px;" placeholder="검색어 입력 (텍스트 컬럼 전체)" value="'+escapeAttr(covSearchText)+'"></div>';

html+='<div class="coverage-table-wrap"><table class="progress-matrix coverage-matrix"><thead><tr>';
html+='<th></th>';
html+='<th class="sortable-th" data-cov-sort="category">구분'+covSortArrowHtml("category")+'</th>';
html+='<th class="sortable-th" data-cov-sort="subCategory">상세 구분'+covSortArrowHtml("subCategory")+'</th>';
html+='<th class="sortable-th" data-cov-sort="example">예시'+covSortArrowHtml("example")+'</th>';
html+='<th class="sortable-th" data-cov-sort="description">설명'+covSortArrowHtml("description")+'</th>';
html+='<th class="sortable-th" data-cov-sort="controlTarget">주요 통제 대상'+covSortArrowHtml("controlTarget")+'</th>';
html+='<th class="sortable-th" data-cov-sort="controlMethod">통제 방식'+covSortArrowHtml("controlMethod")+'</th>';
html+='<th class="sortable-th" data-cov-sort="solutionMeans">솔루션 통제 수단'+covSortArrowHtml("solutionMeans")+'</th>';
pocVendors.forEach(function(v){html+='<th class="cov-vendor-th" title="'+escapeAttr(v.name)+'">'+v.name+'</th>';});
if(editMode)html+='<th></th>';
html+='</tr></thead><tbody id="coverageBody"></tbody></table></div>';

root.innerHTML=html;
renderCoverageBody();

var covChips=document.querySelectorAll(".filter-chip[data-cov-filter]");
for(var i=0;i<covChips.length;i++){
covChips[i].onclick=function(){
covCategoryFilter=this.getAttribute("data-cov-filter");
var all=document.querySelectorAll(".filter-chip[data-cov-filter]");
for(var j=0;j<all.length;j++)all[j].className="filter-chip";
this.className="filter-chip active";
renderCoverageBody();
};
}

var covSortThs=document.querySelectorAll("[data-cov-sort]");
for(var s=0;s<covSortThs.length;s++){
covSortThs[s].onclick=function(){
onCovSortClick(this.getAttribute("data-cov-sort"));
};
}

document.getElementById("covSearchInput").addEventListener("input",function(){
covSearchText=this.value;
renderCoverageBody();
});

document.getElementById("editToggleBtn").onclick=onEditToggleClick;
var addCovBtn=document.getElementById("addCovRowBtn");
if(addCovBtn)addCovBtn.onclick=addCovRow;
}

function computeCovGroups(rows){
var catSpan=new Array(rows.length).fill(1);
var subSpan=new Array(rows.length).fill(1);
var groupParity=new Array(rows.length).fill(0);
var i=0,groupIdx=0;
while(i<rows.length){
var j=i+1;
while(j<rows.length&&rows[j].category===rows[i].category)j++;
catSpan[i]=j-i;
for(var t=i+1;t<j;t++)catSpan[t]=0;
for(var t2=i;t2<j;t2++)groupParity[t2]=groupIdx%2;
var k=i;
while(k<j){
var m=k+1;
while(m<j&&rows[m].subCategory===rows[k].subCategory)m++;
subSpan[k]=m-k;
for(var t3=k+1;t3<m;t3++)subSpan[t3]=0;
k=m;
}
groupIdx++;
i=j;
}
return {catSpan:catSpan,subSpan:subSpan,groupParity:groupParity};
}

function renderCoverageBody(){
var tbody=document.getElementById("coverageBody");
var rows=filteredCovRows();
rows=sortedCovRows(rows);
var dragEnabled=editMode&&covCategoryFilter==="all"&&!covSearchText.trim()&&!covSortState.field;
var colCount=8+pocVendors.length+(editMode?1:0);
var groups=computeCovGroups(rows);
var html="";
rows.forEach(function(r,idx){
var handleCls="drag-handle"+(dragEnabled?"":" disabled");
var handleTitle=dragEnabled?"드래그해서 순서 변경":"필터/검색/정렬 해제 후 전체 보기(편집 모드)에서만 순서 변경 가능";
var trCls=groups.groupParity[idx]?' class="cov-group-alt"':'';
html+='<tr'+trCls+(dragEnabled?' draggable="true"':'')+' data-row-id="'+escapeAttr(r.id)+'">';
html+='<td class="cov-drag-td"><span class="'+handleCls+'" title="'+handleTitle+'">⠿</span></td>';
if(editMode){
html+='<td><input class="edit-field" data-field="category" type="text" value="'+escapeAttr(r.category)+'" style="width:100px;"></td>';
html+='<td><input class="edit-field" data-field="subCategory" type="text" value="'+escapeAttr(r.subCategory)+'" style="width:110px;"></td>';
html+='<td><textarea class="edit-field" data-field="example" rows="2" style="width:140px;">'+escapeAttr(r.example)+'</textarea></td>';
html+='<td><textarea class="edit-field" data-field="description" rows="2" style="width:170px;">'+escapeAttr(r.description)+'</textarea></td>';
html+='<td><input class="edit-field" data-field="controlTarget" type="text" value="'+escapeAttr(r.controlTarget)+'" style="width:110px;"></td>';
html+='<td><textarea class="edit-field" data-field="controlMethod" rows="2" style="width:140px;">'+escapeAttr(r.controlMethod)+'</textarea></td>';
html+='<td><textarea class="edit-field" data-field="solutionMeans" rows="2" style="width:140px;">'+escapeAttr(r.solutionMeans)+'</textarea></td>';
pocVendors.forEach(function(v){
var cur=(r.coverage&&r.coverage[v.name])||"unknown";
var options="";
COVERAGE_VALUES.forEach(function(cv){
options+='<option value="'+cv+'"'+(cv===cur?" selected":"")+'>'+COVERAGE_LABELS[cv]+'</option>';
});
html+='<td class="cov-vendor-td"><select class="edit-field cov-vendor-select" data-vendor="'+escapeAttr(v.name)+'">'+options+'</select></td>';
});
html+='<td><button class="filter-chip cov-save-btn" data-row-id="'+escapeAttr(r.id)+'">저장</button><button class="filter-chip cov-delete-btn" data-row-id="'+escapeAttr(r.id)+'" style="margin-top:6px;">삭제</button><span class="edit-save-status"></span></td>';
}else{
if(groups.catSpan[idx]>0)html+='<td class="cov-group-cell"'+(groups.catSpan[idx]>1?' rowspan="'+groups.catSpan[idx]+'"':'')+'>'+escapeAttr(r.category)+'</td>';
if(groups.subSpan[idx]>0)html+='<td class="cov-group-cell"'+(groups.subSpan[idx]>1?' rowspan="'+groups.subSpan[idx]+'"':'')+'>'+escapeAttr(r.subCategory)+'</td>';
html+='<td>'+escapeAttr(r.example)+'</td>';
html+='<td>'+escapeAttr(r.description)+'</td>';
html+='<td>'+escapeAttr(r.controlTarget)+'</td>';
html+='<td>'+escapeAttr(r.controlMethod)+'</td>';
html+='<td>'+escapeAttr(r.solutionMeans)+'</td>';
pocVendors.forEach(function(v){
var cur=(r.coverage&&r.coverage[v.name])||"unknown";
html+='<td class="cov-vendor-td"><span class="cov-cell cov-'+cur+'" title="'+escapeAttr(v.name)+': '+COVERAGE_LABELS[cur]+'"></span></td>';
});
}
html+='</tr>';
});
if(!rows.length)html='<tr><td colspan="'+colCount+'" class="report-empty">'+(covRows.length?"조건에 맞는 항목이 없습니다.":'등록된 통제 항목이 없습니다. 편집 모드에서 "+ 항목 추가"로 시작하세요.')+'</td></tr>';
tbody.innerHTML=html;
if(editMode)wireCovEditableRows();
wireCovDragRows();
}

function wireCovEditableRows(){
var saveBtns=document.querySelectorAll(".cov-save-btn");
for(var i=0;i<saveBtns.length;i++){
saveBtns[i].onclick=function(){
saveCovRow(this.getAttribute("data-row-id"),this);
};
}
var delBtns=document.querySelectorAll(".cov-delete-btn");
for(var j=0;j<delBtns.length;j++){
delBtns[j].onclick=function(){
if(confirm("이 통제 항목을 삭제하시겠습니까?"))deleteCovRow(this.getAttribute("data-row-id"));
};
}
}

async function saveCovRow(rowId,btn){
var row=btn.closest("tr");
var statusSpan=row.querySelector(".edit-save-status");
statusSpan.textContent="저장 중...";
var fields={};
["category","subCategory","example","description","controlTarget","controlMethod","solutionMeans"].forEach(function(f){
var el=row.querySelector('[data-field="'+f+'"]');
fields[f]=el?el.value:"";
});
var coverage={};
var selects=row.querySelectorAll(".cov-vendor-select");
for(var i=0;i<selects.length;i++){
coverage[selects[i].getAttribute("data-vendor")]=selects[i].value;
}
fields.coverage=coverage;
try{
var res=await fetch("/api/coverage",{
method:"PUT",
headers:{"Content-Type":"application/json","Authorization":"Bearer "+editToken},
body:JSON.stringify({action:"update",rowId:rowId,fields:fields})
});
if(res.status===401){
editToken=null;
editMode=false;
try{localStorage.removeItem("pocEditToken")}catch(e){}
alert("편집 세션이 만료되었습니다. 비밀번호를 다시 입력해주세요.");
renderCoverage();
return;
}
if(!res.ok)throw new Error("save failed");
var updated=await res.json();
applyServerData(updated);
dataSource="live";
statusSpan.textContent="저장됨 ✓";
renderCoverageBody();
}catch(e){
statusSpan.textContent="저장 실패";
}
}

async function deleteCovRow(rowId){
var statusEl=document.getElementById("covActionStatus");
if(statusEl)statusEl.textContent="삭제 중...";
try{
var res=await fetch("/api/coverage",{
method:"PUT",
headers:{"Content-Type":"application/json","Authorization":"Bearer "+editToken},
body:JSON.stringify({action:"delete",rowId:rowId})
});
if(res.status===401){
editToken=null;
editMode=false;
try{localStorage.removeItem("pocEditToken")}catch(e){}
alert("편집 세션이 만료되었습니다. 비밀번호를 다시 입력해주세요.");
renderCoverage();
return;
}
if(!res.ok)throw new Error("delete failed");
var updated=await res.json();
applyServerData(updated);
dataSource="live";
if(statusEl)statusEl.textContent="삭제됨 ✓";
renderCoverageBody();
}catch(e){
if(statusEl)statusEl.textContent="삭제 실패";
}
}

async function addCovRow(){
var statusEl=document.getElementById("covActionStatus");
if(statusEl)statusEl.textContent="추가 중...";
try{
var res=await fetch("/api/coverage",{
method:"PUT",
headers:{"Content-Type":"application/json","Authorization":"Bearer "+editToken},
body:JSON.stringify({action:"add"})
});
if(res.status===401){
editToken=null;
editMode=false;
try{localStorage.removeItem("pocEditToken")}catch(e){}
alert("편집 세션이 만료되었습니다. 비밀번호를 다시 입력해주세요.");
renderCoverage();
return;
}
if(!res.ok)throw new Error("add failed");
var updated=await res.json();
applyServerData(updated);
dataSource="live";
if(statusEl)statusEl.textContent="항목 추가됨";
renderCoverage();
}catch(e){
if(statusEl)statusEl.textContent="추가 실패";
}
}

function wireCovDragRows(){
var tbody=document.getElementById("coverageBody");
var rows=tbody.querySelectorAll("tr[draggable='true']");
var dragSrc=null;
for(var i=0;i<rows.length;i++){
rows[i].addEventListener("dragstart",function(e){
dragSrc=this;
this.classList.add("dragging");
if(e.dataTransfer){
e.dataTransfer.effectAllowed="move";
try{e.dataTransfer.setData("text/plain",this.getAttribute("data-row-id"));}catch(err){}
}
});
rows[i].addEventListener("dragend",function(){
this.classList.remove("dragging");
var all=tbody.querySelectorAll("tr");
for(var j=0;j<all.length;j++)all[j].classList.remove("drag-over-top","drag-over-bottom");
dragSrc=null;
});
rows[i].addEventListener("dragover",function(e){
e.preventDefault();
if(e.dataTransfer)e.dataTransfer.dropEffect="move";
if(!dragSrc||this===dragSrc)return;
var rect=this.getBoundingClientRect();
var midpoint=rect.top+rect.height/2;
this.classList.remove("drag-over-top","drag-over-bottom");
if(e.clientY<midpoint)this.classList.add("drag-over-top");
else this.classList.add("drag-over-bottom");
});
rows[i].addEventListener("dragleave",function(){
this.classList.remove("drag-over-top","drag-over-bottom");
});
rows[i].addEventListener("drop",function(e){
e.preventDefault();
this.classList.remove("drag-over-top","drag-over-bottom");
if(!dragSrc||this===dragSrc)return;
var srcId=dragSrc.getAttribute("data-row-id");
var targetId=this.getAttribute("data-row-id");
var rect=this.getBoundingClientRect();
var midpoint=rect.top+rect.height/2;
var insertAfter=e.clientY>=midpoint;
reorderCovRows(srcId,targetId,insertAfter);
});
}
}

function reorderCovRows(srcId,targetId,insertAfter){
var srcIdx=-1;
for(var i=0;i<covRows.length;i++){if(covRows[i].id===srcId){srcIdx=i;break;}}
if(srcIdx===-1)return;
var srcItem=covRows[srcIdx];
covRows.splice(srcIdx,1);
var targetIdx=-1;
for(var j=0;j<covRows.length;j++){if(covRows[j].id===targetId){targetIdx=j;break;}}
if(targetIdx===-1){
covRows.push(srcItem);
}else{
var insertIdx=insertAfter?targetIdx+1:targetIdx;
covRows.splice(insertIdx,0,srcItem);
}
renderCoverageBody();
saveCovReorder(covRows.map(function(r){return r.id;}));
}

async function saveCovReorder(ids){
var statusEl=document.getElementById("covActionStatus");
if(statusEl)statusEl.textContent="순서 저장 중...";
try{
var res=await fetch("/api/coverage",{
method:"PUT",
headers:{"Content-Type":"application/json","Authorization":"Bearer "+editToken},
body:JSON.stringify({action:"reorder",order:ids})
});
if(res.status===401){
editToken=null;
editMode=false;
try{localStorage.removeItem("pocEditToken")}catch(e){}
alert("편집 세션이 만료되었습니다. 비밀번호를 다시 입력해주세요.");
renderCoverage();
return;
}
if(!res.ok)throw new Error("save failed");
var updated=await res.json();
applyServerData(updated);
dataSource="live";
if(statusEl)statusEl.textContent="순서 저장됨 ✓";
renderCoverageBody();
}catch(e){
if(statusEl)statusEl.textContent="순서 저장 실패";
}
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
html+=phaseLegendHtml();
html+='<div class="timeline-header"><div class="timeline-vendor-name"></div><div class="timeline-header-track">';
pocPhases.forEach(function(p,idx){html+='<span title="'+escapeAttr(p)+'">'+(idx+1)+'</span>';});
html+='</div></div>';
pocVendors.forEach(function(v){
html+='<div class="timeline-row"><div class="timeline-vendor-name">'+v.name+'</div><div class="timeline-track">';
pocPhases.forEach(function(p,idx){
var cls="timeline-phase-seg";
if(v.status==="completed"||idx<v.currentPhaseIndex)cls+=" filled";
else if(idx===v.currentPhaseIndex)cls+=" current";
html+='<div class="'+cls+'" title="'+escapeAttr(p)+'"></div>';
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
html+='<div style="text-align:center;"><div class="mini-score s-'+v.scores[l]+'" style="margin:0 auto 6px;">'+v.scores[l]+'</div><div style="font-size:9px;color:var(--text-faint);font-family:monospace;text-transform:uppercase;">'+layerLabels[l]+'</div></div>';
});
html+='</div>';
html+='<div style="font-size:12px;color:var(--text-muted);">'+poc.notes+'</div>';
html+='<div style="margin-top:14px;"><a href="map.html" style="color:var(--accent-text);font-family:monospace;font-size:11px;text-decoration:none;">→ Vendor Map에서 상세 비교 보기</a></div>';
html+='</div>';
});

root.innerHTML=html;
}

function section(num,title,sub){
return '<div class="sec-header"><span class="num">['+num+']</span><span class="title">'+title+'</span><span class="sub">'+sub+'</span></div><div class="divider"></div>';
}
