// Pure CRC engine: no UI imports. Every visualization step is generated from real computation.
export type Cell={v:number|string;c:string};
export type Row={l:string;cells:Cell[]};
export type Phase='init'|'aug'|'div'|'rem'|'code'|'rx';
export type Explain={what:string;why:string;bits:string;result:string;next?:string};
export type Step={ph:Phase;title:string;rows:Row[];t:Explain};
export type Config={mode:'text'|'model';data:string;gen:string;init:string;xo:string;refin:boolean;refout:boolean;aug:boolean};
export type Verdict={ok:boolean;msg:string};
export type BuildOk={st:Step[];crc:number[];cw:number[];v:Verdict|null;W:number;n:number};
export type BuildErr={e:[string,string][]};

const B=(s:string):number[]=>s.split('').map(Number),S=(a:(number|string)[]):string=>a.join(''),X=(a:number[],b:number[]):number[]=>a.map((v,i)=>v^b[i]);
export {B,S}
const rv8=(a:number[])=>{const o:number[]=[];for(let i=0;i<a.length;i+=8)o.push(...a.slice(i,i+8).reverse());return o};
const cl=(a:number[],f:(k:number,v:number)=>string):Cell[]=>a.map((v,k)=>({v,c:f(k,v)}));
export const PH:Record<Phase,string>={init:'Initialize',aug:'Prepare',div:'Divide',rem:'Remainder',code:'Codeword',rx:'Verify'};
export function validate(c:Config){const e:[string,string][]=[],ok=(s:string)=>/^[01]+$/.test(s);
 if(!ok(c.data))e.push(['data','Dataword must contain only 0 and 1.']);else if(c.data.length>96)e.push(['data','Maximum 96 data bits.']);
 if(!ok(c.gen)||c.gen[0]!=='1'||c.gen.length<2||c.gen.length>33)e.push(['gen','Generator: binary, starts with 1, 2–33 bits.']);
 else if(c.mode==='model'){const W=c.gen.length-1;
  if(!ok(c.init)||c.init.length!==W)e.push(['init','Initial value needs exactly '+W+' bits.']);
  if(!ok(c.xo)||c.xo.length!==W)e.push(['xo','Final XOR needs exactly '+W+' bits.']);
  if(c.aug&&ok(c.init)&&/1/.test(c.init)&&ok(c.data)&&c.data.length<W)e.push(['data','Augmented method with non-zero init needs ≥ '+W+' data bits (or turn augmentation off).'])}
 return e}
function divide(a:number[],g:number[],st:Step[],o:{ph:Phase;sp:number;tl:string;pf:string}):number[]{const n=g.length,L=a.length,gs=S(g);a=a.slice();
 for(let i=0;i<=L-n;i++){const b=a.slice(),x=b[i]===1,w=S(b.slice(i,i+n));
  if(x)for(let j=0;j<n;j++)a[i+j]^=g[j];
  const f=(arr:number[],p?:number[])=>cl(arr,(k,v)=>(k<o.sp?'d':o.tl)+(k>=i&&k<i+n?' w':'')+(k<i?' dim':'')+(p&&p[k]!==v?' x':''));
  st.push({ph:o.ph,title:o.pf+'Division at bit '+(i+1),rows:[{l:'Dividend',cells:f(b)},
   {l:x?'Divisor G':'Zeros',cells:b.map((_,k)=>k>=i&&k<i+n?{v:x?g[k-i]:0,c:x?'g':'z0'}:{v:'',c:'e'})},
   {l:'XOR result',cells:f(a,b)}],
   t:{what:x?'The leading bit of the window (bit '+(i+1)+') is 1, so XOR the window with the generator '+gs+'.':'The leading bit of the window (bit '+(i+1)+') is 0, so XOR with all zeros: nothing changes.',
    why:x?'XOR is modulo-2 subtraction; it cancels the leading 1 so the division can move on.':'G cannot cancel a leading 0, so we only slide the divisor along.',
    bits:'Window = '+w+(x?'  Divisor = '+gs:''),
    result:x?w+' ⊕ '+gs+' = '+S(a.slice(i,i+n)):w+' stays '+w,
    next:i<L-n?'Shift the divisor one place right: next window starts at bit '+(i+2)+'.':'Divisor reached the end: the last '+(n-1)+' bits are the remainder.'}})}
 return a.slice(L-n+1)}
