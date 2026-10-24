# Instructor guide: Proof by Induction

**Status:** Demo — not approved for course use yet.

## Outcomes
Students explain why a base case and an inductive step together prove P(n) for every n at or above the base, and why assuming P(k) is not circular. They write a complete induction proof for a summation identity and an inequality, marking where the hypothesis is used, and they diagnose the four most common ways induction proofs fail.

## Before class
- Try each activity once. In **Why it works**, run all four presets. In **Proof workshop**, deliberately pick a wrong line to see the feedback.
- Decide on conventions to mention: whether your course starts the naturals at 0 or 1, and whether you write the hypothesis as "assume P(k) for some k ≥ n₀" or "let k ≥ n₀ be arbitrary and assume P(k)." The lesson uses the first.
- Nothing is saved, and no student information is collected.

## Facilitation steps
**Why it works (10 minutes)**
1. Before showing anything, ask: "How could you prove something about every whole number without checking them all?" Collect ideas.
2. Run **Full proof**, then **No base case**, **A broken link**, and **Start later**. Have students predict before each push.
3. Open **Why isn't assuming P(k) circular?** and read it together. Ask students to restate it to a partner in one sentence.

**Proof workshop (15 minutes)**
1. Do **Sum of 1 to n** together on the projector, pausing at each choice for a quick vote.
2. Students do **Sum of odd numbers** and **2ⁿ > n** alone or in pairs. Afterwards, ask where the hypothesis was used in each (the highlighted line) and what the picture's highlighted piece represents.
3. Have students write the 2ⁿ > n proof on paper without looking, then compare.

**Tiling puzzle (8 minutes)**
1. Have a student choose the missing square. Ask the class to predict where the first L must go.
2. Stop after level 1 and ask: "Are we done?" The answer is yes, by the hypothesis. Then reveal the rest to show what the hypothesis is doing.
3. For computer science students, open **Proof and program** and connect it to recursion.

**Spot the flaw (10 minutes)**
1. Students work through the six proofs individually, then discuss the horses proof and the 2ⁿ > n² proof as a class.

## Discussion prompts
- In the domino picture, what does the base case correspond to? The inductive step? What would "assume P(n) for every n" correspond to, and why is it useless?
- The n = n + 1 "proof" has a valid inductive step. What does that tell you about the step on its own?
- Where exactly does the horses argument break? Why is one failure enough?
- Why can 2ⁿ > n² be proved from n = 5 but not from n = 1?
- In the tiling proof, we never said how to tile the smaller boards. Why is that allowed?

## Misconceptions and how to address them
- **Assuming P(k) is circular:** The circular-reasoning note in activity 1, and the workshop's hypothesis question, where "assume it for every n" and "assume P(k+1)" are both wrong choices with explanations.
- **The base case is a formality:** The **No base case** preset and the n = n + 1 proof.
- **Examples are proof:** The workshop's picture panel shows numeric checks and says outright that examples aren't a proof.
- **The step only needs to work for most k:** The **A broken link** preset and the horses proof.
- **Working backwards from P(k+1):** The backwards sum proof in Spot the flaw, and the workshop distractors that substitute P(k+1).
- **Inequality steps must land exactly on the target:** The 2ⁿ > n workshop proof and its closing insight.
- **The base case is always n = 1:** The **Start later** preset, the postage proof (base 12), and the corrected 2ⁿ > n² (base 5).

## Assessment / expected responses
- Domino model: base case = the first domino is pushed; step = every domino is close enough to knock over the next; both are needed.
- Not circular: "The step proves an if-then. It shows that P(k) would imply P(k+1), without claiming P(k) is true."
- Sum of odds step: 1 + 3 + ⋯ + (2k−1) + (2k+1) = k² + 2k + 1 = (k+1)², using the hypothesis on the first k terms.
- 2ⁿ > n step: 2ᵏ⁺¹ = 2ᵏ + 2ᵏ > k + 2ᵏ ≥ k + 1.
- Flaws: horses, the step fails at k = 1; n = n + 1, no base case; backwards sum, assumes P(k+1); 2ⁿ > n², the step's inequality needs k ≥ 3, and the claim is false for n = 2, 3, 4.

## Accommodations and extension ideas
- Support: Start with the domino presets and the **Sum of 1 to n** workshop proof done together. The pictures in the workshop give a non-algebraic route into each step.
- Challenge: Ask students to write a correct proof of 2ⁿ > n² for n ≥ 5, or to prove 4ⁿ − 1 is divisible by 3 (it is the tile count in the tiling puzzle).
- Extension: Introduce strong induction with "every n ≥ 2 is a product of primes" (the proof template mentions it), or the 4¢ and 5¢ postage claim proved by strong induction with four base cases.
- Extension: Have computer science students write the recursive tromino-tiling function and prove it terminates.

## Scientific or mathematical references
- Oscar Levin, *Discrete Mathematics: An Open Introduction*, 3rd ed., Section 2.5: Induction. https://discrete.openmathbooks.org/
- Kenneth Rosen, *Discrete Mathematics and Its Applications*, Chapter 5: Induction and Recursion.
- Solomon W. Golomb (1954). Checker boards and polyominoes. *American Mathematical Monthly* 61(10): 675–682. https://doi.org/10.2307/2307321 (the tromino tiling theorem)
- Facts to double-check before approval: the section numbers above for the edition your course uses; attribution of the horses paradox to George Pólya; 11¢ is the largest amount that can't be made from 4¢ and 5¢ stamps (Frobenius number 4·5 − 4 − 5 = 11).
- All drawings and proof wording are original.

## Simplifications / limitations
- The domino picture shows ten dominoes and says the line continues. The text gives the well-ordering argument, but the picture alone is an illustration, not a proof.
- The workshop is multiple choice. Pair it with a written proof to check that students can produce the steps themselves.
- Strong induction and structural induction are only mentioned, not taught.

## Approval
- Reviewer (course instructor or subject expert):
- Review date:
- Approval decision:
