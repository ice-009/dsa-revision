// Starter code for the Codeforces solve page, with fast I/O boilerplate.
export const CF_LANGS = [['cpp', 'C++'], ['java', 'Java'], ['python', 'Python'], ['js', 'JS']];
export const MONACO_LANG = { cpp: 'cpp', java: 'java', python: 'python', js: 'javascript' };
export const isCfLang = l => CF_LANGS.some(([k]) => k === l);

const clean = s => String(s || '').replace(/[\r\n]+/g, ' ').trim();

/** Starter template for a language. `p` is optional ({ id, name }) and only used for a header comment. */
export function cfTemplate(lang, p) {
  const head = p && p.id ? `${p.id}${p.name ? ' - ' + clean(p.name) : ''}` : '';
  const c = (pre, post = '') => (head ? `${pre} ${head}${post}\n` : '');
  switch (lang) {
    case 'java':
      return `${c('//')}import java.io.*;
import java.util.*;

public class Main {
    static BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer st;
    static PrintWriter out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));

    static String next() throws IOException {
        while (st == null || !st.hasMoreTokens()) st = new StringTokenizer(br.readLine());
        return st.nextToken();
    }
    static int nextInt() throws IOException { return Integer.parseInt(next()); }
    static long nextLong() throws IOException { return Long.parseLong(next()); }

    static void solve() throws IOException {
        
    }

    public static void main(String[] args) throws IOException {
        // int t = nextInt(); while (t-- > 0)
        solve();
        out.flush();
    }
}
`;
    case 'python':
      return `${c('#')}import sys
input = sys.stdin.readline


def solve():
    pass


def main():
    # t = int(input())
    # for _ in range(t):
    solve()


main()
`;
    case 'js':
      return `${c('//')}const data = require('fs').readFileSync(0, 'utf8').split(/\\s+/).filter(Boolean);
let pos = 0;
const next = () => data[pos++];
const nextInt = () => parseInt(data[pos++], 10);
const out = [];

function solve() {
    
}

// let t = nextInt(); while (t--)
solve();
console.log(out.join('\\n'));
`;
    case 'cpp':
    default:
      return `${c('//')}#include <bits/stdc++.h>
using namespace std;
using ll = long long;

void solve() {
    
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // int t; cin >> t; while (t--)
    solve();
    return 0;
}
`;
  }
}
