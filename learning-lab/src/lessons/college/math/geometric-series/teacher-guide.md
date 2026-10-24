# Teacher guide: Geometric Series

**Status:** Demo — not approved for course use yet.

## Outcomes
Students explain why a geometric series with |r| < 1 has a finite sum, derive the partial-sum formula S_n = a(1 − r^n)/(1 − r), decide convergence from the common ratio, and find the sum of a geometric series written in sigma notation with any starting index, or state that it diverges.

The explanation the lesson is built around: **the gap between the running total and a/(1 − r) gets multiplied by r at every step.** With |r| < 1 that gap shrinks to 0, which is the whole convergence story. Gap after n terms = (a/(1 − r))·r^n, so S_n = a/(1 − r) − (a/(1 − r))·r^n, which is the partial-sum formula in one line.

## Before class
- Work through all five parts once. Parts 1 to 4 are exploration; part 5 is practice.
- In **Watch it add up**, try r = 1/2, then −4/5, then 1, −1, and 6/5. Each gets its own explanation. Notice the readout "Gap now ÷ gap before", which equals r.
- On a projector, the charts and the derivation grid read best at full width. On phones the charts redraw with larger labels and the parts stack.
- Nothing is saved, and no student information is collected. Practice scores disappear when the page closes.

## Facilitation steps
**Opener: Picture it (5 to 10 minutes)**
1. Ask before showing anything: "Can you add infinitely many positive numbers and get a finite answer?" Take a vote.
2. Step the ½ + ¼ + ⋯ square. Point out that the leftover is always exactly the size of the last piece.
3. Switch to ¼ + 1⁄16 + ⋯ and ask students to explain from the picture alone why the answer is ⅓ (each level is one of three equal pieces).

**Watch it add up (10 minutes)**
1. Have students make the prediction, then add terms. Ask: "What does each step do to the gap?" Lead them to the readout showing the ratio of gaps equals r.
2. Try a negative r. Ask why the total zigzags and why it still settles.
3. Try r = 1, r = −1, and r = 6/5. For 6/5, point out that a/(1 − r) = −5 is a real number, just not the sum.

**Why the formula works (10 minutes)**
1. Step through with a = 3, r = 1/2, n = 5, then change n and r to show the middle always cancels.
2. Pause on step 5 (let n grow): the only n-dependence is r^n, so convergence is entirely a question about r^n.
3. End on step 6: S = a + rS is fast, but the 1 + 2 + 4 + ⋯ = −1 trap shows it assumes the sum exists.

**Where it shows up (5 to 10 minutes)**
1. Type 9 into the repeating block and discuss 0.999… = 1. Then try 142857.
2. Drop the ball. Ask: "Infinitely many bounces, but does it ever stop?" Use the time series to resolve it.

**Practice (10 to 15 minutes)**
1. Students do a round of 6 on their own. Encourage **Write out the first terms** for every problem at first.
2. Afterward, ask which step they slipped on most. It is almost always the first term (starting index) or the sign of r.

## Discussion prompts
- In your own words, what does it mean for an infinite sum to "equal" a number?
- Why does the gap get multiplied by exactly r each step? (Each new term is r times the previous one, and so is each remaining tail.)
- Σ_{n=1}^∞ 5(1/3)^n and Σ_{n=0}^∞ 5(1/3)^n have the same ratio. How are their sums related, and why?
- Why does r = −1 diverge even though the partial sums stay between 0 and a?
- 0.999… = 1. Can two different decimal expansions name the same number? Which other numbers have two?
- Where would you expect a geometric series in your major? (Loan payments and present value, steady-state drug levels, probability of first success on trial n, the running time of divide-and-conquer algorithms.)

## Misconceptions and how to address them
- **Infinitely many positive terms must add to infinity:** Picture it shows a finite total directly; the takeaway says the terms must shrink fast enough. (Shrinking terms alone are not enough in general; see the extension on the harmonic series.)
- **The first term is the coefficient:** Practice detects this answer and says to plug in the starting index. The review screen shows the computed sum next to each series.
- **Ratio upside down or wrong sign:** Practice detects 1/r and −r and explains each.
- **a/(1 − r) works for any r:** Watch it add up shows a/(1 − r) as a number for |r| > 1 and says it is not the sum; the derivation ends with the 1 + 2 + 4 + ⋯ = −1 trap; practice says this when a divergent series is marked convergent.
- **Bounded means convergent:** r = −1 in Watch it add up, and one practice template is c(−1)^n.
- **0.999… < 1:** Where it shows up computes it as a geometric series and explains the limit.
- **The sum is "reached":** Both picture proofs and the gap readout show the leftover never reaches 0 at any finite step; the sum is defined as the limit.

## Assessment / expected responses
- Strong explanation of convergence: "Each term is r times the last, so the distance from the running total to a/(1 − r) also gets multiplied by r. If |r| < 1 that distance goes to 0."
- Σ_{n=1}^∞ 3(2/5)^n: a = 6/5, r = 2/5, converges, sum = (6/5)/(3/5) = 2.
- Σ_{n=0}^∞ 2^{2n}/5^n: rewrite as (4/5)^n; a = 1, r = 4/5, sum = 5.
- Σ_{n=1}^∞ 3^n/2^n: r = 3/2, diverges.
- 0.363636… = (36/100)/(1 − 1/100) = 36/99 = 4/11.
- Ball dropped from 2 m with r = 0.6: distance = 2 + 2(2)(0.6)/(1 − 0.6) = 8 m.

## Accommodations and extension ideas
- Support: Stay with r = 1/2 and a = 1 in parts 2 and 3 until the gap idea is solid. In practice, require writing out the first terms before answering.
- Support: Everything works by keyboard; practice answers can be typed as fractions or decimals.
- Challenge: Find Σ_{n=0}^∞ (1/2^n + 1/3^n) by splitting it into two geometric series.
- Challenge: For which x does Σ x^n converge, and to what? This is the first power series, and the lead-in to Taylor series.
- Extension: Compare with the harmonic series 1 + ½ + ⅓ + ⋯, whose terms shrink to 0 but which diverges. What makes geometric series different?
- Extension: A patient takes 100 mg every 12 hours and 30% remains at the next dose. Show the long-run level just after a dose approaches 100/(1 − 0.3) ≈ 143 mg.

## Scientific or mathematical references
- OpenStax, *Calculus Volume 2*, Section 5.2: Infinite Series (subsection Geometric Series; Example 5.10, Writing Repeating Decimals as Fractions of Integers). https://openstax.org/books/calculus-volume-2/pages/5-2-infinite-series
- OpenStax, *University Physics Volume 1*, Section 3.5: Free Fall (y = y₀ + v₀t − ½gt², g ≈ 9.8 m/s²), used for the bounce-time calculation. https://openstax.org/books/university-physics-volume-1/pages/3-5-free-fall
- The two square-dissection pictures are well-known folklore proofs; the drawings are original.
- Standards: none (see the College section guide). Course placement is in `curriculum/college/syllabus-map.md`.

## Simplifications / limitations
- Explorer values are floating point, shown rounded; targets and practice answers are exact fractions.
- The ratio slider moves in steps of 0.05, plus exact presets such as 1/3 and 2/3.
- The derivation shows n from 3 to 6 so the columns fit; the text says the cancellation holds for every n.
- Practice does not include series that must be split into two, series with a variable x, or finite geometric sums.
- Decimal answers within 0.0005 of the exact value are accepted, and the exact value is shown.
- The bouncing ball ignores air resistance and assumes a constant bounce ratio and infinitely many bounces.

## Approval
- Reviewer (course instructor or subject expert):
- Review date:
- Approval decision:
