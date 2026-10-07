# Helper for the /review-my-code skill: moves your own solutions between the app's data repo
# (code.json, written by the app) and Claude's reviews (reviews.json, read by the app).
#
#   python3 scripts/mycode.py pull                 clone / update the data repo, list what needs a review
#   python3 scripts/mycode.py pending [--all] [N…] list problems needing a review (--all: every problem with code)
#   python3 scripts/mycode.py show N               print everything needed to review problem N, set up .mycode/work/N
#   python3 scripts/mycode.py verify N             run sol.cpp / sol.java / sol.js in .mycode/work/N against the test cases
#   python3 scripts/mycode.py save N               fold .mycode/work/N into reviews.json
#   python3 scripts/mycode.py push                 commit and push reviews.json
#
# Repo: $DSA_DATA_REPO or ice-009/dsa-revise-data. Everything local lives in .mycode/ (gitignored).
import json, os, pathlib, subprocess, sys, tempfile, time

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
import verify_langs as V  # noqa: E402

REPO = os.environ.get('DSA_DATA_REPO', 'ice-009/dsa-revise-data')
HOME = ROOT / '.mycode'
DATA = HOME / 'repo'
WORK = HOME / 'work'
EXT = {'cpp': 'cpp', 'java': 'java', 'js': 'js'}
LANGS = ('cpp', 'java', 'js')


def git(*args, cwd=DATA, check=True):
    return subprocess.run(['git', *args], cwd=cwd, check=check, capture_output=True, text=True)


def load(name):
    f = DATA / name
    return json.loads(f.read_text()) if f.exists() else {}


_app = None
def app():
    """The app's own content (problems, notes, statements, reference solutions), read from its JS files."""
    global _app
    if _app is None:
        js = ('global.window={};const fs=require("fs");'
              'for(const f of ["problems.js","notes.js","solutions.js","explain.js","plus/plus1.js","plus/plus2.js","plus/plus3.js","plus/plus4.js"])'
              'eval(fs.readFileSync(f,"utf8"));'
              'const w=window;process.stdout.write(JSON.stringify({items:w.ITEMS,notes:w.NOTES,sol:w.SOLUTIONS,plus:w.PLUS,explain:w.EXPLAIN}))')
        out = subprocess.run(['node', '-e', js], cwd=ROOT, check=True, capture_output=True, text=True).stdout
        _app = json.loads(out)
        _app['by_n'] = {str(i['n']): i for i in _app['items']}
    return _app


def pending(show_all=False, only=None):
    code, reviews = load('code.json'), load('reviews.json')
    out = []
    for n, e in sorted(code.items(), key=lambda kv: int(kv[0])):
        if not e.get('code', '').strip():
            continue
        if only and int(n) not in only:
            continue
        if show_all or only or reviews.get(n, {}).get('rev') != e['rev']:
            out.append((n, e))
    return out


def cmd_pull():
    if not (DATA / '.git').exists():
        HOME.mkdir(exist_ok=True)
        subprocess.run(['git', 'clone', '-q', f'https://github.com/{REPO}.git', str(DATA)], check=True)
    else:
        git('pull', '-q', '--rebase')
    code = load('code.json')
    print(f'{REPO}: {sum(1 for e in code.values() if e.get("code", "").strip())} solutions in code.json, '
          f'{len(load("reviews.json"))} reviews')
    cmd_pending([])


def cmd_pending(args):
    show_all = '--all' in args
    only = {int(a) for a in args if a.isdigit()}
    rows = pending(show_all, only)
    if not rows:
        print('Nothing to review — every solution already has an up-to-date review.')
        return
    by_n = app()['by_n']
    reviews = load('reviews.json')
    print('Needs review:')
    for n, e in rows:
        state = 'updated since last review' if n in reviews else 'new'
        title = by_n.get(n, {}).get('title', '?')
        print(f'  #{n} {title} — {e["lang"]}, {len(e["code"].splitlines())} lines, rev {e["rev"]} ({state})')


def cmd_show(n):
    a = app()
    e = load('code.json').get(n)
    if not e or not e.get('code', '').strip():
        sys.exit(f'#{n}: no code in code.json — run pull first?')
    p, notes, sol, plus, ex = a['by_n'][n], a['notes'][n], a['sol'][n], a['plus'].get(n, {}), a['explain'].get(n, {})
    cases = json.loads((ROOT / 'solutions' / 'cases.json').read_text())[n]
    w = WORK / n
    w.mkdir(parents=True, exist_ok=True)
    (w / f'mine.{EXT[e["lang"]]}').write_text(e['code'])
    (w / 'meta.json').write_text(json.dumps({'rev': e['rev'], 'lang': e['lang']}))
    print(f'# #{n} {p["title"]} ({p["diff"]}, {p["topic"]}) — {p["url"]}')
    print(f'\n## Problem\n{plus.get("q", "")}\n{ex.get("q", "")}')
    print(f'\n## Reference approach — {notes["pat"]}  ({notes["cx"]})')
    for s in sol['algo']:
        print(f'- {s}')
    print(f'Key insight: {notes["key"]}')
    print(f'\n## Test harness\nentry point: {cases["name"]}{" (design class)" if cases["design"] else ""}; '
          f'{len(cases["cases"])} cases. Example: {json.dumps(cases["cases"][0])[:300]}')
    print('Use the same class / method names and parameter types as the reference code below.')
    for lang in LANGS:
        print(f'\n## Reference {lang}\n```{lang}\n{sol["code"][lang].rstrip()}\n```')
    print(f'\n## THEIR CODE ({e["lang"]}, rev {e["rev"]}) — saved to {w.relative_to(ROOT)}/mine.{EXT[e["lang"]]}\n```{e["lang"]}\n{e["code"].rstrip()}\n```')
    print(f'\nWrite: {w.relative_to(ROOT)}/sol.cpp, sol.java, sol.js and review.json, then run verify {n}.')


