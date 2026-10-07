// Week 1 — Arrays & Hashing, Two Pointers. Each "// @@ n" block is one LeetCode-ready solution.

// @@ 3
class Solution {
    public boolean containsDuplicate(int[] nums) {

        Set<Integer> seen = new HashSet<>();

        for (int num : nums) {

            if (seen.contains(num)) {
                return true;
            }

            seen.add(num);
        }

        return false;
    }
}

// @@ 4
class Solution {
    public boolean isAnagram(String s, String t) {

        if (s.length() != t.length()) {
            return false;
        }

        int[] count = new int[26];

        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }

        for (int i = 0; i < 26; i++) {
            if (count[i] != 0) {
                return false;
            }
        }

        return true;
    }
}

// @@ 5
class Solution {
    public int[] twoSum(int[] nums, int target) {

        Map<Integer, Integer> seen = new HashMap<>();  // value -> index

        for (int i = 0; i < nums.length; i++) {

            int need = target - nums[i];

            if (seen.containsKey(need)) {
                return new int[]{seen.get(need), i};
            }

            seen.put(nums[i], i);
        }

        return new int[0];
    }
}

// @@ 6
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {

        Map<String, List<String>> groups = new HashMap<>();

        for (String word : strs) {

            int[] count = new int[26];

            for (char ch : word.toCharArray()) {
                count[ch - 'a']++;
            }

            // key = the 26 letter counts of the word
            String key = Arrays.toString(count);

            if (!groups.containsKey(key)) {
                groups.put(key, new ArrayList<>());
            }

            groups.get(key).add(word);
        }

        return new ArrayList<>(groups.values());
    }
}

// @@ 7
class Solution {
    public int[] topKFrequent(int[] nums, int k) {

        Map<Integer, Integer> count = new HashMap<>();

        for (int num : nums) {
            count.put(num, count.getOrDefault(num, 0) + 1);
        }

        // buckets.get(freq) = numbers that appear freq times
        List<List<Integer>> buckets = new ArrayList<>();

        for (int i = 0; i <= nums.length; i++) {
            buckets.add(new ArrayList<>());
        }

        for (int num : count.keySet()) {
            int freq = count.get(num);
            buckets.get(freq).add(num);
        }

        int[] ans = new int[k];
        int size = 0;

        for (int freq = nums.length; freq > 0; freq--) {

            for (int num : buckets.get(freq)) {

                ans[size] = num;
                size++;

                if (size == k) {
                    return ans;
                }
            }
        }

        return ans;
    }
}

// @@ 8
class Solution {
    public int[] productExceptSelf(int[] nums) {

        int n = nums.length;
        int[] ans = new int[n];

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
}

// @@ 9
class Solution {
    public boolean isValidSudoku(char[][] board) {

        boolean[][] rows = new boolean[9][9];
        boolean[][] cols = new boolean[9][9];
        boolean[][] boxes = new boolean[9][9];

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
}

// @@ 10
class Solution {
    public String decodeString(String s) {

        Deque<Integer> nums = new ArrayDeque<>();
        Deque<String> strs = new ArrayDeque<>();

        StringBuilder ans = new StringBuilder();
        int num = 0;

        for (char ch : s.toCharArray()) {

            if (Character.isDigit(ch)) {
                num = num * 10 + (ch - '0');
            }

            else if (ch == '[') {
                nums.push(num);
                strs.push(ans.toString());

                num = 0;
                ans = new StringBuilder();
            }

            else if (ch == ']') {

                int times = nums.pop();
                StringBuilder temp = new StringBuilder(strs.pop());

                while (times > 0) {
                    temp.append(ans);
                    times--;
                }

                ans = temp;
            }

            else {
                ans.append(ch);
            }
        }

        return ans.toString();
    }
}

// @@ 11
class Solution {
    public int longestConsecutive(int[] nums) {

        Set<Integer> numSet = new HashSet<>();

        for (int num : nums) {
            numSet.add(num);
        }

        int best = 0;

        for (int num : numSet) {

            // only start counting at the beginning of a run
            if (numSet.contains(num - 1)) {
                continue;
            }

            int curr = num;

            while (numSet.contains(curr + 1)) {
                curr++;
            }

            best = Math.max(best, curr - num + 1);
        }

        return best;
    }
}

// @@ 13
class Solution {
    public boolean isPalindrome(String s) {

        int left = 0;
        int right = s.length() - 1;

        while (left < right) {

            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) {
                left++;
            }

            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) {
                right--;
            }

            char a = Character.toLowerCase(s.charAt(left));
            char b = Character.toLowerCase(s.charAt(right));

            if (a != b) {
                return false;
            }

            left++;
            right--;
        }

        return true;
    }
}

// @@ 14
class Solution {
    public int[] twoSum(int[] numbers, int target) {

        int left = 0;
        int right = numbers.length - 1;

        while (left < right) {

            int sum = numbers[left] + numbers[right];

            if (sum == target) {
                return new int[]{left + 1, right + 1};
            }

            if (sum < target) {
                left++;
            }
            else {
                right--;
            }
        }

        return new int[0];
    }
}

// @@ 15
class Solution {
    public List<List<Integer>> threeSum(int[] nums) {

        Arrays.sort(nums);

        List<List<Integer>> ans = new ArrayList<>();
        int n = nums.length;

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
                    ans.add(Arrays.asList(nums[i], nums[left], nums[right]));

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
}

// @@ 16
class Solution {
    public int maxArea(int[] height) {

        int left = 0;
        int right = height.length - 1;
        int best = 0;

        while (left < right) {

            int width = right - left;
            int area = Math.min(height[left], height[right]) * width;

            best = Math.max(best, area);

            if (height[left] < height[right]) {
                left++;
            }
            else {
                right--;
            }
        }

        return best;
    }
}

// @@ 17
class Solution {
    public int trap(int[] height) {

        int left = 0;
        int right = height.length - 1;

        int leftMax = 0;
        int rightMax = 0;
        int water = 0;

        while (left < right) {

            if (height[left] < height[right]) {
                leftMax = Math.max(leftMax, height[left]);
                water += leftMax - height[left];
                left++;
            }

            else {
                rightMax = Math.max(rightMax, height[right]);
                water += rightMax - height[right];
                right--;
            }
        }

        return water;
    }
}
