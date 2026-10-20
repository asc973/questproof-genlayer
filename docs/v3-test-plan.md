# QuestProof V3 — Organizer-attested evidence review

**Status: IMPLEMENTED AS CODE, NOT DEPLOYED OR TESTED IN STUDIO.**

## What changed

The original Projects submission was rejected because anyone could submit both the conditions and unverified text, there was no organizer-controlled quest, and results were unrelated to eligibility or rewards.

V3 implements a separate contract with:

1. Organizer-only `configure_quest` and `close_quest`.
2. Public GitHub Raw evidence fetched independently by validator execution via `gl.nondet.web.get` and `strict_eq`. This checks **only that the required phrase appears in fetched content**.
3. One submission per wallet.
4. **Human organizer attestation**: the actual organizer wallet calls `attest_participant(participant, approve)` after off-chain identity/evidence review. This is an accountable on-chain approval, **not cryptographic proof of GitHub authorship**.
5. `ELIGIBLE_FOR_OFFCHAIN_REWARD` status recorded on chain after explicit approval.
6. Organizer-only `mark_reward_fulfilled(participant)` to record off-chain fulfillment, guarded against duplicate marking. This call **does not send funds**.

## Studio test plan (new deployment)

Use `contracts/questproof_v3.py` in a new file and deploy **new instance**. Keep original V2 contract unchanged.

1. Organizer wallet deploys the new instance.
2. Organizer: `configure_quest("Documentation Quest", "GenLayer", 100)`. Confirm transaction **Result SUCCESS**, then `get_quest`.
3. Participant wallet: `submit_evidence("https://raw.githubusercontent.com/asc973/questproof-genlayer/main/evidence/genlayer-test.txt")`. Confirm **SUCCESS**; `get_my_status` should be `PENDING_ORGANIZER_REVIEW`.
4. Organizer calls `get_status_for(participant address)`, then `attest_participant(participant address, True)` **only after independent human identity/evidence review**. Confirm `ELIGIBLE_FOR_OFFCHAIN_REWARD`.
5. Organizer calls `mark_reward_fulfilled(participant address)` **only after actually fulfilling an off-chain reward**. Confirm `OFFCHAIN_REWARD_MARKED_FULFILLED`. Do not simulate this as a real payout or claim funds were sent.
6. Unauthorized wallet tries `attest_participant`: expect an access-control error.
7. Repeat submission from the same wallet: expect `Wallet already submitted`.
8. Attempt duplicate reward mark after legitimate fulfillment: expect rejection.
9. Check another fresh wallet with a text file missing `GenLayer`: should record `REJECTED_RULE_NOT_FOUND`.

## Security and unresolved requirements

- **No GitHub ownership verification**: a Raw URL proves where text is hosted, not who wrote it or controls the account.
- Organizer attestation is a manual trust assumption, not automatic source-to-wallet identity verification.
- There is no on-chain reward transfer, escrow, or proven payment receipt. A fulfillment flag is a bookkeeping assertion and can be inaccurate unless audited.
- Currently restricted to GitHub Raw files, not X posts or general quest submissions.
- A new quest configuration does not implement a quest ID or a multi-quest lifecycle. For production, use explicit quest IDs and per-quest storage.
- Fetch stability, redirects, file replacement, rate limits, malicious content, replay, and GenLayer Studio SDK compatibility still need tests.
- The public website remains an independent frontend simulation and is not integrated with this contract.

**Do not resubmit to Projects as complete until you have tested the new contract and addressed authorship/payment trust gaps honestly.**
