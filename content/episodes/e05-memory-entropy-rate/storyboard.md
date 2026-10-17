# E05｜记忆与熵率

## 全片结构

核心问题：单个符号熵相同的过程，为什么可预测性不同，长期每符号信息量如何定义？受众起点：条件熵、链式法则、有限状态 Markov 链；本片建立 entropy rate 和有限链稳态。主线从三台机器的下一位预测，到条件熵平均，再区分 recurrent classes、stationary distribution 与收敛，最终用隐藏信源反例区分平均熵率与单条路径的速率。内容依赖：E01 条件熵、E04 AEP；有限转移矩阵。术语表：entropy rate（熵率）、stationary distribution（平稳分布）、recurrent class（常返类）、ergodic（遍历）。

## 章节

### `c01-memory`
- question：相同边缘分布为何可能对应不同的序列不确定性？
- requires：边缘 entropy、联合/条件 entropy、独立与依赖。
- teaching_sequence：从支付下一比特的问题出发，比较 IID 公平二元源、首次抛币后一直复制的源、首次抛币后一直交替的源，保证单符号均匀；算 `H(X_n)` 相同而 `H(X_n|X^{n−1})` 不同；解释独立情况下每步仍 1 bit、完全复制后首项之后为 0；有限例不代替渐近定义。
- claims：claim_id=e05-memory-entropy-rate-c01_memory-01; identity=established_result; 记忆与条件熵例，Lecture 5 PDF pp. 7–9；使用合法的有限过程构造。
- visual_events：`e1` 第3句显示七位历史，第4句保留末位问号并额外思考3.2秒；A仍不确定，B第6句可确定。`e2` 第22句引入交替源，第23句额外思考2.5秒，第25句揭示强制的下一位；第33句六位窗口右移一位，两种相位仍各占一半。边缘概率指跨运行的分布，复制源单条全1路径的经验频率不代替该分布。
- outcome_check：能指出 marginal entropy 不足以确定序列预测难度。
- next：链式法则把有限块熵写成逐步条件熵之和。

### `c02-rate`
- question：每符号长期平均不确定性如何从 `H(Xⁿ)/n` 定义并求极限？
- requires：链式法则、平稳过程、次可加/极限直觉。
- teaching_sequence：展开 `H(Xⁿ)=Σ H(X_i|X^{i−1})`；平稳性使逐步条件熵随历史长度非增并有下界，因而极限存在；定义 entropy rate `H̄=lim H(Xⁿ)/n`；比较它与单字母 H，明确一般仅有 `H̄≤H(X_1)`；不将平稳性偷换为独立。
- claims：claim_id=e05-memory-entropy-rate-c02_rate-01; identity=established_result; 熵率定义和基本极限，Lecture 5 PDF pp. 7–9；有限字母平稳过程保证适用。
- visual_events：`e1` 锚点“逐项链式展开”，条件熵序列逐项堆叠且前态保留；落点块熵总和。`e2` 锚点“除以长度”，均值曲线趋于下界水平线；落点熵率。
- outcome_check：观众能解释为什么相关性可使熵率低于边缘熵。
- next：Markov 性把无限历史压缩成当前状态，便于算这项极限。

### `c03-classes`
- question：有限 Markov 链的 transient、recurrent、closed class 和周期分别说明什么？
- requires：转移矩阵、路径概率、有限状态图。
- teaching_sequence：从有向带概率图定义可达和互通；区分 transient 与 recurrent，闭合 irreducible class 内各状态常返；定义周期 gcd 并用两态交替链展示周期 2；强调 recurrent state 数不等于 closed class 数，也不等于 stationary distributions 数。
- claims：claim_id=e05-memory-entropy-rate-c03_classes-01; identity=definition; Markov chain classifications，Lecture 5 PDF pp. 10–16；状态空间有限。
- visual_events：`e1` 明确的一条可能路径0→1→2→3→2进入闭类；不声称是随机模拟或访问频率测量。`e2` 两态链回返时间为2、4、6，第23句提问从0初始化是否会稳定，额外思考2.5秒，第24句并列揭示交替分布与保持不变的平稳向量。
- outcome_check：能从小图识别 closed class 与两态链周期。
- next：平稳分布是概率流量平衡，需单独解方程。

