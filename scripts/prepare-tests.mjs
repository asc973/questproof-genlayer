import {state,clients,read,write,save} from './studio.mjs';
if(state.pending)throw Error('Resolve pending transaction before continuing');
const info=JSON.parse(await read('get_info'));
if(info.quests===0)await write('organizer','create_quest',['Staking & Delegation Explained','Explain what staking and delegation mean in GenLayer. Explain how choosing multiple independent validators can support decentralization. Identify one concrete risk of delegation. Use clear educational language, not profit promises.',100]);
const after=JSON.parse(await read('get_info'));
if(after.quests===1)await write('organizer','create_quest',['Security and boundary checks','Explain at least two practical security precautions for using a browser crypto wallet and why they help. Do not ask readers for passwords or recovery phrases.',25]);
if(!state.positiveId){await write('participant','register_submission',['1']);state.positiveId=String(JSON.parse(await read('get_info')).submissions);await save();}
if(!state.negativeId){await write('other','register_submission',['1']);state.negativeId=String(JSON.parse(await read('get_info')).submissions);await save();}
console.log(JSON.stringify({address:state.address,positive:JSON.parse(await read('get_submission',[state.positiveId])),negative:JSON.parse(await read('get_submission',[state.negativeId])),participant:clients.participant.account.address,other:clients.other.account.address}));
