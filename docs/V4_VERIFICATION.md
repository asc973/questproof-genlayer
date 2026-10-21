# QuestProof V4 verification

## Current status

V4 is deployed on **Studionet (61999)**. Deployment finalized with successful execution and majority agreement. Deployed code was downloaded through `getContractCode` and matched byte-for-byte with `contracts/questproof_v4.py`.

- Address: `0x6112dDFBC7114504098bF4Bd680f3920a3E290Fd`
- Deployment transaction: `0x782b6db0c064ec9ea064a060add1acbea7f2d6febfd46858aabb8db52d197979`
- Source SHA-256: `014333468479fd082fb1209b8b6eef4c7a92848ff29df7e126993aaacf070d50`
- Explorer: https://explorer-studio.genlayer.com/address/0x6112dDFBC7114504098bF4Bd680f3920a3E290Fd

**Verification is in progress. Do not interpret this deployment as mission acceptance or all user flows passing.**

## Automated local checks

`npm test`: 19 Python contract invariant tests using a mocked GenLayer host and 9 JavaScript receipt classification tests passed. The Python tests execute the contract code but **do not verify GenVM storage, web access, real LLM calls or validator consensus**. Those require the separate live tests.

`npm run build`: bundles the pinned GenLayerJS SDK locally for the browser; no runtime CDN import or placeholder verdict is used.

## Live testing

Live integration tests use temporary sandbox accounts and real RPC calls with full consensus, never leader-only mode. Public evidence includes only test text and wallet addresses. Private signing keys stay in ignored local test state. The integration harness checkpoints transaction IDs before waiting and does not blindly resubmit after timeout.

Detailed results will be added after actual execution. Browser wallet signing, hosted browser end-to-end flow and publication are not yet verified at this checkpoint.

## Security and scope

- No administrator PASS override; AI review must be accepted by validators.
- Wallet-bound, contract-specific first-line challenge prevents using another wallet's exact evidence file as one's own submission. It **does not authenticate GitHub legal identity or guarantee originality**. Anyone able to publish an appropriately bound file can participate; the challenge is public, not a secret credential.
- A full Git commit SHA fixes the evidence URL; the retrieved content digest is stored with the result.
- Claims update only non-transferable application points. There is no money, token transfer, redeemability or promised future reward.
- Immutable quest rules; organizer-only creation/closure; pending registration and three-attempt limits; single claim per passing submission; at most one passing contribution per quest/wallet.
- Prompt injection instructions are rejected by the rubric and independent validation criteria. These controls reduce risk; they do not prove universal immunity.
- Studionet may reset; keys for temporary browser sessions are lost on refresh. Use a browser wallet for a persistent identity.
