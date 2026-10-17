# E03｜信息处理与统计推断

## 全片结构

核心问题：数据被处理或压缩后，关于未知参数的信息会怎样变化，信息量如何限制估计成功率？受众起点：熵、条件熵、互信息、KL 非负；本片建立 Markov 条件独立、DPI、充分统计量和 Fano。主线是信息经处理不增、统计量可保留参数信息、错误事件带来条件熵上界。内容依赖：E01/E02 → 全片；参数与观测 → c03；分类/估计错误 → c04–c05。术语表：data processing inequality（数据处理不等式）、sufficient statistic（充分统计量）、Fano inequality（Fano 不等式）。

## 章节

### `c01-markov`
- question：怎样用条件独立表达“Y 只通过 X 获得关于 Z 的信息”？
- requires：联合分布、条件分布、链式法则；现场复习。
- teaching_sequence：定义 `Z→X→Y` 等价于 `p(z,x,y)=p(z)p(x|z)p(y|x)`；说明条件于 X 后 Y 与 Z 独立；用复制/加噪通道例子对比不满足因子分解的旁路；强调箭头表示概率因子化，不自动表示物理因果。
- claims：claim_id=e03-processing-inference-c01_markov-01; identity=definition; Markov chain 定义及条件独立，Lecture 2 PDF pp. 3–7。
- visual_events：`e1` 锚点“给定 X”，先显示三变量联合表，再按 X 分层验证条件乘积，保留每层；落点因子分解。`e2` 锚点“增加旁路”，Z 直连 Y 后分层格值不再独立；落点区分链与非链。
- outcome_check：看到一个联合分布分解式，能确认链方向与条件独立对象。
- next：沿这条链的数据处理不会增加互信息。

### `c02-dpi`
- question：如何用链式法则和非负条件互信息证明 DPI，并找出等号结构？
- requires：c01 Markov 链、E01 chain rule、E02 MI 非负。
- teaching_sequence：由 `I(Z;X,Y)=I(Z;X)+I(Z;Y|X)`；Markov 令后项零；交换次序得 `I(Z;X,Y)=I(Z;Y)+I(Z;X|Y)`；因此 `I(Z;Y)≤I(Z;X)`；等号当 `I(Z;X|Y)=0`，解释 Y 已足够保留 X 关于 Z 的信息；用带噪复制例演示严格损失。
- claims：claim_id=e03-processing-inference-c02_dpi-01; identity=established_result; DPI 及链式证明，Lecture 3 PDF p. 11；前提是指定 Markov 条件独立。
- visual_events：`e1` 锚点“联合信息两种展开”，公式账本逐行保留共同左项，突出条件 MI；落点不等式。`e2` 锚点“擦除信号”，经过噪声通道时可区分分布逐渐靠近，保留输入差异；落点信息减少及等号条件。
- outcome_check：能指出证明中哪个条件 MI 为零以及等号意味着什么。
- next：若统计量保留全部参数信息，它就是对推断充分的压缩。

### `c03-sufficiency`
- question：统计量 T(X) 何时不丢失关于未知参数 θ 的信息？
- requires：条件分布、参数化模型、Markov/DPI。
- teaching_sequence：区分随机样本 X 与参数 θ；在选定的共同支配测度下写因子分解判据 `pθ(x)=gθ(T(x))h(x)`；Bernoulli IID 样本中 `T=ΣX_i` 充分，似然只经 count 依赖 θ；定义 minimal sufficient statistic 为充分统计量，且它是任意其他充分统计量的函数（按所用离散模型/等价类表述）；推导 `θ→X→T(X)` 与信息保留直觉。共同支持不是所有 factorization theorem 的普遍必要条件，按当前模型声明支配测度。
- claims：claim_id=e03-processing-inference-c03_sufficiency-01; identity=established_result; 充分性、factorization criterion 与 minimal sufficient 定义，Lecture 3 PDF pp. 12–14；Bernoulli IID 样本、共同计数统计量为明确演算例。
- visual_events：`e1` 锚点“Bernoulli 样本映到 count”，相同 count 的排列归为一组，保留成功数和失败数；落点似然 `θ^T(1−θ)^(n−T)`。`e2` 锚点“最小充分”，统计量映射间的函数关系逐层折叠，前态保留；落点 minimal sufficiency 定义。
- outcome_check：给定 Bernoulli 样本能找出 count，并解释其充分性与 minimal sufficiency 的差别。
- next：若最终任务是估计而非完整后验，可把失败率转成信息下界。

