// Week 9 — Intervals, Math & Geometry, Bit Manipulation.

// @@ 140
class MyCalendar {
    vector<pair<int, int>> booked;

public:
    MyCalendar() {
    }

    bool book(int start, int end) {

        for (int i = 0; i < (int)booked.size(); i++) {

            int bookedStart = booked[i].first;
            int bookedEnd = booked[i].second;

            // half-open intervals overlap
            if (start < bookedEnd && bookedStart < end) {
                return false;
            }
        }

        booked.push_back({start, end});
        return true;
    }
};

// @@ 141
class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {

        vector<vector<int>> ans;

        int start = newInterval[0];
        int end = newInterval[1];

        int n = intervals.size();
        int i = 0;

        // intervals that end before the new one starts
        while (i < n && intervals[i][1] < start) {
            ans.push_back(intervals[i]);
            i++;
        }

        // intervals that overlap the new one: merge them
        while (i < n && intervals[i][0] <= end) {
            start = min(start, intervals[i][0]);
            end = max(end, intervals[i][1]);
            i++;
        }

        ans.push_back({start, end});

        // intervals after the new one
        while (i < n) {
            ans.push_back(intervals[i]);
            i++;
        }

        return ans;
    }
};

// @@ 142
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {

        sort(intervals.begin(), intervals.end());

        vector<vector<int>> merged;

        for (int i = 0; i < (int)intervals.size(); i++) {

            int start = intervals[i][0];
            int end = intervals[i][1];

            if (!merged.empty() && start <= merged.back()[1]) {
                merged.back()[1] = max(merged.back()[1], end);
            }

            else {
                merged.push_back({start, end});
            }
        }

        return merged;
    }
};

// @@ 143
class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {

        sort(intervals.begin(), intervals.end(), compareByEnd);

        int kept = 0;
        long long prevEnd = LLONG_MIN;

        for (int i = 0; i < (int)intervals.size(); i++) {

            int start = intervals[i][0];
            int end = intervals[i][1];

            if (start >= prevEnd) {
                kept++;
                prevEnd = end;
            }
        }

        return intervals.size() - kept;
    }

private:
    static bool compareByEnd(const vector<int>& a, const vector<int>& b) {
        return a[1] < b[1];
    }
};

// @@ 144
class Solution {
public:
    bool carPooling(vector<vector<int>>& trips, int capacity) {

        vector<int> diff(1001, 0);

        for (int i = 0; i < (int)trips.size(); i++) {

            int passengers = trips[i][0];
            int from = trips[i][1];
            int to = trips[i][2];

            diff[from] += passengers;
            diff[to] -= passengers;
        }

        int load = 0;

        for (int pos = 0; pos < (int)diff.size(); pos++) {

            load += diff[pos];

            if (load > capacity) {
                return false;
            }
        }

        return true;
    }
};

// @@ 145
class Solution {
public:
    vector<int> minInterval(vector<vector<int>>& intervals, vector<int>& queries) {

        sort(intervals.begin(), intervals.end());

        // (query value, original index), sorted by value
        vector<pair<int, int>> sortedQueries;
        for (int i = 0; i < (int)queries.size(); i++) {
            sortedQueries.push_back({queries[i], i});
        }
        sort(sortedQueries.begin(), sortedQueries.end());

        // min-heap of (size, right end)
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> heap;

        vector<int> ans(queries.size());
        int i = 0;

        for (int k = 0; k < (int)sortedQueries.size(); k++) {

            int q = sortedQueries[k].first;
            int index = sortedQueries[k].second;

            while (i < (int)intervals.size() && intervals[i][0] <= q) {
                int left = intervals[i][0];
                int right = intervals[i][1];
                heap.push({right - left + 1, right});
                i++;
            }

            while (!heap.empty() && heap.top().second < q) {
                heap.pop();
            }

            if (heap.empty()) {
                ans[index] = -1;
            }

            else {
                ans[index] = heap.top().first;
            }
        }

        return ans;
    }
};

