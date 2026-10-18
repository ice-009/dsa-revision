import cf from '../api/cf.js';
import run from '../api/run.js';
const mk = () => { const r = { code: 200, headers: {}, body: null, setHeader(k, v) { r.headers[k] = v; return r; }, status(c) { r.code = c; return r; }, json(o) { r.body = o; return r; }, send(s) { r.body = typeof s === 'string' ? JSON.parse(s) : s; return r; } }; return r; };
const call = async (h, req) => { const r = mk(); await h(req, r); return r; };
for (const q of ['4A', '1850A', '1A', '1852B', '2A', '1850 A', '1850/A', 'https://codeforces.com/contest/1850/problem/A', '2A', '1800B1', 'https://evil.com/1850A', 'foo']) {
  const t = Date.now(); const r = await call(cf, { method: 'GET', query: { q } });
  const b = r.body;
  console.log('CF', q, r.code, b.name ?? b.error, b.rating, (b.tags||[]).join(','), b.timeLimit, b.memoryLimit, 'samples=' + (b.samples||[]).length, 'legend=' + (b.legend||'').length, 'note=' + (b.note||'').length, Date.now() - t + 'ms');
}
const full = await call(cf, { method: 'GET', query: { q: '4A' } });
const b = full.body; for (const k of ['legend','input','output','note']) b[k] = b[k].slice(0, 150) + '...';
console.log(JSON.stringify(b, null, 1), full.headers);
console.log('POST->', (await call(cf, { method: 'POST', query: {} })).code, (await call(run, { method: 'GET' })).code);
const R = async (lang, source, tests, extra = {}) => (await call(run, { method: 'POST', body: { lang, source, tests, ...extra } })).body;
const show = (n, x) => console.log(n, JSON.stringify(x).slice(0, 600));
show('cpp double', await R('cpp', '#include <iostream>\nint main(){int x;std::cin>>x;std::cout<<2*x<<"\\n";}', [{in:'21\n'},{in:'5\n'},{in:'-4\n'}]));
show('cpp CE', await R('cpp', 'int main(){ foo }', [{in:''},{in:''}]));
show('cpp TLE', await R('cpp', 'int main(){while(1);}', [{in:''}], { timeLimitMs: 1000 }));
show('cpp RE', await R('cpp', 'int main(){int*p=0;*p=1;}', [{in:''}]));
show('cpp MLE', await R('cpp', '#include <vector>\nint main(){std::vector<char> v(400000000,1);long s=0;for(char c:v)s+=c;return s>5;}', [{in:''}], { memoryLimitKb: 65536 }));
show('java', await R('java', 'public class Main{public static void main(String[] a){System.out.println("hi java");}}', [{in:''}]));
show('python', await R('python', 'print(int(input())*2)', [{in:'4\n'}]));
show('js', await R('js', 'console.log("hi js")', [{in:''}]));
show('bad lang', (await call(run, { method: 'POST', body: { lang: 'x', source: 'a', tests: [{in:''}] } })).body);
