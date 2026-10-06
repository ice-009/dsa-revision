"""Shared registry + helpers for the verified solutions.

Each solution is a plain function (or class for design problems) decorated with
@sol(n, ...). scripts/build_solutions.py runs every example and test, and only
then writes solutions.js — so code shown in the app is code that passed.
"""
from collections import defaultdict, deque, Counter, OrderedDict
from functools import cache
from math import inf
import heapq, bisect

REG = {}


def sol(n, *, ex, run, expect, algo, dry, tests=(), norm=None):
    """ex: example shown to the user; run(obj) -> result for that example.
    tests: extra (lambda obj: result, expected) pairs. norm: how to compare."""
    def deco(obj):
        assert n not in REG, f'duplicate #{n}'
        REG[n] = dict(obj=obj, ex=ex, run=run, expect=expect, algo=algo, dry=dry, tests=tests, norm=norm)
        return obj
    return deco


def normalise(v, how):
    if how == 'sorted':
        return sorted(v)
    if how == 'deep':
        return sorted(sorted(x) for x in v)
    if callable(how):
        return how(v)
    return v


class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right


def L(vals):
    """[1,2,3] -> linked list."""
    dummy = tail = ListNode()
    for v in vals:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next


def LV(node):
    """linked list -> [values]."""
    out = []
    while node:
        out.append(node.val)
        node = node.next
    return out


def T(vals):
    """Level-order list with None gaps -> tree (LeetCode format)."""
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])
    q, i = deque([root]), 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i]); q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i]); q.append(node.right)
        i += 1
    return root


def TV(root):
    """tree -> level-order list (trailing Nones trimmed)."""
    out, q = [], deque([root])
    while q:
        node = q.popleft()
        if node:
            out.append(node.val); q.append(node.left); q.append(node.right)
        else:
            out.append(None)
    while out and out[-1] is None:
        out.pop()
    return out


def find(root, val):
    if not root or root.val == val:
        return root
    return find(root.left, val) or find(root.right, val)


def play(cls, calls, init=()):
    """Run a design problem: play(MinStack, [('push', 1), ('getMin',)]) -> non-None results."""
    obj, out = cls(*init), []
    for name, *args in calls:
        r = getattr(obj, name)(*args)
        if r is not None:
            out.append(r)
    return out
