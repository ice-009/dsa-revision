// Week 1 — Arrays & Hashing, Two Pointers. Each "// @@ n" block is one LeetCode-ready solution.

// @@ 3
class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {

        unordered_set<int> seen;

        for (int num : nums) {

            if (seen.count(num)) {
                return true;
            }

            seen.insert(num);
        }

        return false;
    }
};

// @@ 4
class Solution {
public:
    bool isAnagram(string s, string t) {

        if (s.size() != t.size()) {
            return false;
        }

        int count[26] = {0};

        for (int i = 0; i < (int)s.size(); i++) {
            count[s[i] - 'a']++;
            count[t[i] - 'a']--;
        }

        for (int i = 0; i < 26; i++) {
            if (count[i] != 0) {
                return false;
            }
        }

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

            if (seen.count(need)) {
                return {seen[need], i};
            }

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

        for (string word : strs) {

            // key = the 26 letter counts of the word
            string key(26, 0);

            for (char ch : word) {
                key[ch - 'a']++;
            }

            groups[key].push_back(word);
        }

        vector<vector<string>> ans;

        for (auto& entry : groups) {
            ans.push_back(entry.second);
        }

        return ans;
    }
};

// @@ 7
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {

        unordered_map<int, int> count;

        for (int num : nums) {
            count[num]++;
        }

        // buckets[freq] = numbers that appear freq times
        vector<vector<int>> buckets(nums.size() + 1);

        for (auto& entry : count) {
            int num = entry.first;
            int freq = entry.second;
            buckets[freq].push_back(num);
        }

        vector<int> ans;

        for (int freq = nums.size(); freq > 0; freq--) {

            for (int num : buckets[freq]) {

                ans.push_back(num);

                if ((int)ans.size() == k) {
                    return ans;
                }
            }
        }

        return ans;
    }
};

// @@ 8
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {

        int n = nums.size();
        vector<int> ans(n, 1);

        int prefix = 1;

        for (int i = 0; i < n; i++) {
            ans[i] = prefix;
            prefix *= nums[i];
        }

        int suffix = 1;

        for (int i = n - 1; i >= 0; i--) {
            ans[i] *= suffix;
            suffix *= nums[i];
        }

        return ans;
    }
};

// @@ 9
class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board) {

        bool rows[9][9] = {};
        bool cols[9][9] = {};
        bool boxes[9][9] = {};

        for (int i = 0; i < 9; i++) {

            for (int j = 0; j < 9; j++) {

                if (board[i][j] == '.') {
                    continue;
                }

                int digit = board[i][j] - '1';
                int box = (i / 3) * 3 + j / 3;

                if (rows[i][digit] || cols[j][digit] || boxes[box][digit]) {
                    return false;
                }

                rows[i][digit] = true;
                cols[j][digit] = true;
                boxes[box][digit] = true;
            }
        }

        return true;
    }
};

// @@ 10
class Solution {
public:
    string decodeString(string s) {

        stack<int> nums;
        stack<string> strs;

        string ans = "";
        int num = 0;

        for (char ch : s) {

            if (isdigit(ch)) {
                num = num * 10 + (ch - '0');
            }

            else if (ch == '[') {
                nums.push(num);
                strs.push(ans);

                num = 0;
                ans = "";
            }

            else if (ch == ']') {

                int times = nums.top();
                nums.pop();

                string temp = strs.top();
                strs.pop();

                while (times--) {
                    temp += ans;
                }

                ans = temp;
            }

            else {
                ans += ch;
            }
        }

        return ans;
    }
};

// @@ 11
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {

        unordered_set<int> numSet(nums.begin(), nums.end());
        int best = 0;

        for (int num : numSet) {

            // only start counting at the beginning of a run
            if (numSet.count(num - 1)) {
                continue;
            }

            int curr = num;

            while (numSet.count(curr + 1)) {
                curr++;
            }

            best = max(best, curr - num + 1);
        }

        return best;
    }
};

// @@ 13
class Solution {
public:
    bool isPalindrome(string s) {

        int left = 0;
        int right = (int)s.size() - 1;

        while (left < right) {

            while (left < right && !isalnum(s[left])) {
                left++;
            }

            while (left < right && !isalnum(s[right])) {
                right--;
            }

            if (tolower(s[left]) != tolower(s[right])) {
                return false;
            }

            left++;
            right--;
        }

        return true;
    }
};

// @@ 14
class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {

        int left = 0;
        int right = numbers.size() - 1;

        while (left < right) {

            int sum = numbers[left] + numbers[right];

            if (sum == target) {
                return {left + 1, right + 1};
            }

            if (sum < target) {
                left++;
            }
            else {
                right--;
            }
        }

        return {};
    }
};

// @@ 15
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {

        sort(nums.begin(), nums.end());

        vector<vector<int>> ans;
        int n = nums.size();

        for (int i = 0; i < n - 2; i++) {

            if (nums[i] > 0) {
                break;
            }

            if (i > 0 && nums[i] == nums[i - 1]) {
                continue;
            }

            int left = i + 1;
            int right = n - 1;

            while (left < right) {

                int sum = nums[i] + nums[left] + nums[right];

                if (sum < 0) {
                    left++;
                }

                else if (sum > 0) {
                    right--;
                }

                else {
                    ans.push_back({nums[i], nums[left], nums[right]});

                    left++;
                    right--;

                    while (left < right && nums[left] == nums[left - 1]) {
                        left++;
                    }
                }
            }
        }

        return ans;
    }
};

// @@ 16
class Solution {
public:
    int maxArea(vector<int>& height) {

        int left = 0;
        int right = height.size() - 1;
        int best = 0;

        while (left < right) {

            int width = right - left;
            int area = min(height[left], height[right]) * width;

            best = max(best, area);

            if (height[left] < height[right]) {
                left++;
            }
            else {
                right--;
            }
        }

        return best;
    }
};

// @@ 17
class Solution {
public:
    int trap(vector<int>& height) {

        int left = 0;
        int right = (int)height.size() - 1;

        int leftMax = 0;
        int rightMax = 0;
        int water = 0;

        while (left < right) {

            if (height[left] < height[right]) {
                leftMax = max(leftMax, height[left]);
                water += leftMax - height[left];
                left++;
            }

            else {
                rightMax = max(rightMax, height[right]);
                water += rightMax - height[right];
                right--;
            }
        }

        return water;
    }
};
