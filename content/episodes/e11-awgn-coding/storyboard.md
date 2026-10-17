# E11｜AWGN 信道编码

## 全片结构

核心问题：逐码字功率受限的实 AWGN 信道为何有 `½log₂(1+P/N)` bit/实信道使用的容量？受众起点：E09 coding theorem、E10 Gaussian maximum entropy；本片建立逐码字功率约束、converse、随机高斯码本直觉和调制差异。主线从模型到上界、可达码本、几何解释、BPSK 硬软输出比较。内容依赖：实高斯噪声、功率、熵率。术语表：AWGN（加性白高斯噪声）、SNR（信噪比）、BPSK（二相移键控）、soft decision（软判决）。

## 章节

### `c01-awgn`
- question：离散实 AWGN 模型与 codeword 平均功率约束分别限制什么？
- requires：实向量、独立高斯噪声、码字集合。
- teaching_sequence：定义 `Y_i=X_i+Z_i`、`Z_i~N(0,N)` IID；明确每个码字满足 `(1/n)||xⁿ(m)||²≤P`，所有消息 m 均受约束；SNR `P/N`；不把逐码字限制弱化成仅对随机码本平均功率约束。
- claims：claim_id=e11-awgn-coding-c01_awgn-01; identity=definition; AWGN 模型与逐码字功率约束，Lecture 10 PDF pp. 20–21；对每个 m 的 `(1/n)||xⁿ(m)||²≤P`。
- visual_events：`e1` 锚点“加噪”，输入实数点云加独立噪声，噪声分布保留；落点条件输出高斯。`e2` 锚点“检查功率”，码字能量逐条与平均上限对照，保留不同约束；落点 feasible code。
- outcome_check：能辨识每码字和码本平均功率约束的不同。
- next：最大熵与 Jensen 给任何可行码的 converse。

### `c02-upper`
- question：如何从 Fano、最大熵与凹性推出 AWGN 码率上界？
- requires：E09 Fano/converse、E10 Gaussian entropy bound、功率约束。
- teaching_sequence：由 Fano `log M` 约受 `I(Xⁿ;Yⁿ)`；`h(Yⁿ)≤Σh(Y_i)`，每项由 Gaussian maximum entropy 受方差约束；凹 log 与总功率给 `n/2 log₂(1+P/N)`；减噪声熵得 I；Pe→0 后 R 上界；逐行标识独立噪声、平均功率与实维度因子 1/2。
- claims：claim_id=e11-awgn-coding-c02_upper-01; identity=established_result; AWGN converse，Lecture 10 PDF pp. 20–24；real discrete-time channel，bits per real channel use。
- visual_events：`e1` 锚点“输入功率给输出方差”，每坐标方差与噪声 N 叠加并保留均值；落点 `h(Y_i)`。`e2` 锚点“Jensen 平均功率”，各坐标 log 项弯曲平均，旧功率分配保持；落点总 MI 上界。
- outcome_check：能解释 `1/2` 来自每次使用一个实维高斯自由度，而不是任意单位换算。
- next：随机码本构造达到该上界下的任意较低率。

### `c03-codebook`
- question：高斯随机码本怎样同时满足功率要求并使错误解码概率趋零？
- requires：AWGN、联合典型/距离解码、容量上界。
- teaching_sequence：固定 δ>0，按方差 `P−δ` 生成每个坐标；LLN 令单码字超 P 概率趋零，因此码本平均坏功率消息比例的期望趋零。译码用似然/典型规则，平均错误趋零。对码本期望同时计入坏功率消息比例与译码错误，选择使两者和小的确定码本；删除坏功率或坏错误消息后，剩余比例趋一、率损失 `o(1)`，从而所有保留码字逐个满足预算；最后令 δ↓0 得任意 `R<C`。方差恰为 P 时不能声称超限概率趋零。
- claims：claim_id=e11-awgn-coding-c03_codebook-01; identity=established_result; AWGN achievability，Lecture 10 PDF pp. 21–24；逐码字功率约束通过 `P−δ`、LLN、挑选及剔除落实。
- visual_events：`e1` 锚点“方差留 δ 裕量”，码字能量分布中心落在 P 以下、超限尾概率缩小，保留P界；落点 LLN。`e2` 锚点“同时筛坏消息”，错误标记与功率标记交叠删除，保留率比例趋一；落点满足逐码字约束的确定码本。
- outcome_check：能解释为什么恰在 P 生成不够，以及为何删除 vanishing fraction 不改渐近率。
- next：球形图解释容量直觉，但必须标清仅为几何示意。

