# Runs the C++, Java and JS solutions against solutions/cases.json and compares with the
# reference outputs. Usage: python3 scripts/verify_langs.py [cpp|java|js ...] [--only 3,5,7]
import concurrent.futures as cf
import json, pathlib, re, shutil, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
RUNNERS = ROOT / 'scripts' / 'runners'
LANGS = {'cpp': 'cpp', 'java': 'java', 'js': 'js'}
MARK = re.compile(r'^// @@ (\d+)[ \t]*$', re.M)


def snippets(lang):
    out = {}
    for f in sorted((ROOT / 'solutions' / lang).glob(f'*.{LANGS[lang]}')):
        parts = MARK.split(f.read_text())
        for n, code in zip(parts[1::2], parts[2::2]):
            out[int(n)] = code.strip('\n').rstrip() + '\n'
    if lang == 'js':
        # JS has no built-in heap: solutions that use one get the shared Heap class prepended
        heap = (ROOT / 'solutions' / 'js' / '_heap.js').read_text().strip() + '\n\n'
        out = {n: (heap + c if 'new Heap(' in c and 'class Heap' not in c else c) for n, c in out.items()}
    return out


# ── comparison ────────────────────────────────────────────────────
def normalise(v, how):
    key = lambda x: json.dumps(x, sort_keys=True)
    if how == 'sorted' and isinstance(v, list):
        return sorted(v, key=key)
    if how == 'deep' and isinstance(v, list):
        return sorted((sorted(x, key=key) if isinstance(x, list) else x for x in v), key=key)
    return v


def same(a, b):
    if isinstance(b, bool) or isinstance(a, bool):
        return a is b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(a - b) < 1e-6
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(same(a[k], b[k]) for k in a)
    return a == b


def check(cases, results, lang):
    """results: {(n, i): {'got': ...} | {'error': ...}} -> list of failure strings."""
    fails = []
    for n, spec in cases.items():
        for i, cs in enumerate(spec['cases']):
            r = results.get((int(n), i))
            label = f'{lang} #{n} {spec["name"]} case {i}'
            if r is None:
                fails.append(f'{label}: no result (crash, timeout or not written)')
            elif 'error' in r:
                fails.append(f'{label}: {r["error"][:300]}')
            elif spec['name'] == 'reverseBits' and isinstance(r['got'], int) and r['got'] < 0 \
                    and same(r['got'] + 2 ** 32, cs['expect']):
                pass  # Java has no unsigned int: same 32 bits, read as unsigned (as LeetCode does)
            elif not same(normalise(r['got'], spec['norm']), normalise(cs['expect'], spec['norm'])):
                fails.append(f'{label}: got {json.dumps(r["got"])[:200]}, expected {json.dumps(cs["expect"])[:200]}')
    return fails


def parse_lines(text, n=None):
    out = {}
    for line in text.splitlines():
        if line.startswith('{'):
            try:
                d = json.loads(line)
            except json.JSONDecodeError:
                continue
            out[(d.get('n', n), d['i'])] = d
    return out


# ── JS ────────────────────────────────────────────────────────────
def run_js(cases, code, tmp):
    (tmp / 'js.json').write_text(json.dumps({str(n): c for n, c in code.items()}))
    (tmp / 'cases.json').write_text(json.dumps(cases))
    p = subprocess.run(['node', str(RUNNERS / 'run_js.mjs'), str(tmp / 'cases.json'), str(tmp / 'js.json')],
                       capture_output=True, text=True, timeout=300)
    if p.stderr.strip():
        print(p.stderr[-2000:])
    return parse_lines(p.stdout)


