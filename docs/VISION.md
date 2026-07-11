# Vision

## Mission

Make Dynamic Programming intuitive by allowing learners to **build, execute, and visualize** dynamic programming algorithms.

Rather than teaching recurrence relations in isolation, DP Explorer teaches the reasoning process behind them.

The goal is not simply to show the final answer, but to make every intermediate decision visible and understandable.

---

# Educational Philosophy

Dynamic programming is often presented as a collection of formulas to memorize.

DP Explorer instead treats every algorithm as an evolving process.

Learners should understand:

- what each state represents,
- why each dependency is required,
- when memoization occurs,
- how values are computed,
- how execution differs between recursion and tabulation,
- and how the final answer emerges from many smaller decisions.

Understanding the process is more valuable than memorizing the recurrence.

---

# Two Perspectives, One Problem

Every supported problem can be explored through two complementary execution strategies without changing the underlying specification.

## Top-Down

Memoized recursion.

Shows:

- recursive reasoning
- dependency discovery
- memoization
- execution order

This mode answers:

> **Why is this state needed?**

---

## Bottom-Up

Tabulation.

Shows:

- dependency ordering
- table construction
- iterative computation

This mode answers:

> **How is the solution built?**

---

Switching between these two execution modes while keeping the specification unchanged is intended to be one of DP Explorer's strongest educational features.

The learner observes that the recurrence is independent of the execution strategy.

---

# Learning by Construction

DP Explorer is not only a visualization tool.

Learners are encouraged to construct their own dynamic programming algorithms through the Specification Builder.

By defining:

- state variables,
- base cases,
- transitions,
- execution mode,
- and answer extraction,

students move from solving individual DP problems to understanding the underlying structure shared by all dynamic programming algorithms.

---

# Intended Audience

DP Explorer is designed for:

- students learning dynamic programming,
- competitive programmers,
- university courses,
- educators and mentors,
- anyone interested in algorithm visualization.

No prior familiarity with the internal implementation is required.

---

# Long-Term Vision

DP Explorer aims to become a platform for exploring dynamic programming rather than a collection of predefined examples.

Future versions will extend the system with richer specification languages, additional execution models, and new visualization techniques while preserving the project's educational focus.

Every new feature should answer one question:

> **Does this help someone understand dynamic programming better?**

If the answer is no, it does not belong in DP Explorer.
