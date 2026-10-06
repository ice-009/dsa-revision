// Week 9 — Intervals, Math & Geometry, Bit Manipulation.

// @@ 140
class MyCalendar {
    private final List<int[]> booked = new ArrayList<>();  // half-open [start, end)

    public MyCalendar() {}

    public boolean book(int start, int end) {
        for (int[] b : booked)
            if (start < b[1] && b[0] < end) return false;  // overlap
        booked.add(new int[]{start, end});
        return true;
    }
}

// @@ 141
class Solution {
    public int[][] insert(int[][] intervals, int[] newInterval) {
        List<int[]> res = new ArrayList<>();
        int s = newInterval[0], e = newInterval[1], i = 0, n = intervals.length;
        while (i < n && intervals[i][1] < s) res.add(intervals[i++]);  // entirely before
        while (i < n && intervals[i][0] <= e) {                        // overlapping: merge
            s = Math.min(s, intervals[i][0]);
            e = Math.max(e, intervals[i][1]);
            i++;
        }
        res.add(new int[]{s, e});
        while (i < n) res.add(intervals[i++]);  // entirely after
        return res.toArray(new int[0][]);
    }
}

// @@ 142
class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));  // by start
        List<int[]> merged = new ArrayList<>();
        for (int[] iv : intervals) {
            if (!merged.isEmpty() && iv[0] <= merged.get(merged.size() - 1)[1]) {
                int[] last = merged.get(merged.size() - 1);
                last[1] = Math.max(last[1], iv[1]);
            } else {
                merged.add(iv);
            }
        }
        return merged.toArray(new int[0][]);
    }
}

// @@ 143
class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));  // by end
        int kept = 0;
        long prevEnd = Long.MIN_VALUE;
        for (int[] iv : intervals) {
            if (iv[0] >= prevEnd) {  // fits after the last kept one
                kept++;
                prevEnd = iv[1];
            }
        }
        return intervals.length - kept;
    }
}

// @@ 144
class Solution {
    public boolean carPooling(int[][] trips, int capacity) {
        int[] diff = new int[1001];
        for (int[] t : trips) {
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
}

// @@ 145
class Solution {
    public int[] minInterval(int[][] intervals, int[] queries) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));  // by start
        Integer[] order = new Integer[queries.length];
        for (int i = 0; i < order.length; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> Integer.compare(queries[a], queries[b]));
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> a[0] - b[0]);  // {size, right end}
        int[] ans = new int[queries.length];
        int i = 0;
        for (int qi : order) {
            int q = queries[qi];
            while (i < intervals.length && intervals[i][0] <= q) {
                heap.add(new int[]{intervals[i][1] - intervals[i][0] + 1, intervals[i][1]});
                i++;
            }
            while (!heap.isEmpty() && heap.peek()[1] < q) heap.poll();  // ends before q
            ans[qi] = heap.isEmpty() ? -1 : heap.peek()[0];
        }
        return ans;
    }
}

// @@ 147
class Solution {
    public boolean isHappy(int n) {
        int slow = n, fast = next(n);  // Floyd: detect the cycle without a set
        while (fast != 1 && slow != fast) {
            slow = next(slow);
            fast = next(next(fast));
        }
        return fast == 1;
    }

    private int next(int x) {
        int s = 0;
        for (; x > 0; x /= 10) s += (x % 10) * (x % 10);
        return s;
    }
}

// @@ 148
class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) {  // transpose
                int tmp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = tmp;
            }
        for (int[] row : matrix)  // mirror each row
            for (int l = 0, r = n - 1; l < r; l++, r--) {
                int tmp = row[l];
                row[l] = row[r];
                row[r] = tmp;
            }
    }
}

// @@ 149
class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> res = new ArrayList<>();
        int top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; c++) res.add(matrix[top][c]);
            top++;
            for (int r = top; r <= bottom; r++) res.add(matrix[r][right]);
            right--;
            if (top <= bottom) {
                for (int c = right; c >= left; c--) res.add(matrix[bottom][c]);
                bottom--;
            }
            if (left <= right) {
                for (int r = bottom; r >= top; r--) res.add(matrix[r][left]);
                left++;
            }
        }
        return res;
    }
}

// @@ 150
class Solution {
    public void setZeroes(int[][] matrix) {
        int rows = matrix.length, cols = matrix[0].length;
        boolean firstRow = false, firstCol = false;
        for (int c = 0; c < cols; c++) firstRow |= matrix[0][c] == 0;
        for (int r = 0; r < rows; r++) firstCol |= matrix[r][0] == 0;
        for (int r = 1; r < rows; r++)
            for (int c = 1; c < cols; c++)
                if (matrix[r][c] == 0) matrix[r][0] = matrix[0][c] = 0;  // markers
        for (int r = 1; r < rows; r++)
            for (int c = 1; c < cols; c++)
                if (matrix[r][0] == 0 || matrix[0][c] == 0) matrix[r][c] = 0;
        if (firstRow) Arrays.fill(matrix[0], 0);
        if (firstCol)
            for (int r = 0; r < rows; r++) matrix[r][0] = 0;
    }
}

// @@ 152
class Solution {
    public int singleNumber(int[] nums) {
        int res = 0;
        for (int x : nums) res ^= x;  // pairs cancel out
        return res;
    }
}

// @@ 153
class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n &= n - 1;  // clear the lowest set bit
            count++;
        }
        return count;
    }
}

// @@ 154
class Solution {
    public int[] countBits(int n) {
        int[] bits = new int[n + 1];
        for (int i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
        return bits;
    }
}

// @@ 155
class Solution {
    // Java has no unsigned int: n and the result are the same 32 bits read as unsigned
    public int reverseBits(int n) {
        int res = 0;
        for (int i = 0; i < 32; i++) {
            res = (res << 1) | (n & 1);  // move n's lowest bit onto res
            n >>>= 1;                    // unsigned shift
        }
        return res;
    }
}

// @@ 156
class Solution {
    public int missingNumber(int[] nums) {
        int res = nums.length;
        for (int i = 0; i < nums.length; i++) res ^= i ^ nums[i];  // indices cancel values
        return res;
    }
}
