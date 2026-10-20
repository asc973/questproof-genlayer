# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class QuestProofV2(gl.Contract):
    organizer: Address
    quest_title: str
    required_phrase: str
    reward_units: u32
    active: bool
    results: TreeMap[str, str]
    source_urls: TreeMap[str, str]
    last_report: str

    def __init__(self):
        self.organizer = gl.message.sender_address
        self.quest_title = ""
        self.required_phrase = ""
        self.reward_units = 0
        self.active = False
        self.results = TreeMap[str, str]()
        self.source_urls = TreeMap[str, str]()
        self.last_report = "Not configured"

    @gl.public.write
    def configure_quest(self, title: str, required_phrase: str, reward_units: u32) -> None:
        assert gl.message.sender_address == self.organizer, "Only organizer can configure"
        assert 1 <= len(title) <= 100, "Invalid title"
        assert 3 <= len(required_phrase) <= 100, "Invalid phrase"
        assert reward_units > 0, "Set positive reward units"
        self.quest_title = title
        self.required_phrase = required_phrase
        self.reward_units = reward_units
        self.active = True

    @gl.public.write
    def close_quest(self) -> None:
        assert gl.message.sender_address == self.organizer, "Only organizer can close"
        self.active = False

    @gl.public.write
    def submit_public_evidence(self, raw_url: str) -> None:
        assert self.active, "Quest is closed"
        assert raw_url.startswith("https://raw.githubusercontent.com/"), "Only GitHub Raw HTTPS URLs supported"
        assert 45 <= len(raw_url) <= 350, "Invalid evidence URL"
        caller = str(gl.message.sender_address)
        assert self.results.get(caller, "") == "", "Wallet already submitted"

        def fetch_evidence() -> str:
            response = gl.nondet.web.get(raw_url)
            content = response.body.decode("utf-8")
            return content[:4000]

        evidence = gl.eq_principle.strict_eq(fetch_evidence)
        assert len(evidence) > 0, "Evidence source empty"
        # Honest provenance: demonstrates independent retrieval, NOT GitHub authorship.
        found = self.required_phrase.lower() in evidence.lower()
        result = "ELIGIBLE_PENDING_IDENTITY_CHECK" if found else "REJECTED_MISSING_PHRASE"
        self.results[caller] = result
        self.source_urls[caller] = raw_url
        self.last_report = caller + " | " + result + " | " + raw_url

    @gl.public.view
    def get_quest(self) -> str:
        return (
            "Title: " + self.quest_title +
            " | Required phrase: " + self.required_phrase +
            " | Reward units (off-chain accounting only): " + str(self.reward_units) +
            " | Active: " + str(self.active) +
            " | Organizer: " + str(self.organizer)
        )

    @gl.public.view
    def get_my_status(self) -> str:
        caller = str(gl.message.sender_address)
        return self.results.get(caller, "NOT_SUBMITTED")

    @gl.public.view
    def get_last_report(self) -> str:
        return self.last_report
