// Test support for the C++ solutions: LeetCode's node types, a tiny JSON reader,
// and from_json / to_json conversions used by the generated test mains.
#include <algorithm>
#include <climits>
#include <cmath>
#include <cstdint>
#include <deque>
#include <fstream>
#include <functional>
#include <iostream>
#include <list>
#include <map>
#include <numeric>
#include <queue>
#include <set>
#include <sstream>
#include <stack>
#include <string>
#include <tuple>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>
using namespace std;

struct ListNode {
    int val; ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
struct TreeNode {
    int val; TreeNode *left; TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *l, TreeNode *r) : val(x), left(l), right(r) {}
};
#ifdef NODE_RAND
struct Node {
    int val; Node* next; Node* random;
    Node(int _val) : val(_val), next(nullptr), random(nullptr) {}
};
#endif
#ifdef NODE_GRAPH
struct Node {
    int val; vector<Node*> neighbors;
    Node() : val(0) {}
    Node(int _val) : val(_val) {}
    Node(int _val, vector<Node*> _neighbors) : val(_val), neighbors(_neighbors) {}
};
#endif

// ── JSON ──────────────────────────────────────────────────────────
struct J {
    enum T { NUL, BOOL, NUM, STR, ARR, OBJ } t = NUL;
    bool b = false; double num = 0; string s; vector<J> a; vector<pair<string, J>> o;
    const J& operator[](const string& k) const {
        for (auto& p : o) if (p.first == k) return p.second;
        static J nul; return nul;
    }
    bool has(const string& k) const { for (auto& p : o) if (p.first == k) return true; return false; }
};
struct JParser {
    const string& s; size_t i = 0;
    explicit JParser(const string& s) : s(s) {}
    void ws() { while (i < s.size() && isspace((unsigned char)s[i])) i++; }
    J parse() {
        ws(); J j;
        char c = s[i];
        if (c == '{') {
            j.t = J::OBJ; i++; ws();
            if (s[i] == '}') { i++; return j; }
            while (true) { ws(); string k = str(); ws(); i++; J v = parse(); j.o.push_back({k, v}); ws(); if (s[i++] == '}') break; }
        } else if (c == '[') {
            j.t = J::ARR; i++; ws();
            if (s[i] == ']') { i++; return j; }
            while (true) { j.a.push_back(parse()); ws(); if (s[i++] == ']') break; }
        } else if (c == '"') { j.t = J::STR; j.s = str(); }
        else if (s.compare(i, 4, "true") == 0) { j.t = J::BOOL; j.b = true; i += 4; }
        else if (s.compare(i, 5, "false") == 0) { j.t = J::BOOL; i += 5; }
        else if (s.compare(i, 4, "null") == 0) { i += 4; }
        else { j.t = J::NUM; size_t e; j.num = stod(s.substr(i), &e); i += e; }
        return j;
    }
    string str() {
        string out; i++;
        while (s[i] != '"') {
            if (s[i] == '\\') { i++; char e = s[i]; out += e == 'n' ? '\n' : e == 't' ? '\t' : e; }
            else out += s[i];
            i++;
        }
        i++; return out;
    }
};
inline J parse_file(const char* path) {
    ifstream f(path); stringstream ss; ss << f.rdbuf(); string text = ss.str();
    return JParser(text).parse();
}

// ── JSON -> C++ values ────────────────────────────────────────────
static vector<TreeNode*> g_trees;            // trees built in this call, for {"$ref": val}
static unordered_set<const void*> g_inputs;  // input nodes, to detect copies that share nodes

