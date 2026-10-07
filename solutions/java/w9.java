// Week 9 — Intervals, Math & Geometry, Bit Manipulation.

// @@ 140
class MyCalendar {
    private List<int[]> booked;

    public MyCalendar() {
        booked = new ArrayList<>();
    }

    public boolean book(int start, int end) {

        for (int[] interval : booked) {

            int bookedStart = interval[0];
            int bookedEnd = interval[1];

            // half-open intervals overlap
            if (start < bookedEnd && bookedStart < end) {
                return false;
            }
        }

        booked.add(new int[]{start, end});
        return true;
    }
}

// @@ 141
class Solution {
    public int[][] insert(int[][] intervals, int[] newInterval) {

        List<int[]> ans = new ArrayList<>();

        int start = newInterval[0];
        int end = newInterval[1];

        int n = intervals.length;
        int i = 0;

        // intervals that end before the new one starts
        while (i < n && intervals[i][1] < start) {
            ans.add(intervals[i]);
            i++;
        }

        // intervals that overlap the new one: merge them
        while (i < n && intervals[i][0] <= end) {
            start = Math.min(start, intervals[i][0]);
            end = Math.max(end, intervals[i][1]);
            i++;
        }

        ans.add(new int[]{start, end});

        // intervals after the new one
        while (i < n) {
            ans.add(intervals[i]);
            i++;
        }

        return ans.toArray(new int[0][]);
    }
}

// @@ 142
class Solution {
    public int[][] merge(int[][] intervals) {

        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));

        List<int[]> merged = new ArrayList<>();

        for (int[] interval : intervals) {

            int start = interval[0];
            int end = interval[1];

            if (!merged.isEmpty() && start <= merged.get(merged.size() - 1)[1]) {
                int[] last = merged.get(merged.size() - 1);
                last[1] = Math.max(last[1], end);
            }

            else {
                merged.add(new int[]{start, end});
            }
        }

        return merged.toArray(new int[0][]);
    }
}

// @@ 143
class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {

        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));

        int kept = 0;
        long prevEnd = Long.MIN_VALUE;

        for (int[] interval : intervals) {

            int start = interval[0];
            int end = interval[1];

            if (start >= prevEnd) {
                kept++;
                prevEnd = end;
            }
        }

        return intervals.length - kept;
    }
}

// @@ 144
class Solution {
    public boolean carPooling(int[][] trips, int capacity) {

        int[] diff = new int[1001];

        for (int[] trip : trips) {

            int passengers = trip[0];
            int from = trip[1];
            int to = trip[2];

            diff[from] += passengers;
            diff[to] -= passengers;
        }

        int load = 0;

        for (int pos = 0; pos < diff.length; pos++) {

            load += diff[pos];

            if (load > capacity) {
                return false;
            }
        }

        return true;
    }
}

// @@ 145
class Solution {
    public int[] minInterval(int[][] intervals, int[] queries) {

        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));

        // {query value, original index}, sorted by value
        int[][] sortedQueries = new int[queries.length][2];
        for (int i = 0; i < queries.length; i++) {
            sortedQueries[i][0] = queries[i];
            sortedQueries[i][1] = i;
        }
        Arrays.sort(sortedQueries, (a, b) -> Integer.compare(a[0], b[0]));

        // min-heap of {size, right end}
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));

        int[] ans = new int[queries.length];
        int i = 0;

        for (int[] query : sortedQueries) {

            int q = query[0];
            int index = query[1];

            while (i < intervals.length && intervals[i][0] <= q) {
                int left = intervals[i][0];
                int right = intervals[i][1];
                heap.add(new int[]{right - left + 1, right});
                i++;
            }

            while (!heap.isEmpty() && heap.peek()[1] < q) {
                heap.poll();
            }

            if (heap.isEmpty()) {
                ans[index] = -1;
            }

            else {
                ans[index] = heap.peek()[0];
            }
        }

        return ans;
    }
}

// @@ 147
class Solution {
    public boolean isHappy(int n) {

        // Floyd: detect the cycle without a set
        int slow = n;
        int fast = next(n);

        while (fast != 1 && slow != fast) {
            slow = next(slow);
            fast = next(next(fast));
        }

        return fast == 1;
    }

    private int next(int x) {

        int sum = 0;

        while (x > 0) {
            int digit = x % 10;
            sum += digit * digit;
            x /= 10;
        }

        return sum;
    }
}

// @@ 148
class Solution {
    public void rotate(int[][] matrix) {

        int n = matrix.length;

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
            reverseRow(matrix[i]);
        }
    }

    private void reverseRow(int[] row) {

        int left = 0;
        int right = row.length - 1;

        while (left < right) {
            int temp = row[left];
            row[left] = row[right];
            row[right] = temp;

            left++;
            right--;
        }
    }
}

// @@ 149
class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {

        List<Integer> res = new ArrayList<>();

        int top = 0;
        int bottom = matrix.length - 1;
        int left = 0;
        int right = matrix[0].length - 1;

        while (top <= bottom && left <= right) {

            for (int col = left; col <= right; col++) {
                res.add(matrix[top][col]);
            }
            top++;

            for (int row = top; row <= bottom; row++) {
                res.add(matrix[row][right]);
            }
            right--;

            if (top <= bottom) {
                for (int col = right; col >= left; col--) {
                    res.add(matrix[bottom][col]);
                }
                bottom--;
            }

            if (left <= right) {
                for (int row = bottom; row >= top; row--) {
                    res.add(matrix[row][left]);
                }
                left++;
            }
        }

        return res;
    }
}

// @@ 150
class Solution {
    public void setZeroes(int[][] matrix) {

        int rows = matrix.length;
        int cols = matrix[0].length;

        boolean firstRowZero = false;
        boolean firstColZero = false;

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
}

// @@ 152
class Solution {
    public int singleNumber(int[] nums) {

        int res = 0;

        // pairs cancel out
        for (int num : nums) {
            res ^= num;
        }

        return res;
    }
}

// @@ 153
class Solution {
    public int hammingWeight(int n) {

        int count = 0;

        while (n != 0) {
            n = n & (n - 1);  // clear the lowest set bit
            count++;
        }

        return count;
    }
}

// @@ 154
class Solution {
    public int[] countBits(int n) {

        int[] bits = new int[n + 1];

        for (int i = 1; i <= n; i++) {
            bits[i] = bits[i >> 1] + (i & 1);
        }

        return bits;
    }
}

// @@ 155
class Solution {
    // Java has no unsigned int: n and the result are the same 32 bits read as unsigned
    public int reverseBits(int n) {

        int res = 0;

        for (int i = 0; i < 32; i++) {

            int lowestBit = n & 1;

            res = res << 1;
            res = res | lowestBit;

            n = n >>> 1;
        }

        return res;
    }
}

// @@ 156
class Solution {
    public int missingNumber(int[] nums) {

        int n = nums.length;
        int res = n;

        // every present number cancels with its index
        for (int i = 0; i < n; i++) {
            res ^= i;
            res ^= nums[i];
        }

        return res;
    }
}
