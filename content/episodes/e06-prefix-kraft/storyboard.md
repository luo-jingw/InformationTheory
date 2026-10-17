# E06｜前缀码与 Kraft 界

## 全片结构

核心问题：唯一可译码如何约束码树叶深，从而限制平均码长？受众起点：离散信源概率、二进制树、熵；本片区分码的性质并建立 Kraft–McMillan 与 Shannon 长度。主线从无歧义解码到树叶容量，再证明下界并构造近熵码。内容依赖：E01 entropy、E02 KL/Gibbs、E04 block coding。术语表：nonsingular（非奇异）、uniquely decodable（唯一可译码）、prefix-free（前缀码）、Kraft inequality（Kraft 不等式）。

## 章节

### `c01-decoding`
- question：非奇异、唯一可译码和前缀码分别保证什么，蕴含关系如何？
- requires：有限码字集合、串接编码、树路径。
- teaching_sequence：定义非奇异为符号码字不同；UD 为任意码字串接仅一种解析；prefix-free 为无码字是另一者前缀；证明前缀码可瞬时译码且 UD，画 `0,01` 展示非前缀可能仍 UD；不把“非前缀”误作“非 UD”。
- claims：claim_id=e06-prefix-kraft-c01_decoding-01; identity=definition; 代码分类，Lecture 5 PDF pp. 20–21、Lecture 6 PDF pp. 3–7；具体示例需按串接唯一性检查。
- visual_events：`e1` 锚点“收到一串比特”，沿树逐位下行，前缀叶立即停止并保留路径；落点瞬时译码。`e2` 锚点“短码是长码前缀”，展示非前缀但可唯一分段的实例，对照歧义分段；落点区分概念。
- outcome_check：给定码集能分别判断三种性质及蕴含方向。
- next：树叶深度必须满足 Kraft 总量限制。

### `c02-kraft`
- question：二叉树中深度为 `l_i` 的叶，为何满足 `Σ2^(−l_i)≤1`，反向构造何时成立？
- requires：前缀树、二进制深度、几何级数/树容量。
- teaching_sequence：把每个深度 l 叶扩展到共同深度 L，占 `2^(L−l)` 个末端；叶不重叠推出和不超过 `2^L`；再说明 Kraft 条件可构造 prefix code，按长度递增分配 dyadic intervals/树叶；清楚区分必要性和充分性。
- claims：claim_id=e06-prefix-kraft-c02_kraft-01; identity=established_result; Kraft theorem，Lecture 6 PDF pp. 8–11；对 D 元码换底为 D。
- visual_events：`e1` 锚点“叶扩展到同一层”，深叶覆盖一个格、浅叶覆盖多个格，先前叶覆盖持续可见；落点总格不超满树。`e2` 锚点“分配长度”，按指定长度逐个占空位，保留已占叶；落点反向构造。
- outcome_check：能将长度列表代入 Kraft 和并判断必要限制。
- next：任意 UD 码虽非前缀，其长度仍需满足同一不等式。

### `c03-mcmillan`
- question：McMillan 证明怎样用长串可解析性导出 UD 码的 Kraft 必要条件？
- requires：UD 定义、码字长度、渐近计数。
- teaching_sequence：令 `K=Σ_i2^(−l_i)`，`l_min,l_max` 为码字最短/最长长度。拼接 k 个码字，按总 bit 长 j 分组，记数量 `A_j`；UD 保证它们是不同二进制串，故 `A_j≤2^j`。因此 `K^k=Σ_j A_j2^(−j)≤k(l_max−l_min)+1`（总长度 j 仅在 `k l_min…k l_max` 的线性多个整数上）；取 k 次根并令 k→∞，得到 `K≤1`。明确 UD 是计数一一性的关键，不套用 prefix-tree 论证。
- claims：claim_id=e06-prefix-kraft-c03_mcmillan-01; identity=established_result; McMillan inequality 证明，Lecture 6 PDF pp. 8–11；假设有限码且 uniquely decodable。
- visual_events：`e1` 锚点“拼接 k 个码字”，不同消息路径按总长 j 分层并由 UD 分配到 2^j 个串位，保留分层计数；落点 `A_j≤2^j`。`e2` 锚点“取 K 的 k 次方”，权重求和约去 `2^j` 并留下线性项，旧式保留；落点开 k 次方极限 `K≤1`。
- outcome_check：能指出证明需要 UD 保证不同消息串不映成同一串。
- next：Kraft 下界结合 Gibbs 给出平均长度至少 H。

