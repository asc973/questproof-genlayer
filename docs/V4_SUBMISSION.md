# QuestProof V4 — Projects resubmission material

Status: prepared for review; not submitted by the agent. See V4_VERIFICATION.md for verified scope and signing limitations.

## Name
QuestProof

## Description (under 1000 characters)
QuestProof V4 is a GenLayer Studio application for reviewing public community contributions. Its frontend signs real transactions, reads finalized state, tracks receipts and exports evidence. Participants register a wallet-bound challenge, publish it with their contribution at a commit-pinned GitHub Raw URL, and request AI review. The contract fetches the source, checks its binding, stores its digest and uses validator consensus to assess all quest requirements. PASS, FAIL or REVIEW and a specific explanation are recorded without a manual PASS override. A passing wallet can claim non-transferable app points once. Live tests cover positive reviews, prompt-injection rejection, permissions and duplicate claims. Deployed source matches the repository. The challenge binds a file to a signer; it does not verify GitHub identity or universal originality. Points are not tokens or money.

## Evidence to submit

1. Working app: https://asc973.github.io/questproof-genlayer/
2. Active contract: https://explorer-studio.genlayer.com/address/0x324E86Ca1E8862d5e0d5de2489bb77013945Df7a
3. Verification report and linked transactions: https://github.com/asc973/questproof-genlayer/blob/main/docs/V4_VERIFICATION.md
4. Active source: https://github.com/asc973/questproof-genlayer/blob/main/contracts/questproof_v4.py
5. Machine-readable live results: https://github.com/asc973/questproof-genlayer/blob/main/docs/v4-live-results.json

## Changes responding to rejection

- Replaced the browser-only local keyword demo with a bundled SDK client, real signers and contract reads/writes.
- Replaced phrase matching and organizer attestation with substantive AI evaluation independently validated against original evidence and quest requirements.
- Replaced mutable evidence URLs with commit-pinned files, a wallet/contract/submission-specific challenge and a stored SHA-256 digest. This establishes file-to-signer consistency; no stronger identity claim is made.
- Implemented an actual on-chain app-point ledger, rather than a promise that off-chain reward eligibility will be fulfilled. No monetary reward is claimed.
- Added repeatable local and live integration tests, receipt outcome checks and source matching.
- Preserved failed deployment/test history transparently and identify only the current deployment as active.

## Reviewer walkthrough

Open the app, start a temporary Studio session or connect a wallet, select quest 1 and register. Load the new submission, download the challenge-prefixed evidence file, publish it in a public repository, and paste its commit-pinned Raw URL. Run AI review, inspect the stored verdict/reason and receipt, and claim points after PASS. A new temporary browser session signs real sandbox transactions; it is not a simulation. Its key disappears on refresh. Existing public records can also be inspected without a signer.