function remSteps(st:Step[],ph:Phase,pf:string,r:number[],W:number,m:string){st.push({ph,title:pf+'Remainder',rows:[{l:'Remainder',cells:cl(r,()=>'r')}],t:{what:'The last '+W+' bits left after the division are the remainder.',why:'Dividing the padded message by G leaves a remainder; appending it makes the codeword divisible by G.',bits:S(r),result:'Remainder = '+S(r),next:m}})}
function runModel(d:number[],c:Config,st:Step[],rx:boolean):number[]{const g=B(c.gen),W=g.length-1,poly=g.slice(1),sp=(p:Phase):Phase=>rx?'rx':p,pf=rx?'Receiver: ':'';
 let m=c.refin?rv8(d):d.slice(),r:number[];
 if(c.refin)st.push({ph:sp('aug'),title:pf+'Reflect input (RefIn)',rows:[{l:'Data',cells:cl(d,()=>'d')},{l:'Reflected',cells:cl(m,(k,v)=>'d'+(d[k]!==v?' x':''))}],t:{what:'Reverse the bit order inside every 8-bit group (a trailing partial group is reversed by itself).',why:'Some CRC standards process the least-significant bit of each byte first.',bits:S(d)+' → '+S(m),result:'Message fed to the CRC: '+S(m)}});
 if(c.aug){let a=m.concat(Array(W).fill(0));
  st.push({ph:sp('aug'),title:pf+'Append '+W+' zeros',rows:[{l:'Augmented',cells:cl(a,k=>k<m.length?'d':'z')}],t:{what:'Append '+W+' zeros to the message.',why:'They make room for the '+W+'-bit remainder (message × x^'+W+').',bits:S(m)+' + '+'0'.repeat(W),result:S(a)}});
  if(/1/.test(c.init)){const i0=B(c.init),a2=a.slice();i0.forEach((v,k)=>a2[k]^=v);
   st.push({ph:sp('aug'),title:pf+'XOR initial value into message',rows:[{l:'Message',cells:cl(a,k=>k<m.length?'d':'z')},{l:'Init',cells:a.map((_,k)=>k<W?{v:i0[k],c:'g'}:{v:'',c:'e'})},{l:'Result',cells:cl(a2,(k,v)=>(k<m.length?'d':'z')+(a[k]!==v?' x':''))}],t:{what:'XOR the initial value '+c.init+' into the first '+W+' message bits.',why:'In the augmented method this is equivalent to starting the shift register at the init value.',bits:S(a.slice(0,W))+' ⊕ '+c.init,result:S(a2.slice(0,W))}});a=a2}
  r=divide(a,g,st,{ph:sp('div'),sp:m.length,tl:'z',pf})}
 else{r=B(c.init);
  m.forEach((bit,j)=>{const top=r[0],fb=top^bit,sh=r.slice(1).concat(0),nr=fb?X(sh,poly):sh;
   st.push({ph:sp('div'),title:pf+'Shift in bit '+(j+1),rows:[{l:'Register',cells:cl(r,k=>k?'z':'z w')},{l:'Input bit',cells:[{v:bit,c:'d'}]},{l:'Feedback',cells:[{v:fb,c:fb?'x':'z'}]},{l:fb?'Poly (no top 1)':'Zeros',cells:cl(poly,()=>fb?'g':'z0')},{l:'New register',cells:cl(nr,(k,v)=>'z'+(v!==sh[k]?' x':''))}],
    t:{what:'Feedback = register MSB ('+top+') ⊕ input bit ('+bit+') = '+fb+'. Shift the register left by one.',why:fb?'Feedback 1: XOR the shifted register with the polynomial (without its leading 1).':'Feedback 0: nothing to cancel, just shift.',bits:'Register '+S(r)+' → shifted '+S(sh),result:'New register = '+S(nr)}});r=nr})}
 remSteps(st,sp('rem'),pf,r,W,'');
 if(c.refout){const q=r.slice().reverse();st.push({ph:sp('rem'),title:pf+'Reflect output (RefOut)',rows:[{l:'Remainder',cells:cl(r,()=>'r')},{l:'Reflected',cells:cl(q,(k,v)=>'r'+(r[k]!==v?' x':''))}],t:{what:'Reverse the order of the remainder bits.',why:'The standard specifies a reflected CRC value.',bits:S(r)+' → '+S(q),result:S(q)}});r=q}
 if(/1/.test(c.xo)){const q=X(r,B(c.xo));st.push({ph:sp('rem'),title:pf+'Final XOR',rows:[{l:'Value',cells:cl(r,()=>'r')},{l:'XorOut',cells:cl(B(c.xo),()=>'g')},{l:'CRC',cells:cl(q,(k,v)=>'r'+(r[k]!==v?' x':''))}],t:{what:'XOR the value with the final-XOR constant '+c.xo+'.',why:'The standard specifies this to detect e.g. leading zeros.',bits:S(r)+' ⊕ '+c.xo,result:'CRC = '+S(q)}});r=q}
 return r}