### `c04-length`
- question：满足 Kraft 条件的任意码，其平均长度为什么不小于源熵？
- requires：Kraft/McMillan、概率 p_i、KL 非负。
- teaching_sequence：设 `q_i=2^(−l_i)/K`，Kraft K≤1；由 `D(P‖q)≥0` 得 `L≥H−log K≥H`；处理 K=0 不可能覆盖正概率符号；等号要求 dyadic 概率匹配；解释整数长度使一般不等号严格。
- claims：claim_id=e06-prefix-kraft-c04_length-01; identity=established_result; 平均长度下界与等号结构，Lecture 6 PDF pp. 12–13；依赖 E02 Gibbs inequality。
- visual_events：`e1` 锚点“把长度变成 q”，概率质量条转为 `2^-l` 条并按 K 归一，保留 P 与 q；落点 KL 代数式。`e2` 锚点“比较总长度”，熵基线与平均码长并列，标出 K≤1 的额外项；落点 L≥H。
- outcome_check：能从 Kraft 归一化分布写出 KL 并得到长度下界。
- next：Shannon 取整长度构造把额外代价压到每符号不足一 bit。

### `c05-shannon`
- question：`l_i=ceil(−log₂p_i)` 怎样同时满足 Kraft 并保证 `H≤L<H+1`？
- requires：c02 Kraft 构造、c04 长度界、块独立源。
- teaching_sequence：由 ceiling 得 `2^-l_i≤p_i` 推出 Kraft；逐项有 `−log p_i≤l_i<−log p_i+1`；取期望得界；把 n 个源符号作为一个超符号编码，块熵 nH，摊回每符号 overhead 小于 `1/n`；说明实际码仍需前缀构造。
- claims：claim_id=e06-prefix-kraft-c05_shannon-01; identity=established_result; Shannon code/块扩展，Lecture 6 PDF pp. 13–15；IID 块熵可加。
- visual_events：`e1` 锚点“向上取整”，连续理想长度到整数阶梯，保留舍入差；落点逐符号界。`e2` 锚点“把 n 个符号打包”，块 overhead 仍小于 1 bit 后除以 n，保留原单符号基线；落点趋近熵。
- outcome_check：给定 p 能算取整长度并验证 Kraft 与长度范围。
- next：下一集比较实际 Shannon 码、Huffman 最优合并和未知分布下的通用码。

## Prepared narrative revision

The first chapter starts with the explicit 010 decoding puzzle under A=0/B=01/C=10. It reveals A,C and B,A after a three-second prediction hold, motivates nonsingularity and unique decoding, removes C and proves the remaining non-prefix code uniquely decodable, then repairs the codebook to 0/10/11 and decodes 01011 as A,B,C. Its visible tree walk returns to the root at each leaf. The proof compares first codeword boundaries and removes their forced common first word. The implication chain and both counterexamples remain explicit.

The Kraft chapter asks how many depth-L slots a depth-l leaf reserves, holds, then derives the slot count and inequality. Dyadic intervals appear one at a time with their placement argument. Kraft guarantees existence for a length list; the two codebooks of lengths (1,2,2) show that it does not validate arbitrary chosen labels. McMillan asks about the k-th-root limit before showing its analytic curve. The exact counting and asymptotic proof remain complete.

Expected-length penalties remain visible as separate colored contributions. The equality question precedes the P=q/K=1 conditions and the example where both penalties vanish. Shannon rounding asks for the extra distance before the strict less-than-one bound. The final framing experiment compares a known deterministic block, an unknown source count whose empty words all coincide, and a nonempty code making the count visible. The written music direction names each prediction silence and mathematical or visual turning point. All timing, sound and browser observations remain pending production.