### `c04-stationary`
- question：平稳分布满足什么流量方程，极端解对应何种结构？
- requires：转移矩阵、概率向量、线性方程。
- teaching_sequence：定义 `πP=π`、`Σπ=1`；以两态矩阵 `[[1/2,1/2],[1/2,1/2]]` 解出唯一 π，虽然两个状态都 recurrent；对多个闭 irreducible classes 说明每类有其平稳分布，凸组合组成全部平稳分布；纠正“极端 stationary distributions 数等于 recurrent states”的错误，应等于 closed irreducible recurrent classes 数。
- claims：claim_id=e05-memory-entropy-rate-c04_stationary-01; identity=definition; 稳态方程和修正，Lecture 5 PDF pp. 16–19；有限链。
- visual_events：`e1` 锚点“流入等于存量”，节点质量按 P 流动，逐节点显示守恒，保留初始向量；落点 `πP=π`。`e2` 锚点“两个 recurrent 点”，两个节点属于同一个 closed class 并算出同一唯一 π；落点 class 与 state 区分。
- outcome_check：能说明例中两状态皆 recurrent 而 stationary law 唯一。
- next：一旦有 π，Markov 源熵率可按平稳访问频率加权行熵。

### `c05-markov-rate`
- question：有限平稳 Markov 源的 entropy rate 如何从转移矩阵计算？
- requires：c02 熵率、c04 平稳分布、条件熵。
- teaching_sequence：每个状态 i 的下一符号 row entropy `H(P_i)`；按 `π_i` 加权得 `H̄=Σπ_iH(P_i)`。数值例用转移行 `(.9,.1)`、`(.3,.7)`，解得平稳分布 `(.75,.25)`，因此熵率约 `.5720694` bit/symbol，边缘熵约 `.8112781`；逐项比较显示记忆降低长期率。零转移按极限约定；数值是公式演算不是测量。
- claims：claim_id=e05-memory-entropy-rate-c05_markov_rate-01; identity=established_result; finite Markov entropy rate 公式，Lecture 5 PDF pp. 10–19；演算输入与结果见 `docs/mathematical-examples.md`，不是 measured_result。
- visual_events：`e1` 锚点“读取每一行”，行概率化为各自熵条，矩阵保持；落点 row entropy 向量。`e2` 锚点“按 π 加权”，状态熵条按稳态质量缩放后相加；第25句保留总和问号并额外思考2.5秒，第26句才出现.57206942。第34句才给出完整块熵恒等式。
- outcome_check：给一个 2×2 P 与 π，能计算加权行熵。
- next：对遍历源，AEP 会将熵率转成典型序列概率与压缩率。

### `c06-ergodic-aep`
- question：何时可对平稳有记忆源使用 AEP，有限 Markov 例满足哪些条件？
- requires：stationarity、ergodicity、c01 surprisal、c02 entropy rate。
- teaching_sequence：陈述 Shannon–McMillan–Breiman 的适用结论但标为调用定理；列出平稳遍历与有限字母/可积条件；得到 `−(1/n)log P(Xⁿ)→H̄`；有限 irreducible aperiodic Markov 链提供清晰例，但周期并不必然破坏平稳遍历源的定理；区分遍历性与从任意初值 `P^n` 收敛，后者有限 irreducible 链还需 aperiodic。
- claims：claim_id=e05-memory-entropy-rate-c06_ergodic_aep-01; identity=established_result; Lecture 5 PDF pp. 18–19；一般 SMB 定理使用明确 hypotheses，source-review 澄清 irreducibility/convergence 与 stationarity 区别。
- visual_events：`e1` 一般定理列清假设与证明路线；有限正 Markov 链使用极限转移频率表做精确推导，表不是模拟测量。`e2` 公平选择一次隐藏信源，分别产生IID公平比特或全零；第40句显示平均半比特并提问单条路径是否也如此，额外思考3秒，第41句再揭示路径极限1或0。有限n概率公式49/51句出现，53句完整平均熵率证明。55句明确回到平稳遍历情形；遍历性作为充分假设，不声称是所有AEP过程的必要条件。
- outcome_check：能复述 SMB 结论依赖平稳遍历，而非只凭“有限 Markov”四字。
- next：有了熵率与 AEP，转向无前缀码的树结构和平均长度界。
