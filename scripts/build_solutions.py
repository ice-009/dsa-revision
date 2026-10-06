# Builds solutions.js: for every problem the algorithm, dry run, and C++ / Java / JavaScript code.
#
# 1. Python reference solutions (solutions/w*.py) run their examples + tests; their outputs become the
#    expected answers (solutions/cases.json, via record_cases.py).
# 2. The C++, Java and JS solutions (solutions/{cpp,java,js}) are compiled/run against every case.
# 3. Only if everything passes is solutions.js written. Python code is never published.
# Usage: python3 scripts/build_solutions.py
import importlib, json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'solutions'))
sys.path.insert(0, str(ROOT / 'scripts'))
import _harness as H
import verify_langs

for f in sorted((ROOT / 'solutions').glob('w*.py')):
    importlib.import_module(f.stem)

problems = json.loads(re.search(r'window\.ITEMS = (\[.*\]);', (ROOT / 'problems.js').read_text(), re.S).group(1))
wanted = {p['n']: p['title'] for p in problems if p['kind'] == 'Practice'}

# ── 1. reference answers ──────────────────────────────────────────
failures, ref = [], {}
for n, s in sorted(H.REG.items()):
    if n not in wanted:
        failures.append(f'#{n}: not a practice problem in the sheet')
        continue
    try:
        got = s['run'](s['obj'])
        if H.normalise(got, s['norm']) != H.normalise(s['expect'], s['norm']):
            failures.append(f'#{n} reference: example gave {got!r}, expected {s["expect"]!r}')
        for i, (t, exp) in enumerate(s['tests']):
            r = t(s['obj'])
            if H.normalise(r, s['norm']) != H.normalise(exp, s['norm']):
                failures.append(f'#{n} reference: test {i} gave {r!r}, expected {exp!r}')
        ref[n] = got
    except Exception as e:  # noqa: BLE001
        failures.append(f'#{n} reference raised {type(e).__name__}: {e}')
missing = sorted(set(wanted) - set(H.REG))
if missing:
    failures.append(f'missing reference solutions: {missing}')
if failures:
    sys.exit('\n'.join(failures))

subprocess.run([sys.executable, str(ROOT / 'scripts' / 'record_cases.py')], check=True)

# ── 2. C++ / Java / JS ────────────────────────────────────────────
fails, code = verify_langs.verify()
if fails:
    print('\n'.join(fails))
    sys.exit(f'\n{len(fails)} failing — solutions.js not written')

# ── 3. language-neutral text + output ─────────────────────────────
RENAME = {'A_left': 'aLeft', 'A_right': 'aRight', 'B_left': 'bLeft', 'B_right': 'bRight'}


def neutral(t):
    for a, b in RENAME.items():
        t = t.replace(a, b)
    t = re.sub(r'\b([a-z]+)_([a-z])(\w*)', lambda m: m.group(1) + m.group(2).upper() + m.group(3), t)  # snake → camel
    t = re.sub(r'\bTrue\b', 'true', t)
    t = re.sub(r'\bFalse\b', 'false', t)
    t = re.sub(r'\bNone\b', 'null', t)
    t = re.sub(r'±inf\b', '±∞', t)
    t = re.sub(r'-inf\b', '−∞', t)
    t = re.sub(r'\binf\b', '∞', t)
    t = re.sub(r'\blen\((\w+)\)', r'\1.length', t)
    t = re.sub(r'(\w+)\[:([\w+]+)\]', r'\1[0..\2)', t)       # s[:i]   → s[0..i)
    t = re.sub(r'(\w+)\[(\w+):\]', r'\1[\2..]', t)            # s[i:]   → s[i..]
    t = re.sub(r'(\w+)\[(\w+):(\w+)\+1\]', r'\1[\2..\3]', t)  # s[a:b+1] → s[a..b]
    t = re.sub(r'(\w+)\[(\w+):(\w+)\]', r'\1[\2..\3)', t)     # s[a:b]  → s[a..b)
    t = re.sub(r'\bappend(s|ed|ing)?\b', lambda m: 'add' + {'s': 's', 'ed': 'ed', 'ing': 'ing'}.get(m.group(1) or '', ''), t)
    t = t.replace('∈ dict', '∈ words')
    return t


def as_json(v):
    if isinstance(v, (list, tuple)):
        return [as_json(x) for x in v]
    return v


HEADERS = {
    'cpp': [('ListNode', '// ListNode is defined by LeetCode: struct ListNode { int val; ListNode *next; };'),
            ('TreeNode', '// TreeNode is defined by LeetCode: struct TreeNode { int val; TreeNode *left, *right; };'),
            ('Node*', '// Node is defined by LeetCode (see the problem statement).')],
    'java': [('ListNode', '// ListNode is defined by LeetCode: class ListNode { int val; ListNode next; }'),
             ('TreeNode', '// TreeNode is defined by LeetCode: class TreeNode { int val; TreeNode left, right; }'),
             ('Node ', '// Node is defined by LeetCode (see the problem statement).')],
    'js': [('ListNode', '// ListNode(val, next) is defined by LeetCode.'),
           ('TreeNode', '// TreeNode(val, left, right) is defined by LeetCode.'),
           ('_Node', '// _Node is defined by LeetCode (see the problem statement).')],
}


def with_header(lang, src):
    lines = []
    for needle, comment in HEADERS[lang]:
        if needle in ('Node*', 'Node '):  # LeetCode's Node class, not ListNode/TreeNode or a nested helper Node
            if not re.search(r'(?<![A-Za-z])Node\b', src) or re.search(r'(class|struct) Node\b', src):
                continue
        elif needle not in src:
            continue
        lines.append(comment)
    return ('\n'.join(lines) + '\n\n' if lines else '') + src.rstrip() + '\n'


cases = json.loads((ROOT / 'solutions' / 'cases.json').read_text())
out = {}
for n, s in sorted(H.REG.items()):
    got = ref[n]
    out[n] = {
        'algo': [neutral(a) for a in s['algo']],
        'dry': [neutral(d) for d in s['dry']],
        'ex': neutral(s['ex']),
        'out': json.dumps(as_json(got), ensure_ascii=False),
        'code': {lang: with_header(lang, code[lang][n]) for lang in ('cpp', 'java', 'js')},
        'tests': len(cases[str(n)]['cases']),
    }

body = ',\n'.join(f'{n}: {json.dumps(v, ensure_ascii=False)}' for n, v in out.items())
(ROOT / 'solutions.js').write_text(
    '// Generated by scripts/build_solutions.py — every C++, Java and JavaScript solution here passed all its tests.\n'
    'window.SOLUTIONS = {\n' + body + '\n};\n')
checks = sum(v['tests'] for v in out.values())
print(f'{len(out)} problems × 3 languages verified ({checks} cases each, {3 * checks} runs) -> solutions.js')
