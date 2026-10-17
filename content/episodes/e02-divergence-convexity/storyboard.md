# E02｜散度与凸性

## 全片结构

核心问题：如何量化真实分布与模型分布的差异，并证明这种差异不会为负？受众起点：会算熵、条件概率、对数和期望；本片建立凸函数、KL 散度及其用途。主线以弦/切线几何建立 Jensen，再以 `−log` 的凸性证明 Gibbs 不等式，随后连接互信息形状、错配编码和条件 KL 分解。内容依赖：E01 entropy/MI → c01/c05；凸函数定义 → c01；概率单纯形与支持集 → c02。术语表：convexity（凸性）、KL divergence（KL 散度）、Gibbs inequality（Gibbs 不等式）、mismatched model（错配模型）。

## 章节

### `c01-convex`
- question：函数图像何时位于弦下方，为什么这能控制随机变量的平均？
- requires：实函数、凸域、加权平均；现场建立。
- teaching_sequence：定义凸函数 `f(λx+(1−λ)y)≤λf(x)+(1−λ)f(y)`；用两点弦推广有限加权和，再陈述 Jensen；区分函数的凸/凹与集合的凸/非凸；纠正 Lecture 2 p. 8 把 nonconvex set 写作 concave 的术语错误，展示两个孤立点；说明 Jensen 适用域需凸。
- claims：claim_id=e02-divergence-convexity-c01_convex-01; identity=definition; 凸函数定义及不等式，Lecture 2 PDF pp. 8–13；集合非凸不称 concave，采用 source-review 澄清。
- visual_events：`e1` 锚点“连两点”，弦段始终保留并与函数图像比较，权重滑块控制内点；落点为凸性不等式。`e2` 锚点“换成点集”，平面仅两个孤立点，候选连线显现为空缺，保留端点；落点标注 nonconvex set。
- outcome_check：能分别判断集合凸与函数凸，并说出 Jensen 的定义域条件。
- next：取特定凸函数 `−log`，便可比较两个概率分布。

### `c02-kl`
- question：KL 散度为何有方向，遇到模型给真实事件零概率时发生什么？
- requires：E01 surprisal/期望、概率分布和 c01 凸性。
- teaching_sequence：定义 `D(P‖Q)=Σp log₂(p/q)`；逐项解释权重来自 P，代价比来自 P 相对 Q；用交换 P/Q 显示一般不对称；明确若 `p>0,q=0` 则无穷，零权重项按极限为零；用概率单纯形上的两点例子观察零点与方向。
- claims：claim_id=e02-divergence-convexity-c02_kl-01; identity=definition; KL 定义、支持集约定和非对称性，Lecture 2 PDF pp. 14–20；不把几何距离术语用于 KL。
- visual_events：`e1` 锚点“按 P 采样”，在同一离散结果上显示 `p(x)` 权重和 `log(p/q)` 代价，保留每项贡献；落点是加权和。`e2` 锚点“模型漏掉可能事件”，令 q 分量趋零，代价趋无穷并保留其余分量；落点为支持集条件。
- outcome_check：能识别方向、零概率导致的无穷，并说明交换参数可能改变数值。
- next：凸性论证给出散度非负的完整理由。

### `c03-gibbs`
- question：怎样从基本对数不等式逐步推出 `D(P‖Q)≥0`，等号何时成立？
- requires：c02 KL 定义、有限分布支持约定、c01 凸性。
- teaching_sequence：从 `−ln u≥1−u`（正 u）开始；令 `u=q_i/p_i`，乘 `p_i` 并对 P 支持求和；处理 Q 在 P 支持外的剩余质量，得到下界零；换算对数底不改变符号；逐项检查等号要求 `q_i=p_i` 且无额外 Q 质量，得到 P=Q。随后用联合分布定义推出 `I(X;Y)=D(P_{XY}‖P_XP_Y)≥0`；一般条件互信息为给定 Z 后 KL 的按 `P_Z` 加权平均，故非负。再令 U 为 X 字母表上的均匀分布，`D(P_X‖U)=log₂|X|−H(X)≥0`，得到 `H(X)≤log₂|X|`，等号当且仅当均匀。
- claims：claim_id=e02-divergence-convexity-c03_gibbs-01; identity=established_result; Gibbs inequality、等号条件、MI/CMI 非负及最大熵界，Lecture 2 PDF pp. 14–21、Lecture 3 PDF pp. 3–6；每个结论的 KL 参照分布和支持假设在推导中显示。
- visual_events：`e1` 锚点“代入比值”，不等式两边按 i 展开并同步乘 `p_i`，每一步前式保留淡色；落点为求和下界。`e2` 锚点“信息与均匀参照”，联合格与乘积分布对齐显示 MI 的 KL，概率柱与均匀 U 对齐显示 entropy gap；前态保留；落点 `I≥0`、`H≤log|X|` 与等号条件。
- outcome_check：观众能复述替换变量及等号条件，并从参照分布识别 MI 和最大熵界。
- next：用散度非负证明熵的凹性与互信息非负。

