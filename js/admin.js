/* 관리자 페이지.
   - 인증: ADMIN_PASSWORD -> /api/admin-login -> role:"admin" 토큰 (편집 비밀번호와 별개)
   - 모든 데이터는 컬렉션별 전용 폼/표에서 편집하고, 저장 시 서버가 검증 후 스냅샷을 남긴다 */

var ADM = {
token:null, doc:null, meta:null, snaps:[],
tab:"navConfig", draft:{}, dirty:{}, errors:null, status:"",
covFilter:"", covOpenId:null
};

/* data2.js가 정의한 Vendor Map II 기준 점수(기본값 표시용) */
var MAP2_BASE = (typeof vendors !== "undefined" && Array.isArray(vendors)) ? vendors : [];

/* label/hint의 {nav:페이지} 는 메뉴 관리에서 지정한 실제 메뉴명으로 치환된다.
   메뉴명을 바꾸면 좌측 탭과 안내 문구가 함께 따라오도록 하기 위함 */
var TABS = [
{key:"navConfig",     label:"메뉴 관리",        hint:"상단 메뉴의 표시 여부·이름·순서를 정합니다. {nav:dashboard}은 잠겨 있어 항상 표시됩니다. 비활성화한 메뉴는 목록에서 사라지고 URL로 직접 들어와도 홈으로 보냅니다 — 정적 사이트이므로 접근제어가 아니라 정리 수단입니다."},
{key:"pocMeta",       label:"PoC 기본정보",     hint:"{nav:dashboard} 상단과 D-Day 계산에 쓰이는 값입니다. 목표일(targetDate)을 바꾸면 남은 일수가 함께 바뀝니다."},
{key:"pocPhases",     label:"PoC 단계",         hint:"{nav:progress} 매트릭스의 열이 됩니다. 단계를 줄이면 범위를 벗어난 벤더의 현재 단계가 마지막 단계로 자동 보정됩니다."},
{key:"pocVendors",    label:"PoC 벤더",         hint:"{nav:progress}·{nav:dashboard}에 쓰이는 벤더별 진행 상태입니다. 업체명은 중복될 수 없습니다."},
{key:"recentUpdates", label:"최근 업데이트",    hint:"{nav:dashboard}의 변경 이력입니다. 관리자 저장 시 자동으로 기록이 추가되며 최근 20건만 보관됩니다."},
{key:"mapVendors",    label:"{nav:map} 추가벤더", hint:"{nav:map} 메뉴(js/data.js) 위에 얹히는 추가 벤더입니다. 5개 축(Model/Agent/Platform/Identity/ShadowAI)마다 근거를 최소 1줄 입력해야 저장됩니다."},
{key:"map2Overrides", label:"{nav:map2} 점수",  hint:"{nav:map2} 메뉴의 기준 점수를 덮어씁니다. 비워두면 js/data2.js의 기본값을 그대로 사용합니다."},
{key:"covRows",       label:"{nav:coverage}",   hint:"{nav:coverage} 메뉴의 행입니다. 검색으로 행을 찾아 편집을 누르면 전체 항목과 벤더별 커버리지를 고칠 수 있습니다."},
{sep:true},
{key:"__snapshots",   label:"스냅샷 복원",      hint:"저장·복원 직전 문서를 최근 10개까지 자동 보관합니다. 복원하면 현재 상태도 스냅샷으로 남으므로 되돌리기가 가능합니다."}
];

function byId(id){return document.getElementById(id);}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function clone(v){return JSON.parse(JSON.stringify(v===undefined?null:v));}
function tabDef(k){for(var i=0;i<TABS.length;i++){if(TABS[i].key===k)return TABS[i];}return null;}

/* 메뉴명 조회 - 저장 전 편집 중인 draft를 우선해서 입력하는 즉시 반영된다 */
function navLabelOf(page){
var cfg=("navConfig" in ADM.draft)?ADM.draft.navConfig:(ADM.doc&&ADM.doc.navConfig);
if(cfg&&cfg[page]&&cfg[page].label)return cfg[page].label;
var np=ADM.meta&&ADM.meta.navPages;
if(np){for(var i=0;i<np.length;i++){if(np[i].page===page)return np[i].label;}}
return null;
}
/* escSub: 결과를 그대로 HTML에 넣는 경우(안내 문구) 치환값만 이스케이프한다 */
function fillNav(text,escSub){
return String(text==null?"":text).replace(/\{nav:([a-zA-Z0-9_]+)\}/g,function(m,pg){
var v=navLabelOf(pg)||pg;
return escSub?esc(v):v;
});
}
function tabLabel(t){return fillNav(t.label,false);}

/* ---------- 인증 ---------- */
function loadToken(){try{ADM.token=localStorage.getItem("adminToken");}catch(e){ADM.token=null;}}
function saveToken(t){ADM.token=t;try{if(t)localStorage.setItem("adminToken",t);else localStorage.removeItem("adminToken");}catch(e){}}

