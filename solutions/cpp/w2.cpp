// Week 2 — Sliding Window, Stack.

// @@ 19
class Solution {
public:
    int maxProfit(vector<int>& prices) {

        int lowest = INT_MAX;
        int best = 0;

        for (int price : prices) {
            lowest = min(lowest, price);
            best = max(best, price - lowest);
        }

        return best;
    }
};

// @@ 20
class Solution {
public:
    int lengthOfLongestSubstring(string s) {

        vector<int> last(128, -1);  // last index of each character

        int left = 0;
        int best = 0;

        for (int right = 0; right < (int)s.size(); right++) {

            char ch = s[right];

            if (last[ch] >= left) {
                left = last[ch] + 1;
            }

            last[ch] = right;
            best = max(best, right - left + 1);
        }

        return best;
    }
};

// @@ 21
class Solution {
public:
    int characterReplacement(string s, int k) {

        vector<int> count(26, 0);

        int left = 0;
        int maxFreq = 0;
        int best = 0;

        for (int right = 0; right < (int)s.size(); right++) {

            count[s[right] - 'A']++;
            maxFreq = max(maxFreq, count[s[right] - 'A']);

            while ((right - left + 1) - maxFreq > k) {
                count[s[left] - 'A']--;
                left++;
            }

            best = max(best, right - left + 1);
        }

        return best;
    }
};

// @@ 22
class Solution {
public:
    bool checkInclusion(string s1, string s2) {

        int n = s1.size();
        int m = s2.size();

        if (n > m) {
            return false;
        }

        vector<int> need(26, 0);
        vector<int> window(26, 0);

        for (int i = 0; i < n; i++) {
            need[s1[i] - 'a']++;
            window[s2[i] - 'a']++;
        }

        if (need == window) {
            return true;
        }

        for (int right = n; right < m; right++) {

            window[s2[right] - 'a']++;
            window[s2[right - n] - 'a']--;

            if (need == window) {
                return true;
            }
        }

        return false;
    }
};

// @@ 23
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {

        deque<int> dq;  // indices, values decreasing from front to back
        vector<int> ans;

        for (int right = 0; right < (int)nums.size(); right++) {

            while (!dq.empty() && nums[dq.back()] < nums[right]) {
                dq.pop_back();
            }

            dq.push_back(right);

            if (dq.front() <= right - k) {
                dq.pop_front();
            }

            if (right >= k - 1) {
                ans.push_back(nums[dq.front()]);
            }
        }

        return ans;
    }
};

// @@ 24
class Solution {
public:
    string minWindow(string s, string t) {

        if (s.empty() || t.empty()) {
            return "";
        }

        vector<int> need(128, 0);
        vector<int> window(128, 0);

        int required = 0;
        for (char ch : t) {
            if (need[ch] == 0) {
                required++;
            }
            need[ch]++;
        }

        int have = 0;
        int left = 0;
        int bestLen = INT_MAX;
        int bestStart = 0;

        for (int right = 0; right < (int)s.size(); right++) {

            char ch = s[right];
            window[ch]++;

            if (window[ch] == need[ch]) {
                have++;
            }

            while (have == required) {

                if (right - left + 1 < bestLen) {
                    bestLen = right - left + 1;
                    bestStart = left;
                }

                char out = s[left];
                if (window[out] == need[out]) {
                    have--;
                }
                window[out]--;

                left++;
            }
        }

        if (bestLen == INT_MAX) {
            return "";
        }

        return s.substr(bestStart, bestLen);
    }
};

// @@ 26
class Solution {
public:
    bool isValid(string s) {

        unordered_map<char, char> match = {{')', '('}, {']', '['}, {'}', '{'}};
        stack<char> st;

        for (char ch : s) {

            if (match.count(ch)) {

                if (st.empty() || st.top() != match[ch]) {
                    return false;
                }

                st.pop();
            }

            else {
                st.push(ch);
            }
        }

        return st.empty();
    }
};

// @@ 27
class MinStack {
    stack<pair<int, int>> st;  // (value, min so far)

public:
    MinStack() {
    }

    void push(int val) {

        int low = val;

        if (!st.empty()) {
            low = min(val, st.top().second);
        }

        st.push({val, low});
    }

    void pop() {
        st.pop();
    }

    int top() {
        return st.top().first;
    }

    int getMin() {
        return st.top().second;
    }
};

// @@ 28
class Solution {
public:
    int evalRPN(vector<string>& tokens) {

        stack<int> st;

        for (string& token : tokens) {

            if (token == "+" || token == "-" || token == "*" || token == "/") {

                int b = st.top();
                st.pop();

                int a = st.top();
                st.pop();

                if (token == "+") {
                    st.push(a + b);
                }
                else if (token == "-") {
                    st.push(a - b);
                }
                else if (token == "*") {
                    st.push(a * b);
                }
                else {
                    st.push(a / b);  // C++ division truncates toward zero
                }
            }

            else {
                st.push(stoi(token));
            }
        }

        return st.top();
    }
};

// @@ 29
class Solution {
    vector<string> ans;

    void backtrack(string& curr, int opened, int closed, int n) {

        if ((int)curr.size() == 2 * n) {
            ans.push_back(curr);
            return;
        }

        if (opened < n) {
            curr.push_back('(');
            backtrack(curr, opened + 1, closed, n);
            curr.pop_back();
        }

        if (closed < opened) {
            curr.push_back(')');
            backtrack(curr, opened, closed + 1, n);
            curr.pop_back();
        }
    }

public:
    vector<string> generateParenthesis(int n) {

        string curr = "";
        backtrack(curr, 0, 0, n);

        return ans;
    }
};

// @@ 30
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {

        int n = temperatures.size();
        vector<int> ans(n, 0);
        stack<int> st;  // indices still waiting, temps decreasing

        for (int i = 0; i < n; i++) {

            while (!st.empty() && temperatures[st.top()] < temperatures[i]) {
                int j = st.top();
                st.pop();
                ans[j] = i - j;
            }

            st.push(i);
        }

        return ans;
    }
};

// @@ 31
class Solution {
public:
    int carFleet(int target, vector<int>& position, vector<int>& speed) {

        int n = position.size();

        vector<pair<int, int>> cars;
        for (int i = 0; i < n; i++) {
            cars.push_back({position[i], speed[i]});
        }

        sort(cars.begin(), cars.end());

        stack<double> st;  // arrival time of each fleet

        // walk from the car closest to the target
        for (int i = n - 1; i >= 0; i--) {

            double time = (double)(target - cars[i].first) / cars[i].second;

            if (st.empty() || time > st.top()) {
                st.push(time);
            }
        }

        return st.size();
    }
};

// @@ 32
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {

        int n = heights.size();
        stack<pair<int, int>> st;  // (start index, height), heights increasing
        int best = 0;

        for (int i = 0; i < n; i++) {

            int start = i;

            while (!st.empty() && st.top().second > heights[i]) {

                int idx = st.top().first;
                int height = st.top().second;
                st.pop();

                best = max(best, height * (i - idx));
                start = idx;
            }

            st.push({start, heights[i]});
        }

        while (!st.empty()) {

            int idx = st.top().first;
            int height = st.top().second;
            st.pop();

            best = max(best, height * (n - idx));
        }

        return best;
    }
};
