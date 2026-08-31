var selected=["Zenity"];
var radarChart=null;
var explorerSelectedVendor="Zenity";

function hexToRgba(hex,alpha){
var r=parseInt(hex.slice(1,3),16);
var g=parseInt(hex.slice(3,5),16);
var b=parseInt(hex.slice(5,7),16);
return "rgba("+r+","+g+","+b+","+alpha+")";
}

function cssVar(name){
return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function findVendor(name){
for(var i=0;i<vendors.length;i++){if(vendors[i].name===name)return vendors[i];}
return null;
}

function totalScore(v){
return layers.reduce(function(s,l){return s+v.scores[l];},0);
}

function mergeMapVendors(doc){
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

function buildLayout(){
var domainCount=0;
layers.forEach(function(l){domainCount+=threatDomains[l].length;});
document.getElementById("root").innerHTML=
'<div class="hero">'+
'<div><h1>AI SECURITY <span class="accent">VENDOR MAP</span></h1><p>// Layer x Threat Domain Coverage Assessment</p></div>'+
'<div style="text-align:right;"><div class="badge">AX SECURITY PIVOT TF</div><div style="margin-top:10px;font-size:12px;color:var(--text-faint);">// '+vendors.length+' vendors / '+layers.length+' layers / '+domainCount+' domains + Extended</div></div>'+
'</div>'+
section("01","Vendor Selection","// 다중 선택 가능")+
'<div class="control-panel"><div class="control-row"><span class="control-label">// Selected vendors</span><button class="reset-btn" id="resetBtn">Reset</button></div><div class="vendor-chips" id="vendorChips"></div></div>'+
section("02","Best-in-Class by Layer","// 선택된 벤더 기준 최고점")+
'<div class="best-grid" id="bestGrid"></div><div class="insights" id="insights"></div>'+
section("03","Coverage Radar","// Layer 기준 종합 비교 + Layer 의미 설명")+
'<div class="main-grid"><div class="panel"><div class="panel-title">// Radar Chart (0~5) - 추가 강점은 +태그로 표시</div><div class="radar-box"><canvas id="radarChart"></canvas></div></div><div class="panel"><div class="panel-title">// Score Summary + Extended</div><div id="scoreTableWrap"></div></div></div>'+
'<div class="layer-glossary"><div class="lg-title">// Layer Meaning - 각 Layer 의미 설명</div><div class="lg-list" id="layerGlossary"></div></div>'+
section("04","Vendor Score Rationale","// Layer x Vendor 매트릭스 - Extended는 해당 벤더만 추가 표시")+
'<div class="rationale-wrap" id="compareWrap"></div>'+
section("05","Threat Domain Heatmap","// 20개 세부 영역 x 벤더 매트릭스")+
'<div class="heatmap-wrap"><table class="heatmap-table" id="heatmapTable"></table><div class="legend-bar"><div class="legend-item"><div class="legend-color s-5"></div>5 STRONG</div><div class="legend-item"><div class="legend-color s-4"></div>4 GOOD</div><div class="legend-item"><div class="legend-color s-3"></div>3 MODERATE</div><div class="legend-item"><div class="legend-color s-2"></div>2 LIMITED</div><div class="legend-item"><div class="legend-color s-1"></div>1 WEAK</div><div class="legend-item"><div class="legend-color s-0"></div>0 NONE</div></div></div>'+
section("06","Similar Vendor Groups","// 패턴이 비슷한 벤더 자동 클러스터링")+
'<div class="cluster-grid" id="clusterGrid"></div>'+
section("07","Vendor Similarity Explorer","// Core 5축 + Extended 강점 영역 고려한 유사도")+
'<div class="explorer-wrap"><div class="explorer-controls" id="explorerControls"></div><div class="similar-list" id="similarList"></div></div>'+
section("08","Layer-by-Layer Tier Groups","// Core 5개 Layer 기준 강함/중간/약함 그룹")+
'<div class="layer-cluster-wrap" id="layerClusterWrap"></div>'+
section("09","Extended Capabilities Map","// AI Security 외 추가로 커버하는 영역")+
'<div class="ext-cap-wrap" id="extCapWrap"></div>'+
'<div class="footer-note">// DATA: 공개 자료 + 내부 평가 기준 기반 추정치 - 실제 PoC 결과에 따라 조정 필요</div>';

document.getElementById("resetBtn").onclick=function(){selected=["Zenity"];renderAll();};
}

function section(num,title,sub){
return '<div class="sec-header"><span class="num">['+num+']</span><span class="title">'+title+'</span><span class="sub">'+sub+'</span></div><div class="divider"></div>';
}

function badgesHtml(vendorName){
var badges=vendorBadges[vendorName]||[];
if(!badges.length)return "";
var html='<div class="cap-badges">';
badges.forEach(function(b){
var cap=extCapabilities[b];
html+='<span class="cap-badge" title="'+cap.fullName+' - '+cap.desc.replace(/"/g,"&quot;")+'">'+b+'</span>';
});
html+='</div>';
return html;
}

function renderChips(){
var wrap=document.getElementById("vendorChips");
wrap.innerHTML="";
vendors.forEach(function(v){
var el=document.createElement("div");
el.className="vendor-chip"+(selected.indexOf(v.name)!==-1?" selected":"");
el.innerHTML='<span class="dot" style="background:'+v.color+'"></span><span class="name">'+v.name+'</span>';
el.onclick=function(){
var idx=selected.indexOf(v.name);
if(idx!==-1)selected.splice(idx,1);
else selected.push(v.name);
if(selected.length===0)selected=[v.name];
renderAll();
};
wrap.appendChild(el);
});
}

function renderLayerGlossary(){
var wrap=document.getElementById("layerGlossary");
var html="";
layers.forEach(function(l){
html+='<div class="lg-item"><div class="lg-name">'+layerLabels[l]+'</div><div class="lg-desc">'+layerExplanations[l]+'</div></div>';
});
wrap.innerHTML=html;
}

function renderRadar(){
var ctx=document.getElementById("radarChart").getContext("2d");
var datasets=selected.map(function(name){
var v=findVendor(name);
var badges=vendorBadges[v.name]||[];
var label=v.name+(badges.length?"  "+badges.map(function(b){return "+"+b;}).join(" "):"");
return{
label:label,
data:layers.map(function(l){return v.scores[l];}),
backgroundColor:hexToRgba(v.color,.18),
borderColor:v.color,
borderWidth:2.4,
pointBackgroundColor:v.color,
pointBorderColor:cssVar("--bg"),
pointRadius:5,
pointHoverRadius:8
};
});
if(radarChart)radarChart.destroy();
radarChart=new Chart(ctx,{
type:"radar",
data:{labels:layers.map(function(l){return layerLabels[l];}),datasets:datasets},
options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{position:"bottom",labels:{color:cssVar("--text-body"),font:{size:12,weight:"bold"},padding:14,usePointStyle:true,boxWidth:8}},
tooltip:{backgroundColor:cssVar("--surface"),borderColor:cssVar("--accent"),borderWidth:1,titleColor:cssVar("--accent-text"),bodyColor:cssVar("--text-primary")}
},
scales:{
r:{
min:0,
max:5,
ticks:{stepSize:1,backdropColor:"transparent",color:cssVar("--text-faint"),font:{size:10}},
grid:{color:"rgba(255,107,53,.08)"},
angleLines:{color:"rgba(255,107,53,.15)"},
pointLabels:{color:cssVar("--text-primary"),font:{size:13,weight:"bold"}}
}
}
}
});
}

function renderScoreTable(){
var wrap=document.getElementById("scoreTableWrap");
var rows=selected.map(function(name){var v=findVendor(name);return{v:v,total:totalScore(v)};}).sort(function(a,b){return b.total-a.total;});
var html='<table class="score-table"><thead><tr><th>// Vendor</th>';
layers.forEach(function(l){html+='<th>'+layerLabels[l]+'</th>';});
html+='<th>TOTAL</th></tr></thead><tbody>';
rows.forEach(function(r,i){
var rank="";
if(i===0&&rows.length>1)rank='<span class="rank-tag rank-1">#1</span>';
else if(i===1)rank='<span class="rank-tag rank-2">#2</span>';
else if(i===2)rank='<span class="rank-tag rank-3">#3</span>';
html+='<tr><td><div class="v-cell"><span class="dot" style="background:'+r.v.color+'"></span><span class="v-name">'+r.v.name+'</span>'+rank+badgesHtml(r.v.name)+'</div></td>';
layers.forEach(function(l){html+='<td><span class="mini-score s-'+r.v.scores[l]+'">'+r.v.scores[l]+'</span></td>';});
html+='<td class="total-cell">'+r.total+'/25</td></tr>';
});
html+='</tbody></table>';
wrap.innerHTML=html;
}

function renderBestInClass(){
var grid=document.getElementById("bestGrid");
grid.innerHTML="";
layers.forEach(function(layer){
var best=null;
selected.forEach(function(name){
var v=findVendor(name);
if(!best||v.scores[layer]>best.score)best={name:v.name,color:v.color,score:v.scores[layer]};
});
grid.innerHTML+='<div class="best-card"><div class="label">// '+layerLabels[layer]+' Champion</div><div class="layer-name">'+layerLabels[layer]+'</div><div class="winner"><span class="winner-dot" style="background:'+best.color+'"></span><span class="winner-name">'+best.name+'</span></div><div class="score-line"><span class="score-big">'+best.score+'</span><span class="score-max">/ 5</span></div></div>';
});
}

function renderInsights(){
var wrap=document.getElementById("insights");
var ranked=selected.map(function(name){var v=findVendor(name);return{name:v.name,total:totalScore(v)};}).sort(function(a,b){return b.total-a.total;});
var avg={};
layers.forEach(function(l){
var sum=selected.reduce(function(s,name){return s+findVendor(name).scores[l];},0);
avg[l]=(sum/selected.length).toFixed(1);
});
var weakest=layers[0];
layers.forEach(function(l){if(parseFloat(avg[l])<parseFloat(avg[weakest]))weakest=l;});
wrap.innerHTML=
'<div class="insight-card"><h4>// SELECTED</h4><div class="num-big">'+selected.length+'</div><p>비교 중인 솔루션 수</p></div>'+
'<div class="insight-card"><h4>// TOP PERFORMER</h4><div class="num-big accent" style="font-size:20px;">'+ranked[0].name+'</div><p>'+ranked[0].total+' / 25 points</p></div>'+
'<div class="insight-card"><h4>// WEAKEST LAYER</h4><div class="num-big" style="font-size:20px;">'+layerLabels[weakest]+'</div><p>avg '+avg[weakest]+' / 5</p></div>';
}

function renderCompareAnalysis(){
var wrap=document.getElementById("compareWrap");
var html="";
if(selected.length===1){
var v=findVendor(selected[0]);
var rationale=vendorRationale[v.name];
var badges=vendorBadges[v.name]||[];
var extRat=vendorExtRationale[v.name];
html+='<div class="single-vendor" style="border-left-color:'+v.color+'">';
html+='<div class="vh"><span class="dot" style="background:'+v.color+'"></span><span class="vn">'+v.name+'</span><span class="total-pill">'+totalScore(v)+'/25</span></div>';
html+='<div class="vh-tag">// '+vendorSpecialty[v.name]+'</div>'+badgesHtml(v.name);
html+='<div class="layer-rows">';
layers.forEach(function(l){
var s=v.scores[l],lr=rationale[l];
html+='<div class="layer-row"><div class="lr-name"><div class="lr-bar" style="background:'+v.color+'"></div><div class="lr-text">'+layerLabels[l]+'</div></div><div class="lr-score-box s-'+s+'">'+s+'</div><div class="lr-bullets"><ul>';
lr.bullets.forEach(function(b,idx){html+='<li class="'+(lr.type[idx]||"neu")+'">'+b+'</li>';});
html+='</ul></div></div>';
});
html+='</div>';
if(badges.length&&extRat){
html+='<div class="ext-section-divider"><div class="ext-banner"><span class="ext-label">// Extended Capabilities</span><span class="ext-desc">AI 보안 영역 외 추가 강점</span></div></div><div class="layer-rows">';
badges.forEach(function(b){
var cap=extCapabilities[b],br=extRat[b];
if(!br)return;
html+='<div class="layer-row ext"><div class="lr-name"><div class="lr-bar"></div><div class="lr-text">'+cap.fullName.split(" / ")[0]+'</div></div><div class="lr-score-box s-5">+</div><div class="lr-bullets"><ul>';
br.bullets.forEach(function(bb,idx){html+='<li class="'+(br.type[idx]||"neu")+'">'+bb+'</li>';});
html+='</ul></div></div>';
});
html+='</div>';
}
html+='</div>';
wrap.innerHTML=html;
return;
}

var gridCols="110px repeat("+selected.length+", minmax(220px,1fr))";
html+='<div class="matrix-grid" style="grid-template-columns:'+gridCols+'">';
html+='<div class="matrix-header-cell">// LAYER</div>';

selected.forEach(function(name){
var v=findVendor(name);
html+='<div class="matrix-vendor-header" style="border-top-color:'+v.color+'"><div class="vh-row"><span class="dot" style="background:'+v.color+'"></span><span class="vn">'+v.name+'</span><span class="total-pill">'+totalScore(v)+'/25</span></div><div class="vh-tag">'+vendorSpecialty[v.name]+'</div>'+badgesHtml(v.name)+'</div>';
});

layers.forEach(function(l){
html+='<div class="layer-label-cell"><div class="ll-name">'+layerLabels[l]+'</div><div class="ll-sub">'+layerSubs[l]+'</div></div>';
selected.forEach(function(name){
var v=findVendor(name),s=v.scores[l],lr=vendorRationale[v.name][l];
html+='<div class="vendor-cell"><div class="score-display"><div class="vendor-mini"><span class="dot-mini" style="background:'+v.color+'"></span><span class="vn-mini">'+v.name+'</span></div><div class="lr-score-box s-'+s+'">'+s+'</div></div><div class="bullets-mini"><ul>';
lr.bullets.forEach(function(b,idx){html+='<li class="'+(lr.type[idx]||"neu")+'">'+b+'</li>';});
html+='</ul></div></div>';
});
});

var allBadgeKeys=[];
selected.forEach(function(name){
(vendorBadges[name]||[]).forEach(function(b){if(allBadgeKeys.indexOf(b)===-1)allBadgeKeys.push(b);});
});
if(allBadgeKeys.length){
allBadgeKeys.forEach(function(capKey){
var cap=extCapabilities[capKey];
html+='<div class="layer-label-cell ext"><div class="ll-name">+ '+capKey+'</div><div class="ll-sub">// '+cap.fullName+'</div></div>';
selected.forEach(function(name){
var v=findVendor(name),has=(vendorBadges[v.name]||[]).indexOf(capKey)!==-1,er=vendorExtRationale[v.name];
html+='<div class="vendor-cell">';
if(has&&er&&er[capKey]){
html+='<div class="score-display"><div class="vendor-mini"><span class="dot-mini" style="background:'+v.color+'"></span><span class="vn-mini">'+v.name+'</span></div><div class="lr-score-box s-5">+</div></div><div class="bullets-mini"><ul>';
er[capKey].bullets.forEach(function(bb,idx){html+='<li class="'+(er[capKey].type[idx]||"neu")+'">'+bb+'</li>';});
html+='</ul></div>';
}else{
html+='<div class="score-display"><div class="vendor-mini"><span class="dot-mini" style="background:'+v.color+'"></span><span class="vn-mini">'+v.name+'</span></div><div class="lr-score-box s-0">-</div></div><div class="bullets-mini" style="color:var(--text-faint);">// 해당 영역 미보유</div>';
}
html+='</div>';
});
});
}
html+='</div>';

var ranked=selected.map(function(name){var v=findVendor(name);return{name:v.name,total:totalScore(v)};}).sort(function(a,b){return b.total-a.total;});
var layerLeaders={};
layers.forEach(function(l){
var max=-1,leader=null;
selected.forEach(function(name){var v=findVendor(name);if(v.scores[l]>max){max=v.scores[l];leader=v;}});
layerLeaders[l]={name:leader.name,score:max};
});
var bestCombo=[];
layers.forEach(function(l){if(bestCombo.indexOf(layerLeaders[l].name)===-1)bestCombo.push(layerLeaders[l].name);});
var leaderSummary="";
layers.forEach(function(l){leaderSummary+='<strong>'+layerLabels[l]+'</strong> -> '+layerLeaders[l].name+' ('+layerLeaders[l].score+'/5) &nbsp; ';});
html+='<div class="summary-block"><h4>// EXECUTIVE SUMMARY</h4><div class="line">';
html+='> 종합 1위: <strong>'+ranked[0].name+'</strong> ('+ranked[0].total+'/25) | 최하위: <strong>'+ranked[ranked.length-1].name+'</strong> ('+ranked[ranked.length-1].total+'/25)<br>';
html+='> Layer Champions: '+leaderSummary+'<br>';
html+='> <strong>Best-in-Class Combo</strong> -> '+bestCombo.join(" + ")+'</div></div>';
wrap.innerHTML=html;
}

function renderHeatmap(){
var tbl=document.getElementById("heatmapTable");
var html='<thead><tr><th style="min-width:80px;">// LAYER</th><th style="min-width:160px;">// THREAT DOMAIN</th><th style="min-width:260px;">// 설명</th>';
selected.forEach(function(name){
var v=findVendor(name);
html+='<th><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+v.color+';margin-right:6px;vertical-align:middle;"></span>'+v.name+'</th>';
});
html+='</tr></thead><tbody>';
layers.forEach(function(layer){
threatDomains[layer].forEach(function(domain,idx){
html+='<tr>';
if(idx===0)html+='<td class="layer-td" rowspan="'+threatDomains[layer].length+'">'+layerLabels[layer]+'</td>';
html+='<td class="domain-td">'+domain+'</td><td class="domain-desc">'+(domainDesc[domain]||"")+'</td>';
selected.forEach(function(name){
var v=findVendor(name),s=v.threatScores[domain];
html+='<td><div class="cell-score s-'+s+'">'+s+'</div></td>';
});
html+='</tr>';
});
});
html+='</tbody>';
tbl.innerHTML=html;
}

function renderClusterGroups(){
var grid=document.getElementById("clusterGrid");
var html="";
vendorClusters.forEach(function(c){
var membersHtml="";
c.members.forEach(function(name){var v=findVendor(name);if(v)membersHtml+='<div class="member-chip"><span class="mc-dot" style="background:'+v.color+'"></span>'+v.name+'</div>';});
var bars="";
layers.forEach(function(l){
var s=c.pattern[l],pct=s/5*100;
bars+='<div class="pattern-bar"><div class="pb-label">'+layerLabels[l].substring(0,4)+'</div><div class="pb-fill"><div class="pb-inner" style="height:'+pct+'%;"></div></div><div class="pb-score">'+s.toFixed(1)+'</div></div>';
});
html+='<div class="cluster-card"><div class="cluster-name">'+c.name+'</div><div class="cluster-trait">'+c.trait+'</div><div class="pattern-bars">'+bars+'</div><div class="member-list">'+membersHtml+'</div></div>';
});
grid.innerHTML=html;
}

function cosineSimilarityExtended(baseName,otherName){
var v1=findVendor(baseName).scores,v2=findVendor(otherName).scores;
var dot=0,mag1=0,mag2=0;
layers.forEach(function(l){var a=v1[l],b=v2[l];dot+=a*b;mag1+=a*a;mag2+=b*b;});
var b1=vendorBadges[baseName]||[],b2=vendorBadges[otherName]||[];
Object.keys(extCapabilities).forEach(function(k){
var a=b1.indexOf(k)!==-1?5:0;
var b=b2.indexOf(k)!==-1?5:0;
dot+=a*b;mag1+=a*a;mag2+=b*b;
});
if(mag1===0||mag2===0)return 0;
return dot/(Math.sqrt(mag1)*Math.sqrt(mag2));
}

function renderExplorer(){
var controls=document.getElementById("explorerControls");
var list=document.getElementById("similarList");
var ctrl='<span class="label">// Base vendor:</span>';
vendors.forEach(function(v){
ctrl+='<div class="vendor-select-chip '+(explorerSelectedVendor===v.name?"active":"")+'" data-vendor="'+v.name+'">'+v.name+'</div>';
});
controls.innerHTML=ctrl;
var chips=controls.querySelectorAll(".vendor-select-chip");
for(var i=0;i<chips.length;i++){
chips[i].onclick=function(){
explorerSelectedVendor=this.getAttribute("data-vendor");
renderExplorer();
};
}
var base=findVendor(explorerSelectedVendor);
var sims=[];
vendors.forEach(function(v){
if(v.name!==base.name)sims.push({vendor:v,sim:cosineSimilarityExtended(base.name,v.name)});
});
sims.sort(function(a,b){return b.sim-a.sim;});
var top3=sims.slice(0,3);

function note(baseV,otherV){
var high=[],low=[],shared=[];
layers.forEach(function(l){
if(baseV.scores[l]>=4&&otherV.scores[l]>=4)high.push(layerLabels[l]);
if(baseV.scores[l]<=2&&otherV.scores[l]<=2)low.push(layerLabels[l]);
});
var bb=vendorBadges[baseV.name]||[],ob=vendorBadges[otherV.name]||[];
bb.forEach(function(b){if(ob.indexOf(b)!==-1)shared.push(b);});
var n="";
if(high.length)n+="<strong>같이 강함</strong>: "+high.join(", ");
if(low.length){if(n)n+=" &nbsp;|&nbsp; ";n+="<strong>같이 약함</strong>: "+low.join(", ");}
if(shared.length){if(n)n+="<br>";n+="<strong>공통 Extended</strong>: +"+shared.join(" / +");}
if(!n)n="<strong>중간 점수 영역에서 유사한 패턴</strong>";
return n;
}

var html="";
top3.forEach(function(item,idx){
var v=item.vendor,pct=(item.sim*100).toFixed(1),bars="";
layers.forEach(function(l){
var h=v.scores[l]/5*100;
bars+='<div class="smb"><div class="smb-fill" style="height:'+h+'%;"></div><div class="smb-label">'+layerLabels[l].substring(0,3)+'</div></div>';
});
html+='<div class="similar-card"><div class="sim-rank">#'+(idx+1)+' SIMILAR</div><div class="sim-header"><span class="dot" style="background:'+v.color+'"></span><span class="vn">'+v.name+'</span></div><div class="sim-percent">'+pct+'%</div><div class="sim-mini-bars">'+bars+'</div><div class="sim-note">'+note(base,v)+'</div></div>';
});
list.innerHTML=html;
}

function renderLayerClusters(){
var wrap=document.getElementById("layerClusterWrap");
var html="";
layers.forEach(function(l){
var strong=[],medium=[],weak=[];
vendors.forEach(function(v){
var s=v.scores[l];
if(s>=4)strong.push({v:v,s:s});
else if(s>=3)medium.push({v:v,s:s});
else weak.push({v:v,s:s});
});
strong.sort(function(a,b){return b.s-a.s;});
medium.sort(function(a,b){return b.s-a.s;});
weak.sort(function(a,b){return b.s-a.s;});

function tier(arr){
var h='<div class="lc-members">';
arr.forEach(function(item){
h+='<div class="lc-member"><span class="dot-tiny" style="background:'+item.v.color+'"></span>'+item.v.name+'<span class="score-tiny">'+item.s+'</span></div>';
});
h+='</div>';
return h;
}

html+='<div class="layer-cluster-row"><div class="lc-header"><div class="lc-bar"></div><div class="lc-name">'+layerLabels[l]+'</div><div class="lc-desc">'+layerSubs[l]+'</div></div><div class="lc-tiers">'+
'<div class="lc-tier strong"><div class="lc-tier-label">// STRONG (4~5)</div>'+tier(strong)+'</div>'+
'<div class="lc-tier medium"><div class="lc-tier-label">// MEDIUM (3)</div>'+tier(medium)+'</div>'+
'<div class="lc-tier weak"><div class="lc-tier-label">// WEAK (0~2)</div>'+tier(weak)+'</div>'+
'</div></div>';
});
wrap.innerHTML=html;
}

function renderExtCapMap(){
var wrap=document.getElementById("extCapWrap");
var html='<div class="ext-cap-intro"><strong>Extended Capabilities</strong>는 AI Security 5개 Core Layer 외에 각 벤더가 추가로 커버하는 영역입니다. 방사형 그래프에는 영향을 주지 않지만, 벤더 선택 시 해당 강점이 +태그로 표시되고, [04] Rationale 섹션에서는 추가 분석이 표시됩니다.</div><div class="ext-cap-grid">';
Object.keys(extCapabilities).forEach(function(k){
var cap=extCapabilities[k],owners=[];
vendors.forEach(function(v){if((vendorBadges[v.name]||[]).indexOf(k)!==-1)owners.push(v);});
var ownersHtml="";
if(!owners.length)ownersHtml='<div style="font-size:11px;color:var(--text-faint);font-family:monospace;">// 해당 벤더 없음</div>';
else owners.forEach(function(v){ownersHtml+='<div class="ecc-vendor-chip"><span class="ecc-dot" style="background:'+v.color+'"></span>'+v.name+'</div>';});
html+='<div class="ext-cap-card"><span class="ecc-tag">+'+k+'</span><div class="ecc-name">'+cap.fullName+'</div><div class="ecc-desc">'+cap.desc+'</div><div class="ecc-vendors">'+ownersHtml+'</div></div>';
});
html+='</div>';
wrap.innerHTML=html;
}

function renderAll(){
renderChips();
renderRadar();
renderScoreTable();
renderBestInClass();
renderInsights();
renderLayerGlossary();
renderCompareAnalysis();
renderHeatmap();
renderClusterGroups();
renderExplorer();
renderLayerClusters();
renderExtCapMap();
}

var chartScript=document.createElement("script");
chartScript.src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
chartScript.onload=function(){
fetch("/api/data").then(function(r){return r.ok?r.json():null;})
.then(function(doc){if(doc)mergeMapVendors(doc);})
.catch(function(){})
.then(function(){buildLayout();renderAll();});
};
chartScript.onerror=function(){
document.getElementById("root").innerHTML='<div class="loading" style="color:var(--status-bad-text);">Chart.js 로딩 실패 - 인터넷 연결 또는 CDN 접근 정책을 확인하세요.</div>';
};
document.head.appendChild(chartScript);

document.addEventListener("theme-change",function(){
if(typeof renderAll==="function"&&document.getElementById("radarChart"))renderAll();
});
