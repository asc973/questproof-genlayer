# Trap Hunt and Contribution Passport

Three fictional security-learning challenges are available without connecting a wallet: airdrop phishing, NFT approval traps, and fake support messages. Each has three dangerous choices and one safe response. Practice scoring is deterministic, runs locally, and is explicitly not AI consensus. Practice cannot create an on-chain badge.

To earn a badge, write your own explanation (80+ characters), connect a signer, choose **온체인 도전 준비**, then use the existing workspace: register, publish the downloaded wallet-bound evidence at a pinned public GitHub commit, request GenLayer AI review, and claim points after PASS. Each challenge awards 50 non-transferable app points once per wallet. Practice success never guarantees AI PASS. Never include real secrets.

The passport scans every 25-record page of finalized submissions for the requested wallet. A challenge badge requires that challenge's PASS record AND claimed=true. PASS without a claim is shown as pending. Badges are derived profile labels, not newly minted NFTs. It reads the same deployed V4 source and existing ledger; no replacement contract or manual verdict override is introduced.

Daily starting scenario uses the day of month in Asia/Seoul. All three scenarios remain selectable. Practice progress is stored only on this device. No financial rewards or human uniqueness are claimed.

Local validation: 33 automated tests (11 JavaScript and 22 contract host tests), including all-choices rejection and badge gating. Network and hosted browser verification are recorded separately when completed.

## Verified live challenge

Quest #3 (airdrop) → submission #4 → actual AI PASS → successful finalized claim. The test wallet's balance increased from its previous 100 to 150 points. All three quest creations, registration, evaluation and claim (6 transactions) were individually reread and proved FINALIZED / MAJORITY_AGREE / SUCCESS. Deployed source still matches the published V4 byte for byte. See [machine-readable live evidence](play-live-results.json). This tests one challenge end to end, not all three semantic outcomes or a personal wallet extension.

## Hosted browser verification

On the published app, all three scenarios rendered, accepted their correct choices and displayed the expected explanations without a wallet. Selecting every option correctly failed. The UI rejected a short explanation and a disconnected on-chain preparation attempt. With a temporary signer, preparation selected quest #5 and copied the typed Fake Support explanation into the contribution editor. No transaction is sent by preparation itself.

The passport queried the real test wallet `0x1b297ef186b58243cea62813ae8720796c67f288` and displayed 1/3 badges, 150 points, and only the earned phishing badge. Practice success did not award the other badges. Personal wallet extension signing remains untested. The airdrop challenge was tested end to end on-chain; the other two currently have finalized quests plus browser practice/selection tests, not completed AI/claim runs.

![Trap Hunt browser practice](screenshots/trap-hunt.jpg)
![Finalized on-chain passport read](screenshots/passport.jpg)
