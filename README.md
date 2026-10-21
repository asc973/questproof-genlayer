# QuestProof V4 — live evidence review

QuestProof is a GenLayer Studio application for reviewing public educational contributions against immutable community quest requirements. V4 replaces the old browser-only simulation and manual organizer attestations with direct contract reads/writes, source-grounded AI consensus and a non-transferable point ledger.

**Status:** V4 deployed; live integration verification in progress. No claim of Projects acceptance. See [verification](docs/V4_VERIFICATION.md) for exactly what has and has not passed. V1–V3 sources remain for historical transparency; they are not the active application.

**Website:** https://asc973.github.io/questproof-genlayer/

**V4 contract:** https://explorer-studio.genlayer.com/address/0x6112dDFBC7114504098bF4Bd680f3920a3E290Fd

## Implemented flow

1. Connect an EIP-1193 wallet to Studionet, or generate a temporary in-memory sandbox signer. Read-only inspection works without a wallet.
2. Browse immutable quests and register a submission using an actual signed transaction.
3. Load the contract-generated wallet challenge. Publish it as the first line of a public GitHub file, followed by the contribution. Use the file's commit-pinned Raw URL.
4. The contract retrieves and agrees on the evidence, verifies its wallet binding and asks AI to assess all quest requirements. Validators independently judge the review using the original source and explicit criteria.
5. Read PASS / FAIL / REVIEW, the concrete explanation, source URL and content digest from contract storage.
6. A PASS allows the submitting wallet to claim non-transferable app points exactly once. View wallet history and point totals from chain.

There is no local simulation verdict and no admin function to force PASS. The transaction panel shows the original hash, receipt and finalization state, supports tracking resumption and exports evidence JSON.

## Scope

The file binding establishes consistency with the signing wallet, not verified GitHub identity, human uniqueness or internet-wide authorship. Points are not tokens, money or redeemable rewards. No token transfer is implemented. Studionet is a temporary development environment and may reset.

## Build and test

Node 22+ and Python 3 are required.

```
npm ci
npm test
npm run build
```

GitHub Pages serves the root `index.html`, compiled `assets/`, and `deployment.json`. The lockfile pins dependencies; no user keys are included in the repository. Use HTTPS for browser wallets and clipboard access.

- Active contract: `contracts/questproof_v4.py`
- Frontend: `src/app.js`, `src/network.js`, `src/receipts.js`
- Local test suite: `tests/`
- Live deployment and test harness: `scripts/`; generated keys and pending IDs live in ignored `.local/` only.

Deploying with `NODE_USE_ENV_PROXY=1 node scripts/studio.mjs deploy` creates temporary test accounts and submits a real sandbox deployment. It refuses to blindly deploy again when an address is already recorded. Keep `.local/` private and never use personal-wallet keys there.
