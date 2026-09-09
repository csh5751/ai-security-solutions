/* 발표용 모션 레이어. 관리자 페이지에서는 동작하지 않는다.
   설계 원칙
   - 진입 상태(opacity:0)는 이 파일만 부여한다. 스크립트가 실패하거나
     사용자가 모션을 껐으면 콘텐츠는 처음부터 그대로 보인다.
   - 각 페이지는 fetch 이후 #root를 비동기로 다시 그리므로, 앱 코드를
     건드리지 않고 MutationObserver로 새 노드를 감지해 다시 적용한다. */
(function(){
if(document.body.getAttribute("data-page")==="admin")return;

var REVEAL_SEL=[
".hero",".sec-header",".box",".panel",".summary-block",
".dash-stat-card",".vendor-status-card",".update-log-item",".quick-nav-card",
".insight-card",".best-card",".cluster-card",".similar-card",".ext-cap-card",
".layer-cluster-row",".lg-item",".matrix-vendor-header",
".report-card",".single-vendor",".timeline-row",".milestone-row",
/* 통제 매트릭스는 제외한다. tr에 transform이 걸리면 containing block이
   새로 생겨 좌측 고정 열의 position:sticky가 깨진다 */
".progress-matrix:not(.coverage-matrix) tbody tr"
].join(",");

var COUNT_SEL=".dash-stat-value,.num-big,.score-big,.sim-percent,.total-cell,.total-pill";

/* 숫자 카운트업 대상 서식 화이트리스트.
   "MS Agent 365"처럼 이름에 숫자가 섞인 값을 잘못 애니메이션하지 않도록
   전체 문자열이 아래 형태와 정확히 일치할 때만 처리한다. m[1]=접두 m[2]=숫자 m[3]=접미 */
var NUM_PATTERNS=[
/^()(\d+(?:\.\d+)?)(%?)$/,
/^()(\d+)(\s*\/\s*\d+)$/,
/^(D[-+])(\d+)()$/,
/^(TOTAL\s+)(\d+)(\s*\/\s*\d+)$/i
];

var reduced=false;
try{
reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}catch(e){}

var hasIO=typeof IntersectionObserver!=="undefined";

/* ---------- 스크롤 진행 바 ---------- */
function initScrollProgress(){
var bar=document.createElement("div");
bar.id="scroll-progress";
document.body.appendChild(bar);
var nav=document.querySelector(".topnav");
var queued=false;
function update(){
queued=false;
var doc=document.documentElement;
var max=(doc.scrollHeight||0)-window.innerHeight;
var pct=max>0?Math.min(100,Math.max(0,(window.scrollY/max)*100)):0;
bar.style.width=pct+"%";
if(nav){
if(nav.getBoundingClientRect().top<=0.5)nav.classList.add("mo-stuck");
else nav.classList.remove("mo-stuck");
}
}
function onScroll(){
if(queued)return;
queued=true;
window.requestAnimationFrame(update);
}
window.addEventListener("scroll",onScroll,{passive:true});
window.addEventListener("resize",onScroll,{passive:true});
update();
}

/* ---------- 진입 애니메이션 ---------- */
var revealIO=null;
function ensureRevealIO(){
if(revealIO||!hasIO)return revealIO;
revealIO=new IntersectionObserver(function(entries){
entries.forEach(function(en){
if(!en.isIntersecting)return;
en.target.classList.add("mo-in");
revealIO.unobserve(en.target);
});
},{rootMargin:"0px 0px -6% 0px",threshold:0.06});
return revealIO;
}

function staggerIndex(node){
var p=node.parentNode;
if(!p||!p.children)return 0;
var c=0;
for(var i=0;i<p.children.length;i++){
var s=p.children[i];
if(s===node)return c;
if(s.matches&&s.matches(REVEAL_SEL))c++;
}
return 0;
}

function applyReveals(scope){
if(reduced)return;
var io=ensureRevealIO();
var nodes=(scope||document).querySelectorAll(REVEAL_SEL);
for(var i=0;i<nodes.length;i++){
var n=nodes[i];
if(n.classList.contains("mo-reveal")||n.classList.contains("mo-in"))continue;
n.classList.add("mo-reveal");
var d=Math.min(staggerIndex(n),9)*48;
n.style.setProperty("--mo-d",d+"ms");
if(io)io.observe(n);
else n.classList.add("mo-in");
}
}

/* ---------- 숫자 카운트업 ---------- */
function parseNum(text){
var t=String(text==null?"":text).trim();
for(var i=0;i<NUM_PATTERNS.length;i++){
var m=NUM_PATTERNS[i].exec(t);
if(m){
var raw=m[2];
var dot=raw.indexOf(".");
return {pre:m[1]||"",to:parseFloat(raw),dec:dot===-1?0:raw.length-dot-1,suf:m[3]||""};
}
}
return null;
}

function runCount(el,spec){
var dur=900,start=null;
function frame(ts){
if(start===null)start=ts;
var p=Math.min(1,(ts-start)/dur);
var eased=1-Math.pow(1-p,3);
var v=spec.to*eased;
el.textContent=spec.pre+v.toFixed(spec.dec)+spec.suf;
if(p<1)window.requestAnimationFrame(frame);
else el.textContent=spec.pre+spec.to.toFixed(spec.dec)+spec.suf;
}
window.requestAnimationFrame(frame);
}

var countIO=null;
function ensureCountIO(){
if(countIO||!hasIO)return countIO;
countIO=new IntersectionObserver(function(entries){
entries.forEach(function(en){
if(!en.isIntersecting)return;
countIO.unobserve(en.target);
var spec=parseNum(en.target.getAttribute("data-mo-num"));
if(spec)runCount(en.target,spec);
});
},{threshold:0.35});
return countIO;
}

function applyCounts(scope){
if(reduced)return;
var io=ensureCountIO();
var nodes=(scope||document).querySelectorAll(COUNT_SEL);
for(var i=0;i<nodes.length;i++){
var n=nodes[i];
if(n.hasAttribute("data-mo-num"))continue;
var spec=parseNum(n.textContent);
if(!spec)continue;
/* 원본 문자열을 남겨 두어야 재적용 시 최종값을 복원할 수 있다 */
n.setAttribute("data-mo-num",n.textContent.trim());
if(io){
n.textContent=spec.pre+(0).toFixed(spec.dec)+spec.suf;
io.observe(n);
}
}
}

/* ---------- 비동기 렌더 대응 ---------- */
function watchRoot(){
if(typeof MutationObserver==="undefined")return;
var root=document.getElementById("root");
if(!root)return;
var timer=null;
/* childList만 관찰한다. 클래스 부여(attributes)까지 보면 자기 자신이
   트리거가 되어 무한 루프가 된다 */
new MutationObserver(function(){
if(timer)clearTimeout(timer);
timer=setTimeout(function(){
timer=null;
applyReveals(root);
applyCounts(root);
},70);
}).observe(root,{childList:true,subtree:true});
}

function boot(){
try{initScrollProgress();}catch(e){}
try{applyReveals(document);applyCounts(document);}catch(e){}
try{watchRoot();}catch(e){}
}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
else boot();
})();
