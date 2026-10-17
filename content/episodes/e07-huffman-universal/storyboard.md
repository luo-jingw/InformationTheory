# E07｜Huffman 与通用压缩

## 全片结构

核心问题：已知分布时怎样构造最短前缀码，未知分布时又怎样避免错配？受众起点：E02 KL，E06 Kraft/Shannon 码；本片现场复习码树并建立 Huffman、SFE、universal coding、LZ78。内容依赖：源概率、前缀码、平均长度。术语表：Huffman coding（Huffman 编码）、universal coding（通用编码）、Shannon–Fano–Elias（SFE 编码）、LZ78（Lempel–Ziv 78）。

## 章节

### `c01-shannon-mismatch`
- question：Shannon 码与真分布的平均代价如何由 KL 散度精确表示？
- requires：E06 `l_i=ceil(−log q_i)`、E02 KL、真实源 P。
- teaching_sequence：真实 P 产生符号而码按 Q 取长度；连续理想长度期望为 `H(P)+D(P‖Q)`；整数 ceiling 增加小于 1 bit/符号；解释真分布匹配时接近熵，错配代价不对称；零 Q 概率导致无穷。
- claims：claim_id=e07-huffman-universal-c01_shannon_mismatch-01; identity=established_result; mismatched coding/KL 关系，Lecture 7 PDF pp. 3–5；有限离散源及支持覆盖。
- visual_events：先展示固定100符号清单的三本码表与200/170/150比特账单，第三句后的预测暂停只显示第一本账单。随后 `e1` 锚点“按真实 P 加权码长”，每符号长度乘 P 并堆叠，P/Q 保留并列；落点 H+KL。`e2` 锚点“移开模型 Q”，高概率符号成本上升并显示零支持无穷；落点 mismatch penalty。
- outcome_check：能区分 entropy 基线与 KL 额外成本。
- next：若 P 不知道，需要对模型不确定性也保持低冗余。

### `c02-huffman`
- question：Huffman 为何每次合并最小概率两项，就能构造最优二元前缀码？
- requires：前缀树、叶深度加权长度、最优子结构直觉。
- teaching_sequence：在最优树中证明两个最小概率符号可安排为最深兄弟叶；合并成概率和的伪符号，深度代价增加 `p_i+p_j`；对子问题递归。用 `(.4,.2,.2,.1,.05,.05)` 计算例，熵约 `2.2219281`、Huffman 均长 `2.3` bit/symbol。D 元码每次合并 D 项；必要时补零权重叶，使调整后叶数 `m'` 满足 `(m'−1) mod (D−1)=0`。数值为有限演算。
- claims：claim_id=e07-huffman-universal-c02_huffman-01; identity=established_result; Huffman algorithm，Lecture 7 PDF pp. 8–12；演算数值见 `docs/mathematical-examples.md`；D-ary 补零条件明确。
- visual_events：`e1` 锚点“选两个最小权重”，活动概率队列每步删除两项并加入合并父项，在首次合并与三个0.20项的平局处停顿，保留已合并节点；落点权重和。`e2` 锚点“回溯树”，叶深转为码字，保留树枝；落点 prefix code。
- outcome_check：手算一组概率合并并验证平均长度。
- next：交换论证和归纳把算法变成最优性证明。

### `c03-optimality`
- question：为什么 Huffman 的兄弟叶交换不增成本，递归合并因此保证全局最优？
- requires：c02 Huffman 构造、prefix code 最优树存在。
- teaching_sequence：取两个最小概率符号；任意最优前缀树可将最深兄弟叶标签交换到它们，因权重最小而不增加权路径长度；合并兄弟为伪叶，深度成本差固定为两者概率和；归纳最优子树，拆分即 Huffman；分别标识交换、归约和归纳假设。
- claims：claim_id=e07-huffman-universal-c03_optimality-01; identity=established_result; Huffman optimality proof，Lecture 7 PDF pp. 9–12；有限二元前缀码树。
- visual_events：`e1` 锚点“把小概率移到最深处”，标签交换而树形保留，旧深度留作对照；落点代价不增。`e2` 锚点“合并再拆开”，双叶压成伪叶，代价差显式标 `(p_i+p_j)`；落点归纳步骤。
- outcome_check：能指出“贪心选择”需要的交换性质，而非只凭每轮局部最小断言最优。
- next：已知概率码最优，累积分布也能直接构造接近最优码。

