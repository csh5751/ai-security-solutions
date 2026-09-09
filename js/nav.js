/* 상단 메뉴. 표시 여부/이름/순서는 관리자 페이지에서 저장한 navConfig(KV)를 따른다.
   - 메뉴 자체는 localStorage 캐시로 즉시 렌더(깜빡임 방지)
   - 접근 차단 판정은 서버 응답만 신뢰(캐시가 낡아 잘못 차단하는 것을 막기 위함) */
var NAV_PAGES_FALLBACK = [
{page:"dashboard",href:"index.html",label:"Home",locked:true},
{page:"map",href:"map.html",label:"Vendor Map"},
{page:"map2",href:"map2.html",label:"Vendor Map II"},
{page:"progress",href:"progress.html",label:"PoC 진행현황"},
{page:"coverage",href:"coverage.html",label:"통제 매트릭스"},
{page:"timeline",href:"timeline.html",label:"로드맵"},
{page:"reports",href:"reports.html",label:"평가 리포트"}
];
var NAV_CACHE_KEY = "navConfigCache";

function navReadCache(){
try{var raw=localStorage.getItem(NAV_CACHE_KEY);return raw?JSON.parse(raw):null;}catch(e){return null;}
}
function navWriteCache(obj){
try{localStorage.setItem(NAV_CACHE_KEY,JSON.stringify(obj));}catch(e){}
}
function navHasAdminToken(){
try{return !!localStorage.getItem("adminToken");}catch(e){return false;}
}
function navEscape(s){
return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* pages(서버 정의 또는 폴백) + cfg(표시/이름/순서)를 합쳐 렌더 목록을 만든다 */
function navResolve(pages,cfg){
var list=(pages&&pages.length?pages:NAV_PAGES_FALLBACK).map(function(p,i){
var e=cfg&&cfg[p.page]?cfg[p.page]:null;
return {
page:p.page,
href:p.href,
label:(e&&e.label)?e.label:p.label,
order:(e&&typeof e.order==="number")?e.order:i,
visible:p.locked?true:(e?e.visible!==false:true)
};
});
list.sort(function(a,b){return a.order-b.order;});
return list;
}

function navRender(pages,cfg){
var root=document.getElementById("nav-root");
if(!root)return;
var current=document.body.getAttribute("data-page");
var isLight=document.documentElement.getAttribute("data-theme")==="light";
var items=navResolve(pages,cfg).filter(function(l){return l.visible;});

var html='<div class="topnav"><span class="brand">AI SECURITY <span class="accent">PoC</span></span>';
items.forEach(function(l){
html+='<a href="'+l.href+'"'+(l.page===current?' class="active"':'')+'>'+navEscape(l.label)+'</a>';
});
/* 관리자 링크는 관리자 토큰을 가진 브라우저에만 노출 */
if(navHasAdminToken()||current==="admin"){
html+='<a href="admin.html" class="nav-admin'+(current==="admin"?' active':'')+'">⚙ 관리자</a>';
}
html+='<button type="button" class="theme-toggle" id="theme-toggle-btn">'+(isLight?"🌙 다크":"☀️ 라이트")+'</button>';
html+='</div>';
root.innerHTML=html;

document.getElementById("theme-toggle-btn").addEventListener("click",function(){
var nowLight=document.documentElement.getAttribute("data-theme")==="light";
var next=nowLight?"dark":"light";
if(next==="light")document.documentElement.setAttribute("data-theme","light");
else document.documentElement.removeAttribute("data-theme");
try{localStorage.setItem("theme",next)}catch(e){}
this.textContent=next==="light"?"🌙 다크":"☀️ 라이트";
document.dispatchEvent(new CustomEvent("theme-change"));
});
}

/* 비활성화된 메뉴로 직접 들어온 경우 안내 후 홈으로 보냄.
   정적 사이트이므로 접근제어가 아니라 '정리' 수단이다 - JS/API를 직접 보면 우회 가능 */
function navEnforce(pages,cfg){
var current=document.body.getAttribute("data-page");
if(!current||current==="admin")return;
var defs=(pages&&pages.length?pages:NAV_PAGES_FALLBACK);
var def=null;
for(var i=0;i<defs.length;i++){if(defs[i].page===current){def=defs[i];break;}}
if(!def||def.locked)return;
var e=cfg&&cfg[current];
if(!e||e.visible!==false)return;

var label=(e&&e.label)?e.label:def.label;
var ov=document.createElement("div");
ov.className="nav-blocked";
ov.innerHTML='<div class="nav-blocked-card">'+
'<div class="nb-title">비활성화된 메뉴</div>'+
'<div class="nb-desc"><strong>'+navEscape(label)+'</strong> 메뉴는 현재 관리자 설정에서 비활성화되어 있습니다.</div>'+
'<div class="nb-sub">3초 후 홈으로 이동합니다.</div>'+
'<a class="nb-btn" href="index.html">홈으로 가기</a></div>';
document.body.appendChild(ov);
setTimeout(function(){location.replace("index.html");},3000);
}

(function(){
var cached=navReadCache();
navRender(cached&&cached.pages,cached&&cached.navConfig);
fetch("/api/nav").then(function(r){return r.ok?r.json():null;}).then(function(d){
if(!d||!d.navConfig)return;
navWriteCache({navConfig:d.navConfig,pages:d.pages});
navRender(d.pages,d.navConfig);
navEnforce(d.pages,d.navConfig);
}).catch(function(){});
})();
