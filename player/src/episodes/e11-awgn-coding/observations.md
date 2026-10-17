# Scene drafts

Six chapter classes and an explicitly imported numerical table are staged. Runtime ignores this directory. The scenes implement the per-codeword constraint, entropy/Jensen converse, Gaussian ensemble power/error selection, output-volume analogy, BPSK soft/hard derivation and comparison under equal power/noise.

The BPSK table contains81 SNR points from .01 to100. SciPy Gaussian quadrature uses z in[-12,12], epsabs=epsrel=1e-10; maximum reported absolute error is9.8460546051e-11. Source values and error estimates are retained in numerical-curves.json. The expected logarithm is evaluated with logaddexp.

The geometric picture explicitly uses output radius sqrt(n(P+N)) relative to sqrt(nN), keeps the input-power ball separate, and states that circles are an n-dimensional-radius schematic rather than a packing proof. Finite selection numbers are labelled schematic and satisfy the displayed power/error removal inequalities. The BPSK log likelihood is explicitly natural logarithm before the base-two entropy expectation. Production timing and browser/encoded review remain pending.