// @@ 147
class Solution {
public:
    bool isHappy(int n) {

        // Floyd: detect the cycle without a set
        int slow = n;
        int fast = next(n);

        while (fast != 1 && slow != fast) {
            slow = next(slow);
            fast = next(next(fast));
        }

        return fast == 1;
    }

private:
    int next(int x) {

        int sum = 0;

        while (x > 0) {
            int digit = x % 10;
            sum += digit * digit;
            x /= 10;
        }

        return sum;
    }
};

// @@ 148
class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {

        int n = matrix.size();

        // transpose
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;
            }
        }

        // reverse each row
        for (int i = 0; i < n; i++) {
            reverse(matrix[i].begin(), matrix[i].end());
        }
    }
};

// @@ 149
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {

        vector<int> res;

        int top = 0;
        int bottom = matrix.size() - 1;
        int left = 0;
        int right = matrix[0].size() - 1;

        while (top <= bottom && left <= right) {

            for (int col = left; col <= right; col++) {
                res.push_back(matrix[top][col]);
            }
            top++;

            for (int row = top; row <= bottom; row++) {
                res.push_back(matrix[row][right]);
            }
            right--;

            if (top <= bottom) {
                for (int col = right; col >= left; col--) {
                    res.push_back(matrix[bottom][col]);
                }
                bottom--;
            }

            if (left <= right) {
                for (int row = bottom; row >= top; row--) {
                    res.push_back(matrix[row][left]);
                }
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

        int rows = matrix.size();
        int cols = matrix[0].size();

        bool firstRowZero = false;
        bool firstColZero = false;

        for (int c = 0; c < cols; c++) {
            if (matrix[0][c] == 0) {
                firstRowZero = true;
            }
        }

        for (int r = 0; r < rows; r++) {
            if (matrix[r][0] == 0) {
                firstColZero = true;
            }
        }

        // use row 0 and column 0 as markers
        for (int r = 1; r < rows; r++) {
            for (int c = 1; c < cols; c++) {
                if (matrix[r][c] == 0) {
                    matrix[r][0] = 0;
                    matrix[0][c] = 0;
                }
            }
        }

        for (int r = 1; r < rows; r++) {
            for (int c = 1; c < cols; c++) {
                if (matrix[r][0] == 0 || matrix[0][c] == 0) {
                    matrix[r][c] = 0;
                }
            }
        }

        if (firstRowZero) {
            for (int c = 0; c < cols; c++) {
                matrix[0][c] = 0;
            }
        }

        if (firstColZero) {
            for (int r = 0; r < rows; r++) {
                matrix[r][0] = 0;
            }
        }
    }
};

// @@ 152
class Solution {
public:
    int singleNumber(vector<int>& nums) {

        int res = 0;

        // pairs cancel out
        for (int num : nums) {
            res ^= num;
        }

        return res;
    }
};

// @@ 153
class Solution {
public:
    int hammingWeight(int n) {

        unsigned int x = n;
        int count = 0;

        while (x != 0) {
            x = x & (x - 1);  // clear the lowest set bit
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

        for (int i = 1; i <= n; i++) {
            bits[i] = bits[i >> 1] + (i & 1);
        }

        return bits;
    }
};

// @@ 155
class Solution {
public:
    uint32_t reverseBits(uint32_t n) {

        uint32_t res = 0;

        for (int i = 0; i < 32; i++) {

            int lowestBit = n & 1;

            res = res << 1;
            res = res | lowestBit;

            n = n >> 1;
        }

        return res;
    }
};

// @@ 156
class Solution {
public:
    int missingNumber(vector<int>& nums) {

        int n = nums.size();
        int res = n;

        // every present number cancels with its index
        for (int i = 0; i < n; i++) {
            res ^= i;
            res ^= nums[i];
        }

        return res;
    }
};
