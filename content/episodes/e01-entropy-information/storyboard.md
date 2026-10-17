# E01｜熵与信息

## 全片结构

核心问题：概率如何变成可计算的信息量，并由此量化不确定性与共享信息？受众起点：会读有限概率分布、条件概率和期望；本片现场建立 surprisal、entropy、joint/conditional entropy 与 mutual information。主线从通信中“消息有多意外”走到平均信息、条件知识与两变量共享结构。内容依赖：概率与期望 → 本片 c01；熵 → c02；条件分布 → c03；链式分解 → c04；离散分布计算 → c05。术语表在共享 glossary 中建立：surprisal/self-information（自信息）、entropy（熵）、conditional entropy（条件熵）、mutual information（互信息）。

## 章节

### `c01-communication`
- question：通信系统的哪些量决定“每次使用”能传多少信息，为什么要用概率描述消息？
- requires：概率、随机变量、有限字母表和期望为受众已知；本章只快速复习。
- teaching_sequence：从发送者、信道、接收者和噪声定义通信模型；区分消息数、码率与可靠性；用两种概率不同的消息源比较相同字母表下的预期不确定性；明确物理信道容量尚未证明，只提出信息量问题。
- claims：claim_id=e01-entropy-information-c01_communication-01; identity=definition; 通信模型与离散信源/信道表述，Lecture 1 PDF pp. 2–16；不引入未证明的容量结论。
- visual_events：`e1` 锚点“发送一条消息”，画出 source→channel→receiver，噪声扰动只作用于信道且保留输入/输出并列；落点是一个带概率标记的有限字母表。`e2` 锚点“常见与罕见”，两种源依次给同一符号不同频率，历史频数保留，落点为待定义的惊讶量。
- outcome_check：观众能指出信源概率和信道噪声分别描述哪一段。
- next：消息的意外程度先从单次结果定义。

### `c02-surprisal`
- question：观察到某个结果的意外程度如何定义，信源平均不确定性又怎样从它得到？
- requires：c01 的有限信源与事件概率。
- teaching_sequence：定义 `I(x)=log₂(1/p(x))`，由独立事件相乘推出信息量相加；定义 `H(X)=E[I(X)]=−Σ_x p(x)log₂p(x)`，令 `0log₂0=0`；用 Bernoulli 分布定义 `H_b(p)=−p log₂p−(1−p)log₂(1−p)`，画出两端为0、p=1/2为1 bit；再用概率 `(1/2,1/4,1/8,1/8)` 的最优问题树，逐叶深度为 1、2、3、3，算平均 `7/4` bit，指出这例是预览而非一般最优码证明。
- claims：claim_id=e01-c02-surprisal-definition; identity=definition; 自信息、熵定义及问题树例，Lecture 1 PDF pp. 17–21；bit 由 log₂；零项按连续极限约定。 claim_id=e01-c02-question-tree; identity=established_result;
- visual_events：`e1` 锚点“概率减半”，同时生成 I(x) 数轴、熵的概率加权和与 H_b 曲线，保留单次与平均两层；落点 `H=E[I]`。`e2` 锚点“从根节点提问”，按四个叶概率展开问题树，逐次标记深度和概率权重，保留分支；落点平均深度 `7/4` bit。
- outcome_check：能写 H(X) 的期望定义、计算 H_b(1/2)，并复算问题树平均长度。
- next：信源每次结果不同，要对 surprisal 取平均。

