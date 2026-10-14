# QuestProof — Evidence before rewards

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

## Roadmap

1. Verify contract deployment and review calls in Studio.
2. Build a browser wallet client and integrate on-chain reads/writes.
3. Add source verification, review history and appeals.
4. Add tests for adversarial submissions and reviewer consistency.

## License

Educational prototype; submitted as a project exploration, not a production reward oracle.