function logout(msg){
saveToken(null);
ADM.doc=null;ADM.draft={};ADM.dirty={};
renderLogin(msg||"");
}

async function api(method,body){
var opts={method:method,headers:{"Authorization":"Bearer "+ADM.token}};
if(body){opts.headers["Content-Type"]="application/json";opts.body=JSON.stringify(body);}
var res=await fetch("/api/admin",opts);
if(res.status===401){logout("관리자 세션이 만료되었습니다. 다시 로그인해주세요.");return null;}
var data=null;
try{data=await res.json();}catch(e){}
if(!res.ok){
var err=new Error((data&&data.error)||("요청 실패 ("+res.status+")"));
err.details=(data&&data.details)||null;
throw err;
}
return data;
}

function renderLogin(errMsg){
byId("root").innerHTML=
'<div class="hero"><div><h1>ADMIN <span class="accent">CONSOLE</span></h1><p>// 관리자 인증</p></div></div>'+
'<div class="admin-login">'+
'<h2>관리자 인증</h2>'+
'<p>관리자 페이지는 편집 모드와 <strong>별도의 비밀번호</strong>를 사용합니다. Cloudflare 환경변수 <code>ADMIN_PASSWORD</code>에 등록한 값을 입력하세요.</p>'+
'<div class="al-row"><input class="admin-input" type="password" id="admPw" placeholder="관리자 비밀번호" autocomplete="current-password">'+
'<button class="admin-btn" id="admLoginBtn">로그인</button></div>'+
'<div class="admin-err" id="admErr">'+esc(errMsg||"")+'</div>'+
'</div>';
var pw=byId("admPw");
byId("admLoginBtn").onclick=doLogin;
pw.onkeydown=function(e){if(e.key==="Enter")doLogin();};
pw.focus();
}