export function build(c:Config,rx:string):BuildOk|BuildErr{const e=validate(c);if(e.length)return{e};
 const d=B(c.data),g=B(c.gen),n=g.length,W=n-1,M=c.mode==='model',st:Step[]=[];
 const ir:Row[]=[{l:'Dataword',cells:cl(d,()=>'d')},{l:'Generator',cells:cl(g,()=>'g')}];
 if(M)ir.push({l:'Init',cells:cl(B(c.init),()=>'z')},{l:'XorOut',cells:cl(B(c.xo),()=>'z')});
 st.push({ph:'init',title:'Input initialization',rows:ir,t:{what:(M?'Configurable CRC model: width '+W+', RefIn='+c.refin+', RefOut='+c.refout+', '+(c.aug?'augmented division':'shift-register method')+'.':'Textbook CRC: augmented modulo-2 division, init 0, no reflection, no final XOR.'),why:'The generator has '+n+' bits, so the CRC has '+(n-1)+' bits.',bits:'Data '+c.data+'  G '+c.gen,result:'G(x) = '+g.map((v,i)=>v?(n-1-i?(n-1-i===1?'x':'x^'+(n-1-i)):'1'):'').filter(Boolean).join(' + ')}});
 let crc:number[];
 if(M)crc=runModel(d,c,st,false);
 else{const a=d.concat(Array(W).fill(0));
  st.push({ph:'aug',title:'Append '+W+' zeros',rows:[{l:'Augmented',cells:cl(a,k=>k<d.length?'d':'z')}],t:{what:'Append '+W+' zeros (gray) to the dataword.',why:'They make room for the CRC bits (data × x^'+W+').',bits:c.data+' + '+'0'.repeat(W),result:S(a)}});
  const r=divide(a,g,st,{ph:'div',sp:d.length,tl:'z',pf:''});remSteps(st,'rem','',r,W,'');crc=r}
 const cw=d.concat(crc);
 st.push({ph:'code',title:'Codeword generation',rows:[{l:'Dataword',cells:cl(d,()=>'d')},{l:'CRC',cells:cl(crc,()=>'r')},{l:'Codeword',cells:cl(cw,k=>k<d.length?'d':'r')}],t:{what:'Append the CRC bits to the original data.',why:'The receiver can re-check this redundancy; any single-bit flip changes the result.',bits:c.data+' + '+S(crc),result:'Transmitted codeword = '+S(cw)}});
 let v:Verdict|null=null;const R=rx?rx.length:0;
 if(/^[01]+$/.test(rx||'')&&R<=128&&R>(M?W:n-1)){const rb=B(rx),same=R===cw.length;
  st.push({ph:'rx',title:'Receiver: received codeword',rows:[{l:'Sent',cells:cl(cw,k=>k<d.length?'d':'r')},{l:'Received',cells:cl(rb,(k,x)=>(k<R-W?'d':'r')+(same&&x!==cw[k]?' bad':''))}],t:{what:'The receiver gets a frame that may be corrupted.',why:M?'It recomputes the CRC over the data part with identical parameters and compares it to the received CRC field.':'It divides the whole frame by G. An intact codeword leaves remainder 0 (the syndrome).',bits:same?'Flipped bits: '+(rb.map((x,k)=>x!==cw[k]?k+1:0).filter(Boolean).join(', ')||'none'):'Length differs from the sent codeword',result:S(rb)}});
  let ok:boolean,msg:string;
  if(M){const c2=runModel(rb.slice(0,R-W),c,st,true),rc=rb.slice(R-W);ok=S(c2)===S(rc);
   st.push({ph:'rx',title:'Receiver: compare CRCs',rows:[{l:'Computed',cells:cl(c2,()=>'r')},{l:'Received',cells:cl(rc,(k,x)=>'r'+(x!==c2[k]?' bad':''))}],t:{what:'Compare the recomputed CRC with the received one.',why:'Equal means the data is consistent with its CRC.',bits:S(c2)+' vs '+S(rc),result:ok?'Match: no error detected.':'Mismatch: error detected, frame rejected.'}});
   msg=ok?'Recomputed CRC matches the received CRC field: no error detected.':'Recomputed CRC ('+S(c2)+') ≠ received CRC ('+S(rc)+'): error detected.'}
  else{const syn=divide(rb,g,st,{ph:'rx',sp:R-W,tl:'r',pf:'Receiver: '});ok=!syn.includes(1);
   st.push({ph:'rx',title:'Receiver: syndrome',rows:[{l:'Syndrome',cells:cl(syn,()=>ok?'r':'bad')}],t:{what:'The remainder of the received frame is the syndrome.',why:'Zero means the frame is divisible by G, as a valid codeword must be.',bits:S(syn),result:ok?'Syndrome = 0: no error detected.':'Syndrome ≠ 0: error detected, frame rejected.'}});
   msg=ok?'Syndrome '+S(syn)+' is all zeros: no error detected (errors that are multiples of G would still slip through).':'Syndrome '+S(syn)+' ≠ 0: error detected, frame rejected.'}
  v={ok,msg}}
 st.forEach((s,i)=>{if(!s.t.next)s.t.next=st[i+1]?'Next: '+st[i+1].title+'.':'Algorithm complete.'});
 return{st,crc,cw,v,W,n}}
