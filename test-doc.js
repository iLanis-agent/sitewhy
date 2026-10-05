// Tables from web.dev "Same-site and same-origin" (fetched). A = https://www.example.com:443. [B, sameOrigin, sameSite, schemelessSameSite]
var S=require('./engine.js'),fs=require('fs');S.load(fs.readFileSync(__dirname+'/psl-rules.txt','utf8'));
var A='https://www.example.com:443';
var T=[['https://www.evil.com:443',0,0,0],['https://example.com:443',0,1,1],['https://login.example.com:443',0,1,1],['http://www.example.com:443',0,0,1],['https://www.example.com:80',0,1,1],['https://www.example.com:443',1,1,1],['https://www.example.com',1,1,1]];
var bad=0,a=S.parse(A,true);
T.forEach(function(t){var b=S.parse(t[0],true),c=S.compare(a,b);
 var got=[c.sameOrigin,c.sameSite,c.schemelessSameSite].map(Number);
 if(got.join()!==t.slice(1).join()){bad++;console.log('FAIL',t[0],got);}});
// eTLD example from the article: https://www.project.github.io:443/foo has eTLD .github.io and eTLD+1 project.github.io
var g=S.parse('https://www.project.github.io:443/foo',true);
if(g.suffix!=='github.io'||g.domain!=='project.github.io'||g.site!=='https://project.github.io'){bad++;console.log('FAIL github.io',g);}
console.log((T.length+1)+' article cases, '+bad+' failures');
