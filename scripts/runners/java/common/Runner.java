package common;

import java.lang.reflect.*;
import java.nio.file.*;
import java.util.*;

/** Replays solutions/cases.json against the compiled Java solutions (one package per problem). */
public class Runner {
    // ── JSON ────────────────────────────────────────────────────
    static int pos;
    static String src;

    static Object parse(String s) { src = s; pos = 0; return value(); }

    static void ws() { while (pos < src.length() && Character.isWhitespace(src.charAt(pos))) pos++; }

    static Object value() {
        ws();
        char c = src.charAt(pos);
        if (c == '{') {
            Map<String, Object> m = new LinkedHashMap<>();
            pos++; ws();
            if (src.charAt(pos) == '}') { pos++; return m; }
            while (true) { ws(); String k = str(); ws(); pos++; m.put(k, value()); ws(); if (src.charAt(pos++) == '}') return m; }
        }
        if (c == '[') {
            List<Object> l = new ArrayList<>();
            pos++; ws();
            if (src.charAt(pos) == ']') { pos++; return l; }
            while (true) { l.add(value()); ws(); if (src.charAt(pos++) == ']') return l; }
        }
        if (c == '"') return str();
        if (src.startsWith("true", pos)) { pos += 4; return true; }
        if (src.startsWith("false", pos)) { pos += 5; return false; }
        if (src.startsWith("null", pos)) { pos += 4; return null; }
        int start = pos;
        while (pos < src.length() && "+-0123456789.eE".indexOf(src.charAt(pos)) >= 0) pos++;
        String num = src.substring(start, pos);
        if (num.contains(".") || num.contains("e") || num.contains("E")) return Double.parseDouble(num);
        return Long.parseLong(num);
    }

    static String str() {
        StringBuilder b = new StringBuilder();
        pos++;
        while (src.charAt(pos) != '"') {
            char c = src.charAt(pos++);
            if (c == '\\') { char e = src.charAt(pos++); b.append(e == 'n' ? '\n' : e == 't' ? '\t' : e); }
            else b.append(c);
        }
        pos++;
        return b.toString();
    }

    static String quote(String s) { return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\""; }

    // ── JSON -> Java ────────────────────────────────────────────
    static List<TreeNode> trees = new ArrayList<>();
    static Set<Object> inputs = Collections.newSetFromMap(new IdentityHashMap<>());

    @SuppressWarnings("unchecked")
    static Object convert(Object j, Type type) throws Exception {
        if (type instanceof ParameterizedType pt) {
            if (j == null) return null;
            Type inner = pt.getActualTypeArguments()[0];
            List<Object> out = new ArrayList<>();
            for (Object x : (List<Object>) j) out.add(convert(x, inner));
            return out;
        }
        Class<?> c = (Class<?>) type;
        if (c == int.class || c == Integer.class) return ((Number) j).intValue();
        if (c == long.class || c == Long.class) return ((Number) j).longValue();
        if (c == double.class || c == Double.class) return ((Number) j).doubleValue();
        if (c == boolean.class || c == Boolean.class) return j;
        if (c == char.class || c == Character.class) return ((String) j).charAt(0);
        if (c == String.class) return j;
        if (j == null) return null;
        if (c.isArray()) {
            List<Object> l = (List<Object>) j;
            Object arr = Array.newInstance(c.getComponentType(), l.size());
            for (int i = 0; i < l.size(); i++) Array.set(arr, i, convert(l.get(i), c.getComponentType()));
            return arr;
        }
        Map<String, Object> m = (Map<String, Object>) j;
        if (c == ListNode.class) return list(m);
        if (c == TreeNode.class) return tree(m);
        if (c.getSimpleName().equals("Node")) return m.containsKey("$rand") ? randList(c, m) : graph(c, m);
        throw new IllegalArgumentException("cannot convert to " + c);
    }

    @SuppressWarnings("unchecked")
    static ListNode list(Map<String, Object> m) {
        boolean cyc = m.containsKey("$cycle");
        List<Object> vals = cyc ? (List<Object>) ((List<Object>) m.get("$cycle")).get(0) : (List<Object>) m.get("$list");
        int at = cyc ? ((Number) ((List<Object>) m.get("$cycle")).get(1)).intValue() : -1;
        ListNode dummy = new ListNode(), tail = dummy;
        List<ListNode> nodes = new ArrayList<>();
        for (Object v : vals) { tail.next = new ListNode(((Number) v).intValue()); tail = tail.next; nodes.add(tail); inputs.add(tail); }
        if (at >= 0) tail.next = nodes.get(at);
        return dummy.next;
    }

    static TreeNode find(TreeNode r, int v) {
        if (r == null || r.val == v) return r;
        TreeNode l = find(r.left, v);
        return l != null ? l : find(r.right, v);
    }

