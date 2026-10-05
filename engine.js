(function(root){
  'use strict';
  var PSL=null;
  function load(str){
    var d={norm:{},wild:{},exc:{},n:0};
    str.split(' ').forEach(function(r){if(!r)return;var sec=r[0],t=r.slice(1);d.n++;
      if(t[0]==='!'){d.exc[t.slice(1)]=sec;}
      else if(t.slice(0,2)==='*.'){d.wild[t.slice(2)]=sec;}
      else d.norm[t]=sec;});
    PSL=d;return d;}
  // returns {suffixLen, rule, section} for a lower-case ASCII host
  function suffix(host,usePrivate){
    var h=host.split('.'),n=h.length,best=1,rule='*',sec='default',i,s;
    function ok(x){return x&&(usePrivate||x==='i');}
    for(i=0;i<n;i++){s=h.slice(i).join('.');
      if(PSL.exc[s]&&ok(PSL.exc[s])){return {suffixLen:n-i-1,rule:'!'+s,section:PSL.exc[s]==='i'?'ICANN':'private'};}}
    for(i=0;i<n;i++){s=h.slice(i).join('.');var k=n-i;
      if(PSL.norm[s]&&ok(PSL.norm[s])&&k>best){best=k;rule=s;sec=PSL.norm[s];}
      if(i+1<n){var t=h.slice(i+1).join('.');
        if(PSL.wild[t]&&ok(PSL.wild[t])&&k>best){best=k;rule='*.'+t;sec=PSL.wild[t];}}}
    return {suffixLen:best,rule:rule,section:sec==='i'?'ICANN':sec==='p'?'private':'default (unlisted TLD, rule "*")'};}
  function registrable(host,usePrivate){
    var h=host.split('.'),sx=suffix(host,usePrivate),n=h.length;
    return {suffix:h.slice(n-sx.suffixLen).join('.'),
      domain:n>sx.suffixLen?h.slice(n-sx.suffixLen-1).join('.'):null,rule:sx.rule,section:sx.section};}
  var SPECIAL={'http:':1,'https:':1,'ws:':1,'wss:':1,'ftp:':1};
  function parse(str,usePrivate){
    var s=String(str).trim();
    if(!s)return {error:'Type a URL.'};
    if(!/^[A-Za-z][A-Za-z0-9+.\-]*:/.test(s))s='https://'+s;
    var u;try{u=new URL(s);}catch(e){return {error:'Not a valid URL.'};}
    if(!SPECIAL[u.protocol])return {error:'Scheme "'+u.protocol+'" is not supported here (use http, https, ws, wss or ftp).'};
    var host=u.hostname,isIp=/^\[/.test(host)||/^\d+\.\d+\.\d+\.\d+$/.test(host);
    var port=u.port||({'http:':'80','https:':'443','ws:':'80','wss:':'443','ftp:':'21'})[u.protocol];
    var r={url:u.href,scheme:u.protocol.slice(0,-1),host:host,port:port,origin:u.protocol+'//'+host+':'+port,isIp:isIp};
    if(isIp){r.suffix=null;r.domain=null;r.rule=null;r.section='IP address';r.site=r.scheme+'://'+host;}
    else{var g=registrable(host.replace(/\.$/,''),usePrivate);r.suffix=g.suffix;r.domain=g.domain;r.rule=g.rule;r.section=g.section;
      r.site=r.scheme+'://'+(g.domain||host.replace(/\.$/,''));}
    r.siteless=r.site.replace(/^[a-z]+:\/\//,'');
    return r;}
  function compare(a,b){
    var out={};
    out.sameOrigin=a.origin===b.origin;
    out.sameSite=a.site===b.site;
    out.schemelessSameSite=a.siteless===b.siteless;
    out.secFetchSite=out.sameOrigin?'same-origin':out.sameSite?'same-site':'cross-site';
    var why=[];
    if(!out.sameOrigin){
      if(a.scheme!==b.scheme)why.push('different scheme ('+a.scheme+' vs '+b.scheme+')');
      if(a.host!==b.host)why.push('different host');
      if(a.port!==b.port)why.push('different port ('+a.port+' vs '+b.port+')');}
    out.originWhy=why;
    return out;}
  var api={load:load,suffix:suffix,registrable:registrable,parse:parse,compare:compare};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SiteWhy=api;
})(typeof window!=='undefined'?window:globalThis);
