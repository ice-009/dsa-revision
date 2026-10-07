// Week 2 — Sliding Window, Stack.

// @@ 19
class Solution {
    public int maxProfit(int[] prices) {

        int lowest = Integer.MAX_VALUE;
        int best = 0;

        for (int price : prices) {
            lowest = Math.min(lowest, price);
            best = Math.max(best, price - lowest);
        }

        return best;
    }
}

// @@ 20
class Solution {
    public int lengthOfLongestSubstring(String s) {

        int[] last = new int[128];  // last index of each character
        Arrays.fill(last, -1);

        int left = 0;
        int best = 0;

        for (int right = 0; right < s.length(); right++) {

            char ch = s.charAt(right);

            if (last[ch] >= left) {
                left = last[ch] + 1;
            }

            last[ch] = right;
            best = Math.max(best, right - left + 1);
        }

        return best;
    }
}

// @@ 21
class Solution {
    public int characterReplacement(String s, int k) {

        int[] count = new int[26];

        int left = 0;
        int maxFreq = 0;
        int best = 0;

        for (int right = 0; right < s.length(); right++) {

            count[s.charAt(right) - 'A']++;
            maxFreq = Math.max(maxFreq, count[s.charAt(right) - 'A']);

            while ((right - left + 1) - maxFreq > k) {
                count[s.charAt(left) - 'A']--;
                left++;
            }

            best = Math.max(best, right - left + 1);
        }

        return best;
    }
}

// @@ 22
class Solution {
    public boolean checkInclusion(String s1, String s2) {

        int n = s1.length();
        int m = s2.length();

        if (n > m) {
            return false;
        }

        int[] need = new int[26];
        int[] window = new int[26];

        for (int i = 0; i < n; i++) {
            need[s1.charAt(i) - 'a']++;
            window[s2.charAt(i) - 'a']++;
        }

        if (Arrays.equals(need, window)) {
            return true;
        }

        for (int right = n; right < m; right++) {

            window[s2.charAt(right) - 'a']++;
            window[s2.charAt(right - n) - 'a']--;

            if (Arrays.equals(need, window)) {
                return true;
            }
        }

        return false;
    }
}

// @@ 23
class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {

        Deque<Integer> dq = new ArrayDeque<>();  // indices, values decreasing from front to back
        int[] ans = new int[nums.length - k + 1];

        for (int right = 0; right < nums.length; right++) {

            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[right]) {
                dq.pollLast();
            }

            dq.offerLast(right);

            if (dq.peekFirst() <= right - k) {
                dq.pollFirst();
            }

            if (right >= k - 1) {
                ans[right - k + 1] = nums[dq.peekFirst()];
            }
        }

        return ans;
    }
}

// @@ 24
class Solution {
    public String minWindow(String s, String t) {

        if (s.isEmpty() || t.isEmpty()) {
            return "";
        }

        int[] need = new int[128];
        int[] window = new int[128];

        int required = 0;
        for (char ch : t.toCharArray()) {
            if (need[ch] == 0) {
                required++;
            }
            need[ch]++;
        }

        int have = 0;
        int left = 0;
        int bestLen = Integer.MAX_VALUE;
        int bestStart = 0;

        for (int right = 0; right < s.length(); right++) {

            char ch = s.charAt(right);
            window[ch]++;

            if (window[ch] == need[ch]) {
                have++;
            }

            while (have == required) {

                if (right - left + 1 < bestLen) {
                    bestLen = right - left + 1;
                    bestStart = left;
                }

                char out = s.charAt(left);
                if (window[out] == need[out]) {
                    have--;
                }
                window[out]--;

                left++;
            }
        }

        if (bestLen == Integer.MAX_VALUE) {
            return "";
        }

        return s.substring(bestStart, bestStart + bestLen);
    }
}

// @@ 26
class Solution {
    public boolean isValid(String s) {

        Map<Character, Character> match = new HashMap<>();
        match.put(')', '(');
        match.put(']', '[');
        match.put('}', '{');

        Deque<Character> stack = new ArrayDeque<>();

        for (char ch : s.toCharArray()) {

            if (match.containsKey(ch)) {

                if (stack.isEmpty()) {
                    return false;
                }

                char top = stack.pop();

                if (top != match.get(ch)) {
                    return false;
                }
            }

            else {
                stack.push(ch);
            }
        }

        return stack.isEmpty();
    }
}

