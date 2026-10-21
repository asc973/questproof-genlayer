import {cases} from '../src/challenges.js';import {clients,state,write,read} from './studio.mjs';import {writeFile} from 'node:fs/promises';
const info=JSON.parse(await read('get_info'));if(info.organizer.toLowerCase()!==clients.organizer.account.address.toLowerCase())throw Error('Wrong organizer');
const existing=JSON.parse(await read('list_quests',[0,25]));const catalog=[];
for(const c of cases){let q=existing.find(q=>q.title==='Trap Hunt / '+c.id&&q.rules===c.rules);if(!q){await write('organizer','create_quest',['Trap Hunt / '+c.id,c.rules,50]);q=JSON.parse(await read('list_quests',[0,25])).find(q=>q.title==='Trap Hunt / '+c.id&&q.rules===c.rules);}if(!q)throw Error('Missing finalized quest');catalog.push({id:c.id,questId:q.id,badge:c.badge});}
await writeFile('challenges.json',JSON.stringify({contract:state.address,cases:catalog},null,2)+'\n');console.log('CHALLENGES READY',catalog);
