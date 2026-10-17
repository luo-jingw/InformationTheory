# E04｜典型性与无损压缩

## 全片结构

核心问题：为什么平均熵决定长序列压缩率，以及随机编码如何证明可达而非“所有典型串无碰撞”？受众起点：独立同分布源、熵、LLN、Fano；AEP在本片建立。主线从 surprisal 平均收敛到典型集合的概率质量与数量界，再构造固定长度编码并做 converse。内容依赖：E01 熵；E03 Fano；概率收敛、指数阶。术语表：AEP（渐近等分性）、typical set（典型集）、source coding rate（信源编码率）、block error（块错误）。

## 章节

### `c01-aep`
- question：独立同分布序列的每符号 surprisal 为何趋近熵？
- requires：有限字母表、IID、LLN、surprisal。
- teaching_sequence：写 `−(1/n)log P(Xⁿ)=(1/n)Σ−log p(Xᵢ)`；用大数定律得依概率/几乎必然收敛到 H（按所用定理区分）；定义 ε-典型事件并给概率趋近一；明确有限字母表与有限期望等条件，不把有限 n 说成必然落入典型集。
- claims：claim_id=e04-typical-compression-c01_aep-01; identity=established_result; AEP/LLN 陈述，Lecture 3 PDF pp. 18–21、Lecture 4 PDF pp. 3–5；IID 与有限熵前提。
- visual_events：`e1` 锚点“累加每个符号”，逐项 surprisal 汇成样本均值线，保留历史轨迹并加 H 水平线；落点收敛带。`e2` 锚点“容差 ε”，典型区间缩窄而样本质量集中，保留区间边界；落点概率趋近一。
- outcome_check：能将序列概率改写成逐符号 surprisal 平均。
- next：AEP 不只说质量，也限制典型序列的数量。

### `c02-counting`
- question：典型集合为什么约有 `2^(nH)` 个成员，质量和成员比例有何区别？
- requires：c01 AEP、有限字母表大小 k。
- teaching_sequence：先以 Bernoulli(.01)、n=6 的 64 格示例展示一个字符串承载 .941480149401 概率、计数比例却为 1/64；再对典型串逐个用概率上下界夹住；典型总质量近一推出 cardinality 指数阶约 `2^(nH)`；区分对源概率质量的说法与全体 `k^n` 串中的比例；严格纠正 uniform source：每个串 surprisal 相同，任何正 ε 下均 weakly typical，所以集合可占全部序列；弱/强典型定义及有限样本容差分开。
- claims：claim_id=e04-typical-compression-c02_counting-01; identity=established_result; typical sequence 计数，Lecture 4 PDF pp. 3–5；弱/强典型性 Lecture 5 PDF p. 6；“小比例”只对非均匀有限源和足够小容差成立。
- visual_events：`e1` 锚点“给每个典型串概率区间”，把每串质量倒数转成数量上下界，保留总质量条；落点指数阶。`e2` 锚点“改成均匀源”，`k^n` 串全部落入典型框，前述非均匀情形留在旁边；落点质量≠比例。
- outcome_check：观众能指出概率质量接近一不等于全空间比例很小。
- next：固定长度压缩将典型集合映到有限个码字，剩余是碰撞风险。

### `c03-binning`
- question：100 条消息随机放入 1000 个格子，为什么某处几乎总有碰撞，你的消息却大多能解码？
- requires：c02 典型集合大小、独立均匀随机 binning、条件概率、并集界。
- prediction：句 3–5 提出“任意处碰撞”和“绿色消息可还原”两个问题；句 5 后额外停留 3.2 秒。
- teaching_sequence：100 张卡片飞向 1000 个格子；句 6–8 对比全局碰撞 99.40% 与绿色卡片独占 90.57%；句 9 明示一个可能分配；句 10–14 保留远处橙色碰撞，移入再移出绿色格子的竞争者；句 15–22 完整计算固定消息的条件独立公式及并集界；句 23–33 按序揭开全体分配，写出条件乘积与生日界；句 34–39 给出指数规模反差；句 40–43 回到实际抽到的消息和信源平均错误。
- claims：claim_id=e04-typical-compression-c03_binning-01; identity=established_result; Lecture 4 PDF pp. 9–11 的 binning 论证经 source-review 更正。对 M≤N，全异概率为 ∏(1−k/N)；1−u≤e^(−u) 与 Σk=M(M−1)/2 给生日界。
- visual_events：绿色 YOU 是始终可追踪的同一条消息；橙色只标记其他已碰撞消息；格子与卡片几何实际移动。初始分配明确是示例，不冒充仿真。局部证明只显示一个格子的竞争者；全局证明再揭开所有格子。公式按问题分组，保留当前推理所需的式子。
- exact_values：P(所选碰撞)=1−(999/1000)^99≈0.09430215504；P(任意碰撞)=1−∏[k=0..99](1−k/1000)≈0.99404107337；所选并集界=0.099。
- asymptotic：n∈4N，M=2^(n/2)，N=2^(3n/4)；所选风险≤2^(−n/4)→0；生日指数 M(M−1)/(2N)=[2^(n/4)−2^(−n/4)]/2→∞，故某处碰撞概率→1。
- music：独立 cue sheet 逐段规定乐句；提问的未解决音程、预测留白、全局揭晓、绿色回应、竞争者移入时的中断、稀疏证明与结尾回应均锚定同一实测语音。
- outcome_check：观众能用绿色消息解释 per-message bound；说明其他格子发生碰撞为何不等于本次解码错误。
- next：将每条实际消息的风险平均，再与非典型事件合并。

### `c04-achievability`
- question：如何从 AEP、每条码的碰撞概率和期望界推出存在低错误固定长码？
- requires：AEP、源率 H、选中项 binning bound。
- teaching_sequence：非典型事件概率 + 典型串条件错误相加；随机码平均界 `E_code[P_error]≤P(Xⁿ∉Aεⁿ)+2^(−n(R−H−ε))`；先取 `0<ε<R−H` 固定，再令 n 增大；期望小推出至少有一个码本达到该平均错误界；明确随机码 ensemble 与实际选码的存在性逻辑。
- claims：claim_id=e04-typical-compression-c04_achievability-01; identity=established_result; source coding achievability，Lecture 4 PDF pp. 12–13；不声称随机码本全局无碰撞。
- visual_events：`e1` 锚点“分解总错误”，错误条拆成非典型和典型碰撞两项，保留总长；落点 union bound。`e2` 锚点“固定 ε 再增长 n”，两项曲线分别趋零，码本分布的均值也下降；落点存在好码。
- outcome_check：能说明参数顺序以及期望小为何推出至少一个码本好。
- next：再证明率低于 H 不可能令块错误消失。

### `c05-converse`
- question：为什么可靠固定长度编码必须至少使用约 H bit/符号？
- requires：Fano、源熵、有限码字数与确定编码。
- teaching_sequence：设消息码字最多 `2^(nR)`；解码错误概率 Pe；用 Fano 上界 `H(Xⁿ|Xhatⁿ)`，结合近乎正确重建得 `nH` 不可超过码字熵加小项；除以 n、取极限得到 R≥H；解释 source coding theorem 的边界及误差趋零假设。
- claims：claim_id=e04-typical-compression-c05_converse-01; identity=established_result; 源编码 converse，Lecture 5 PDF pp. 3–5；有限字母 IID 源和 vanishing block error。
- visual_events：`e1` 锚点“码字容量”，所有可用码字计数形成 `nR` 上界条，重建不确定性单独保留；落点 Fano。`e2` 锚点“除以 n”，有限项消失而 H 保留；落点率下界。
- outcome_check：能分辨 achievability 与 converse 各证明哪一侧。
- next：结尾比较 zero-error 与 asymptotically vanishing block error 的不同边界。

### `c06-boundaries`
- question：零错误压缩与错误概率随块长趋零的压缩，允许的码结构有何差异？
- requires：c04/c05 source coding theorem、支持集与块错误定义。
- teaching_sequence：定义 zero-error 对所有正概率序列无混淆；定义渐近可靠的 block error；有限 n 下二者不等价；对 IID 典型源讲 rate 大于 H 的可达与小于 H 的不可达边界；不把临界等号的细节超出定理地断言。
- claims：claim_id=e04-typical-compression-c06_boundaries-01; identity=established_result; Lecture 5 PDF pp. 3–6；边界陈述依赖前章 IID finite-alphabet 及渐近编码设定。
- visual_events：`e1` 锚点“任一支持串”，零错误要求每个都各有码字，支持集保持可见；落点 worst-case。`e2` 锚点“块长增大”，错误区域逐渐变薄但不在有限 n 消失；落点 vanishing-error 与 H 界。
- outcome_check：能指出 vanishing error 并不等于任意有限块长 zero error。
- next：下一集把独立源推广到有记忆过程，以 entropy rate 取代单符号熵。

## Narrative questions and reveals

| Chapter | Question, prediction and visual answer |
|---|---|
| c01 | A biased coin's full-message probability is unknown before the message. Symbol cards arrive successively; the logarithm question at sentence 5 has an extra 2-second hold before the sum appears at sentence 6. Exact binomial distributions distinguish finite probability from convergence. |
| c02 | A small set can carry most mass; two distinct measurements stay visible. The finite Bernoulli(.01), n=6 example opens the chapter: mass .941480149401, counting fraction 1/64. Sentences 5–17 then derive its general counting framework. Sentence 23 asks about a uniform source with an extra 2-second hold; all strings become typical only at sentence 24. A second 2-second hold after sentence 43 precedes computing the average of the three-symbol counterexample. Its weak/strong conclusion remains hidden until justified. |
| c03 | Green-card puzzle and score map are specified in the chapter above. |
| c04 | Randomness proves existence of a good machine; the two error events, positive rate gap and averaging argument supply the answer. A bad assignment is distinguished from failure of the existence proof. |
| c05 | An encoder has 50 bits while the source block has entropy 72.1928 bits in the displayed example. The uncovered budget becomes the finite error floor through Fano. The weak-converse limitation remains explicit. |
| c06 | A Bernoulli(.2) coin asks whether fixed-length zero error still costs one bit per symbol. Sentence 11 adds 2.5 seconds of thinking time; the numerical rate answer appears at sentence 12 and entropy .721928 at sentence 13. The prefix example keeps the same Bernoulli(.2) source. |

Music direction and authored notes are owned by `score-notes.md` and `score-cues.json`. Each prediction's empty-note cue ends at its visual reveal; narration retains natural speed.
