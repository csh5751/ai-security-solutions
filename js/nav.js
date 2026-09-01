var navLinks=[
{page:"dashboard",href:"index.html",label:"Home"},
{page:"map",href:"map.html",label:"Vendor Map"},
{page:"progress",href:"progress.html",label:"PoC 진행현황"},
{page:"coverage",href:"coverage.html",label:"통제 매트릭스"},
{page:"timeline",href:"timeline.html",label:"로드맵"},
{page:"reports",href:"reports.html",label:"평가 리포트"}
];

(function(){
var current=document.body.getAttribute("data-page");
var isLight=document.documentElement.getAttribute("data-theme")==="light";
var html='<div class="topnav"><span class="brand">AI SECURITY <span class="accent">PoC</span></span>';
navLinks.forEach(function(l){
html+='<a href="'+l.href+'"'+(l.page===current?' class="active"':'')+'>'+l.label+'</a>';
});
html+='<button type="button" class="theme-toggle" id="theme-toggle-btn">'+(isLight?"🌙 다크":"☀️ 라이트")+'</button>';
html+='</div>';
document.getElementById("nav-root").innerHTML=html;

document.getElementById("theme-toggle-btn").addEventListener("click",function(){
var nowLight=document.documentElement.getAttribute("data-theme")==="light";
var next=nowLight?"dark":"light";
if(next==="light"){
document.documentElement.setAttribute("data-theme","light");
}else{
document.documentElement.removeAttribute("data-theme");
}
try{localStorage.setItem("theme",next)}catch(e){}
this.textContent=next==="light"?"🌙 다크":"☀️ 라이트";
document.dispatchEvent(new CustomEvent("theme-change"));
});
})();
