// Week 1 — Arrays & Hashing, Two Pointers. Each "// @@ n" block is one LeetCode-ready solution.

// @@ 3
class Solution {
    public boolean containsDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums) {
            if (!seen.add(x)) return true;  // add() returns false if x was already there
        }
        return false;
    }
}

// @@ 4
class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < s.length(); i++) {
            count[s.charAt(i) - 'a']++;
            count[t.charAt(i) - 'a']--;
        }
        for (int c : count)
            if (c != 0) return false;
        return true;
    }
}

// @@ 5
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();  // value -> index
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) return new int[]{seen.get(need), i};
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}

// @@ 6
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String w : strs) {
            int[] count = new int[26];
            for (char c : w.toCharArray()) count[c - 'a']++;
            String key = Arrays.toString(count);  // letter counts as the key
            groups.computeIfAbsent(key, x -> new ArrayList<>()).add(w);
        }
        return new ArrayList<>(groups.values());
    }
}

// @@ 7
class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> count = new HashMap<>();
        for (int x : nums) count.merge(x, 1, Integer::sum);
        List<Integer>[] buckets = new List[nums.length + 1];  // buckets[f] = numbers seen f times
        for (var e : count.entrySet()) {
            int f = e.getValue();
            if (buckets[f] == null) buckets[f] = new ArrayList<>();
            buckets[f].add(e.getKey());
        }
        int[] res = new int[k];
        int idx = 0;
        for (int f = nums.length; f > 0 && idx < k; f--) {
            if (buckets[f] == null) continue;
            for (int num : buckets[f]) {
                res[idx++] = num;
                if (idx == k) break;
            }
        }
        return res;
    }
}

// @@ 8
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];
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
}

// @@ 9
class Solution {
    public boolean isValidSudoku(char[][] board) {
        boolean[][] rows = new boolean[9][9], cols = new boolean[9][9], boxes = new boolean[9][9];
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
}

// @@ 10
class Solution {
    public String decodeString(String s) {
        Deque<StringBuilder> strs = new ArrayDeque<>();  // string before each '['
        Deque<Integer> counts = new ArrayDeque<>();
        StringBuilder cur = new StringBuilder();
        int k = 0;
        for (char ch : s.toCharArray()) {
            if (Character.isDigit(ch)) {
                k = k * 10 + (ch - '0');
            } else if (ch == '[') {
                strs.push(cur);
                counts.push(k);
                cur = new StringBuilder();
                k = 0;
            } else if (ch == ']') {
                StringBuilder prev = strs.pop();
                prev.append(cur.toString().repeat(counts.pop()));
                cur = prev;
            } else {
                cur.append(ch);
            }
        }
        return cur.toString();
    }
}

// @@ 11
class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> s = new HashSet<>();
        for (int x : nums) s.add(x);
        int best = 0;
        for (int x : s) {
            if (s.contains(x - 1)) continue;  // only start at the beginning of a run
            int y = x;
            while (s.contains(y + 1)) y++;
            best = Math.max(best, y - x + 1);
        }
        return best;
    }
}

// @@ 13
class Solution {
    public boolean isPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;
            l++;
            r--;
        }
        return true;
    }
}

// @@ 14
class Solution {
    public int[] twoSum(int[] numbers, int target) {
        int l = 0, r = numbers.length - 1;
        while (l < r) {
            int s = numbers[l] + numbers[r];
            if (s == target) return new int[]{l + 1, r + 1};
            if (s < target) l++;
            else r--;
        }
        return new int[0];
    }
}

// @@ 15
class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        int n = nums.length;
        for (int i = 0; i < n - 2; i++) {
            if (nums[i] > 0) break;
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = n - 1;
            while (l < r) {
                int s = nums[i] + nums[l] + nums[r];
                if (s < 0) l++;
                else if (s > 0) r--;
                else {
                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    l++;
                    r--;
                    while (l < r && nums[l] == nums[l - 1]) l++;
                }
            }
        }
        return res;
    }
}

// @@ 16
class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1, best = 0;
        while (l < r) {
            best = Math.max(best, Math.min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return best;
    }
}

// @@ 17
class Solution {
    public int trap(int[] height) {
        int l = 0, r = height.length - 1;
        int leftMax = 0, rightMax = 0, water = 0;
        while (l < r) {
            if (height[l] < height[r]) {
                leftMax = Math.max(leftMax, height[l]);
                water += leftMax - height[l];
                l++;
            } else {
                rightMax = Math.max(rightMax, height[r]);
                water += rightMax - height[r];
                r--;
            }
        }
        return water;
    }
}