// @@ 27
class MinStack {
    private Deque<int[]> stack = new ArrayDeque<>();  // {value, min so far}

    public MinStack() {
    }

    public void push(int val) {

        int low = val;

        if (!stack.isEmpty()) {
            low = Math.min(val, stack.peek()[1]);
        }

        stack.push(new int[]{val, low});
    }

    public void pop() {
        stack.pop();
    }

    public int top() {
        return stack.peek()[0];
    }

    public int getMin() {
        return stack.peek()[1];
    }
}

// @@ 28
class Solution {
    public int evalRPN(String[] tokens) {

        Deque<Integer> stack = new ArrayDeque<>();

        for (String token : tokens) {

            if (token.equals("+") || token.equals("-") || token.equals("*") || token.equals("/")) {

                int b = stack.pop();
                int a = stack.pop();

                if (token.equals("+")) {
                    stack.push(a + b);
                }
                else if (token.equals("-")) {
                    stack.push(a - b);
                }
                else if (token.equals("*")) {
                    stack.push(a * b);
                }
                else {
                    stack.push(a / b);  // Java division truncates toward zero
                }
            }

            else {
                stack.push(Integer.parseInt(token));
            }
        }

        return stack.pop();
    }
}

// @@ 29
class Solution {
    private List<String> ans = new ArrayList<>();

    public List<String> generateParenthesis(int n) {

        backtrack(new StringBuilder(), 0, 0, n);

        return ans;
    }

    private void backtrack(StringBuilder curr, int opened, int closed, int n) {

        if (curr.length() == 2 * n) {
            ans.add(curr.toString());
            return;
        }

        if (opened < n) {
            curr.append('(');
            backtrack(curr, opened + 1, closed, n);
            curr.deleteCharAt(curr.length() - 1);
        }

        if (closed < opened) {
            curr.append(')');
            backtrack(curr, opened, closed + 1, n);
            curr.deleteCharAt(curr.length() - 1);
        }
    }
}

// @@ 30
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {

        int n = temperatures.length;
        int[] ans = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();  // indices still waiting, temps decreasing

        for (int i = 0; i < n; i++) {

            while (!stack.isEmpty() && temperatures[stack.peek()] < temperatures[i]) {
                int j = stack.pop();
                ans[j] = i - j;
            }

            stack.push(i);
        }

        return ans;
    }
}

// @@ 31
class Solution {
    public int carFleet(int target, int[] position, int[] speed) {

        int n = position.length;

        int[][] cars = new int[n][2];
        for (int i = 0; i < n; i++) {
            cars[i][0] = position[i];
            cars[i][1] = speed[i];
        }

        // closest to target first
        Arrays.sort(cars, (a, b) -> b[0] - a[0]);

        Deque<Double> stack = new ArrayDeque<>();  // arrival time of each fleet

        for (int[] car : cars) {

            double time = (double) (target - car[0]) / car[1];

            if (stack.isEmpty() || time > stack.peek()) {
                stack.push(time);
            }
        }

        return stack.size();
    }
}

// @@ 32
class Solution {
    public int largestRectangleArea(int[] heights) {

        int n = heights.length;
        Deque<int[]> stack = new ArrayDeque<>();  // {start index, height}, heights increasing
        int best = 0;

        for (int i = 0; i < n; i++) {

            int start = i;

            while (!stack.isEmpty() && stack.peek()[1] > heights[i]) {

                int[] top = stack.pop();
                int idx = top[0];
                int height = top[1];

                best = Math.max(best, height * (i - idx));
                start = idx;
            }

            stack.push(new int[]{start, heights[i]});
        }

        while (!stack.isEmpty()) {

            int[] top = stack.pop();
            int idx = top[0];
            int height = top[1];

            best = Math.max(best, height * (n - idx));
        }

        return best;
    }
}
