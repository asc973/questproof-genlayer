import {createClient, createAccount, generatePrivateKey} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionStatus, TransactionHashVariant} from 'genlayer-js/types';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {successfulReceipt,executedSuccessfully,normalizeReceipt} from '../src/receipts.js';

await mkdir('.local', {recursive:true, mode:0o700});
let keys;
try { keys=JSON.parse(await readFile('.local/test-accounts.json','utf8')); }
catch(e) { if(e.code!=='ENOENT') throw e; keys={organizer:generatePrivateKey(),participant:generatePrivateKey(),other:generatePrivateKey()}; await writeFile('.local/test-accounts.json',JSON.stringify(keys),{mode:0o600}); }
export const clients=Object.fromEntries(Object.entries(keys).map(([name,key])=>[name,createClient({chain:studionet,account:createAccount(key)})]));
export const read=async(method,args=[])=>clients.organizer.readContract({address:state.address,functionName:method,args,transactionHashVariant:process.env.QP_TEST_FAST==='1'?TransactionHashVariant.LATEST_NONFINAL:TransactionHashVariant.LATEST_FINAL});
let state;
try {state=JSON.parse(await readFile('.local/state.json','utf8'));} catch(e){if(e.code!=='ENOENT')throw e; state={transactions:[]};}
export const save=()=>writeFile('.local/state.json',JSON.stringify(state,null,2));
export const wait=async(hash)=>{
  const receipt=await clients.organizer.waitForTransactionReceipt({hash,status:process.env.QP_TEST_FAST==='1'?TransactionStatus.ACCEPTED:TransactionStatus.FINALIZED,interval:3000,retries:100});
  const full=await clients.organizer.getTransaction({hash});
  const result={...normalizeReceipt(full),recipient:full.recipient||full.to_address};
  // Receipt formats differ across Studio releases; require a proven return, never
  // infer success from finalization or a zero/absent error alone.
  result.success=process.env.QP_TEST_FAST==='1'?executedSuccessfully(full):successfulReceipt(full);
  state.transactions.push(result); await save(); console.log(JSON.stringify(result)); return {receipt:full,result};
};
export const write=async(name,method,args=[],expectSuccess=true)=>{
  const hash=await clients[name].writeContract({address:state.address,functionName:method,args,value:0n,leaderOnly:false});
  state.pending={hash,name,method,args};await save();console.log(JSON.stringify({submitted:hash,method,name}));
  const r=await wait(hash);state.transactions.at(-1).method=method;state.transactions.at(-1).signer=name;delete state.pending;await save();
  if(expectSuccess&&!r.result.success)throw Error('Execution not proven successful: '+method);
  if(!expectSuccess&&r.result.success)throw Error('Expected rollback: '+method);
  if(!expectSuccess&&(!['ACCEPTED','FINALIZED'].includes(r.result.status)||!['ERROR','FINISHED_WITH_ERROR'].includes(r.result.execution)||r.result.consensus!=='MAJORITY_AGREE'))throw Error('Expected agreed execution error, not an unresolved transaction: '+method);
  return r;
};
export {state};
if(process.argv[2]==='deploy') {
  const code=await readFile('contracts/questproof_v4.py','utf8');
  const digest=createHash('sha256').update(code).digest('hex');
  if(state.address)throw Error('Already deployed; do not blindly redeploy');
  if(!state.deployHash){
    const schema=await clients.organizer.getContractSchemaForCode(code); console.log('Schema methods:',Object.keys(schema.methods));
    state.source_sha256=digest;
    state.deployHash=await clients.organizer.deployContract({code,args:[],leaderOnly:false});await save();console.log('Deploy submitted:',state.deployHash);
  }
  const r=await wait(state.deployHash);
  if(!r.result.success)throw Error('Deployment execution not proven successful');
  state.address=r.receipt.data?.contract_address||r.receipt.data?.contractAddress||r.receipt.recipient||r.receipt.to_address;
  if(!state.address) {console.log('Receipt shape:',JSON.stringify(r.receipt,(_,v)=>typeof v==='bigint'?v.toString():v));throw Error('Contract address missing');}
  const deployed=await clients.organizer.getContractCode(state.address);
  state.source_match=deployed===code;
  await save();
  if(!state.source_match)throw Error('Deployed source mismatch');
  console.log('Deployed:',state.address,'source match:',state.source_match,await read('get_info'));
}