    @SuppressWarnings("unchecked")
    static TreeNode tree(Map<String, Object> m) {
        if (m.containsKey("$ref")) {
            int v = ((Number) m.get("$ref")).intValue();
            for (TreeNode t : trees) { TreeNode f = find(t, v); if (f != null) return f; }
            return null;
        }
        List<Object> v = (List<Object>) m.get("$tree");
        if (v.isEmpty() || v.get(0) == null) return null;
        TreeNode root = new TreeNode(((Number) v.get(0)).intValue());
        Deque<TreeNode> q = new ArrayDeque<>(List.of(root));
        int i = 1;
        while (!q.isEmpty() && i < v.size()) {
            TreeNode n = q.poll();
            if (i < v.size() && v.get(i) != null) { n.left = new TreeNode(((Number) v.get(i)).intValue()); q.add(n.left); }
            i++;
            if (i < v.size() && v.get(i) != null) { n.right = new TreeNode(((Number) v.get(i)).intValue()); q.add(n.right); }
            i++;
        }
        trees.add(root);
        return root;
    }

    @SuppressWarnings("unchecked")
    static Object randList(Class<?> c, Map<String, Object> m) throws Exception {
        List<Object> pairs = (List<Object>) m.get("$rand");
        List<Object> nodes = new ArrayList<>();
        for (Object p : pairs) { Object n = c.getConstructor(int.class).newInstance(((Number) ((List<Object>) p).get(0)).intValue()); nodes.add(n); inputs.add(n); }
        for (int i = 0; i < nodes.size(); i++) {
            if (i + 1 < nodes.size()) c.getField("next").set(nodes.get(i), nodes.get(i + 1));
            Object r = ((List<Object>) pairs.get(i)).get(1);
            c.getField("random").set(nodes.get(i), r == null ? null : nodes.get(((Number) r).intValue()));
        }
        return nodes.isEmpty() ? null : nodes.get(0);
    }

    @SuppressWarnings("unchecked")
    static Object graph(Class<?> c, Map<String, Object> m) throws Exception {
        List<Object> adj = (List<Object>) m.get("$graph");
        List<Object> nodes = new ArrayList<>();
        for (int i = 0; i < adj.size(); i++) { Object n = c.getConstructor(int.class).newInstance(i + 1); nodes.add(n); inputs.add(n); }
        for (int i = 0; i < adj.size(); i++) {
            List<Object> nbs = (List<Object>) c.getField("neighbors").get(nodes.get(i));
            for (Object nb : (List<Object>) adj.get(i)) nbs.add(nodes.get(((Number) nb).intValue() - 1));
        }
        return nodes.isEmpty() ? null : nodes.get(0);
    }

    // ── Java -> JSON ────────────────────────────────────────────
    static String json(Object r, String ret) throws Exception {
        if (("list".equals(ret) || "tree".equals(ret)) && r == null) return "[]";
        if ("val".equals(ret)) return r == null ? "null" : String.valueOf(((TreeNode) r).val);
        if (r == null) return "null";
        if (r instanceof ListNode h) {
            StringJoiner sj = new StringJoiner(",", "[", "]");
            for (int g = 0; h != null && g < 100000; h = h.next, g++) sj.add(String.valueOf(h.val));
            return sj.toString();
        }
        if (r instanceof TreeNode t) {
            List<String> out = new ArrayList<>();
            Deque<TreeNode> q = new LinkedList<>();
            q.add(t);
            while (!q.isEmpty()) {
                TreeNode n = q.poll();
                if (n != null) { out.add(String.valueOf(n.val)); q.add(n.left); q.add(n.right); } else out.add("null");
            }
            while (!out.isEmpty() && out.get(out.size() - 1).equals("null")) out.remove(out.size() - 1);
            return "[" + String.join(",", out) + "]";
        }
        if (r.getClass().getSimpleName().equals("Node")) return "rand".equals(ret) ? randJson(r) : graphJson(r);
        if (r instanceof String s) return quote(s);
        if (r instanceof Character ch) return quote(String.valueOf(ch));
        if (r instanceof Boolean || r instanceof Integer || r instanceof Long) return r.toString();
        if (r instanceof Double d) return d.toString();
        if (r.getClass().isArray()) {
            StringJoiner sj = new StringJoiner(",", "[", "]");
            for (int i = 0; i < Array.getLength(r); i++) sj.add(json(Array.get(r, i), null));
            return sj.toString();
        }
        if (r instanceof Collection<?> col) {
            StringJoiner sj = new StringJoiner(",", "[", "]");
            for (Object x : col) sj.add(json(x, null));
            return sj.toString();
        }
        throw new IllegalArgumentException("cannot serialise " + r.getClass());
    }

    static String randJson(Object h) throws Exception {
        Class<?> c = h.getClass();
        List<Object> nodes = new ArrayList<>();
        for (Object n = h; n != null; n = c.getField("next").get(n)) {
            if (inputs.contains(n)) return quote("shares nodes with the original");
            nodes.add(n);
        }
        StringJoiner sj = new StringJoiner(",", "{\"$rand\":[", "]}");
        for (Object n : nodes) {
            Object r = c.getField("random").get(n);
            int idx = -1;
            for (int k = 0; k < nodes.size(); k++) if (nodes.get(k) == r) idx = k;
            sj.add("[" + c.getField("val").get(n) + "," + (idx < 0 ? "null" : idx) + "]");
        }
        return sj.toString();
    }

    @SuppressWarnings("unchecked")
    static String graphJson(Object start) throws Exception {
        Class<?> c = start.getClass();
        TreeMap<Integer, Object> seen = new TreeMap<>();
        Deque<Object> st = new ArrayDeque<>(List.of(start));
        while (!st.isEmpty()) {
            Object n = st.pop();
            if (inputs.contains(n)) return quote("shares nodes with the original");
            int v = (int) c.getField("val").get(n);
            if (seen.containsKey(v)) continue;
            seen.put(v, n);
            for (Object nb : (List<Object>) c.getField("neighbors").get(n)) st.push(nb);
        }
        StringJoiner sj = new StringJoiner(",", "{\"$graph\":[", "]}");
        for (Object n : seen.values()) {
            StringJoiner inner = new StringJoiner(",", "[", "]");
            for (Object nb : (List<Object>) c.getField("neighbors").get(n)) inner.add(String.valueOf(c.getField("val").get(nb)));
            sj.add(inner.toString());
        }
        return sj.toString();
    }

    // ── run ─────────────────────────────────────────────────────
    static Method method(Class<?> c, String name, int argc) {
        for (Method m : c.getDeclaredMethods())
            if (m.getName().equals(name) && m.getParameterCount() == argc) { m.setAccessible(true); return m; }
        throw new IllegalArgumentException("no method " + name + "/" + argc + " in " + c.getName());
    }

    static Object[] args(List<Object> raw, Type[] types) throws Exception {
        Object[] a = new Object[raw.size()];
        for (int i = 0; i < a.length; i++) a[i] = convert(raw.get(i), types[i]);
        return a;
    }

    @SuppressWarnings("unchecked")
    public static void main(String[] argv) throws Exception {
        Map<String, Object> all = (Map<String, Object>) parse(Files.readString(Path.of(argv[0])));
        Set<String> only = argv.length > 1 ? new HashSet<>(Arrays.asList(argv[1].split(","))) : null;
        for (var e : all.entrySet()) {
            String n = e.getKey();
            if (only != null && !only.contains(n)) continue;
            Map<String, Object> spec = (Map<String, Object>) e.getValue();
            boolean design = (Boolean) spec.get("design");
            String name = (String) spec.get("name"), ret = (String) spec.get("ret");
            Object inplace = spec.get("inplace");
            Class<?> cls;
            try {
                cls = Class.forName("p" + n + "." + (design ? name : "Solution"));
            } catch (ClassNotFoundException ex) {
                continue;
            }
            List<Object> cases = (List<Object>) spec.get("cases");
            for (int i = 0; i < cases.size(); i++) {
                Map<String, Object> cs = (Map<String, Object>) cases.get(i);
                trees.clear();
                inputs.clear();
                String got;
                try {
                    if (design) {
                        List<Object> init = (List<Object>) cs.get("init");
                        Constructor<?> ctor = null;
                        for (Constructor<?> k : cls.getDeclaredConstructors()) if (k.getParameterCount() == init.size()) ctor = k;
                        ctor.setAccessible(true);
                        Object obj = ctor.newInstance(args(init, ctor.getGenericParameterTypes()));
                        StringJoiner sj = new StringJoiner(",", "[", "]");
                        for (Object callObj : (List<Object>) cs.get("calls")) {
                            List<Object> call = (List<Object>) callObj;
                            Method m = method(cls, (String) call.get(0), call.size() - 1);
                            Object r = m.invoke(obj, args(call.subList(1, call.size()), m.getGenericParameterTypes()));
                            if (m.getReturnType() != void.class) sj.add(json(r, null));
                        }
                        got = sj.toString();
                    } else {
                        List<Object> raw = (List<Object>) cs.get("args");
                        Method m = method(cls, name, raw.size());
                        Constructor<?> ctor = cls.getDeclaredConstructor();
                        ctor.setAccessible(true);
                        Object[] a = args(raw, m.getGenericParameterTypes());
                        Object r = m.invoke(ctor.newInstance(), a);
                        got = inplace != null ? json(a[((Number) inplace).intValue()], null) : json(r, ret);
                    }
                    System.out.println("{\"n\":" + n + ",\"i\":" + i + ",\"got\":" + got + "}");
                } catch (Throwable t) {
                    Throwable c = t instanceof InvocationTargetException ite ? ite.getCause() : t;
                    System.out.println("{\"n\":" + n + ",\"i\":" + i + ",\"error\":" + quote(String.valueOf(c)) + "}");
                }
            }
        }
    }
}
