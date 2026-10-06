// Week 9 — Intervals, Math & Geometry, Bit Manipulation.

// @@ 140
class MyCalendar {
    vector<pair<int, int>> booked;  // half-open [start, end)
public:
    MyCalendar() {}

    bool book(int start, int end) {
        for (auto [s, e] : booked)
            if (start < e && s < end) return false;  // overlap
        booked.push_back({start, end});
        return true;
    }
};

// @@ 141
class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> res;
        int s = newInterval[0], e = newInterval[1], i = 0, n = intervals.size();
        while (i < n && intervals[i][1] < s) res.push_back(intervals[i++]);  // entirely before
        while (i < n && intervals[i][0] <= e) {                              // overlapping: merge
            s = min(s, intervals[i][0]);
            e = max(e, intervals[i][1]);
            i++;
        }
        res.push_back({s, e});
        while (i < n) res.push_back(intervals[i++]);  // entirely after
        return res;
    }
};

// @@ 142
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());  // by start
        vector<vector<int>> merged;
        for (auto& iv : intervals) {
            if (!merged.empty() && iv[0] <= merged.back()[1])
                merged.back()[1] = max(merged.back()[1], iv[1]);
            else
                merged.push_back(iv);
        }
        return merged;
    }
};

// @@ 143
class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) { return a[1] < b[1]; });  // by end
        int kept = 0;
        long long prevEnd = LLONG_MIN;
        for (auto& iv : intervals) {
            if (iv[0] >= prevEnd) {  // fits after the last kept one
                kept++;
                prevEnd = iv[1];
            }
        }
        return intervals.size() - kept;
    }
};

// @@ 144
class Solution {
public:
    bool carPooling(vector<vector<int>>& trips, int capacity) {
        vector<int> diff(1001, 0);
        for (auto& t : trips) {
            diff[t[1]] += t[0];  // passengers get in at `from`
            diff[t[2]] -= t[0];  // and leave at `to`
        }
        int load = 0;
        for (int change : diff) {
            load += change;
            if (load > capacity) return false;
        }
        return true;
    }
};

// @@ 145
class Solution {
public:
    vector<int> minInterval(vector<vector<int>>& intervals, vector<int>& queries) {
        sort(intervals.begin(), intervals.end());  // by start
        vector<int> order(queries.size());
        iota(order.begin(), order.end(), 0);
        sort(order.begin(), order.end(), [&](int a, int b) { return queries[a] < queries[b]; });
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> heap;  // (size, right end)
        vector<int> ans(queries.size());
        int i = 0;
        for (int qi : order) {
            int q = queries[qi];
            while (i < (int)intervals.size() && intervals[i][0] <= q) {
                heap.push({intervals[i][1] - intervals[i][0] + 1, intervals[i][1]});
                i++;
            }
            while (!heap.empty() && heap.top().second < q) heap.pop();  // ends before q
            ans[qi] = heap.empty() ? -1 : heap.top().first;
        }
        return ans;
    }
};

// @@ 147
class Solution {
    int next(int x) {
        int s = 0;
        for (; x; x /= 10) s += (x % 10) * (x % 10);
        return s;
    }
public:
    bool isHappy(int n) {
        int slow = n, fast = next(n);  // Floyd: detect the cycle without a set
        while (fast != 1 && slow != fast) {
            slow = next(slow);
            fast = next(next(fast));
        }
        return fast == 1;
    }
};

// @@ 148
class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) swap(matrix[i][j], matrix[j][i]);  // transpose
        for (auto& row : matrix) reverse(row.begin(), row.end());           // mirror each row
    }
};

// @@ 149
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        vector<int> res;
        int top = 0, bottom = matrix.size() - 1, left = 0, right = matrix[0].size() - 1;
        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; c++) res.push_back(matrix[top][c]);
            top++;
            for (int r = top; r <= bottom; r++) res.push_back(matrix[r][right]);
            right--;
            if (top <= bottom) {
                for (int c = right; c >= left; c--) res.push_back(matrix[bottom][c]);
                bottom--;
            }
            if (left <= right) {
                for (int r = bottom; r >= top; r--) res.push_back(matrix[r][left]);
                left++;
            }
        }
        return res;
    }
};

// @@ 150
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int rows = matrix.size(), cols = matrix[0].size();
        bool firstRow = false, firstCol = false;
        for (int c = 0; c < cols; c++) firstRow |= matrix[0][c] == 0;
        for (int r = 0; r < rows; r++) firstCol |= matrix[r][0] == 0;
        for (int r = 1; r < rows; r++)
            for (int c = 1; c < cols; c++)
                if (matrix[r][c] == 0) matrix[r][0] = matrix[0][c] = 0;  // markers
        for (int r = 1; r < rows; r++)
            for (int c = 1; c < cols; c++)
                if (matrix[r][0] == 0 || matrix[0][c] == 0) matrix[r][c] = 0;
        if (firstRow)
            for (int c = 0; c < cols; c++) matrix[0][c] = 0;
        if (firstCol)
            for (int r = 0; r < rows; r++) matrix[r][0] = 0;
    }
};

// @@ 152
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int res = 0;
        for (int x : nums) res ^= x;  // pairs cancel out
        return res;
    }
};

// @@ 153
class Solution {
public:
    int hammingWeight(int n) {
        int count = 0;
        unsigned int x = n;
        while (x) {
            x &= x - 1;  // clear the lowest set bit
            count++;
        }
        return count;
    }
};

// @@ 154
class Solution {
public:
    vector<int> countBits(int n) {
        vector<int> bits(n + 1, 0);
        for (int i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
        return bits;
    }
};

// @@ 155
class Solution {
public:
    uint32_t reverseBits(uint32_t n) {
        uint32_t res = 0;
        for (int i = 0; i < 32; i++) {
            res = (res << 1) | (n & 1);  // move n's lowest bit onto res
            n >>= 1;
        }
        return res;
    }
};

// @@ 156
class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int res = nums.size();
        for (int i = 0; i < (int)nums.size(); i++) res ^= i ^ nums[i];  // indices cancel values
        return res;
    }
};
