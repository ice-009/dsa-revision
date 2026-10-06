// Week 1 — Arrays & Hashing, Two Pointers. Each "// @@ n" block is one LeetCode-ready solution.

// @@ 3
class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> seen;
        for (int x : nums) {
            if (seen.count(x)) return true;
            seen.insert(x);
        }
        return false;
    }
};

// @@ 4
class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        int count[26] = {0};
        for (int i = 0; i < (int)s.size(); i++) {
            count[s[i] - 'a']++;
            count[t[i] - 'a']--;
        }
        for (int c : count)
            if (c != 0) return false;
        return true;
    }
};

// @@ 5
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;  // value -> index
        for (int i = 0; i < (int)nums.size(); i++) {
            int need = target - nums[i];
            if (seen.count(need)) return {seen[need], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};

// @@ 6
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (const string& w : strs) {
            string key(26, 0);  // letter counts as the key
            for (char c : w) key[c - 'a']++;
            groups[key].push_back(w);
        }
        vector<vector<string>> res;
        for (auto& [key, g] : groups) res.push_back(g);
        return res;
    }
};

// @@ 7
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int x : nums) count[x]++;
        vector<vector<int>> buckets(nums.size() + 1);  // buckets[f] = numbers seen f times
        for (auto& [num, f] : count) buckets[f].push_back(num);
        vector<int> res;
        for (int f = nums.size(); f > 0; f--) {
            for (int num : buckets[f]) {
                res.push_back(num);
                if ((int)res.size() == k) return res;
            }
        }
        return res;
    }
};

// @@ 8
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> res(n, 1);
        int prefix = 1;
        for (int i = 0; i < n; i++) {
            res[i] = prefix;
            prefix *= nums[i];
        }
        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] *= suffix;
            suffix *= nums[i];
        }
        return res;
    }
};

// @@ 9
class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {
        bool rows[9][9] = {}, cols[9][9] = {}, boxes[9][9] = {};
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == '.') continue;
                int v = board[r][c] - '1';
                int b = (r / 3) * 3 + c / 3;
                if (rows[r][v] || cols[c][v] || boxes[b][v]) return false;
                rows[r][v] = cols[c][v] = boxes[b][v] = true;
            }
        }
        return true;
    }
};

// @@ 10
class Solution {
public:
    string decodeString(string s) {
        vector<pair<string, int>> stack;  // (string before '[', repeat count)
        string cur;
        int k = 0;
        for (char ch : s) {
            if (isdigit(ch)) {
                k = k * 10 + (ch - '0');
            } else if (ch == '[') {
                stack.push_back({cur, k});
                cur = "";
                k = 0;
            } else if (ch == ']') {
                auto [prev, times] = stack.back();
                stack.pop_back();
                string repeated;
                while (times--) repeated += cur;
                cur = prev + repeated;
            } else {
                cur += ch;
            }
        }
        return cur;
    }
};

// @@ 11
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> s(nums.begin(), nums.end());
        int best = 0;
        for (int x : s) {
            if (s.count(x - 1)) continue;  // only start at the beginning of a run
            int y = x;
            while (s.count(y + 1)) y++;
            best = max(best, y - x + 1);
        }
        return best;
    }
};

// @@ 13
class Solution {
public:
    bool isPalindrome(string s) {
        int l = 0, r = (int)s.size() - 1;
        while (l < r) {
            while (l < r && !isalnum(s[l])) l++;
            while (l < r && !isalnum(s[r])) r--;
            if (tolower(s[l]) != tolower(s[r])) return false;
            l++;
            r--;
        }
        return true;
    }
};

// @@ 14
class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int l = 0, r = numbers.size() - 1;
        while (l < r) {
            int s = numbers[l] + numbers[r];
            if (s == target) return {l + 1, r + 1};
            if (s < target) l++;
            else r--;
        }
        return {};
    }
};

// @@ 15
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        int n = nums.size();
        for (int i = 0; i < n - 2; i++) {
            if (nums[i] > 0) break;
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = n - 1;
            while (l < r) {
                int s = nums[i] + nums[l] + nums[r];
                if (s < 0) l++;
                else if (s > 0) r--;
                else {
                    res.push_back({nums[i], nums[l], nums[r]});
                    l++;
                    r--;
                    while (l < r && nums[l] == nums[l - 1]) l++;
                }
            }
        }
        return res;
    }
};

// @@ 16
class Solution {
public:
    int maxArea(vector<int>& height) {
        int l = 0, r = height.size() - 1, best = 0;
        while (l < r) {
            best = max(best, min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return best;
    }
};

// @@ 17
class Solution {
public:
    int trap(vector<int>& height) {
        int l = 0, r = (int)height.size() - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                leftMax = max(leftMax, height[l]);
                water += leftMax - height[l];
                l++;
            } else {
                rightMax = max(rightMax, height[r]);
                water += rightMax - height[r];
                r--;
            }
        }
        return water;
    }
};
