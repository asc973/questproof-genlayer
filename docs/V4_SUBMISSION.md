# QuestProof V4 — Projects resubmission material

Status: prepared for review; not submitted by the agent. See V4_VERIFICATION.md for verified scope and signing limitations.

## Name
QuestProof

## Description (under 1000 characters)
QuestProof is a GenLayer Studionet learning app with three Trap Hunt challenges: phishing airdrops, risky NFT approvals and fake support. Anyone can practice without a wallet; local quiz feedback is clearly separated from AI consensus. For verified participation, a signer registers, publishes a wallet-bound explanation at a commit-pinned GitHub Raw URL, and requests review. The contract fetches evidence, checks the challenge, stores its SHA-256 digest, and uses independent validator assessments to record PASS, FAIL or REVIEW with reasons. A PASS can claim 50 non-transferable app points once per challenge. The passport derives badges only from finalized PASS and claim records. All three challenges were tested through real registration, AI review and claims; deployed source matches GitHub. Badges are app labels, not NFTs. No GitHub identity, human uniqueness, financial reward or guaranteed AI accuracy is claimed.

## Evidence to submit

1. Working app: https://asc973.github.io/questproof-genlayer/
2. Active contract: https://explorer-studio.genlayer.com/address/0x324E86Ca1E8862d5e0d5de2489bb77013945Df7a
3. Verification report and linked transactions: https://github.com/asc973/questproof-genlayer/blob/main/docs/V4_VERIFICATION.md
4. Active source: https://github.com/asc973/questproof-genlayer/blob/main/contracts/questproof_v4.py
5. Machine-readable live results: https://github.com/asc973/questproof-genlayer/blob/main/docs/v4-live-results.json

6. Three-challenge verification and participation: https://github.com/asc973/questproof-genlayer/blob/main/docs/PLAY.md
7. Finalized three-badge results: https://github.com/asc973/questproof-genlayer/blob/main/docs/all-challenges-results.json

## Changes responding to rejection

- Replaced the browser-only local keyword demo with a bundled SDK client, real signers and contract reads/writes.
- Replaced phrase matching and organizer attestation with substantive AI evaluation independently validated against original evidence and quest requirements.
- Replaced mutable evidence URLs with commit-pinned files, a wallet/contract/submission-specific challenge and a stored SHA-256 digest. This establishes file-to-signer consistency; no stronger identity claim is made.
- Implemented an actual on-chain app-point ledger, rather than a promise that off-chain reward eligibility will be fulfilled. No monetary reward is claimed.
- Added repeatable local and live integration tests, receipt outcome checks and source matching.
- Preserved failed deployment/test history transparently and identify only the current deployment as active.

## Reviewer walkthrough

Open the app, start a temporary Studio session or connect a wallet, select quest 1 and register. Load the new submission, download the challenge-prefixed evidence file, publish it in a public repository, and paste its commit-pinned Raw URL. Run AI review, inspect the stored verdict/reason and receipt, and claim points after PASS. A new temporary browser session signs real sandbox transactions; it is not a simulation. Its key disappears on refresh. Existing public records can also be inspected without a signer.


## Trap Hunt reviewer shortcut

Play any of the three fictional scenarios without a signer. To inspect existing finalized achievement, enter wallet `0x1b297ef186b58243cea62813ae8720796c67f288` in Wallet history and click **온체인 여권 불러오기** in the Play section. It should show 3/3 badges and 250 app points (150 from three challenges plus 100 from an earlier quest). To participate, connect a signer, write 80+ characters in your own explanation, click **온체인 도전 준비**, then follow registration, public pinned evidence, AI review and point claim in the workspace. Local quiz choices alone never earn a badge.

Submission status remains: prepared, not sent to the GenLayer Projects portal by the agent.
