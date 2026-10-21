import {createClient,createAccount} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionStatus,TransactionHashVariant} from 'genlayer-js/types';
import {successfulReceipt,normalizeReceipt} from './receipts.js';
export {successfulReceipt};

export const chain=studionet;
export const explorer='https://explorer-studio.genlayer.com';
export const publicClient=createClient({chain});
export function parseRecord(value){return typeof value==='string'?JSON.parse(value):value;}
export function assertAddress(value){if(!/^0x[0-9a-fA-F]{40}$/.test(value))throw Error('A valid deployed V4 contract address is required.');return value;}
export const read=async(address,functionName,args=[])=>parseRecord(await publicClient.readContract({address:assertAddress(address),functionName,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL}));
export async function connectWallet(provider) {
  if(!provider)throw Error('No browser wallet found. Install an EIP-1193 wallet or use a temporary Studio session.');
  const [address]=await provider.request({method:'eth_requestAccounts'});
  const id='0x'+chain.id.toString(16);
  try{await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:id}]});}
  catch(e){if(e.code!==4902)throw e;await provider.request({method:'wallet_addEthereumChain',params:[{chainId:id,chainName:chain.name,nativeCurrency:chain.nativeCurrency,rpcUrls:chain.rpcUrls.default.http,blockExplorerUrls:[explorer]}]});}
  if(Number(await provider.request({method:'eth_chainId'}))!==chain.id)throw Error('Switch wallet to Studionet 61999.');
  return {address,client:createClient({chain,account:address,provider}),mode:'Browser wallet'};
}
export function createSession(){const account=createAccount();return {address:account.address,client:createClient({chain,account}),mode:'Temporary Studio session (memory only)'};}
export async function waitForFinalized(hash,onUpdate=()=>{}) {
  if(!/^0x[0-9a-fA-F]{64}$/.test(hash))throw Error('Invalid transaction ID');
  // Track the original ID. Never resubmit because polling timed out.
  for(let i=0;i<100;i++){
    const tx=await publicClient.getTransaction({hash});
    onUpdate(tx);
    const status=normalizeReceipt(tx).status;
    if(status==='FINALIZED'){
      if(!successfulReceipt(tx))throw Object.assign(Error('Finalized transaction did not prove successful execution. Inspect the receipt and unchanged contract state.'),{receipt:tx});
      return tx;
    }
    if(['UNDETERMINED','CANCELED','CANCELLED'].includes(status))throw Object.assign(Error('Transaction '+status+'; no success claimed.'),{receipt:tx});
    await new Promise(r=>setTimeout(r,3000));
  }
  throw Error('Still pending. Resume tracking this transaction ID; do not submit it again.');
}
export async function send(session,address,functionName,args,onHash,onUpdate){
  if(!session)throw Error('Connect a wallet or start a temporary Studio session first.');
  const hash=await session.client.writeContract({address:assertAddress(address),functionName,args,value:0n,leaderOnly:false});
  onHash(hash);return waitForFinalized(hash,onUpdate);
}