### `c03-conditional`
- question：知道 `X` 后，`Y` 平均还剩多少不确定性？为何某个条件下会更不确定？
- requires：c02 surprisal、联合分布和条件概率；逐项建立。
- teaching_sequence：用 joint table 显示 `p(x,y)`；按每个 x 的行归一化得到 `p(y|x)`；先算各行 entropy，再按 `p(x)` 加权得 `H(Y|X)`；用源审更正例子展示 `H(Y|X=0)=1 > H(Y)=H_b(.05)≈.2864`，但平均 `H(Y|X)=.1`；强调条件熵是平均而非逐条件不等式。
- claims：claim_id=e01-entropy-information-c03_conditional-01; identity=established_result; 联合/条件熵定义，Lecture 1 PDF pp. 22–23；一般 `H(Y|X)≤H(Y)`，Lecture 2 PDF p. 17；例子取 `P(X=0)=.1`、该行 Y 均匀、X=1 时 Y=0。
- visual_events：`e1` 锚点“揭示 X”，同一张联合概率表先显示边缘和行条件分布，保留联合格值；落点为按行计算的熵。`e2` 锚点“平均之前先看单行”，突出稀有均匀行再按权重压缩，落点并列展示 1 bit、0.2864 bit 与 0.1 bit。
- outcome_check：能区分单个条件熵与条件熵平均，并指出不等式约束的是哪一个。
- next：把联合不确定性拆成已知一项加剩余一项。

### `c04-mutual`
- question：两个变量共享多少信息，怎样由联合熵与条件熵得到同一个量？
- requires：c03 条件熵与 c02 熵；本片已建立。
- teaching_sequence：定义 `I(X;Y)=H(Y)−H(Y|X)` 并用链式法则推出 `H(X,Y)=H(X)+H(Y|X)` 和对称熵差；先定义条件互信息 `I(X;Z|Y)=H(Z|Y)−H(Z|X,Y)`，解释它是在已知 Y 时 X 与 Z 的平均共享信息；进一步推出 `I(X;Y,Z)=I(X;Y)+I(X;Z|Y)`；把 MI 解释为不确定性减少而非因果影响；用二元联合表核算。
- claims：claim_id=e01-entropy-information-c04_mutual-01; identity=established_result; 联合/条件熵与互信息链式法则，Lecture 1 PDF pp. 22–24、Lecture 2 PDF pp. 3–5；非负性留待 KL 证明，不凭图像宣称。
- visual_events：`e1` 锚点“知道 X 前后”，同一 Y 不确定性条分为共享与剩余两段，保留总长；落点熵差。`e2` 锚点“增加 Z”，条件于 Y 的新信息接在 I(X;Y) 后，旧项保留；落点条件互信息链式法则。
- outcome_check：能用熵差定义条件互信息，并复述 I(X;Y,Z) 的链式分解。
- next：最后在一个完整分布上复算并检查所有分解。

### `c05-recap`
- question：面对具体联合分布，如何从概率表稳定地算出 H、条件熵和 MI？
- requires：本片 c02–c04 定义与链式法则。
- teaching_sequence：给出有理数联合表；求边缘、逐行条件概率、边缘熵与条件熵；用两条等价式复核 MI；检查独立/确定关系边界；说明四舍五入只在最终显示时进行。
- claims：claim_id=e01-entropy-information-c05_recap-01; identity=established_result; 计算遵循 Lecture 1 PDF pp. 17–24 的定义；不把近似数值当成新定理。
- visual_events：`e1` 锚点“行和列求和”，概率格聚合为边缘条形图，原表仍在侧栏；落点是两组边缘分布。`e2` 锚点“两个算法核对”，公式路径分别从熵差和联合熵差汇合，保留中间值；落点是同一 MI 数值。
- outcome_check：给出新二元表，观众能写边缘并选择合法的条件熵平均。
- next：下一集证明 KL 非负及其凸性基础，为信息不等式提供理由。

## Replacement prediction stages

A new physical eight-sentence opening uses two complete binary question trees, with the model (.5,.25,.125,.125) shared by both. The balanced depths are (2,2,2,2), the frequent-first depths (1,2,3,3); cost labels appear only after the s3 hold, at s4 and s5 respectively. Rare outcomes retain depth three, preventing an average from being misread as a guarantee for every message. The existing communication-model narration begins at s8 through its explicit timing view.

Other holds are c02 s5/s30, c03 s26/s37, c04 s23 and c05 s20/s40/s42. Existing complete derivations remain. The independence and deterministic mutual-information value labels wait for s41 and s44 respectively. The weighted average answer, rare conditional entropy and rounding question use their existing delayed formulas.