# ── Java ──────────────────────────────────────────────────────────
def run_java(cases, code, tmp):
    (tmp / 'cases.json').write_text(json.dumps(cases))
    src = tmp / 'java'
    shutil.copytree(RUNNERS / 'java', src)
    files = {}
    for n, c in code.items():
        spec = cases[str(n)]
        imports = 'import common.*;\nimport java.util.*;\n'
        if spec['ret'] == 'rand':
            imports += 'import common.rand.Node;\n'
        if spec['ret'] == 'graph':
            imports += 'import common.graph.Node;\n'
        d = src / f'p{n}'
        d.mkdir()
        (d / 'Sol.java').write_text(f'package p{n};\n\n{imports}\n{c}')
        files[n] = d / 'Sol.java'
    common = [str(x) for x in src.glob('common/**/*.java')]
    out = tmp / 'jout'
    p = subprocess.run(['javac', '-nowarn', '-d', str(out), *common, *map(str, files.values())], capture_output=True, text=True)
    bad = {}
    if p.returncode:
        # find which problems fail to compile, report them, and build the rest
        for n, f in files.items():
            q = subprocess.run(['javac', '-nowarn', '-d', str(tmp / 'jone'), *common, str(f)], capture_output=True, text=True)
            if q.returncode:
                bad[n] = q.stderr.strip().splitlines()[0][-300:] if q.stderr.strip() else 'compile error'
        good = [str(f) for n, f in files.items() if n not in bad]
        subprocess.run(['javac', '-nowarn', '-d', str(out), *common, *good], capture_output=True, text=True, check=True)
    p = subprocess.run(['java', '-Xss64m', '-cp', str(out), 'common.Runner', str(tmp / 'cases.json')],
                       capture_output=True, text=True, timeout=300)
    if p.stderr.strip():
        print(p.stderr[-2000:])
    res = parse_lines(p.stdout)
    for n, msg in bad.items():
        for i in range(len(cases[str(n)]['cases'])):
            res[(n, i)] = {'error': 'compile: ' + msg}
    return res


# ── C++ ───────────────────────────────────────────────────────────
SIG = r'(?:^|[{{}};])\s*(?:public:\s*)?(?:static\s+)?([A-Za-z_][\w:<>,\s\*&]*?)\s*\b{name}\s*\(([^)]*)\)\s*(?:const\s*)?\{{'


def split_params(s):
    out, depth, cur = [], 0, ''
    for ch in s:
        if ch == '<':
            depth += 1
        elif ch == '>':
            depth -= 1
        if ch == ',' and depth == 0:
            out.append(cur); cur = ''
        else:
            cur += ch
    if cur.strip():
        out.append(cur)
    types = []
    for p in out:
        p = re.sub(r'\bconst\b', '', p).replace('&', ' ').strip()
        m = re.match(r'(.*?)(\w+)\s*$', p, re.S)
        types.append(re.sub(r'\s+', ' ', m.group(1)).replace(' *', '*').strip())
    return types


def signature(code, name):
    m = re.search(SIG.format(name=re.escape(name)), code, re.M)
    if not m:
        raise ValueError(f'cannot find signature of {name}')
    return re.sub(r'\s+', ' ', m.group(1)).replace(' *', '*').strip(), split_params(m.group(2))


def decls(types, src, prefix):
    return [f'{t} {prefix}{k} = FromJ<{t}>::get({src}.a[{k}]);' for k, t in enumerate(types)]


def cpp_main(n, spec, code):
    head = {'rand': '#define NODE_RAND\n', 'graph': '#define NODE_GRAPH\n'}.get(spec['ret'], '')
    body = []
    if spec['design']:
        cls = spec['name']
        m = re.search(rf'(?<!new )\b{cls}\s*\(([^)]*)\)\s*(?::|\{{)', code)
        ctor = split_params(m.group(1)) if m else []
        for ci, cs in enumerate(spec['cases']):
            body.append(f'    if (ci == {ci}) {{')
            body += ['      ' + d for d in decls(ctor, 'c["init"]', 'i')]
            ctor_args = ", ".join(f"i{k}" for k in range(len(ctor)))
            body.append(f'      {cls} obj({ctor_args});' if ctor else f'      {cls} obj;')
            body.append('      vector<string> outs;')
            for k, call in enumerate(cs['calls']):
                ret, params = signature(code, call[0])
                body.append(f'      {{ const J& call = c["calls"].a[{k}];')
                body += ['        ' + d.replace('.a[', '.a[1 + ', 1) for d in decls(params, 'call', 'x')]
                args = ', '.join(f'x{j}' for j in range(len(params)))
                body.append(f'        obj.{call[0]}({args});' if ret == 'void' else f'        outs.push_back(to_json(obj.{call[0]}({args})));')
                body.append('      }')
            body.append('      got = "["; for (size_t k = 0; k < outs.size(); k++) { if (k) got += ","; got += outs[k]; } got += "]";')
            body.append('    }')
    else:
        ret, params = signature(code, spec['name'])
        body += ['    ' + d for d in decls(params, 'c["args"]', 'a')]
        body.append('    Solution sol;')
        call = f'sol.{spec["name"]}({", ".join(f"a{k}" for k in range(len(params)))})'
        if spec['inplace'] is not None:
            body += [f'    {call};', f'    got = to_json(a{spec["inplace"]});']
        elif spec['ret'] == 'val':
            body += [f'    auto r = {call};', '    got = r ? to_json(r->val) : "null";']
        else:
            body.append(f'    got = to_json({call});')
    return f'''{head}#include "lc.h"

{code}
int main(int argc, char** argv) {{
  J cases = parse_file(argv[1]);
  for (size_t ci = 0; ci < cases.a.size(); ci++) {{
    const J& c = cases.a[ci];
    reset_call();
    string got = "null";
{chr(10).join(body)}
    cout << "{{\\"i\\":" << ci << ",\\"got\\":" << got << "}}" << endl;
  }}
}}
'''