def cmd_verify(n):
    w = WORK / n
    spec = json.loads((ROOT / 'solutions' / 'cases.json').read_text())[n]
    cases = {n: spec}
    heap = (ROOT / 'solutions' / 'js' / '_heap.js').read_text().strip() + '\n\n'
    tests, all_ok = {}, True
    for lang in LANGS:
        f = w / f'sol.{EXT[lang]}'
        if not f.exists():
            print(f'{lang}: missing {f.relative_to(ROOT)}')
            all_ok = False
            continue
        src = f.read_text().strip('\n') + '\n'
        if lang == 'js' and 'new Heap(' in src and 'class Heap' not in src:
            src = heap + src
        with tempfile.TemporaryDirectory() as t:
            res = V.RUN[lang](cases, {int(n): src}, pathlib.Path(t))
        fails = V.check(cases, res, lang)
        total = len(spec['cases'])
        tests[lang] = {'pass': total - len(fails), 'total': total, 'ok': not fails}
        all_ok &= not fails
        print(f'{lang}: {total - len(fails)}/{total} passing')
        for x in fails:
            print(f'   {x}')
    (w / 'tests.json').write_text(json.dumps(tests))
    print('all passing' if all_ok else 'SOME FAILING')


def cmd_save(n):
    w = WORK / n
    meta = json.loads((w / 'meta.json').read_text())
    rv = json.loads((w / 'review.json').read_text())
    tests = json.loads((w / 'tests.json').read_text()) if (w / 'tests.json').exists() else {}
    a = rv.get('approach') or {}
    problems = [k for k in ('name', 'summary', 'steps', 'cx') if not a.get(k)]
    if problems or 'same' not in rv:
        sys.exit(f'review.json is missing: {", ".join(["approach." + k for k in problems] + ([] if "same" in rv else ["same"]))}')
    if not rv['same'] and not rv.get('compare'):
        sys.exit('review.json: "compare" is required when same is false')
    code = {}
    for lang in LANGS:
        f = w / f'sol.{EXT[lang]}'
        if not f.exists():
            sys.exit(f'missing {f.relative_to(ROOT)}')
        code[lang] = f.read_text().strip('\n') + '\n'
    if set(tests) != set(LANGS):
        sys.exit(f'run verify {n} first')
    reviews = load('reviews.json')
    reviews[n] = {
        'rev': meta['rev'], 'lang': meta['lang'], 'code': code, 'tests': tests,
        'approach': {'name': a['name'], 'summary': a['summary'], 'steps': a['steps'], 'cx': a['cx']},
        'same': bool(rv['same']), 'compare': rv.get('compare', ''), 'notes': rv.get('notes', []),
        'at': int(time.time() * 1000),
    }
    (DATA / 'reviews.json').write_text(json.dumps(reviews, indent=1, ensure_ascii=False) + '\n')
    bad = [l for l, t in tests.items() if not t['ok']]
    print(f'#{n} saved ({"tests failing in " + ", ".join(bad) if bad else "all tests passing"}). Run push when done.')


def cmd_push():
    git('add', 'reviews.json')
    if not git('status', '--porcelain', 'reviews.json').stdout.strip():
        print('Nothing new to push.')
        return
    before = load('reviews.json')
    head = git('show', 'HEAD:reviews.json', check=False).stdout
    old = json.loads(head) if head.strip() else {}
    changed = sorted((k for k in before if before[k] != old.get(k)), key=int)
    git('commit', '-q', '-m', 'Review ' + ', '.join(f'#{k}' for k in changed))
    if git('push', '-q', check=False).returncode:
        git('pull', '-q', '--rebase')
        git('push', '-q')
    print(f'Pushed reviews for {", ".join("#" + k for k in changed)} to {REPO}. The app picks them up on its next sync.')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__ or 'usage: mycode.py pull|pending|show|verify|save|push')
    c, rest = sys.argv[1], sys.argv[2:]
    if c == 'pull':
        cmd_pull()
    elif c == 'pending':
        cmd_pending(rest)
    elif c in ('show', 'verify', 'save') and rest:
        {'show': cmd_show, 'verify': cmd_verify, 'save': cmd_save}[c](str(int(rest[0])))
    elif c == 'push':
        cmd_push()
    else:
        sys.exit('usage: mycode.py pull | pending [--all] [N…] | show N | verify N | save N | push')
