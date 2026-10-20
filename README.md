# QuestProof — Evidence before rewards

**Status:** Original Projects application rejected; V2 remediation is in progress and has not been deployed or accepted.

An experimental GenLayer Intelligent Contract proof of concept for reviewing community quest submissions.

**Website:** https://asc973.github.io/questproof-genlayer/

## AI contract candidate (new)

- `contracts/questproof_ai.py` is the new GenLayer AI-review contract candidate, ready for a Studio deployment attempt. It has **not yet been deployed or validated on GenLayer**.
- The previously tested `questproof.py` in Studio is a minimal storage/read prototype and should remain unchanged until the AI candidate is verified.
- Inputs: `submission_url`, `submitted_text`, `quest_rules`. After the AI write transaction is finalized, call `get_latest_review` to inspect the verdict and reason.
- Example submission URL: `https://x.com/example/status/123456789`
- Example submission text: `@GenLayer staking and delegation support network security and decentralization.`
- Example quest rules: `Mention @GenLayer and explain staking and delegation in relation to decentralization.`

## What is included

- `index.html` — responsive project website with interactive **browser-only, rule-based demonstration**.
- `contracts/questproof.py` — experimental Python Intelligent Contract using GenLayer nondeterministic AI prompting and comparative equivalence.

## How it works

1. An organizer defines natural-language quest requirements.
2. The participant supplies their submission URL and actual content.
3. In GenLayer Studio, the `review_submission(submission_url, submitted_text, quest_rule)` write method is intended to assess the supplied text.
4. Once finalized, `get_latest_review()` returns the latest review verdict and reason.

## Important limitations

The published website is **not connected to the on-chain contract**. Its demo intentionally makes no claims of AI review or on-chain consensus. A supplied URL is not fetched or verified; this prototype does not prove authorship or reward eligibility.

The contract source is not yet proven to deploy and run successfully on GenLayer's live test environment. SDK behavior and validator consensus should be tested in Studio before relying on results. Only the latest review is saved.

## Example inputs for Studio

- `submission_url`: `https://x.com/example/status/123456`
- `submitted_text`: `@GenLayer staking and delegation support network security and decentralization.`
- `quest_rule`: `Mention @GenLayer and explain how staking and delegation support decentralization.`

After finalization, call `get_latest_review` to inspect the result. Capture the actual Studio transaction or Explorer address as evidence, not an invented one.

## Verified Studio execution (2026-10-14)

The user executed the AI review contract in GenLayer Studio and observed:

- Deployed AI contract: accepted, deployment transaction **FINALIZED**.
- `review_submission` write: **FINALIZED**.
- `get_latest_review`: returned **PASS** with a reason explaining that the supplied sample text mentioned @GenLayer and explained staking/delegation in relation to decentralization.
- The URL was a placeholder (`https://x.com/example/status/123456789`), so this verifies **AI assessment of supplied text**, not an external X post or its authorship.
- Studio displayed an address shortened as `0xf8...157c`. The complete contract address and corresponding Explorer URL should be captured before citing them.
- Frontend remains a **separate local rule-based demo**, not a connected blockchain app.

Tested scenario: a positive example. Negative and ambiguous cases still need testing.

## Wallet lookup fix (2026-10-20, untested)

A Studio test reported `get_my_status = PENDING_ORGANIZER_REVIEW` while `get_status_for(participant) = NOT_SUBMITTED` for what appeared to be the same address. The likely cause is inconsistent string representation of `Address` versus `gl.message.sender_address`. The original V3 is preserved.

[\`contracts/questproof_v3_fixed.py\`](contracts/questproof_v3_fixed.py) is a **new, untested** version that stores wallet keys in lowercase and accepts `participant_key: str` for cross-wallet functions (`get_status_for`, `attest_participant`, `mark_reward_fulfilled`). All strings must be a full 42-character 0x address. The new contract **must be deployed as a new instance**; old state is not migrated. Verify the write transaction result SUCCESS, not just FINALIZED. Do not attest to real identity without separate identity verification, and never mark a reward fulfilled without a real transfer.

## QuestProof V3 — organizer attestations and eligibility bookkeeping (unverified)

New candidate: [`contracts/questproof_v3.py`](contracts/questproof_v3.py). Separate [Studio test plan](docs/v3-test-plan.md).

V3 adds organizer-controlled on-chain participant attestation after a GitHub Raw check, plus a record of *off-chain* reward eligibility and fulfillment. It does **not** verify GitHub authorship with cryptographic proof or distribute tokens. This code is **not yet deployed or tested**. The published frontend is still a standalone simulation.

## QuestProof V2 — remediation candidate (NOT DEPLOYED)

The original Projects submission was rejected because it classified user-supplied text without independently retrieving evidence, lacked an organizer-owned quest, and did not link results to eligibility.

The new `contracts/questproof_v2.py` **attempts to address these points**:

1. `configure_quest` and `close_quest`: only the deploying organizer wallet can configure/close the quest.
2. `submit_public_evidence`: GenLayer validators retrieve a **public GitHub Raw** URL instead of trusting pasted text. Only `raw.githubusercontent.com` is accepted.
3. The calling wallet is the submitting identity. Duplicate submissions from the same wallet are rejected.
4. The contract saves an eligibility **candidate** status and organizer-defined reward units. **It does not transfer tokens, establish authorship of the remote file, verify X posts, or prove someone controls the GitHub repository.**

### Studio testing checklist

- Create a fresh Studio file named `questproof_v2.py` and paste the entire source with the version header on the first line.
- Deploy a **new instance**, rather than upgrading the original V1 storage layout.
- As the deployer, run `configure_quest("Documentation Quest", "GenLayer", 100)`.
- Call `get_quest` to verify organizer, rule, and reward units.
- Upload a small public text file to a GitHub repository, copy its **Raw** URL and call `submit_public_evidence(raw_url)`.
- Call `get_my_status` and `get_last_report` and check the actual transaction result is SUCCESS (not merely FINALIZED).
- Attempt a second submission from the same wallet; expect rejection.
- With a second wallet, try calling `configure_quest`; expect rejection.
- Repeat with a file missing the required phrase; expect `REJECTED_MISSING_PHRASE`.
- Close the quest and try submitting; expect rejection.

### Outstanding blockers before resubmission

- **Studio execution unverified**: even schema loading, deployment and external fetch may need corrections based on Studio errors.
- GitHub Raw URLs provide independently fetched content, **not verified authorship**. Attestation, GitHub OAuth ownership checks, or organizer-signed evidence must be added to make identity claims.
- No automated reward transfers: `reward_units` records accounting intent only.
- Frontend is the pre-existing, non-integrated demonstration. A connected organizer/user workflow is not yet built.

Do **not** claim the rejection is fully resolved or resubmit the unchanged Projects application.

## Roadmap

1. Verify contract deployment and review calls in Studio.
2. Build a browser wallet client and integrate on-chain reads/writes.
3. Add source verification, review history and appeals.
4. Add tests for adversarial submissions and reviewer consistency.

## License

Educational prototype; submitted as a project exploration, not a production reward oracle.