### `c04-sfe`
- question：Shannon–Fano–Elias 如何用累积概率区间给每个符号分配前缀码？
- requires：符号概率、累积概率、二进制展开和 Kraft。
- teaching_sequence：对符号 i 取区间中点 `F(i−1)+p_i/2`；截取约 `ceil(log₂(1/p_i))+1` 位；说明区间宽度保证码字区间不交叠，故前缀可解；比较 Shannon 码多一位开销，避免把截断二进制边界歧义忽略。
- claims：claim_id=e07-huffman-universal-c04_sfe-01; identity=established_result; SFE 构造，Lecture 7 PDF p. 13；正概率排序和精确区间约定。
- visual_events：`e1` 锚点“累积分区间”，单位线段按概率切割，中点与边界保留；落点二进制码。`e2` 锚点“增加保护位”，每符号码区间嵌入所属概率段，不相交关系一直可见；落点前缀性质。
- outcome_check：给两三符号概率能算累积中点并说明额外位用途。
- next：SFE 仍需模型概率；LZ78 从数据本身逐渐学习重复短语。

### `c05-universal`
- question：通用编码的“通用”对哪些模型类别、以什么冗余标准成立？
- requires：已知分布编码、KL mismatch、渐近平均长度。
- teaching_sequence：区分对每个固定源渐近冗余小与逐块对所有源零冗余；未知 P 时估计模型会产生代价；比较 minimax/源类平均基准的概念；引入有限字母 IID 类作例，不将 universal 说成无假设或逐样本最优；把结论限定到具体编码定理随后再证。
- claims：claim_id=e07-huffman-universal-c05_universal-01; identity=established_result; universal coding 与冗余概念，Lecture 7 PDF pp. 6–7；该章仅界定问题，不声称统一率定理。
- visual_events：`e1` 从两个候选信源P₁=(.8,.1,.1)、P₂=(.1,.8,.1)和两本码长(1,2,2)/(2,1,2)开始；停顿后显示互换的1.2/1.9代价矩阵，再转为减去熵的冗余。该有限矩阵不表示未证明的渐近曲线或全局minimax最优性。`e2` 锚点“改变性能基准”，pointwise 与 minimax 两条线分开；落点通用范围必须写明。
- outcome_check：能问出通用针对哪个 source class、何种冗余、何种极限。
- next：LZ78 用在线词典示范不依赖预先 P 的具体机制。

### `c06-lz78`
- question：LZ78 如何用已见短语构造新词条，解码器如何同步恢复原串？
- requires：有限字母串、前缀词典、指针/新增符号表示。
- teaching_sequence：从根空短语出发，扫描最长已在词典前缀再附新符号；输出 `(index,symbol)` 并加入词条；用短串完整跑编码与解码，逐步验证同步；讨论有限序列尾部特殊处理，并说明渐近压缩性质另有条件，不从单例演示推出定理。
- claims：claim_id=e07-huffman-universal-c06_lz78-01; identity=established_result; Lempel–Ziv 78 构造，Lecture 7 PDF p. 14；编码/解码词典按相同顺序更新。
- visual_events：`e1` 锚点“遇到新延伸”，输入游标保留历史，词典表加入新项；未生成的记录和词条隐藏；在下一记录和尾部处理处停顿；落点指针+符号输出。`e2` 锚点“解码同一输出”，两端词典逐项同步扩展并还原字串；落点 round trip。
- outcome_check：观众能手动编码下一条短语并在解码侧找到相同词典项。
- next：转入信道编码，将信息率与噪声下的可靠传输联系。

## 预测与回扣

本片九个显式hold分别对应短码字分配、第一次Huffman合并、0.20平局、深叶交换、SFE包含关系、双源码选择、LZ78下一记录、末尾词条和七比特输入的实际账单。完整的错配/取整界、Huffman存在与交换归纳证明、D元补零、SFE区间证明、universality定义及LZ78逐项解码均保留。末尾12个原始字段比特大于7个输入比特，有限例子说明词典机制及开销，不据此宣称压缩定理。