async function doLogin(){
var pw=byId("admPw").value;
var errEl=byId("admErr");
var btn=byId("admLoginBtn");
if(!pw){errEl.textContent="비밀번호를 입력해주세요.";return;}
btn.disabled=true;errEl.textContent="확인 중...";
try{
var res=await fetch("/api/admin-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:pw})});
var data=null;try{data=await res.json();}catch(e){}
if(!res.ok||!data||!data.token){
errEl.textContent=(data&&data.error==="invalid admin password")?"비밀번호가 올바르지 않습니다.":((data&&data.error)||"로그인에 실패했습니다.");
btn.disabled=false;return;
}
saveToken(data.token);
await load();
}catch(e){
errEl.textContent="네트워크 오류: "+e.message;
btn.disabled=false;
}
}

/* ---------- 로드 ---------- */
async function load(){
byId("root").innerHTML='<div class="loading">데이터 불러오는 중...</div>';
try{
var data=await api("GET");
if(!data)return;
ADM.doc=data.doc;ADM.meta=data.meta;ADM.snaps=data.snapshots||[];
ADM.draft={};ADM.dirty={};ADM.errors=null;ADM.status="";
renderShell();
}catch(e){
byId("root").innerHTML='<div class="loading" style="color:var(--status-bad-text)">불러오기 실패: '+esc(e.message)+'</div>';
}
}

function draftOf(col){
if(!(col in ADM.draft))ADM.draft[col]=clone(ADM.doc[col]);
return ADM.draft[col];
}
function phasesNow(){
var p=("pocPhases" in ADM.draft)?ADM.draft.pocPhases:ADM.doc.pocPhases;
return Array.isArray(p)?p:[];
}
function countOf(col){
var v=(col in ADM.draft)?ADM.draft[col]:ADM.doc[col];
if(Array.isArray(v))return v.length;
if(v&&typeof v==="object")return Object.keys(v).length;
return null;
}

/* ---------- 셸 ---------- */
function renderShell(){
var html='<div class="hero"><div><h1>ADMIN <span class="accent">CONSOLE</span></h1><p>// 메뉴 구성 · 데이터 직접 수정</p></div>'+
'<div style="text-align:right;"><span class="badge">ADMIN</span>'+
'<div style="margin-top:10px;"><button class="admin-btn ghost tiny" id="admReload">새로고침</button> '+
'<button class="admin-btn ghost tiny" id="admLogout">로그아웃</button></div></div></div>';
html+='<div class="admin-layout"><div class="admin-tabs" id="admTabs"></div><div class="admin-pane" id="admPane"></div></div>';
byId("root").innerHTML=html;
byId("admLogout").onclick=function(){
if(anyDirty()&&!confirm("저장하지 않은 변경이 있습니다. 로그아웃할까요?"))return;
logout("");
};
byId("admReload").onclick=function(){
if(anyDirty()&&!confirm("저장하지 않은 변경이 있습니다. 서버 값으로 새로 불러올까요?"))return;
load();
};
renderTabs();
renderPane();
}

function anyDirty(){return Object.keys(ADM.dirty).some(function(k){return ADM.dirty[k];});}

function renderTabs(){
var html="";
TABS.forEach(function(t){
if(t.sep){html+='<div class="admin-tab-sep"></div>';return;}
var c=(t.key==="__snapshots")?ADM.snaps.length:countOf(t.key);
html+='<div class="admin-tab'+(ADM.tab===t.key?' active':'')+(ADM.dirty[t.key]?' dirty':'')+'" data-tab="'+t.key+'">'+
esc(tabLabel(t))+(c===null?"":'<span class="at-count">'+c+'</span>')+'</div>';
});
byId("admTabs").innerHTML=html;
var tabs=byId("admTabs").querySelectorAll(".admin-tab");
for(var i=0;i<tabs.length;i++){
tabs[i].onclick=function(){
ADM.tab=this.getAttribute("data-tab");
ADM.errors=null;ADM.status="";ADM.covOpenId=null;
renderTabs();renderPane();
};
}
}

function setStatus(msg,kind){
ADM.status=msg;ADM.statusKind=kind||"";
var el=byId("admStatus");
if(el){el.textContent=msg;el.className="admin-status "+(kind||"");}
}

function renderPane(){
var t=tabDef(ADM.tab);
var pane=byId("admPane");
var saveBtn=(ADM.tab==="__snapshots")?"":
'<button class="admin-btn" data-act="save">저장</button>'+
'<button class="admin-btn ghost" data-act="revert">되돌리기</button>';
var html='<div class="admin-pane-head"><h3>'+esc(tabLabel(t))+'</h3><div class="aph-actions">'+
'<span class="admin-status '+(ADM.statusKind||"")+'" id="admStatus">'+esc(ADM.status||"")+'</span>'+saveBtn+'</div></div>';
html+='<div class="admin-hint">'+fillNav(t.hint,true)+'</div>';
if(ADM.errors&&ADM.errors.length){
html+='<div class="admin-errlist"><strong>저장하지 않았습니다 — 아래 항목을 고쳐주세요</strong><ul>';
ADM.errors.forEach(function(e){html+='<li>· '+esc(e)+'</li>';});
html+='</ul></div>';
}
html+='<div id="admBody"></div>';
pane.innerHTML=html;

var body=byId("admBody");
if(ADM.tab==="navConfig")body.innerHTML=edNav();
else if(ADM.tab==="pocMeta")body.innerHTML=edMeta();
else if(ADM.tab==="pocPhases")body.innerHTML=edPhases();
else if(ADM.tab==="pocVendors")body.innerHTML=edVendors();
else if(ADM.tab==="recentUpdates")body.innerHTML=edUpdates();
else if(ADM.tab==="mapVendors")body.innerHTML=edMapVendors();
else if(ADM.tab==="map2Overrides")body.innerHTML=edMap2();
else if(ADM.tab==="covRows")body.innerHTML=edCovRows();
else if(ADM.tab==="__snapshots")body.innerHTML=edSnapshots();

/* renderPane은 탭 전환마다 호출되므로 addEventListener를 쓰면 리스너가 누적되어
   클릭 한 번이 여러 번 실행된다. 대입 방식으로 멱등하게 유지한다 */
pane.oninput=onPaneInput;
pane.onchange=onPaneInput;
pane.onclick=onPaneClick;
}

/* ---------- 입력 바인딩 (data-p: "|"로 구분한 경로) ---------- */
function setPath(root,path,val,t){
if(!path.length)return;
var cur=root;
for(var i=0;i<path.length-1;i++){
var k=path[i];
if(cur[k]===undefined||cur[k]===null)cur[k]=/^\d+$/.test(path[i+1])?[]:{};
cur=cur[k];
}
var last=path[path.length-1];
if(t==="intn"&&(val===null||val===""))delete cur[last];
else cur[last]=val;
}

function onPaneInput(e){
var el=e.target;
if(!el||!el.getAttribute)return;
var p=el.getAttribute("data-p");
if(p===null)return;
var col=el.getAttribute("data-col")||ADM.tab;
var t=el.getAttribute("data-t")||"str";
var val;
if(t==="bool")val=el.checked;
else if(t==="int"||t==="intn"){
if(el.value===""){val=null;}
else{val=parseInt(el.value,10);if(isNaN(val))val=null;}
if(t==="int"&&val===null)val=0;
}else val=el.value;
setPath(draftOf(col),p.split("|"),val,t);
/* 모든 축을 기본값으로 되돌린 벤더는 덮어쓰기 목록에서 제거 */
if(col==="map2Overrides"){
var ov=ADM.draft[col];
Object.keys(ov).forEach(function(k){
if(!ov[k]||!Object.keys(ov[k]).length)delete ov[k];
});
}
ADM.dirty[col]=true;
renderTabs();
setStatus("변경됨 (저장 전)","");
}

function onPaneClick(e){
var el=e.target.closest?e.target.closest("[data-act]"):null;
if(!el)return;
var act=el.getAttribute("data-act");
var col=ADM.tab;

if(act==="save"){save(col);return;}
if(act==="revert"){
if(!ADM.dirty[col]){setStatus("변경사항이 없습니다","");return;}
if(!confirm("이 화면의 변경을 모두 버리고 서버 값으로 되돌릴까요?"))return;
delete ADM.draft[col];delete ADM.dirty[col];ADM.errors=null;
renderTabs();renderPane();setStatus("되돌렸습니다","");
return;
}
if(act==="restore"){doRestore(parseInt(el.getAttribute("data-idx"),10));return;}

var d=draftOf(col);
var idx=parseInt(el.getAttribute("data-idx"),10);

if(act==="add-phase"){d.push("새 단계");}
else if(act==="del"){
if(!confirm("이 항목을 삭제할까요?"))return;
d.splice(idx,1);
if(col==="covRows")ADM.covOpenId=null;
}
else if(act==="up"&&idx>0){var tmp=d[idx-1];d[idx-1]=d[idx];d[idx]=tmp;}
else if(act==="down"&&idx<d.length-1){var tmp2=d[idx+1];d[idx+1]=d[idx];d[idx]=tmp2;}
else if(act==="nav-up"||act==="nav-down"){
var pages=ADM.meta.navPages.slice().sort(function(a,b){return (d[a.page]?d[a.page].order:0)-(d[b.page]?d[b.page].order:0);});
var pos=-1;for(var i=0;i<pages.length;i++){if(pages[i].page===el.getAttribute("data-page")){pos=i;break;}}
var swap=(act==="nav-up")?pos-1:pos+1;
if(pos<0||swap<0||swap>=pages.length)return;
var a=pages[pos].page,b=pages[swap].page;
var oa=d[a].order;d[a].order=d[b].order;d[b].order=oa;
}
else if(act==="add-vendor"){
d.push({name:"",currentPhaseIndex:-1,status:"not-started",owner:"TBD",dueDate:"-",progressPct:0,notes:"",updatedAt:"-"});
}
else if(act==="add-update"){
d.unshift({date:new Date().toISOString().slice(0,10),vendor:"System",message:""});
}
else if(act==="add-mapvendor"){
var rat={};ADM.meta.mapLayers.forEach(function(l){rat[l]={type:["neu"],bullets:[""]};});
d.push({name:"",color:"#94A3B8",scores:(function(){var s={};ADM.meta.mapLayers.forEach(function(l){s[l]=1;});return s;})(),
specialty:"",badges:[],rationale:rat,extRationale:{},estimated:true});
}
else if(act==="add-bullet"){
var layer=el.getAttribute("data-layer");
var blk=d[idx].rationale[layer]||(d[idx].rationale[layer]={type:[],bullets:[]});
blk.type.push("neu");blk.bullets.push("");
}
else if(act==="del-bullet"){
var layer2=el.getAttribute("data-layer");
var bi=parseInt(el.getAttribute("data-bi"),10);
var blk2=d[idx].rationale[layer2];
blk2.type.splice(bi,1);blk2.bullets.splice(bi,1);
if(!blk2.bullets.length){blk2.type.push("neu");blk2.bullets.push("");}
}
else if(act==="toggle-badge"){
var b2=el.getAttribute("data-badge");
var arr=d[idx].badges||(d[idx].badges=[]);
var at=arr.indexOf(b2);
if(at===-1)arr.push(b2);else arr.splice(at,1);
}
else if(act==="add-cov"){
d.push({id:"row-"+Date.now(),category:"",subCategory:"",example:"",description:"",
controlTarget:"",controlMethod:"",solutionMeans:"",coverage:{}});
ADM.covOpenId=d[d.length-1].id;
}
else if(act==="cov-open"){
var rid=el.getAttribute("data-rid");
ADM.covOpenId=(ADM.covOpenId===rid)?null:rid;
renderPane();return;
}
else if(act==="cov-filter-clear"){ADM.covFilter="";renderPane();return;}
else return;

ADM.dirty[col]=true;
renderTabs();renderPane();
setStatus("변경됨 (저장 전)","");
}

/* ---------- 저장 / 복원 ---------- */
async function save(col){
if(!ADM.dirty[col]){setStatus("변경사항이 없습니다","");return;}
setStatus("저장 중...","");
ADM.errors=null;
try{
var res=await api("PUT",{collection:col,value:ADM.draft[col]});
if(!res)return;
ADM.doc=res.doc;
delete ADM.draft[col];delete ADM.dirty[col];
var s=await api("GET");
if(s){ADM.snaps=s.snapshots||[];}
renderTabs();renderPane();
setStatus("저장됨 ✓","ok");
}catch(e){
ADM.errors=e.details||null;
renderPane();
setStatus(e.details?"검증 실패 — 저장하지 않았습니다":("저장 실패: "+e.message),"err");
}
}

async function doRestore(idx){
var s=ADM.snaps[idx];
if(!s)return;
if(!confirm(s.at+" 시점으로 되돌립니다.\n현재 상태도 스냅샷으로 남으니 다시 되돌릴 수 있습니다.\n\n계속할까요?"))return;
setStatus("복원 중...","");
try{
var res=await api("POST",{action:"restore",index:idx});
if(!res)return;
await load();
setStatus("복원 완료 ✓","ok");
}catch(e){
setStatus("복원 실패: "+e.message,"err");
}
}

/* ---------- 폼 헬퍼 ---------- */
var STATUS_LABEL={"not-started":"시작 전","on-track":"정상 진행","delayed":"지연","completed":"완료","pending":"보류","cancelled":"중단/취소"};
var COV_LABEL={full:"전체지원",partial:"부분지원",none:"미지원",unknown:"확인필요"};
var TYPE_LABEL={pos:"+ 강점",neg:"- 약점",neu:"· 중립"};

function fInput(path,val,extra){
return '<input class="admin-input'+((extra&&extra.cls)?" "+extra.cls:"")+'" type="text" data-p="'+path+'" value="'+esc(val)+'"'+
((extra&&extra.ph)?' placeholder="'+esc(extra.ph)+'"':'')+'>';
}
function fNum(path,val,min,max,t){
return '<input class="admin-input num" type="number" min="'+min+'" max="'+max+'" data-t="'+(t||"int")+'" data-p="'+path+'" value="'+(val===undefined||val===null?"":val)+'">';
}
function fArea(path,val,rows){
return '<textarea class="admin-textarea" rows="'+(rows||2)+'" data-p="'+path+'">'+esc(val)+'</textarea>';
}
function fSel(path,val,opts,t){
var h='<select class="admin-select" data-p="'+path+'"'+(t?' data-t="'+t+'"':'')+'>';
opts.forEach(function(o){
h+='<option value="'+esc(o[0])+'"'+(String(o[0])===String(val==null?"":val)?" selected":"")+'>'+esc(o[1])+'</option>';
});
return h+'</select>';
}
function fChk(path,checked,label){
return '<label class="admin-switch"><input type="checkbox" data-t="bool" data-p="'+path+'"'+(checked?" checked":"")+'>'+esc(label||"")+'</label>';
}
function ordBtns(i,len){
return '<button class="admin-ord" data-act="up" data-idx="'+i+'"'+(i===0?" disabled":"")+'>▲</button>'+
'<button class="admin-ord" data-act="down" data-idx="'+i+'"'+(i===len-1?" disabled":"")+'>▼</button>';
}
function statusOpts(){return (ADM.meta.vendorStatus||[]).map(function(s){return [s,STATUS_LABEL[s]||s];});}
function phaseOpts(){
var o=[["-1","시작 전"]];
phasesNow().forEach(function(p,i){o.push([String(i),(i+1)+". "+p]);});
return o;
}

/* ---------- 편집기 ---------- */
function edNav(){
var d=draftOf("navConfig");
var pages=ADM.meta.navPages.slice().sort(function(a,b){
return (d[a.page]?d[a.page].order:0)-(d[b.page]?d[b.page].order:0);
});
var html="";
pages.forEach(function(p){
var e=d[p.page]||{visible:true,label:p.label,order:0};
html+='<div class="nav-cfg-row">'+
'<button class="admin-ord" data-act="nav-up" data-page="'+p.page+'">▲</button>'+
'<button class="admin-ord" data-act="nav-down" data-page="'+p.page+'">▼</button>'+
'<span class="ncr-code">'+esc(p.page)+'</span>'+
fInput(p.page+"|label",e.label,{ph:"메뉴 이름"})+
(p.locked
?'<span class="ncr-lock">🔒 항상 표시</span>'
:fChk(p.page+"|visible",e.visible!==false,"표시"))+
'</div>';
});
html+='<div class="admin-hint" style="border:0;margin-top:6px;padding:0;">현재 표시: '+
pages.filter(function(p){var e=d[p.page];return p.locked||!e||e.visible!==false;}).length+' / '+pages.length+'개</div>';
return html;
}

function edMeta(){
var d=draftOf("pocMeta");
return '<div class="admin-grid">'+
'<div class="admin-field"><label>title (제목)</label>'+fInput("title",d.title)+'</div>'+
'<div class="admin-field"><label>sponsor (주관)</label>'+fInput("sponsor",d.sponsor)+'</div>'+
'<div class="admin-field"><label>startDate (시작일)</label>'+fInput("startDate",d.startDate,{ph:"2026-07-01"})+'</div>'+
'<div class="admin-field"><label>targetDate (목표일)</label>'+fInput("targetDate",d.targetDate,{ph:"2026-11-30"})+'</div>'+
'</div>';
}

function edPhases(){
var d=draftOf("pocPhases");
var html='<div class="admin-table-wrap"><table class="admin-table"><thead><tr>'+
'<th style="width:56px">순서</th><th>단계 이름</th><th style="width:110px"></th></tr></thead><tbody>';
d.forEach(function(p,i){
html+='<tr><td style="font-family:monospace;color:var(--text-faint)">'+(i+1)+'</td>'+
'<td>'+fInput(String(i),p)+'</td>'+
'<td><div class="admin-rowbtns">'+ordBtns(i,d.length)+
'<button class="admin-btn danger tiny" data-act="del" data-idx="'+i+'">삭제</button></div></td></tr>';
});
html+='</tbody></table></div>';
if(!d.length)html+='<div class="admin-empty">단계가 없습니다. 최소 1개를 추가해주세요.</div>';
html+='<button class="admin-btn ghost" data-act="add-phase" style="margin-top:10px">+ 단계 추가</button>';
return html;
}

function edVendors(){
var d=draftOf("pocVendors");
var po=phaseOpts(),so=statusOpts();
var html='<div class="admin-table-wrap"><table class="admin-table"><thead><tr>'+
'<th>업체명</th><th>현재 단계</th><th>상태</th><th>진행률</th><th>담당자</th><th>완료예정일</th><th>메모</th><th></th>'+
'</tr></thead><tbody>';
d.forEach(function(v,i){
html+='<tr>'+
'<td style="min-width:150px">'+fInput(i+"|name",v.name,{ph:"업체명"})+'</td>'+
'<td style="min-width:150px">'+fSel(i+"|currentPhaseIndex",v.currentPhaseIndex,po,"int")+'</td>'+
'<td style="min-width:120px">'+fSel(i+"|status",v.status,so)+'</td>'+
'<td>'+fNum(i+"|progressPct",v.progressPct,0,100)+'</td>'+
'<td style="min-width:96px">'+fInput(i+"|owner",v.owner)+'</td>'+
'<td style="min-width:112px">'+fInput(i+"|dueDate",v.dueDate)+'</td>'+
'<td style="min-width:200px">'+fArea(i+"|notes",v.notes,2)+'</td>'+
'<td><div class="admin-rowbtns">'+ordBtns(i,d.length)+
'<button class="admin-btn danger tiny" data-act="del" data-idx="'+i+'">삭제</button></div></td></tr>';
});
html+='</tbody></table></div>';
if(!d.length)html+='<div class="admin-empty">벤더가 없습니다.</div>';
html+='<button class="admin-btn ghost" data-act="add-vendor" style="margin-top:10px">+ 벤더 추가</button>';
return html;
}

function edUpdates(){
var d=draftOf("recentUpdates");
var html='<div class="admin-table-wrap"><table class="admin-table"><thead><tr>'+
'<th style="width:120px">날짜</th><th style="width:150px">대상</th><th>내용</th><th style="width:64px"></th>'+
'</tr></thead><tbody>';
d.forEach(function(u,i){
html+='<tr><td>'+fInput(i+"|date",u.date,{ph:"2026-09-09"})+'</td>'+
'<td>'+fInput(i+"|vendor",u.vendor)+'</td>'+
'<td>'+fInput(i+"|message",u.message)+'</td>'+
'<td><button class="admin-btn danger tiny" data-act="del" data-idx="'+i+'">삭제</button></td></tr>';
});
html+='</tbody></table></div>';
if(!d.length)html+='<div class="admin-empty">기록이 없습니다.</div>';
html+='<button class="admin-btn ghost" data-act="add-update" style="margin-top:10px">+ 기록 추가</button>';
return html;
}

function edMapVendors(){
var d=draftOf("mapVendors");
var layers=ADM.meta.mapLayers,badges=ADM.meta.knownBadges;
var typeOpts=ADM.meta.bulletTypes.map(function(t){return [t,TYPE_LABEL[t]||t];});
var scoreOpts=[0,1,2,3,4,5].map(function(n){return [String(n),String(n)];});
var html="";
d.forEach(function(v,i){
html+='<div class="mv-card"><div class="mv-card-head">'+
'<span class="mvh-name">'+esc(v.name||"(이름 없음)")+'</span>'+
'<input type="color" data-p="'+i+'|color" value="'+esc(/^#[0-9A-Fa-f]{6}$/.test(v.color||"")?v.color:"#94A3B8")+'" style="width:38px;height:28px;background:none;border:1px solid var(--border-strong);border-radius:4px;cursor:pointer">'+
fChk(i+"|estimated",v.estimated===true,"추정치 표시")+
'<button class="admin-btn danger tiny" data-act="del" data-idx="'+i+'" style="margin-left:auto">벤더 삭제</button></div>';
html+='<div class="admin-grid"><div class="admin-field"><label>name (벤더명)</label>'+fInput(i+"|name",v.name)+'</div>'+
'<div class="admin-field"><label>specialty (한 줄 특징)</label>'+fArea(i+"|specialty",v.specialty,2)+'</div></div>';
html+='<div class="mv-scores">';
layers.forEach(function(l){
html+='<div class="mv-score"><span>'+esc(l)+'</span>'+fSel(i+"|scores|"+l,(v.scores&&v.scores[l]),scoreOpts,"int")+'</div>';
});
html+='</div>';
html+='<div class="admin-field"><label>badges (추가 역량)</label><div class="mv-badges">';
badges.forEach(function(b){
var on=(v.badges||[]).indexOf(b)!==-1;
html+='<label class="admin-switch"><input type="checkbox" data-act="toggle-badge" data-idx="'+i+'" data-badge="'+esc(b)+'"'+(on?" checked":"")+'>'+esc(b)+'</label>';
});
html+='</div></div>';
layers.forEach(function(l){
var blk=(v.rationale&&v.rationale[l])||{type:[],bullets:[]};
html+='<div class="mv-layer"><div class="mv-layer-name">'+esc(l)+' 근거 (최소 1줄)</div>';
(blk.bullets||[]).forEach(function(b,bi){
html+='<div class="mv-bullet">'+
fSel(i+"|rationale|"+l+"|type|"+bi,(blk.type||[])[bi]||"neu",typeOpts)+
'<textarea class="admin-textarea" rows="2" data-p="'+i+'|rationale|'+l+'|bullets|'+bi+'">'+esc(b)+'</textarea>'+
'<button class="admin-btn danger tiny" data-act="del-bullet" data-idx="'+i+'" data-layer="'+esc(l)+'" data-bi="'+bi+'">×</button></div>';
});
html+='<button class="admin-btn ghost tiny" data-act="add-bullet" data-idx="'+i+'" data-layer="'+esc(l)+'">+ 근거 추가</button></div>';
});
html+='</div>';
});
if(!d.length)html+='<div class="admin-empty">추가 벤더가 없습니다. '+esc(navLabelOf("map")||"Vendor Map")+' 메뉴의 기본 11개 벤더는 js/data.js에 정적으로 있어 여기서 편집하지 않습니다.</div>';
html+='<button class="admin-btn ghost" data-act="add-mapvendor" style="margin-top:6px">+ 벤더 추가</button>';
return html;
}

function edMap2(){
var d=draftOf("map2Overrides");
var axes=ADM.meta.map2Layers;
if(!MAP2_BASE.length)return '<div class="admin-empty">js/data2.js를 불러오지 못해 기본 점수를 표시할 수 없습니다.</div>';
var html='<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>벤더</th>';
axes.forEach(function(a){html+='<th style="text-align:center">'+esc(a)+'</th>';});
html+='<th style="width:76px">합계</th></tr></thead><tbody>';
MAP2_BASE.forEach(function(v){
var ov=d[v.name]||{};
var total=0;
var cells="";
axes.forEach(function(a){
var base=(v.scores&&typeof v.scores[a]==="number")?v.scores[a]:0;
var cur=(typeof ov[a]==="number")?ov[a]:base;
total+=cur;
var opts=[["","기본 ("+base+")"]].concat([0,1,2,3,4,5].map(function(n){return [String(n),String(n)];}));
cells+='<td style="text-align:center">'+fSel(v.name+"|"+a,(typeof ov[a]==="number")?ov[a]:"",opts,"intn")+'</td>';
});
html+='<tr><td style="font-weight:700;min-width:180px"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+esc(v.color)+';margin-right:7px"></span>'+esc(v.name)+'</td>'+
cells+'<td style="font-family:monospace;color:var(--accent-text);font-weight:800">'+total+'/25</td></tr>';
});
html+='</tbody></table></div>';
html+='<div class="admin-hint" style="border:0;margin-top:10px;padding:0;">"기본"을 고르면 덮어쓰기를 지우고 js/data2.js 값을 씁니다. 현재 덮어쓴 벤더: '+Object.keys(d).length+'개</div>';
return html;
}

function covVendorNames(){
var set={};
(ADM.doc.covRows||[]).forEach(function(r){
if(r.coverage)Object.keys(r.coverage).forEach(function(k){set[k]=true;});
});
(ADM.doc.pocVendors||[]).forEach(function(v){if(v.name)set[v.name]=true;});
return Object.keys(set).sort();
}

function edCovRows(){
var d=draftOf("covRows");
var q=ADM.covFilter.trim().toLowerCase();
var covOpts=ADM.meta.coverageValues.map(function(c){return [c,COV_LABEL[c]||c];});
var vnames=covVendorNames();

var html='<div class="cov-filter-row">'+
'<input class="admin-input" id="covFilterInput" type="text" placeholder="구분·상세구분·예시로 검색" value="'+esc(ADM.covFilter)+'" style="max-width:300px">'+
(q?'<button class="admin-btn ghost tiny" data-act="cov-filter-clear">검색 해제</button>':'')+
'<span class="admin-status">'+d.length+'행 중 '+d.filter(function(r){return !q||matchCov(r,q);}).length+'행 표시</span></div>';

html+='<div class="admin-table-wrap"><table class="admin-table"><thead><tr>'+
'<th style="width:46px">#</th><th>구분</th><th>상세구분</th><th>예시</th><th style="width:150px"></th>'+
'</tr></thead><tbody>';
d.forEach(function(r,i){
if(q&&!matchCov(r,q))return;
var open=(ADM.covOpenId===r.id);
html+='<tr><td style="font-family:monospace;color:var(--text-faint)">'+(i+1)+'</td>'+
'<td>'+esc(r.category||"-")+'</td><td>'+esc(r.subCategory||"-")+'</td><td>'+esc(r.example||"-")+'</td>'+
'<td><div class="admin-rowbtns">'+
'<button class="admin-btn ghost tiny" data-act="cov-open" data-rid="'+esc(r.id)+'">'+(open?"닫기":"편집")+'</button>'+
'<button class="admin-btn danger tiny" data-act="del" data-idx="'+i+'">삭제</button></div></td></tr>';
if(open){
html+='<tr><td colspan="5" style="background:transparent;border:0;padding:0"><div class="cov-edit-panel">'+
'<div class="admin-grid">'+
'<div class="admin-field"><label>category (구분)</label>'+fInput(i+"|category",r.category)+'</div>'+
'<div class="admin-field"><label>subCategory (상세구분)</label>'+fInput(i+"|subCategory",r.subCategory)+'</div>'+
'<div class="admin-field"><label>example (예시)</label>'+fInput(i+"|example",r.example)+'</div>'+
'<div class="admin-field"><label>solutionMeans (적용 수단)</label>'+fInput(i+"|solutionMeans",r.solutionMeans)+'</div>'+
'</div>'+
'<div class="admin-field" style="margin-top:12px"><label>description (설명)</label>'+fArea(i+"|description",r.description,3)+'</div>'+
'<div class="admin-field" style="margin-top:12px"><label>controlTarget (통제 대상)</label>'+fArea(i+"|controlTarget",r.controlTarget,2)+'</div>'+
'<div class="admin-field" style="margin-top:12px"><label>controlMethod (통제 방법)</label>'+fArea(i+"|controlMethod",r.controlMethod,3)+'</div>'+
'<div class="admin-field" style="margin-top:14px"><label>벤더별 커버리지</label><div class="cov-cov-grid">';
vnames.forEach(function(vn){
var cur=(r.coverage&&r.coverage[vn])||"unknown";
html+='<div class="cov-cov-item"><span title="'+esc(vn)+'">'+esc(vn)+'</span>'+
fSel(i+"|coverage|"+vn,cur,covOpts)+'</div>';
});
html+='</div></div></div></td></tr>';
}
});
html+='</tbody></table></div>';
if(!d.length)html+='<div class="admin-empty">행이 없습니다.</div>';
html+='<button class="admin-btn ghost" data-act="add-cov" style="margin-top:10px">+ 행 추가</button>';
return html;
}

function matchCov(r,q){
return ["category","subCategory","example","description","controlTarget","controlMethod","solutionMeans"].some(function(f){
return String(r[f]||"").toLowerCase().indexOf(q)!==-1;
});
}

function edSnapshots(){
if(!ADM.snaps.length)return '<div class="admin-empty">보관된 스냅샷이 없습니다. 데이터를 한 번 저장하면 생성됩니다.</div>';
var html="";
ADM.snaps.forEach(function(s,i){
html+='<div class="snap-row"><span class="sr-at">'+esc(String(s.at).replace("T"," ").slice(0,19))+'</span>'+
'<span class="sr-label">'+esc(s.label)+'</span>'+
'<button class="admin-btn ghost tiny" data-act="restore" data-idx="'+i+'">이 시점으로 복원</button></div>';
});
return html;
}

/* ---------- 부팅 ---------- */
(function(){
loadToken();
if(ADM.token)load();
else renderLogin("");
/* 통제 매트릭스 검색창은 리렌더 없이 값만 반영 */
document.addEventListener("input",function(e){
if(e.target&&e.target.id==="covFilterInput"){
ADM.covFilter=e.target.value;
var body=byId("admBody");
if(body){
body.innerHTML=edCovRows();
var f=byId("covFilterInput");
if(f){f.focus();f.setSelectionRange(f.value.length,f.value.length);}
}
}
});
})();