### `c04-fano`
- question：估计错误概率怎样限制离散参数的条件熵？
- requires：离散 Θ、估计量、条件熵、错误指示变量。
- teaching_sequence：定义 `E=1{Θ≠Θhat}`；展开 `H(Θ|Θhat)` 加入 E；用 `H(E)≤1` 和错误时最多 `|Θ|−1` 个候选推出 `H(Θ|Θhat)≤h₂(Pe)+Pe log₂(|Θ|−1)`；经数据处理连接观测 X；逐条解释有限参数空间和离散假设。
- claims：claim_id=e03-processing-inference-c04_fano-01; identity=established_result; Fano inequality 及证明思路，Lecture 3 PDF pp. 15–17；`Θ` 取有限离散集合。
- visual_events：`e1` 锚点“先知道是否错”，Θ 候选集合按正确/错误分叉，错误分支保留剩余候选；落点二元熵加 `log(|Θ|−1)`。`e2` 锚点“估计量来自 X”，在信息链插入 `X→Θhat` 并标记 DPI；落点把估计不确定性联系到 I(Θ;X)。
- outcome_check：能说出错误分支候选数为何至多 `|Θ|−1`，并指出 Fano 何时适用。
- next：具体恢复任务需先确定最佳估计规则及其错误事件。

### `c05-estimation`
- question：MAP 规则最小化什么错误率，如何将恢复极限写成可用信息界？
- requires：c04 Fano、后验概率、决策损失。
- teaching_sequence：等代价 0–1 loss 下逐观测选择最大后验 θ 得 MAP；比较先验、似然与后验；用 Fano 将小错误概率要求转为 `I(Θ;X)` 至少约为 `H(Θ)`；区分等代价假设与一般损失，也区分下界与可达到算法。
- claims：claim_id=e03-processing-inference-c05_estimation-01; identity=established_result; MAP 定义及 Fano 型恢复下界，Lecture 3 PDF pp. 15–17；先验概率和有限 Θ 是界的条件。
- visual_events：`e1` 锚点“固定一条观测”，后验柱逐个比较并选最高者，其他候选保留；落点 MAP 判决。`e2` 锚点“提高成功要求”，错误概率下降时信息需求上升，保留 H(Θ) 水平；落点为恢复界并标明必要条件非充分构造。
- outcome_check：给定一组后验概率能找 MAP，并解释 Fano 不能直接给出具体估计算法。
- next：把误差界与 AEP 联合起来，将单符号不确定性转为块编码率。

## Replacement missing-bit experiment

The new eight-sentence opening enumerates four fair two-bit secrets. Y keeps their first bit; the “sharpen” processing Z=2Y appends a guessed zero. The s3 prediction hold precedes the two-to-one mappings and the half-success bound. Providing S=X mod 2 changes the data: X=2Y+S. The opening is an exact finite toy channel, with no claim about a physical image-processing algorithm. The original Markov content follows through an explicit eight-sentence timing view.

Other holds occur at c02 s28, c03 s15, c04 s19 and c05 s14/s52. Effective channel error is withheld until c02 s29. The complete sufficiency, minimality, Gaussian factorization, Fano and MAP arguments remain. Final c05 s58–60 returns to H(X|Y)=1, I(X;Z)=I(X;Y)=1 and best error .5, then exact recovery with the added true bit. The original compression handoff moves to s61.