def run_cpp(cases, code, tmp):
    def one(n):
        spec = cases[str(n)]
        d = tmp / f'cpp{n}'
        d.mkdir()
        try:
            (d / 'main.cpp').write_text(cpp_main(n, spec, code[n]))
        except ValueError as e:
            return n, {i: {'error': str(e)} for i in range(len(spec['cases']))}
        (d / 'cases.json').write_text(json.dumps(spec['cases']))
        p = subprocess.run(['clang++', '-std=c++17', '-O1', '-w', '-I', str(RUNNERS), '-o', str(d / 'a.out'), str(d / 'main.cpp')],
                           capture_output=True, text=True)
        if p.returncode:
            err = next((l for l in p.stderr.splitlines() if 'error' in l), p.stderr[:300])
            return n, {i: {'error': 'compile: ' + err[-300:]} for i in range(len(spec['cases']))}
        try:
            r = subprocess.run([str(d / 'a.out'), str(d / 'cases.json')], capture_output=True, text=True, timeout=20)
            out = r.stdout
            if r.returncode:
                out += '\n'  # crash: later cases simply have no result
        except subprocess.TimeoutExpired as e:
            out = (e.stdout or b'').decode() if isinstance(e.stdout, bytes) else (e.stdout or '')
        return n, {k[1]: v for k, v in parse_lines(out, n).items()}

    res = {}
    with cf.ThreadPoolExecutor(max_workers=8) as ex:
        for n, rs in ex.map(one, sorted(code)):
            for i, v in rs.items():
                res[(n, i)] = v
    return res


RUN = {'cpp': run_cpp, 'java': run_java, 'js': run_js}


def verify(langs=('cpp', 'java', 'js'), only=None, require_all=True):
    cases = json.loads((ROOT / 'solutions' / 'cases.json').read_text())
    if only:
        cases = {k: v for k, v in cases.items() if int(k) in only}
    fails = []
    code_by_lang = {}
    for lang in langs:
        code = {n: c for n, c in snippets(lang).items() if str(n) in cases}
        code_by_lang[lang] = code
        missing = sorted(int(n) for n in cases if int(n) not in code)
        if missing and require_all:
            fails.append(f'{lang}: missing solutions {missing}')
        with tempfile.TemporaryDirectory() as t:
            res = RUN[lang]({k: v for k, v in cases.items() if int(k) in code}, code, pathlib.Path(t))
        sub = {k: v for k, v in cases.items() if int(k) in code}
        f = check(sub, res, lang)
        print(f'{lang}: {len(code)} solutions, {sum(len(c["cases"]) for c in sub.values()) - len(f)} cases passing, {len(f)} failing')
        fails += f
    return fails, code_by_lang


if __name__ == '__main__':
    args = sys.argv[1:]
    only = None
    if '--only' in args:
        k = args.index('--only')
        only = {int(x) for x in args[k + 1].split(',')}
        args = args[:k] + args[k + 2:]
    fails, _ = verify(tuple(args) or ('cpp', 'java', 'js'), only, require_all=False)
    print('\n'.join(fails) or 'all passing')
    sys.exit(1 if fails else 0)