template <class T> struct FromJ;
template <> struct FromJ<int> { static int get(const J& j) { return (int)llround(j.num); } };
template <> struct FromJ<long> { static long get(const J& j) { return (long)llround(j.num); } };
template <> struct FromJ<long long> { static long long get(const J& j) { return llround(j.num); } };
template <> struct FromJ<unsigned int> { static unsigned int get(const J& j) { return (unsigned int)llround(j.num); } };
template <> struct FromJ<double> { static double get(const J& j) { return j.num; } };
template <> struct FromJ<bool> { static bool get(const J& j) { return j.b; } };
template <> struct FromJ<string> { static string get(const J& j) { return j.s; } };
template <> struct FromJ<char> { static char get(const J& j) { return j.s.empty() ? 0 : j.s[0]; } };
template <class T> struct FromJ<vector<T>> {
    static vector<T> get(const J& j) { vector<T> v; for (auto& x : j.a) v.push_back(FromJ<T>::get(x)); return v; }
};
template <> struct FromJ<ListNode*> {
    static ListNode* get(const J& j) {
        if (j.t == J::NUL) return nullptr;
        bool cyc = j.has("$cycle");
        const J& vals = cyc ? j["$cycle"].a[0] : j["$list"];
        int pos = cyc ? (int)j["$cycle"].a[1].num : -1;
        ListNode dummy; ListNode* tail = &dummy; vector<ListNode*> nodes;
        for (auto& v : vals.a) { tail->next = new ListNode((int)v.num); tail = tail->next; nodes.push_back(tail); g_inputs.insert(tail); }
        if (pos >= 0) tail->next = nodes[pos];
        return dummy.next;
    }
};
inline TreeNode* find_val(TreeNode* r, int v) {
    if (!r) return nullptr;
    if (r->val == v) return r;
    TreeNode* l = find_val(r->left, v);
    return l ? l : find_val(r->right, v);
}
template <> struct FromJ<TreeNode*> {
    static TreeNode* get(const J& j) {
        if (j.t == J::NUL) return nullptr;
        if (j.has("$ref")) { for (auto* t : g_trees) if (auto* f = find_val(t, (int)j["$ref"].num)) return f; return nullptr; }
        const auto& v = j["$tree"].a;
        if (v.empty() || v[0].t == J::NUL) return nullptr;
        TreeNode* root = new TreeNode((int)v[0].num);
        deque<TreeNode*> q{root}; size_t i = 1;
        while (!q.empty() && i < v.size()) {
            TreeNode* n = q.front(); q.pop_front();
            if (i < v.size() && v[i].t != J::NUL) { n->left = new TreeNode((int)v[i].num); q.push_back(n->left); }
            i++;
            if (i < v.size() && v[i].t != J::NUL) { n->right = new TreeNode((int)v[i].num); q.push_back(n->right); }
            i++;
        }
        g_trees.push_back(root);
        return root;
    }
};
#ifdef NODE_RAND
template <> struct FromJ<Node*> {
    static Node* get(const J& j) {
        if (j.t == J::NUL) return nullptr;
        vector<Node*> nodes;
        for (auto& p : j["$rand"].a) { nodes.push_back(new Node((int)p.a[0].num)); g_inputs.insert(nodes.back()); }
        for (size_t i = 0; i < nodes.size(); i++) {
            if (i + 1 < nodes.size()) nodes[i]->next = nodes[i + 1];
            const J& r = j["$rand"].a[i].a[1];
            nodes[i]->random = r.t == J::NUL ? nullptr : nodes[(int)r.num];
        }
        return nodes.empty() ? nullptr : nodes[0];
    }
};
#endif
#ifdef NODE_GRAPH
template <> struct FromJ<Node*> {
    static Node* get(const J& j) {
        if (j.t == J::NUL) return nullptr;
        const auto& adj = j["$graph"].a;
        vector<Node*> nodes;
        for (size_t i = 0; i < adj.size(); i++) { nodes.push_back(new Node((int)i + 1)); g_inputs.insert(nodes.back()); }
        for (size_t i = 0; i < adj.size(); i++) for (auto& nb : adj[i].a) nodes[i]->neighbors.push_back(nodes[(int)nb.num - 1]);
        return nodes.empty() ? nullptr : nodes[0];
    }
};
#endif

// ── C++ values -> JSON ────────────────────────────────────────────
inline string to_json(int x) { return to_string(x); }
inline string to_json(long x) { return to_string(x); }
inline string to_json(long long x) { return to_string(x); }
inline string to_json(unsigned int x) { return to_string(x); }
inline string to_json(double x) { ostringstream o; o.precision(17); o << x; return o.str(); }
inline string to_json(bool x) { return x ? "true" : "false"; }
inline string to_json(const string& x) {
    string o = "\"";
    for (char c : x) { if (c == '"' || c == '\\') o += '\\'; o += c; }
    return o + "\"";
}
inline string to_json(const char* x) { return to_json(string(x)); }
inline string to_json(char c) { return to_json(string(1, c)); }
inline string to_json(const vector<bool>& v) {
    string o = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) o += ","; o += v[i] ? "true" : "false"; }
    return o + "]";
}
template <class T> string to_json(const vector<T>& v) {
    string o = "[";
    for (size_t i = 0; i < v.size(); i++) { if (i) o += ","; o += to_json(v[i]); }
    return o + "]";
}
inline string to_json(ListNode* h) {
    string o = "["; bool first = true; int guard = 0;
    for (; h && guard < 100000; h = h->next, guard++) { if (!first) o += ","; first = false; o += to_string(h->val); }
    return o + "]";
}
inline string to_json(TreeNode* r) {
    vector<string> out; deque<TreeNode*> q{r};
    while (!q.empty()) {
        TreeNode* n = q.front(); q.pop_front();
        if (n) { out.push_back(to_string(n->val)); q.push_back(n->left); q.push_back(n->right); }
        else out.push_back("null");
    }
    while (!out.empty() && out.back() == "null") out.pop_back();
    string o = "[";
    for (size_t i = 0; i < out.size(); i++) { if (i) o += ","; o += out[i]; }
    return o + "]";
}
#ifdef NODE_RAND
inline string to_json(Node* h) {
    if (!h) return "null";
    vector<Node*> nodes;
    for (Node* c = h; c; c = c->next) { if (g_inputs.count(c)) return "\"shares nodes with the original\""; nodes.push_back(c); }
    string o = "{\"$rand\":[";
    for (size_t i = 0; i < nodes.size(); i++) {
        if (i) o += ",";
        int r = -1;
        for (size_t k = 0; k < nodes.size(); k++) if (nodes[k] == nodes[i]->random) r = (int)k;
        o += "[" + to_string(nodes[i]->val) + "," + (r < 0 ? string("null") : to_string(r)) + "]";
    }
    return o + "]}";
}
#endif
#ifdef NODE_GRAPH
inline string to_json(Node* start) {
    if (!start) return "null";
    map<int, Node*> seen; vector<Node*> st{start};
    while (!st.empty()) {
        Node* n = st.back(); st.pop_back();
        if (g_inputs.count(n)) return "\"shares nodes with the original\"";
        if (seen.count(n->val)) continue;
        seen[n->val] = n;
        for (auto* nb : n->neighbors) st.push_back(nb);
    }
    string o = "{\"$graph\":[";
    bool first = true;
    for (auto& [v, n] : seen) {
        if (!first) o += ",";
        first = false; o += "[";
        for (size_t i = 0; i < n->neighbors.size(); i++) { if (i) o += ","; o += to_string(n->neighbors[i]->val); }
        o += "]";
    }
    return o + "]}";
}
#endif
inline void reset_call() { g_trees.clear(); g_inputs.clear(); }