### `c04-geometry`
- question：高维球体积如何直观解释 AWGN 的 log(1+SNR)，哪些部分不是独立证明？
- requires：高维向量、噪声典型球、功率球、体积指数。
- teaching_sequence：输入可画在半径约 `√(nP)` 球内；接收向量典型半径约 `√(n(P+N))`，噪声典型半径约 `√(nN)`。可区分接收端大球中互不重叠噪声球的数量，其体积比 `(P+N)/N` 给 `(1/2)log₂(1+P/N)` 直觉。输入球只说明码字功率约束，不是该比值分子。几何图是 analogy，正式 achievability/converse 来自前两章定理。
- claims：claim_id=e11-awgn-coding-c04_geometry-01; identity=analogy; 高维几何直觉，Lecture 10 PDF pp. 22–24；identity 为 analogy，不作为证明。
- visual_events：`e1` 锚点“接收端总变化”，画半径 `√n(P+N)` 大球与半径 `√nN` 噪声球，输入功率球另列且不参与该体积比；落点半径平方比。`e2` 锚点“取对数体积”，两球体积指数相除显式出现 1/2；落点几何容量直觉及 analogy 标签。
- outcome_check：能指出几何图解释指数率但不替代概率证明。
- next：有限星座 BPSK 会因输入受限而低于 Gaussian-input 容量。

### `c05-bpsk`
- question：BPSK 硬判决与软输出分别保留多少信息，互信息如何定义？
- requires：二点输入、AWGN 条件密度、互信息积分/离散和。
- teaching_sequence：`X∈{±√P}` 过高斯噪声；软接收 R 保留连续幅值；硬判决只保留符号；数据处理得 `I(X;sign R)≤I(X;R)`；给出 binary-input Gaussian MI 数值积分或可复算公式，区分其受限输入容量与高斯输入上界。
- claims：claim_id=e11-awgn-coding-c05_bpsk-01; identity=established_result; BPSK 及硬软判决比较，Lecture 10 PDF pp. 25–29；输入等概率若声称最优须核对对应对称性。
- visual_events：`e1` 锚点“接收样本落在哪侧”，两高斯密度重叠并显示门限，保留幅值；落点硬 bit。`e2` 锚点“丢掉幅值”，连续 R 映射成 ±1，MI 数值按公式/积分标注 provenance；落点 DPI 对照。
- outcome_check：能说明软判决多保留幅度信息而不违反 DPI。
- next：最后比较输入限制容量与 Gaussian 输入公式，并建立可复算数值积分。

### `c06-comparison`
- question：离散调制输入与 Gaussian 输入容量差别如何公平比较，积分的数值从何而来？
- requires：BPSK、Gaussian AWGN formula、单位 bit/use、数值积分。
- teaching_sequence：固定相同平均功率与 N，比较 `I_BPSK(X;Y)` 和 Gaussian `C=½log₂(1+P/N)`；前者有限输入可用 `H(X)−E H(X|Y)` 一维高斯积分；展示 SNR 轴但数据标为公式数值计算，非测量；趋高 SNR 时 BPSK MI≤1 bit/use 而 Gaussian 容量无此 1-bit 上限。
- claims：claim_id=e11-awgn-coding-c06_comparison-01; identity=established_result; Lecture 10 PDF pp. 25–29；real discrete-time units bits/use；BPSK 值若绘制须记录积分网格/精度。
- visual_events：`e1` 锚点“同功率同噪声”，双曲线使用同一 P/N 横轴，保留输入约束标签；落点容量间隙。`e2` 锚点“提高 SNR”，BPSK 曲线趋 1 而高斯公式继续上升，前态保留；落点输入字母表限制。
- outcome_check：能说出输入限制造成差距，而非噪声模型变了。
- next：连续时间带宽引入每秒使用率，才能从 bit/use 转到 bit/s。

## 预测与具体比较

五处hold位于原索引：c01 s7的(1.5,1.5)功率资格、c03 s25的P′=P越界比例、c04 s7的接收侧体积比、c05 s8的r=.25与r=2置信度、c06 s8的高SNR二元上限。功率不合格标签/颜色在答案句后显示；后验数值在公式之后出现；高于SNR一的曲线在高SNR预测后展开。所有Fano/Jensen、连续联合典型性、逐码字功率筛选、最大错误控制、几何类比条件及soft/hard积分推导保留。两种正接收值的后验分别约.622459/.982014；硬判决只保留相同的正号。
