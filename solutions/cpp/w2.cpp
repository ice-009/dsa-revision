// Week 2 — Sliding Window, Stack.

// @@ 19
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int lowest = INT_MAX, best = 0;
        for (int p : prices) {
            lowest = min(lowest, p);
            best = max(best, p - lowest);
        }
        return best;
    }
};

// @@ 20
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> last(128, -1);  // last index of each character
        int l = 0, best = 0;
        for (int r = 0; r < (int)s.size(); r++) {
            if (last[s[r]] >= 0) l = max(l, last[s[r]] + 1);
            last[s[r]] = r;
            best = max(best, r - l + 1);
        }
        return best;
    }
};

// @@ 21
class Solution {
public:
    int characterReplacement(string s, int k) {
        int count[26] = {0};
        int l = 0, maxF = 0, best = 0;
        for (int r = 0; r < (int)s.size(); r++) {
            maxF = max(maxF, ++count[s[r] - 'A']);
            while ((r - l + 1) - maxF > k) {
                count[s[l] - 'A']--;
                l++;
            }
            best = max(best, r - l + 1);
        }
        return best;
    }
};

// @@ 22
class Solution {
public:
    bool checkInclusion(string s1, string s2) {
        int n = s1.size();
        if (n > (int)s2.size()) return false;
        vector<int> need(26, 0), window(26, 0);
        for (int i = 0; i < n; i++) {
            need[s1[i] - 'a']++;
            window[s2[i] - 'a']++;
        }
        if (need == window) return true;
        for (int r = n; r < (int)s2.size(); r++) {
            window[s2[r] - 'a']++;
            window[s2[r - n] - 'a']--;
            if (need == window) return true;
        }
        return false;
    }
};

// @@ 23
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> q;  // indices, values decreasing
        vector<int> res;
        for (int r = 0; r < (int)nums.size(); r++) {
            while (!q.empty() && nums[q.back()] < nums[r]) q.pop_back();
            q.push_back(r);
            if (q.front() <= r - k) q.pop_front();
            if (r >= k - 1) res.push_back(nums[q.front()]);
        }
        return res;
    }
};

// @@ 24
class Solution {
public:
    string minWindow(string s, string t) {
        if (s.empty() || t.empty()) return "";
        vector<int> need(128, 0), window(128, 0);
        int required = 0;
        for (char c : t)
            if (need[c]++ == 0) required++;
        int have = 0, bestLen = INT_MAX, bestL = 0, l = 0;
        for (int r = 0; r < (int)s.size(); r++) {
            char c = s[r];
            if (++window[c] == need[c]) have++;
            while (have == required) {
                if (r - l + 1 < bestLen) {
                    bestLen = r - l + 1;
                    bestL = l;
                }
                char d = s[l++];
                if (window[d]-- == need[d]) have--;
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestL, bestLen);
    }
};

// @@ 26
class Solution {
public:
    bool isValid(string s) {
        unordered_map<char, char> match = {{')', '('}, {']', '['}, {'}', '{'}};
        vector<char> stack;
        for (char ch : s) {
            if (match.count(ch)) {
                if (stack.empty() || stack.back() != match[ch]) return false;
                stack.pop_back();
            } else {
                stack.push_back(ch);
            }
        }
        return stack.empty();
    }
};

// @@ 27
class MinStack {
    vector<pair<int, int>> st;  // (value, min so far)
public:
    MinStack() {}

    void push(int val) {
        int low = st.empty() ? val : min(val, st.back().second);
        st.push_back({val, low});
    }

    void pop() { st.pop_back(); }

    int top() { return st.back().first; }

    int getMin() { return st.back().second; }
};

// @@ 28
class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        vector<long long> st;
        for (const string& tok : tokens) {
            if (tok == "+" || tok == "-" || tok == "*" || tok == "/") {
                long long b = st.back(); st.pop_back();
                long long a = st.back(); st.pop_back();
                if (tok == "+") st.push_back(a + b);
                else if (tok == "-") st.push_back(a - b);
                else if (tok == "*") st.push_back(a * b);
                else st.push_back(a / b);  // C++ division truncates toward zero
            } else {
                st.push_back(stoll(tok));
            }
        }
        return (int)st.back();
    }
};

// @@ 29
class Solution {
    vector<string> res;
    void bt(string& cur, int open, int closed, int n) {
        if ((int)cur.size() == 2 * n) {
            res.push_back(cur);
            return;
        }
        if (open < n) {
            cur.push_back('(');
            bt(cur, open + 1, closed, n);
            cur.pop_back();
        }
        if (closed < open) {
            cur.push_back(')');
            bt(cur, open, closed + 1, n);
            cur.pop_back();
        }
    }
public:
    vector<string> generateParenthesis(int n) {
        string cur;
        bt(cur, 0, 0, n);
        return res;
    }
};

// @@ 30
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> ans(n, 0), st;  // st: indices still waiting, temps decreasing
        for (int i = 0; i < n; i++) {
            while (!st.empty() && temperatures[st.back()] < temperatures[i]) {
                int j = st.back();
                st.pop_back();
                ans[j] = i - j;
            }
            st.push_back(i);
        }
        return ans;
    }
};

// @@ 31
class Solution {
public:
    int carFleet(int target, vector<int>& position, vector<int>& speed) {
        int n = position.size();
        vector<pair<int, int>> cars(n);
        for (int i = 0; i < n; i++) cars[i] = {position[i], speed[i]};
        sort(cars.rbegin(), cars.rend());  // closest to target first
        vector<double> st;                 // arrival time of each fleet
        for (auto& [p, s] : cars) {
            double t = (double)(target - p) / s;
            if (st.empty() || t > st.back()) st.push_back(t);
        }
        return st.size();
    }
};

// @@ 32
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        vector<pair<int, int>> st;  // (start index, height), heights increasing
        int best = 0, n = heights.size();
        for (int i = 0; i < n; i++) {
            int start = i;
            while (!st.empty() && st.back().second > heights[i]) {
                auto [idx, h] = st.back();
                st.pop_back();
                best = max(best, h * (i - idx));
                start = idx;
            }
            st.push_back({start, heights[i]});
        }
        for (auto& [idx, h] : st) best = max(best, h * (n - idx));
        return best;
    }
};
