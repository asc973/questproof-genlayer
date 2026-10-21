import {clients,state,write,read} from './studio.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {passport} from '../src/challenges.js';
const cfg=JSON.parse(await readFile('challenges.json','utf8'));
if(cfg.contract.toLowerCase()!==state.address.toLowerCase())throw Error('Wrong deployment');
const wallet=clients.participant.account.address.toLowerCase();
const contributions={
 approval:'An unlimited token approval can let an approved contract spend tokens up to that allowance, including future deposits, so a malicious spender could take funds. Blind signing can authorize a harmful action without understanding what the wallet is signing. A private key gives direct wallet control and must never be shared even with someone claiming to be support. I would refuse the suspicious request and independently verify the official contract address and the exact permissions before considering any interaction. I would use limited allowances when needed and revoke unnecessary approvals using a trusted independently verified tool.',
 support:'A support agent who contacts me first in a DM may be an impersonator, so the message alone proves nothing. Remote control software could let that person operate my computer or access my wallet. Screen sharing a recovery phrase exposes the words needed to restore and control the wallet, so I must never show them. I would stop the conversation, refuse remote access and secret sharing, and independently open the official help page from the real app to contact support. I would not use the links sent by the stranger.'
};
let checkpoint={transactions:[]};try{checkpoint=JSON.parse(await readFile('.local/all-challenges.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const save=()=>writeFile('.local/all-challenges.json',JSON.stringify(checkpoint,null,2)+'\n');
async function records(){const info=JSON.parse(await read('get_info'));let result=[];for(let i=0;i<info.submissions;i+=25)result.push(...JSON.parse(await read('list_submissions',[wallet,i,25])));return result;}
for(const id of ['approval','support']){
 const c=cfg.cases.find(c=>c.id===id);const q=JSON.parse(await read('get_quest',[c.questId]));if(!q.active||q.points!==50)throw Error('Quest unavailable');
 let mine=(await records()).filter(r=>r.quest_id===c.questId);let r=mine.find(r=>r.status==='PASS')||mine.find(r=>r.status==='AWAITING_EVIDENCE');
 if(process.argv[2]==='register'){
  if(!r){const tx=await write('participant','register_submission',[c.questId]);checkpoint.transactions.push({case:id,method:'register_submission',...tx.result});await save();r=(await records()).find(r=>r.quest_id===c.questId&&r.status==='AWAITING_EVIDENCE');}
  if(!r)throw Error('No record');checkpoint[id]={submissionId:r.id};await save();await writeFile(`.local/play-${id}.txt`,r.marker+'\n\n'+contributions[id]+'\n');console.log('READY',id,r.id);
 }else{
  if(!r)throw Error('Register first');const raw=process.argv[id==='approval'?2:3];
  if(r.status==='AWAITING_EVIDENCE'){const tx=await write('participant','evaluate_submission',[r.id,raw]);checkpoint.transactions.push({case:id,method:'evaluate_submission',...tx.result});await save();r=JSON.parse(await read('get_submission',[r.id]));}
  if(r.status!=='PASS')throw Error(id+' did not pass: '+r.review);
  if(!r.claimed){const tx=await write('participant','claim_points',[r.id]);checkpoint.transactions.push({case:id,method:'claim_points',...tx.result});await save();}
 }
}
if(process.argv[2]!=='register'){
 const all=await records();const badges=passport(all,cfg.cases);const points=Number(await read('get_points',[wallet]));if(badges.filter(b=>b.earned).length!==3||points!==250)throw Error('Passport or balance mismatch');
 const sourceMatch=await clients.organizer.getContractCode(state.address)===await readFile('contracts/questproof_v4.py','utf8');if(!sourceMatch)throw Error('Source differs');
 const report={verifiedAt:new Date().toISOString(),network:'studionet',contract:state.address,wallet,sourceMatch,points,badges,records:all.filter(r=>cfg.cases.some(c=>c.questId===r.quest_id)),transactions:checkpoint.transactions};await writeFile('docs/all-challenges-results.json',JSON.stringify(report,null,2)+'\n');console.log('ALL THREE VERIFIED',points);
}
