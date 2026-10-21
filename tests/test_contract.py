"""Local contract invariants with mocked GenLayer host; NOT consensus tests."""
import unittest, types, sys, json, importlib.util, copy
class UserError(Exception): pass
class TreeMap(dict):
    @classmethod
    def __class_getitem__(cls, args): return cls
class Contract:
    def __new__(cls):
        obj=super().__new__(cls)
        for name,typ in cls.__annotations__.items():
            if typ is TreeMap: setattr(obj,name,TreeMap())
        return obj
identity=lambda fn:fn
ctx=types.SimpleNamespace(sender_address='0x'+'a'*40,contract_address='0x'+'c'*40)
host=types.SimpleNamespace(body=b'',output='',calls=0)
def prompt(text): host.calls+=1;return host.output
gl=types.SimpleNamespace(Contract=Contract,public=types.SimpleNamespace(view=identity,write=identity),message=ctx,vm=types.SimpleNamespace(UserError=UserError),nondet=types.SimpleNamespace(web=types.SimpleNamespace(get=lambda url:types.SimpleNamespace(body=host.body)),exec_prompt=prompt),eq_principle=types.SimpleNamespace(strict_eq=lambda fn:fn(),prompt_non_comparative=lambda fn,**kw:fn()))
m=types.ModuleType('genlayer');m.gl=gl;m.Address=str;m.u32=int;m.TreeMap=TreeMap;sys.modules['genlayer']=m
spec=importlib.util.spec_from_file_location('v4','contracts/questproof_v4.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
URL='https://raw.githubusercontent.com/user/repo/'+'1'*40+'/evidence.txt'
RULE='Explain staking, delegation, and how multiple independent validators support decentralization.'
class Tests(unittest.TestCase):
    def setUp(self):
        ctx.sender_address='0x'+'a'*40;self.c=mod.QuestProofV4();self.q=self.c.create_quest('Staking education',RULE,100);ctx.sender_address='0x'+'b'*40;host.calls=0
    def register(self): return self.c.register_submission(self.q)
    def evidence(self,sid,verdict='PASS'):
        r=json.loads(self.c.get_submission(sid));host.body=(r['marker']+'\n'+'Delegation supports independent validators and decentralization. Staking aligns incentives with responsible validation. '*2).encode();host.output=json.dumps({'verdict':verdict,'reason':'The supplied contribution explains the required concepts with substantive detail.'});return self.c.evaluate_submission(sid,URL)
    def test_positive_claim_once(self):
        sid=self.register();self.evidence(sid);self.c.claim_points(sid);self.assertEqual(self.c.get_points(ctx.sender_address),100)
        with self.assertRaises(UserError): self.c.claim_points(sid)
        self.assertEqual(self.c.get_points(ctx.sender_address),100)
    def test_no_manual_award_or_verdict_override(self): self.assertFalse(hasattr(self.c,'attest_participant'))
    def test_creator_role(self):
        with self.assertRaises(UserError): self.c.create_quest('Unauthorized',RULE,100)
    def test_close_role(self):
        with self.assertRaises(UserError): self.c.close_quest(self.q)
    def test_pending_duplicate(self):
        self.register()
        with self.assertRaises(UserError): self.register()
    def test_three_attempts(self):
        for _ in range(3):self.c.cancel_submission(self.register())
        with self.assertRaises(UserError):self.register()
    def test_cross_wallet_cancel_and_evidence(self):
        sid=self.register();ctx.sender_address='0x'+'d'*40
        with self.assertRaises(UserError):self.c.cancel_submission(sid)
        with self.assertRaises(UserError):self.c.evaluate_submission(sid,URL)
    def test_no_claim_before_pass(self):
        with self.assertRaises(UserError):self.c.claim_points(self.register())
    def test_fail_and_review_no_points(self):
        for verdict in ('FAIL','REVIEW'):
            sid=self.register();self.evidence(sid,verdict)
            with self.assertRaises(UserError):self.c.claim_points(sid)
        self.assertEqual(self.c.get_points(ctx.sender_address),0)
    def test_cross_wallet_claim(self):
        sid=self.register();self.evidence(sid);ctx.sender_address='0x'+'d'*40
        with self.assertRaises(UserError):self.c.claim_points(sid)
    def test_pass_prevents_more_attempts(self):
        self.evidence(self.register())
        with self.assertRaises(UserError):self.register()
    def test_url_allowlist_and_immutable_commit(self):
        sid=self.register()
        for u in (URL.replace('raw.githubusercontent.com','evil.example'),URL.replace('1'*40,'main'),URL+'?x=1',URL+'#x',URL.replace('evidence.txt','../evidence.txt'),URL.replace('user/repo','user//repo')):
            with self.subTest(u=u),self.assertRaises(UserError):self.c.evaluate_submission(sid,u)
        self.assertEqual(host.calls,0)
    def test_challenge_mismatch(self):
        sid=self.register();host.body=('wrong wallet\n'+'x'*100).encode()
        with self.assertRaises(UserError):self.c.evaluate_submission(sid,URL)
        self.assertEqual(host.calls,0)
    def test_oversize_no_model(self):
        sid=self.register();host.body=b'x'*10001
        with self.assertRaises(UserError):self.c.evaluate_submission(sid,URL)
        self.assertEqual(host.calls,0)
    def test_malformed_ai_preserves_pending(self):
        sid=self.register();r=json.loads(self.c.get_submission(sid));host.body=(r['marker']+'\n'+'x'*100).encode();host.output='{"verdict":"APPROVE","reason":"bad"}'
        with self.assertRaises(UserError):self.c.evaluate_submission(sid,URL)
        self.assertEqual(json.loads(self.c.get_submission(sid))['status'],'AWAITING_EVIDENCE')
    def test_repeat_evaluation(self):
        sid=self.register();self.evidence(sid)
        with self.assertRaises(UserError):self.evidence(sid)
    def test_digest_and_pagination(self):
        import hashlib
        sid=self.register();self.evidence(sid);r=json.loads(self.c.get_submission(sid));self.assertEqual(r['sha256'],hashlib.sha256(host.body).hexdigest());self.assertEqual(len(json.loads(self.c.list_submissions(ctx.sender_address,0,25))),1)
        with self.assertRaises(UserError):self.c.list_submissions('',0,1000)
    def test_closed_quest_existing_can_finish(self):
        sid=self.register();ctx.sender_address=self.c.organizer;self.c.close_quest(self.q);ctx.sender_address='0x'+'b'*40;self.evidence(sid);self.c.claim_points(sid)
        ctx.sender_address='0x'+'d'*40
        with self.assertRaises(UserError):self.register()
    def test_missing_id_and_boundary(self):
        with self.assertRaises(UserError):self.c.get_submission('999')
        ctx.sender_address=self.c.organizer
        for p in (-1,0,1001):
            with self.assertRaises(UserError):self.c.create_quest('Valid title',RULE,p)
if __name__=='__main__':unittest.main()
