# Numerical Teaching Examples

All logarithms in entropy/capacity expressions use base two. Values below were computed directly on 2026-10-15; rounding applies only to displayed values. They are finite calculations, not measurements of coding performance.

| Object and assumptions | Input | Computed result |
|---|---|---|
| Dyadic source/question tree | probabilities `(.5,.25,.125,.125)`; lengths `(1,2,3,3)` | entropy and expected length both `1.75` bits |
| Conditional entropy example | `P(X=0)=.1`, Y uniform given X=0, Y=0 given X=1 | `H(Y)=0.286396957116`, `H(Y|X=0)=1`, `H(Y|X)=.1` bits |
| BSC | crossover `.1`, uniform input | capacity `0.531004406411` bits/use |
| Huffman | `(.4,.2,.2,.1,.05,.05)` | entropy `2.221928094887`, optimal mean length `2.3` bits/symbol |
| Stationary two-state Markov source | transition rows `(.9,.1)` and `(.3,.7)` | stationary distribution `(.75,.25)`; entropy rate `0.5720694199996`, marginal entropy `0.8112781244591` bits/symbol |
| Z-channel | X=0 produces Y=0; X=1 produces Y=0 with probability `.3` | optimum `P(X=1)=0.4210006134071`; capacity `0.5036919334848` bits/use |
| Parallel real Gaussian channels | noise variances `(1,2,5)`; total power `6` | water level `4.5`; power `(3.5,2.5,0)`; capacity `1.6699250014423` bits/vector-use; equal allocation gives `1.5351946639457` |
| Wideband energy limit | real bandlimited AWGN, capacity-achieving input | minimum limiting `E_b/N₀=ln 2=0.6931471805599`, or `−1.591745389549 dB` |

## Binary versus Gaussian input

Real scalar channel `Y=X+Z`, `Z~N(0,1)`, input second moment `s`. Binary input takes `±sqrt(s)` equiprobably. Hard decision thresholds Y at zero. Gaussian-input capacity, binary-input mutual information with continuous output, and mutual information after hard decision are different quantities, all in bits per real use.

| s | Gaussian input | Binary input, soft output | Binary input, hard output |
|---:|---:|---:|---:|
| .1 | .06875176187497 | .06874331344495 | .04489438330660 |
| 1 | .5 | .48594415413294 | .36891723259446 |
| 10 | 1.72971580931865 | .99675632799003 | .99079435369710 |

The soft-output integral was evaluated using SciPy quadrature over standard-normal noise `z∈[−12,12]`:

```text
I = 1 − E_z[log₂(1+exp(−2 sqrt(s)(sqrt(s)+z)))].
```

`logaddexp` avoids overflow. Reported quadrature absolute errors were `3.54e−9`, `3.54e−9`, and `3.05e−13` respectively; these are estimator outputs for that finite integration interval. The omitted normal tails beyond 12 have negligible probability at the displayed precision. The hard-decision crossover is `Q(sqrt(s))`.

## E01 recap calculation

For the joint table `(.3,.2;.1,.4)`, the row marginal is `(.5,.5)` and the column marginal is `(.4,.6)`. Row-conditional distributions are `(.6,.4)` and `(.2,.8)`. Column-conditional distributions are `(.75,.25)` and `(1/3,2/3)`.

Direct base-two calculations give `H(X)=1`, `H(Y)=0.9709505944546686`, `H(X,Y)=1.8464393446710154`, `H(Y|X)=0.8464393446710154`, and `H(X|Y)=0.8754887502163469` bits. The mutual information is `0.12451124978365313` bits. The entropy-difference, reversed entropy-difference and joint-entropy routes agree to the displayed precision. The independent table with the same marginals is `(.2,.3;.2,.3)`.

## E02 divergence and shape calculations

For `P=(.8,.2)` and `Q=(.5,.5)`, `D(P||Q)=0.27807190511263774` and `D(Q||P)=0.32192809488736235` bits. True entropy is `0.7219280948873623` bits and Q's ideal expected length is exactly 1 bit. The weighted KL contributions can have opposite signs even though their sum is nonnegative.

For Bernoulli distributions with first-component probabilities `.1`, `.2` and `.3`, direct evaluation gives `D(.1||.3)=0.16781682137412193`, greater than `D(.1||.2)+D(.2||.3)=0.0900560635077668`. Thus KL fails the triangle inequality in this concrete example.

With fixed BSC crossover `.1` and input probability `a` of one, `I(a)=h₂(.1+.8a)-h₂(.1)` is a concave curve. At `a=.2` it is `0.3577507789033366` bits/use, and at `.5` it is `0.5310044064107188`. With fixed uniform input, mixing the identity and bit-flip channels by weight `t` gives `I(t)=1-h₂(t)`, a convex curve whose endpoints equal 1 and midpoint equals 0.

For joint tables `P=(.3,.2;.1,.4)` and `Q=(.3,.3;.1,.3)`, the KL chain calculation gives:

| Quantity | Bits |
|---|---:|
| Joint divergence | .04902249956730638 |
| Marginal X divergence | .029446844526784283 |
| First conditional-row divergence | .029049405545331364 |
| Second conditional-row divergence | .010101904535712705 |
| P-weighted conditional divergence | .019575655040522034 |

The joint value equals the marginal plus conditional value to floating-point precision. Both tables have positive entries, so the finite logarithmic expansion has no zero-denominator terms.

## E03 inference calculations

A fair source bit Z passing through independent binary flips with probabilities .1 and .2 has end-to-end flip probability `.1×.8+.9×.2=.26`. The two informations are `I(Z;X)=0.5310044064107188` and `I(Z;Y)=0.17325362750738216` bits. Their difference is `0.3577507789033366`, equal to `I(Z;X|Y)` under this chain.

With prior probabilities `(.9,.1)` and observation-one likelihoods `(.2,.8)`, the joint observation masses are `(.18,.08)`. The posterior for parameter one is `.08/.26=4/13`; the MAP decision is parameter zero under equal error costs.

## E04 typicality and compression calculations

Bernoulli(.2) has entropy .721928094887 bits and single-symbol surprisal variance .64. Exact binomial typical probabilities at tolerance .15 are 0.629145600 for n=8, 0.732302221 for n=32, 0.973361475 for n=128. The corresponding Chebyshev bounds on atypical probability are 3.555556, .888889 and .222222. A bound above one is valid but uninformative.

For M=8 independent assignments into N=12 bins, chosen-string collision probability is 0.456148822, bounded by 7/12; any-pair collision probability is 0.953583140. The explicit assignment in the scene is one possible realization.

At n=6, Bernoulli(.01), epsilon=.3, only 000000 is weakly typical: mass .941480149401 and counting fraction .015625. The variable prefix example at n=3, Bernoulli(.2), has no prefix pair, Kraft sum .7890625 and expected length 2.584 bits/block = .861333333 bits/symbol. The n=100, R=.5 Fano example has error lower bound .211928094887. Full numeric observations are in E04 QA.
