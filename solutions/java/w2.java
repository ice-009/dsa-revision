// Week 2 — Sliding Window, Stack.

// @@ 19
class Solution {
    public int maxProfit(int[] prices) {
        int lowest = Integer.MAX_VALUE, best = 0;
        for (int p : prices) {
            lowest = Math.min(lowest, p);
            best = Math.max(best, p - lowest);
        }
        return best;
    }
}

// @@ 20
class Solution {
    public int lengthOfLongestSubstring(String s) {
        int[] last = new int[128];  // last index of each character
        Arrays.fill(last, -1);
        int l = 0, best = 0;
        for (int r = 0; r < s.length(); r++) {
            char c = s.charAt(r);
            if (last[c] >= 0) l = Math.max(l, last[c] + 1);
            last[c] = r;
            best = Math.max(best, r - l + 1);
        }
        return best;
    }
}

// @@ 21
class Solution {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int l = 0, maxF = 0, best = 0;
        for (int r = 0; r < s.length(); r++) {
            maxF = Math.max(maxF, ++count[s.charAt(r) - 'A']);
            while ((r - l + 1) - maxF > k) {
                count[s.charAt(l) - 'A']--;
                l++;
            }
            best = Math.max(best, r - l + 1);
        }
        return best;
    }
}

// @@ 22
class Solution {
    public boolean checkInclusion(String s1, String s2) {
        int n = s1.length();
        if (n > s2.length()) return false;
        int[] need = new int[26], window = new int[26];
        for (int i = 0; i < n; i++) {
            need[s1.charAt(i) - 'a']++;
            window[s2.charAt(i) - 'a']++;
        }
        if (Arrays.equals(need, window)) return true;
        for (int r = n; r < s2.length(); r++) {
            window[s2.charAt(r) - 'a']++;
            window[s2.charAt(r - n) - 'a']--;
            if (Arrays.equals(need, window)) return true;
        }
        return false;
    }
}

// @@ 23
class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        Deque<Integer> q = new ArrayDeque<>();  // indices, values decreasing
        int[] res = new int[nums.length - k + 1];
        for (int r = 0; r < nums.length; r++) {
            while (!q.isEmpty() && nums[q.peekLast()] < nums[r]) q.pollLast();
            q.offerLast(r);
            if (q.peekFirst() <= r - k) q.pollFirst();
            if (r >= k - 1) res[r - k + 1] = nums[q.peekFirst()];
        }
        return res;
    }
}

// @@ 24
class Solution {
    public String minWindow(String s, String t) {
        if (s.isEmpty() || t.isEmpty()) return "";
        int[] need = new int[128], window = new int[128];
        int required = 0;
        for (char c : t.toCharArray())
            if (need[c]++ == 0) required++;
        int have = 0, bestLen = Integer.MAX_VALUE, bestL = 0, l = 0;
        for (int r = 0; r < s.length(); r++) {
            char c = s.charAt(r);
            if (++window[c] == need[c]) have++;
            while (have == required) {
                if (r - l + 1 < bestLen) {
                    bestLen = r - l + 1;
                    bestL = l;
                }
                char d = s.charAt(l++);
                if (window[d]-- == need[d]) have--;
            }
        }
        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestL, bestL + bestLen);
    }
}

// @@ 26
class Solution {
    public boolean isValid(String s) {
        Map<Character, Character> match = Map.of(')', '(', ']', '[', '}', '{');
        Deque<Character> stack = new ArrayDeque<>();
        for (char ch : s.toCharArray()) {
            if (match.containsKey(ch)) {
                if (stack.isEmpty() || stack.peek() != match.get(ch)) return false;
                stack.pop();
            } else {
                stack.push(ch);
            }
        }
        return stack.isEmpty();
    }
}

// @@ 27
class MinStack {
    private final Deque<int[]> st = new ArrayDeque<>();  // {value, min so far}

    public MinStack() {}

    public void push(int val) {
        int low = st.isEmpty() ? val : Math.min(val, st.peek()[1]);
        st.push(new int[]{val, low});
    }

    public void pop() { st.pop(); }

    public int top() { return st.peek()[0]; }

    public int getMin() { return st.peek()[1]; }
}

// @@ 28
class Solution {
    public int evalRPN(String[] tokens) {
        Deque<Integer> st = new ArrayDeque<>();
        for (String tok : tokens) {
            switch (tok) {
                case "+" -> st.push(st.pop() + st.pop());
                case "*" -> st.push(st.pop() * st.pop());
                case "-" -> { int b = st.pop(), a = st.pop(); st.push(a - b); }
                case "/" -> { int b = st.pop(), a = st.pop(); st.push(a / b); }  // truncates toward zero
                default -> st.push(Integer.parseInt(tok));
            }
        }
        return st.pop();
    }
}

// @@ 29
class Solution {
    private final List<String> res = new ArrayList<>();

    public List<String> generateParenthesis(int n) {
        bt(new StringBuilder(), 0, 0, n);
        return res;
    }

    private void bt(StringBuilder cur, int open, int closed, int n) {
        if (cur.length() == 2 * n) {
            res.add(cur.toString());
            return;
        }
        if (open < n) {
            cur.append('(');
            bt(cur, open + 1, closed, n);
            cur.deleteCharAt(cur.length() - 1);
        }
        if (closed < open) {
            cur.append(')');
            bt(cur, open, closed + 1, n);
            cur.deleteCharAt(cur.length() - 1);
        }
    }
}

// @@ 30
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] ans = new int[n];
        Deque<Integer> st = new ArrayDeque<>();  // indices still waiting, temps decreasing
        for (int i = 0; i < n; i++) {
            while (!st.isEmpty() && temperatures[st.peek()] < temperatures[i]) {
                int j = st.pop();
                ans[j] = i - j;
            }
            st.push(i);
        }
        return ans;
    }
}

// @@ 31
class Solution {
    public int carFleet(int target, int[] position, int[] speed) {
        int n = position.length;
        Integer[] order = new Integer[n];
        for (int i = 0; i < n; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> position[b] - position[a]);  // closest to target first
        Deque<Double> st = new ArrayDeque<>();                   // arrival time of each fleet
        for (int i : order) {
            double t = (double) (target - position[i]) / speed[i];
            if (st.isEmpty() || t > st.peek()) st.push(t);
        }
        return st.size();
    }
}

// @@ 32
class Solution {
    public int largestRectangleArea(int[] heights) {
        Deque<int[]> st = new ArrayDeque<>();  // {start index, height}, heights increasing
        int best = 0, n = heights.length;
        for (int i = 0; i < n; i++) {
            int start = i;
            while (!st.isEmpty() && st.peek()[1] > heights[i]) {
                int[] top = st.pop();
                best = Math.max(best, top[1] * (i - top[0]));
                start = top[0];
            }
            st.push(new int[]{start, heights[i]});
        }
        for (int[] e : st) best = Math.max(best, e[1] * (n - e[0]));
        return best;
    }
}
