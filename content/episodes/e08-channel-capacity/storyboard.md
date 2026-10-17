# E08｜离散无记忆信道容量

## 全片结构

核心问题：给定离散无记忆信道，怎样最大化一次使用可可靠传输的信息？受众起点：E01 互信息、E05 有限分布；本片建立 DMC、信道输入优化和容量。开场先选择0.10隐蔽翻转或0.40标记擦除，保留预测；主线从转移矩阵算条件熵，再比较典型信道并解释单次互信息的最大值意义。内容依赖：联合分布、互信息、最大化。术语表：DMC（离散无记忆信道）、channel capacity（信道容量）、BSC（对称二元信道）、BEC（擦除信道）。

## 章节

### `c01-dmc`
- question：DMC 的矩阵如何编码每次输入输出关系，无记忆假设具体排除什么？
- requires：有限 X/Y、条件概率、独立重复试验。
- teaching_sequence：定义行 `W(y|x)` 非负且和为1；memoryless 表示 `Wⁿ(yⁿ|xⁿ)=∏W(y_i|x_i)`；定义信息容量 `C=max_{P_X}I(X;Y)`，指出本章尚未证明 operational coding theorem；给二输入二输出矩阵计算联合分布；区分信道随机性和输入先验；说明有状态信道不自动属于 DMC。
- claims：claim_id=e08-channel-capacity-c01_dmc-01; identity=definition; DMC 与信息容量定义，Lecture 8 PDF pp. 3–5、10–11。
- visual_events：先显示两条链路的概率和接收者可见信息，暂停后保留选择而不揭示答案；随后 `e1` 锚点“固定输入 x”，转移矩阵行变成输出概率柱并保留其余行；落点条件分布。`e2` 锚点“重复两次”，单次概率因子相乘为序列概率；保留每次转移；落点 memoryless 分解。
- outcome_check：给定输入序列能写其输出概率乘积。
- next：容量先从具体信道互信息曲线看起。

### `c02-bsc`
- question：BSC 的翻转概率如何决定互信息和容量？
- requires：c01 DMC、E01 `H_b`、对称输入概念。
- teaching_sequence：写 BSC 转移矩阵和 `Y=X⊕N`；公平输入时输出公平，`I=1−H_b(p)`；用输入偏置时写出 H(Y)−H_b(p)，证明最大值在公平输入；用 p=0、1/2、1 检查容量和可逆标签。`p=.1` 时容量约 `.5310044` bit/use，数值为公式演算。
- claims：claim_id=e08-channel-capacity-c02_bsc-01; identity=established_result; BSC 互信息/容量，Lecture 8 PDF pp. 8–10；演算值见 `docs/mathematical-examples.md`，非 measured_result。
- visual_events：`e1` 锚点“噪声翻转”，输入 bit 经过概率 p 的交换，保留 0/1 两路径；落点 BSC 矩阵。p=1处单独暂停，先显示0↔1的确定映射，再揭示可逆性和C=1，三种端点答案按各自句子显示。`e2` 锚点“扫输入偏置”，输入 entropy 和输出 entropy 曲线保留，互信息曲线落点最大在 1/2。
- outcome_check：可由 p 算出 BSC capacity 并解释公平输入。
- next：擦除符号与翻转符号产生另一条不同容量公式。

### `c03-bec`
- question：擦除信道为何在未擦除时传一 bit、擦除时传零？
- requires：互信息、擦除符号 ⊥、独立擦除概率。
- teaching_sequence：定义 BEC(ε) 的输出 {0,1,⊥}；擦除标记与输入独立，`H(X|Y)=εH(X)`；所以 `I=(1−ε)H(X)`，公平输入最优，容量 `1−ε`；与 BSC 同误差参数对照，说明“错”与“未知”不同。
- claims：claim_id=e08-channel-capacity-c03_bec-01; identity=established_result; BEC 分析，Lecture 8 PDF pp. 8–9；擦除事件独立。
- visual_events：`e1` 锚点“输出 ⊥”，被擦除的分支保留两种输入可能，未擦除分支显示确切 bit；落点条件熵。`e2` 锚点“改变 ε”，可用传输比例下降，保留已知/未知区域；落点线性容量。推导后回到最初的不同参数比较：C_A≈0.5310044，C_B=0.6 bit/use，明确擦除标记属于观测。
- outcome_check：能从擦除率解释 `1−ε` 而非 `1−H_b(ε)`。
- next：对称结构可使均匀输入最优并简化一般容量计算。

