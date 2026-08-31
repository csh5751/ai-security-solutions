var navLinks=[
{page:"dashboard",href:"index.html",label:"Home"},
{page:"map",href:"map.html",label:"Vendor Map"},
{page:"progress",href:"progress.html",label:"PoC 진행현황"},
{page:"timeline",href:"timeline.html",label:"로드맵"},
{page:"reports",href:"reports.html",label:"평가 리포트"}
];

(function(){
var current=document.body.getAttribute("data-page");
var html='<div class="topnav"><span class="brand">AI SECURITY <span class="accent">PoC</span></span>';
navLinks.forEach(function(l){
html+='<a href="'+l.href+'"'+(l.page===current?' class="active"':'')+'>'+l.label+'</a>';
});
html+='</div>';
document.getElementById("nav-root").innerHTML=html;
})();
