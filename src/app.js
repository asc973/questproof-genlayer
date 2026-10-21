import {normalizeReceipt} from './receipts.js';
import {chain,explorer,read,connectWallet,createSession,send,waitForFinalized,publicClient} from './network.js';
const $=id=>document.getElementById(id);
const stringify=v=>JSON.stringify(v,(_,x)=>typeof x==='bigint'?String(x):x,2);
let session=null,busy=false,info=null;
let contract=localStorage.getItem('questproof-v4-address')||'';
let history;try{history=JSON.parse(localStorage.getItem('questproof-v4-transactions')||'[]');if(!Array.isArray(history))history=[];}catch{history=[];}
const scope=()=>contract.toLowerCase();
function message(text,bad=false){$('notice').textContent=text;$('notice').className=bad?'error':'notice';}
function activeAddress(){return session?.address||$('lookupWallet').value.trim();}
function renderHistory(){
  $('transactions').replaceChildren();
  for(const t of history.filter(t=>(t.contract.toLowerCase()===scope()||t.contract==='NEW_WORKSPACE')).slice().reverse().slice(0,20)){
    const row=document.createElement('div');row.className='tx';
    const a=document.createElement('a');a.href=explorer+'/tx/'+t.hash;a.target='_blank';a.rel='noopener';a.textContent=t.method+' · '+t.hash.slice(0,12)+'…';
    const label=document.createElement('span');label.textContent=t.status;row.append(a,label);$('transactions').append(row);
  }
}
function saveHistory(){localStorage.setItem('questproof-v4-transactions',stringify(history.slice(-100)));renderHistory();}
function showSession(){ $('walletStatus').textContent=session?session.mode+' · '+session.address:'Read-only · no signer connected'; if(session)$('lookupWallet').value=session.address;}
async function deployOwn(){
  if(!session)throw Error('Connect a signer first. A new deployment makes that signer the organizer.');
  if(busy)throw Error('Wait for the current transaction.');
  if(history.some(t=>t.method==='deployContract'&&t.status==='PENDING'))throw Error('An earlier deployment is unresolved. Resume tracking it first.');
  $('action').textContent=stringify({network:'Studionet',chainId:chain.id,action:'Deploy a new independent QuestProof V4 workspace',organizer:session.address,value:'0 GEN'});
  const response=await fetch('./contracts/questproof_v4.py',{cache:'no-store'});if(!response.ok)throw Error('Contract source unavailable');const code=await response.text();
  busy=true;let entry;
  try{
    const hash=await session.client.deployContract({code,args:[],leaderOnly:false});
    entry={hash,method:'deployContract',contract:'NEW_WORKSPACE',wallet:session.address,status:'PENDING'};history.push(entry);saveHistory();
    const tx=await waitForFinalized(hash,r=>{$('receipt').textContent=stringify(normalizeReceipt(r));});
    const address=tx.recipient||tx.to_address;if(!address)throw Error('Deployment finalized but address unavailable; inspect the original transaction.');
    const deployed=await publicClient.getContractCode(address);if(deployed!==code)throw Error('Source mismatch. Workspace not activated.');
    contract=address;entry.contract=address;entry.status='FINALIZED / SUCCESS';saveHistory();localStorage.setItem('questproof-v4-address',contract);$('contract').value=contract;await refresh();message('Your workspace is deployed, finalized and source-matched. You are its organizer. Create a quest below.');
  }catch(e){if(entry&&e.receipt){entry.status='FAILED';saveHistory();}throw e;}finally{busy=false;}
}
async function refresh(){
  if(!contract)throw Error('V4 deployment is not configured yet.');
  info=await read(contract,'get_info');
  if(info.version!=='4.0.0')throw Error('This is not a QuestProof V4 contract.');
  $('info').textContent=stringify(info);$('organizer').hidden=!(session&&info.organizer.toLowerCase()===session.address.toLowerCase());
  const quests=await read(contract,'list_quests',[Number($('questOffset').value),25]);
  const previous=$('questId').value;$('quests').replaceChildren();$('questId').replaceChildren();
  for(const q of quests){
    const option=document.createElement('option');option.value=q.id;option.textContent='#'+q.id+' '+q.title+(q.active?'':' (closed)');$('questId').append(option);
    const card=document.createElement('article');card.className='quest';
    const title=document.createElement('h3');title.textContent='#'+q.id+' '+q.title;
    const rules=document.createElement('p');rules.textContent=q.rules;
    const meta=document.createElement('small');meta.textContent=q.points+' non-transferable points · '+(q.active?'OPEN':'CLOSED');card.append(title,rules,meta);$('quests').append(card);
  }
  if(quests.some(q=>q.id===previous))$('questId').value=previous;
  if(activeAddress())await refreshWallet();renderHistory();
}
async function refreshWallet(){
  const wallet=activeAddress();if(!/^0x[0-9a-fA-F]{40}$/.test(wallet))throw Error('Enter a valid wallet address.');
  $('points').textContent=String(await read(contract,'get_points',[wallet]));
  const records=await read(contract,'list_submissions',[wallet,Number($('submissionOffset').value),25]);
  $('submissions').replaceChildren();
  for(const r of records){const b=document.createElement('button');b.className='secondary';b.textContent='#'+r.id+' · '+r.status+(r.claimed?' · POINTS CLAIMED':'');b.onclick=()=>{$('submissionId').value=r.id;run(readSubmission);};$('submissions').append(b);}
}
async function readSubmission(){
  const r=await read(contract,'get_submission',[$('submissionId').value.trim()]);$('record').textContent=stringify(r);
  $('challenge').value=r.marker;
  $('claim').disabled=!(session&&r.wallet===session.address.toLowerCase()&&r.status==='PASS'&&!r.claimed);
  $('sourceLink').hidden=!r.source;if(r.source){$('sourceLink').href=r.source;$('sourceLink').textContent='Read pinned evidence ↗';}
  return r;
}
async function transact(method,args){
  if(busy)throw Error('Wait for the current transaction.');
  if(!session)throw Error('Connect your wallet or start a temporary Studio session.');
  if(history.some(t=>t.contract.toLowerCase()===scope()&&t.wallet===session.address&&t.status==='PENDING'))throw Error('An earlier transaction is unresolved. Resume tracking before sending another.');
  // The action summary is rendered before the wallet signing request.
  $('action').textContent=stringify({network:'Studionet',chainId:chain.id,to:contract,value:'0 GEN',method,args,signer:session.address});
  busy=true;document.body.classList.add('busy');let entry;
  try{
    await send(session,contract,method,args,hash=>{entry={hash,method,contract,wallet:session.address,status:'PENDING'};history.push(entry);saveHistory();},tx=>{$('receipt').textContent=stringify(normalizeReceipt(tx));});
    entry.status='FINALIZED / SUCCESS';saveHistory();await refresh();message('Finalized with successful execution. Contract state refreshed.');
  }catch(e){if(entry&&e.receipt){entry.status='FAILED / '+(e.receipt.statusName||e.receipt.status);saveHistory();}$('receipt').textContent=e.receipt?stringify(normalizeReceipt(e.receipt)):$('receipt').textContent;throw e;}
  finally{busy=false;document.body.classList.remove('busy');}
}
async function run(fn){try{await fn();}catch(e){message(e.shortMessage||e.message||String(e),true);}}
$('connect').onclick=()=>run(async()=>{session=await connectWallet(window.ethereum);showSession();await refresh();});
$('temporary').onclick=()=>run(async()=>{if(session)throw Error('Disconnect first to avoid losing your current session.');session=createSession();showSession();message('New temporary signing account created. Real Studionet transactions; key stays in memory and is lost on refresh. No personal funds.');await refresh();});
$('disconnect').onclick=()=>{session=null;showSession();$('organizer').hidden=true;$('claim').disabled=true;message('Signer disconnected. Temporary keys cannot be recovered.');};
$('deployOwn').onclick=()=>run(deployOwn);
window.ethereum?.on?.('accountsChanged',()=>{session=null;showSession();$('organizer').hidden=true;message('Wallet account changed; reconnect before writing.');});
window.ethereum?.on?.('chainChanged',()=>{session=null;showSession();message('Wallet network changed; reconnect to Studionet.');});
$('apply').onclick=()=>run(async()=>{const address=$('contract').value.trim();const test=await read(address,'get_info');if(test.version!=='4.0.0')throw Error('Not a V4 deployment');contract=address;localStorage.setItem('questproof-v4-address',contract);await refresh();});
$('refresh').onclick=()=>run(refresh);$('lookup').onclick=()=>run(refreshWallet);
$('register').onclick=()=>run(async()=>{await transact('register_submission',[$('questId').value]);const next=await read(contract,'get_info');const recent=await read(contract,'list_submissions',[session.address,Math.max(0,Number(next.submissions)-25),25]);const mine=recent.find(r=>r.wallet===session.address.toLowerCase()&&r.quest_id===$('questId').value&&r.status==='AWAITING_EVIDENCE');if(mine){$('submissionId').value=mine.id;await readSubmission();}await refreshWallet();message('Registration finalized. Load your submission challenge, publish the evidence, then request review.');});
$('load').onclick=()=>run(readSubmission);
$('copy').onclick=()=>run(async()=>{await navigator.clipboard.writeText($('challenge').value);message('Challenge copied. Put it on the FIRST line of the evidence file.');});
$('download').onclick=()=>run(async()=>{const r=await readSubmission();const blob=new Blob([r.marker+'\n\n'+$('contribution').value.trim()+'\n'],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='questproof-'+r.id+'.txt';a.click();URL.revokeObjectURL(a.href);});
$('evaluate').onclick=()=>run(async()=>{await transact('evaluate_submission',[$('submissionId').value.trim(),$('evidenceUrl').value.trim()]);await readSubmission();});
$('claim').onclick=()=>run(async()=>{await transact('claim_points',[$('submissionId').value.trim()]);await readSubmission();});
$('cancel').onclick=()=>run(async()=>{await transact('cancel_submission',[$('submissionId').value.trim()]);await readSubmission();});
$('create').onclick=()=>run(()=>transact('create_quest',[$('title').value.trim(),$('rules').value.trim(),Number($('reward').value)]));
$('closeQuest').onclick=()=>run(()=>transact('close_quest',[$('questId').value]));
$('resume').onclick=()=>run(async()=>{for(const t of history.filter(t=>(t.contract.toLowerCase()===scope()||t.contract==='NEW_WORKSPACE')&&t.status==='PENDING')){try{const tx=await waitForFinalized(t.hash,tx=>{$('receipt').textContent=stringify(normalizeReceipt(tx));});if(t.method==='deployContract'){const address=tx.recipient||tx.to_address;const code=await fetch('./contracts/questproof_v4.py',{cache:'no-store'}).then(r=>r.text());if(await publicClient.getContractCode(address)!==code)throw Error('Deployed source differs from current release; inspect before activating.');contract=address;t.contract=address;localStorage.setItem('questproof-v4-address',contract);$('contract').value=contract;}t.status='FINALIZED / SUCCESS';}catch(e){if(e.receipt)t.status='FAILED / '+(e.receipt.statusName||e.receipt.status);throw e;}finally{saveHistory();}}await refresh();});
$('export').onclick=()=>run(async()=>{const data={contract,network:'studionet',info,transactions:history.filter(t=>t.contract.toLowerCase()===scope()),submission:$('submissionId').value?await read(contract,'get_submission',[$('submissionId').value]):null};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([stringify(data)],{type:'application/json'}));a.download='questproof-evidence.json';a.click();URL.revokeObjectURL(a.href);});
showSession();renderHistory();
run(async()=>{const d=await fetch('./deployment.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Deployment config unavailable');return r.json();});if(!contract&&d.verified)contract=d.contractAddress;$('contract').value=contract;if(contract){await refresh();message('Connected to Studionet. Displaying finalized contract state.');}else message('V4 code prepared; verified deployment has not been configured. No simulated results are shown.');});
