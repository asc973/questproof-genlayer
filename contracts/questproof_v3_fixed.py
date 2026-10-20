# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class QuestProofV3Fixed(gl.Contract):
    organizer: Address
    quest_title: str
    required_phrase: str
    reward_units: u32
    active: bool
    status_by_wallet: TreeMap[str, str]
    evidence_by_wallet: TreeMap[str, str]
    approved_by_wallet: TreeMap[str, str]
    claimed_by_wallet: TreeMap[str, str]
    last_report: str

    def __init__(self):
        self.organizer = gl.message.sender_address
        self.quest_title = ""
        self.required_phrase = ""
        self.reward_units = 0
        self.active = False
        self.status_by_wallet = TreeMap[str, str]()
        self.evidence_by_wallet = TreeMap[str, str]()
        self.approved_by_wallet = TreeMap[str, str]()
        self.claimed_by_wallet = TreeMap[str, str]()
        self.last_report = "No submissions"

    @gl.public.write
    def configure_quest(self, title: str, phrase: str, units: u32) -> None:
        assert gl.message.sender_address == self.organizer, "Only organizer can configure"
        assert not self.active, "Close existing quest before reconfiguring"
        assert 1 <= len(title) <= 100, "Invalid title"
        assert 3 <= len(phrase) <= 100, "Invalid phrase"
        assert units > 0, "Reward units must be positive"
        self.quest_title = title
        self.required_phrase = phrase
        self.reward_units = units
        self.active = True

    @gl.public.write
    def submit_evidence(self, raw_url: str) -> None:
        assert self.active, "Quest is closed"
        assert raw_url.startswith("https://raw.githubusercontent.com/"), "GitHub Raw HTTPS URL required"
        assert 45 <= len(raw_url) <= 350, "Invalid evidence URL"
        wallet = str(gl.message.sender_address).lower()
        assert self.status_by_wallet.get(wallet, "") == "", "Wallet already submitted"
        phrase = self.required_phrase.lower()

        def fetch_and_check() -> bool:
            web_data = gl.nondet.web.get(raw_url)
            body = web_data.body.decode("utf-8")[:4000]
            return phrase in body.lower() and len(body) > 0

        exists = gl.eq_principle.strict_eq(fetch_and_check)
        status = "PENDING_ORGANIZER_REVIEW" if exists else "REJECTED_RULE_NOT_FOUND"
        self.status_by_wallet[wallet] = status
        self.evidence_by_wallet[wallet] = raw_url
        self.approved_by_wallet[wallet] = "NO"
        self.claimed_by_wallet[wallet] = "NO"
        self.last_report = wallet + " | " + status

    @gl.public.write
    def attest_participant(self, participant_key: str, approve: bool) -> None:
        assert gl.message.sender_address == self.organizer, "Only organizer may attest"
        assert len(participant_key) == 42 and participant_key[:2].lower() == "0x", "Invalid address length or prefix"
        wallet = participant_key.lower()
        assert self.status_by_wallet.get(wallet, "") == "PENDING_ORGANIZER_REVIEW", "No pending submission"
        # The organizer is attesting to identity/evidence after an OFF-CHAIN review.
        # This on-chain action is NOT independent proof of GitHub authorship.
        self.approved_by_wallet[wallet] = "YES" if approve else "NO"
        status = "ELIGIBLE_FOR_OFFCHAIN_REWARD" if approve else "REJECTED_BY_ORGANIZER"
        self.status_by_wallet[wallet] = status
        self.last_report = wallet + " | " + status

    @gl.public.write
    def mark_reward_fulfilled(self, participant_key: str) -> None:
        assert gl.message.sender_address == self.organizer, "Only organizer may mark rewards"
        assert len(participant_key) == 42 and participant_key[:2].lower() == "0x", "Invalid address length or prefix"
        wallet = participant_key.lower()
        assert self.status_by_wallet.get(wallet, "") == "ELIGIBLE_FOR_OFFCHAIN_REWARD", "Not eligible"
        assert self.approved_by_wallet.get(wallet, "NO") == "YES", "Organizer approval required"
        assert self.claimed_by_wallet.get(wallet, "NO") != "YES", "Already marked fulfilled"
        self.claimed_by_wallet[wallet] = "YES"
        self.status_by_wallet[wallet] = "OFFCHAIN_REWARD_MARKED_FULFILLED"
        self.last_report = wallet + " | OFFCHAIN_REWARD_MARKED_FULFILLED"
        # No ERC20 or GEN is transferred; organizer must actually fulfill reward externally.

    @gl.public.write
    def close_quest(self) -> None:
        assert gl.message.sender_address == self.organizer, "Only organizer can close"
        self.active = False

    @gl.public.view
    def get_quest(self) -> str:
        return ("Title: " + self.quest_title +
                " | Required phrase: " + self.required_phrase +
                " | Off-chain reward units: " + str(self.reward_units) +
                " | Active: " + str(self.active) +
                " | Organizer: " + str(self.organizer))

    @gl.public.view
    def get_my_status(self) -> str:
        wallet = str(gl.message.sender_address).lower()
        return self.status_by_wallet.get(wallet, "NOT_SUBMITTED")

    @gl.public.view
    def get_status_for(self, participant_key: str) -> str:
        assert len(participant_key) == 42 and participant_key[:2].lower() == "0x", "Invalid address length or prefix"
        wallet = participant_key.lower()
        return (self.status_by_wallet.get(wallet, "NOT_SUBMITTED") +
                " | Source: " + self.evidence_by_wallet.get(wallet, "") +
                " | Marked fulfilled: " + str(self.claimed_by_wallet.get(wallet, "NO")))

    @gl.public.view
    def get_last_report(self) -> str:
        return self.last_report