### `c04-jensen`
- question：混合两种分布为什么不会降低熵，推导中凸性施加在哪里？
- requires：E01 entropy、c01 Jensen、c03 Gibbs。
- teaching_sequence：令混合 `P=Σλ_jP_j`；将 `−x log x` 的凹性逐分量应用并求和，推出 `H(P)≥Σλ_jH(P_j)`；另用 KL/Gibbs 解释混合分布与分量的平均散度；说明等号取决于分布重合条件，不把示意图当证明。
- claims：claim_id=e02-divergence-convexity-c04_jensen-01; identity=established_result; entropy concavity 与 Jensen 推导，Lecture 3 PDF pp. 3–5；MI 凹性依赖变量固定条件放在下一章。
- visual_events：`e1` 锚点“混合概率”，两组概率柱按 λ 插值，逐分量弯曲函数贡献与线性弦并列，保留两端分布；落点为熵的凹性。`e2` 锚点“求和”，每个符号贡献堆叠，落点比较混合熵与平均熵。
- outcome_check：给定两个分布和混合比例，能判断混合熵相对平均值的方向。
- next：互信息作为函数时，固定哪个变量决定其凹凸性质。

### `c05-mi-shape`
- question：互信息对输入分布为何凹，而固定输入后的条件互信息呈现不同形状？
- requires：E01 MI、c04 entropy concavity、DMC/条件分布概念。
- teaching_sequence：先固定信道转移概率，写 `I(X;Y)=H(Y)−H(Y|X)` 并解释前项随输入混合变化；展示其对 `P_X` 的凹性；再固定输入观察关于信道的凸性；以二元信道图扫输入偏置，对比改变信道；避免把“互信息总是凹”泛化到所有参数。
- claims：claim_id=e02-divergence-convexity-c05_mi_shape-01; identity=established_result; 互信息对输入分布凹、对信道条件的凸性，Lecture 3 PDF pp. 6–10；固定对象必须标明。
- visual_events：`e1` 锚点“只动输入”，固定信道矩阵，输入单纯形轨迹与 MI 曲线同步，保留矩阵；落点为凹曲线。`e2` 锚点“只动信道”，锁定输入分布、插值转移矩阵，旧矩阵淡留；落点为参数角色对照。
- outcome_check：面对一个凹性陈述，观众能指出固定信道还是固定输入。
- next：KL 链式分解把错配代价拆成信息损失与条件代价。

### `c06-mismatch`
- question：用错误模型编码时，平均码长多出的部分怎样由 KL 散度解释？
- requires：熵、KL、链式法则；E01/E02 已建立。
- teaching_sequence：真实 P 产生符号、模型 Q 给出 ideal length `−log Q(x)`；取 P 期望得 `H(P)+D(P‖Q)`；加入条件变量后展开联合 KL，分成边缘 KL 与 P 加权条件 KL；逐项说明非负，解读过长代价。
- claims：claim_id=e02-divergence-convexity-c06_mismatch-01; identity=established_result; KL 与熵关系、条件散度链式分解，Lecture 2 PDF pp. 20–21；码长为理想实数长度，实际整数码稍后讨论。
- visual_events：`e1` 锚点“在 P 下平均 Q 码长”，每符号长度条按 P 加权并与熵基线叠加；落点 excess length=KL。`e2` 锚点“加入条件变量”，联合差额拆成边缘与条件两层，保留总量；落点为链式公式。
- outcome_check：能从期望 `−log Q(X)` 写出熵加散度，并解释何时惩罚为零。
- next：数据处理、充分统计量与错误概率界将把信息量用于推断。

## Replacement bill and prediction stages

The c01 eight-sentence opening uses an explicit fixed inventory of 500 A, 250 B, 125 C and 125 D. The valid prefix codes are {0,10,110,111} and {00,01,10,11}. Their bills appear only after the s3 hold: 1750 at s4, 2000 and the 250 difference at s5. This inventory is a finite chosen example, not an empirical frequency claim about every random block. All original convexity narration follows through an explicit eight-sentence timing view.

Other holds occur at c02 s16, c04 s30, c05 s68 and c06 s17. Existing reverse-KL, mixture-entropy, XOR and penalty answer states remain sentence-anchored. After the complete conditional-divergence proof, c06 s47–49 returns to the opening's dyadic model, H=1.75, cross entropy 2 and divergence .25, with no integer rounding gap in these particular codes. The original next-episode handoff moves to s50.
