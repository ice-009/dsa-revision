# Records every example/test input from the verified Python reference solutions as
# language-neutral JSON (solutions/cases.json), with the reference output as `expect`.
# The C++, Java and JS runners replay these cases against their own solutions.
import copy, importlib, inspect, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'solutions'))
import _harness as H

mods = [importlib.import_module(f.stem) for f in sorted((ROOT / 'solutions').glob('w*.py'))]

# LeetCode names where the Python reference had to differ
LC_NAME = {14: 'twoSum', 38: 'search', 113: 'rob', 125: 'maxProfit'}
# how to serialise return values that are nodes
RET = {42: 'list', 43: 'list', 46: 'list', 48: 'list', 51: 'list', 52: 'list',
       55: 'tree', 66: 'tree', 61: 'val', 47: 'rand', 90: 'graph'}
INPLACE = {45: 0, 93: 0, 148: 0, 150: 0}


def enc(v, seen_trees):
    """Python value -> JSON-able input encoding."""
    if isinstance(v, H.ListNode):
        vals, pos, idx, cur = [], -1, {}, v
        while cur and id(cur) not in idx:
            idx[id(cur)] = len(vals); vals.append(cur.val); cur = cur.next
        if cur:
            return {'$cycle': [vals, idx[id(cur)]]}
        return {'$list': vals}
    if isinstance(v, H.TreeNode):
        if id(v) in seen_trees:
            return {'$ref': v.val}
        stack = [v]
        while stack:
            n = stack.pop()
            if n:
                seen_trees.add(id(n)); stack += [n.left, n.right]
        return {'$tree': H.TV(v)}
    if hasattr(v, 'random'):
        nodes, cur = [], v
        while cur:
            nodes.append(cur); cur = cur.next
        return {'$rand': [[n.val, nodes.index(n.random) if n.random else None] for n in nodes]}
    if hasattr(v, 'neighbors'):
        seen, stack = {}, [v]
        while stack:
            n = stack.pop()
            if n.val not in seen:
                seen[n.val] = n; stack += n.neighbors
        return {'$graph': [[nb.val for nb in seen[i].neighbors] for i in range(1, len(seen) + 1)]}
    if isinstance(v, (list, tuple)):
        return [enc(x, seen_trees) for x in v]
    return v


def enc_ret(v, kind):
    if kind == 'list':
        return H.LV(v)
    if kind == 'tree':
        return H.TV(v)
    if kind == 'val':
        return v.val
    if kind in ('rand', 'graph'):
        return enc(v, set()) if v else None
    if isinstance(v, (list, tuple)):
        return [enc_ret(x, None) for x in v]
    return v


cases = {}
current = None


def recording_play(cls, calls, init=()):
    obj, out = cls(*init), []
    for name, *args in calls:
        r = getattr(obj, name)(*args)
        if r is not None:
            out.append(r)
    current['cases'].append({'init': enc(list(init), set()), 'calls': [[c[0], *enc(list(c[1:]), set())] for c in calls],
                             'expect': enc_ret(out, None)})
    return out


for m in mods:
    m.play = recording_play

for n, s in sorted(H.REG.items()):
    obj = s['obj']
    design = inspect.isclass(obj)
    name = LC_NAME.get(n, obj.__name__)
    current = {'name': name, 'design': design, 'norm': s['norm'] if isinstance(s['norm'], str) else None,
               'ret': RET.get(n), 'inplace': INPLACE.get(n), 'cases': []}

    def recorder(*args, _obj=obj, _n=n):
        seen = set()
        encoded = enc(list(copy.deepcopy(args)) if _n not in (44, 47, 61, 90) else list(args), seen)
        result = _obj(*args)
        idx = INPLACE.get(_n)
        expect = enc_ret(args[idx], None) if idx is not None else enc_ret(result, RET.get(_n))
        if idx is not None and _n == 45:
            expect = H.LV(args[0])
        current['cases'].append({'args': encoded, 'expect': expect})
        return result

    target = obj if design else recorder
    for run in [s['run']] + [t for t, _ in s['tests']]:
        run(target)
    cases[n] = current

out = ROOT / 'solutions' / 'cases.json'
out.write_text(json.dumps(cases, indent=None, separators=(',', ':')))
print(len(cases), 'problems,', sum(len(c['cases']) for c in cases.values()), 'cases ->', out.relative_to(ROOT))
