import {transactionsStatusNumberToName,transactionResultNumberToName} from 'genlayer-js/types';
export function normalizeReceipt(tx){
  const leaders=tx.consensus_data?.leader_receipt;
  // Studio may append a validator cancelled after quorum to leader_receipt.
  // Judge the last actual leader, never that idle validator.
  const leader=Array.isArray(leaders)?leaders.filter(r=>r.mode==='leader'||r.mode===undefined).at(-1):leaders;
  return {
    hash:tx.hash||tx.txId||tx.tx_id,
    status:tx.statusName||transactionsStatusNumberToName[String(tx.status)]||tx.status,
    consensus:tx.resultName||tx.result_name||transactionResultNumberToName[String(tx.result)],
    execution:tx.txExecutionResultName||leader?.execution_result,
    returned:tx.txExecutionResultName==='FINISHED_WITH_RETURN'||leader?.result?.status==='return',
    error:leader?.genvm_result?.error_description||leader?.genvm_result?.stderr||(leader?.result?.status!=='return'&&typeof leader?.result?.payload==='string'?leader.result.payload:'')||'',
  };
}
export function executedSuccessfully(tx){
  const r=normalizeReceipt(tx);
  return ['ACCEPTED','FINALIZED'].includes(r.status)&&['ACCEPT','ACCEPTED','SUCCESS','MAJORITY_AGREE'].includes(r.consensus)&&['FINISHED_WITH_RETURN','SUCCESS'].includes(r.execution)&&r.returned;
}
export function successfulReceipt(tx){return normalizeReceipt(tx).status==='FINALIZED'&&executedSuccessfully(tx);}
