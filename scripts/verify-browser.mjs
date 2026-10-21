import {clients,state,read} from './studio.mjs';
import {normalizeReceipt,successfulReceipt} from '../src/receipts.js';
import {TransactionStatus} from 'genlayer-js/types';
import {writeFile} from 'node:fs/promises';
const hashes=process.argv.slice(2);if(hashes.length!==3)throw Error('Pass registration, review and claim transaction IDs');
const transactions=await Promise.all(hashes.map(async hash=>{await clients.organizer.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,interval:3000,retries:100});const tx=await clients.organizer.getTransaction({hash});if(!successfulReceipt(tx))throw Error('Browser transaction did not succeed: '+hash);return {...normalizeReceipt(tx),signer:tx.from_address||tx.sender,recipient:tx.to_address||tx.recipient,mode:tx.execution_mode,leaderOnly:tx.leader_only};}));
const record=JSON.parse(await read('get_submission',['3']));const points=Number(await read('get_points',[record.wallet]));
if(record.status!=='PASS'||!record.claimed||points!==100||transactions.some(t=>t.signer.toLowerCase()!==record.wallet||t.recipient.toLowerCase()!==state.address.toLowerCase()))throw Error('Browser final state mismatch');
await writeFile('docs/v4-browser-results.json',JSON.stringify({verifiedAt:new Date().toISOString(),url:'https://asc973.github.io/questproof-genlayer/',network:'studionet',contract:state.address,signerType:'Temporary in-memory browser account',personalWalletExtensionTested:false,transactions,record,points},null,2)+'\n');console.log(JSON.stringify({browserFlow:'PASS',points,claimed:record.claimed,finalized:transactions.length}));
