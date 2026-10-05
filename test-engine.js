var S=require('./engine.js'),fs=require('fs');S.load(fs.readFileSync(__dirname+'/psl-rules.txt','utf8'));
var tot=0,cmp2=0,cmp=0,skip=0,agree=0,mm=[];
process.argv.slice(2).forEach(function(f){fs.readFileSync(f,'utf8').split('\n').filter(Boolean).forEach(function(l){
 var o=JSON.parse(l);tot++;if(!o.tld){skip++;return;}cmp++;
 var r=S.registrable(o.h,true);
 var dom=r.domain===null?r.suffix:r.domain; // tld returns the host itself when it is a suffix
 var r2=S.registrable(o.h,false),dom2=r2.domain===null?r2.suffix:r2.domain;cmp2++;
 if(r.rule==='*'||r2.rule==='*')mm.push({h:o.h,why:'listed host reported as unlisted',got:r});else if(r.suffix===o.tld.suffix&&dom===o.tld.domain&&r2.suffix===o.tld.icann.suffix&&dom2===o.tld.icann.domain)agree++;else mm.push({h:o.h,want:o.tld,got:r,got2:r2});});});
console.log(JSON.stringify({lines:tot,tldRejected:skip,compared:cmp,privateToggleAlsoCompared:cmp2,agree:agree,mismatches:mm.length}));
mm.slice(0,+(process.env.SHOW||6)).forEach(function(m){console.log(JSON.stringify(m));});