### `c04-symmetric`
- question：列和对称如何保证均匀输入达到容量，typewriter 信道如何展示输出噪声？
- requires：DMC、互信息对输入凹、对称作用。
- teaching_sequence：弱对称矩阵各行互为置换且列和相同，所以每行熵相同；任意输入下 `H(Y)≤log₂|Y|`，而 `H(Y|X)` 固定等于行熵；均匀输入因列和相同产生均匀输出，达到熵上界，故容量为 `log₂|Y|−H(row)`；用 typewriter 循环错位矩阵算一例，不声称更一般矩阵有输入置换群作用。
- claims：claim_id=e08-channel-capacity-c04_symmetric-01; identity=established_result; weakly symmetric channel 容量式，Lecture 8 PDF pp. 10–12、Lecture 9 PDF pp. 3–6；使用相同列和与置换行条件。
- visual_events：`e1` 锚点“置换输入标签”，互信息不变的多份矩阵旋转平均，保留原矩阵；落点均匀输入。`e2` 锚点“typewriter 循环”，噪声沿环移动输出箭头；落点行熵公式。
- outcome_check：判断给定矩阵是否满足弱对称条件，避免只看行熵相同。
- next：不对称信道需要直接优化输入分布。

### `c05-asymmetric`
- question：Z-channel 的最优输入为何一般偏离均匀，怎样数值展示最大化？
- requires：DMC、二元熵、输入分布参数 q。
- teaching_sequence：定义单向翻转 Z-channel；写 `I(q)=H_b(output(q))−qH_b(α)`（按输入标签推导）；端点互信息为零，内部最大；对 q 求导/数值最大化。取 `P(Y=0|X=1)=.3`，最优 `P(X=1)≈.4210006`、容量约 `.5036919` bit/use；作为可复算公式演算。
- claims：claim_id=e08-channel-capacity-c05_asymmetric-01; identity=established_result; Z-channel 示例，Lecture 9 PDF pp. 4–6；数值演算见 `docs/mathematical-examples.md`，参数定义固定。
- visual_events：`e1` 锚点“仅一个方向出错”，矩阵单向边显示，保留无错方向；落点输出概率表达式。`e2` 锚点“调整 q”，互信息曲线随 q 绘制，候选最大点保留括区间；落点非均匀最优输入。在求导前暂停预测公平输入是否仍最优；数值最大点按原结果句揭示。
- outcome_check：给 α 和 q 能构造输出分布并计算互信息。
- next：容量作为函数还有上下界、零值判据和唯一性性质。

### `c06-properties`
- question：容量的基本界、零容量判据和最优输入唯一性应如何陈述？
- requires：DMC 容量定义、输出分布、互信息非负。
- teaching_sequence：信息容量定义已在 c01；由字母表得 `C≤log₂ min(|X|,|Y|)`；零容量等价所有输入行完全相同。最优输出分布唯一：若两个容量最优输入诱导不同输出，混合输入使 `H(Y)`严格凹增、`H(Y|X)`线性不变，与最大容量矛盾；但输入分布本身可不唯一。检查恒定输出与 noiseless channel。
- claims：claim_id=e08-channel-capacity-c06_properties-01; identity=established_result; 容量界、零容量判据及最优输出唯一性，Lecture 8 PDF pp. 10–12、Lecture 9 PDF p. 5；不声称最优输入唯一。
- visual_events：`e1` 锚点“恒定输出”，先显示两行(.9,.1)的相同输出，再将第二行改为(.2,.8)，以公平输入得到R=(.55,.45)，明确标为具体示例；保留一般散度恒等式说明任意两条不同的行都给出正互信息；落点C=0的充要行条件。`e2` 锚点“混合两个最优输入”，若输出分布不同，熵弦严格高于端点而条件熵线性，保留两个端点；落点最优输出唯一、输入未必唯一。
- outcome_check：能给出零容量行条件，并复述唯一的是最优输出分布而非输入分布。
- next：下一集用编码定理证明容量不是单次互信息的形式定义而是可靠传输率界。

## 预测与条件

六处hold分别对应开场链路选择、p=1可逆翻转、BEC比较回扣、行熵是否足够、Z信道公平输入及最优输入唯一性。所有原始DMC因子分解、BSC/BEC证明、弱对称上界达到、Z信道导数/严格凹性，以及容量存在/零值/唯一输出证明保留。不同参数的开场比较与相同横坐标参数的两条容量曲线分开标记。实际编码可靠率由E09处理。
