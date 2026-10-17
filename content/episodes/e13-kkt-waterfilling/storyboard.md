# E13｜KKT 与注水分配

## 全片结构

核心问题：总输入功率固定时，如何分给多个独立信道模式以最大化总互信息？受众起点：E08 凹互信息、E11 AWGN 容量、拉格朗日乘子基础；本片建立 KKT 条件与 water-filling。主线先看 DMC 最优输入的 equal-divergence 条件，再推 KKT 的符号/互补性，然后并行 Gaussian modes 与主动集算法，最后用数值残差核验。内容依赖：凹优化、概率单纯形、功率非负和总预算。术语表：KKT（Karush–Kuhn–Tucker）、active constraint（活跃约束）、water-filling（注水）。

## 章节

### `c01-dmc-optimum`
- question：DMC 容量最优输入为何使所有被使用输入到输出分布的 KL 散度相等？
- requires：DMC `W(y|x)`、输入分布、KL、互信息对输入凹。
- teaching_sequence：写 `I=Σ_x p_x D(W_x‖q_Y)`；对 simplex 中正概率坐标求导；最优内部坐标 divergence 相同，未使用坐标不超过该水平；归一化后公共值等于 C；注明边界最优用单侧 KKT 而非所有 x 等号。
- claims：claim_id=e13-kkt-waterfilling-c01_dmc_optimum-01; identity=established_result; DMC capacity optimality condition，Lecture 10 PDF pp. 35–36；finite DMC，边界 active inputs 正确标注。
- visual_events：`e1` 锚点“每一行与输出 q 比较”，行 KL 柱并排，输出分布保留；落点加权互信息。`e2` 锚点“移小量概率质量”，可用输入 KL 水平相等、未用输入标成 ≤；落点最优条件。
- outcome_check：能区分正概率输入等式与零概率输入的不等式条件。
- next：连续功率变量的 KKT 也会给等边际效用条件。

### `c02-kkt`
- question：最大化凹目标且有总功率/非负约束时，KKT 的乘子符号与互补松弛如何定？
- requires：约束优化、梯度、可行性/资格条件。
- teaching_sequence：定义 maximize `f(p)` subject `Σp≤P,p_i≥0`；改写约束统一方向，写 stationarity、primal/dual feasibility 与 complementarity；逐项解释 μ 对功率上限、ν_i 对非负边界；用单变量边界例核对符号；注明凸可行域、凹 f 以及 Slater 等 qualification 保证充分/必要。
- claims：claim_id=e13-kkt-waterfilling-c02_kkt-01; identity=established_result; KKT conditions，Lecture 10 PDF pp. 35–36；符号按 maximize 形式推导，qualification 明示。
- visual_events：`e1` 锚点“写每个约束”，约束面与可行域边界显现并保留目标等高线；落点拉格朗日乘子。`e2` 锚点“边界上 p_i=0”，互补乘积为零，展示 ν_i 允许非零；落点 active set。
- outcome_check：给定一组最优候选能逐项检查四类 KKT 条件。
- next：并行 AWGN 的每个 mode 有对数效用，其导数产生水位规则。

### `c03-parallel`
- question：并行高斯模式的总容量最大化怎样分解为 `Σ ½log₂(1+p_i/N_i)`？
- requires：独立 modes、总功率约束、E11 实 AWGN capacity。
- teaching_sequence：将每 mode 互信息相加；问题是 maximize sum logs subject 总功率 ≤P 和 p_i≥0；解释噪声方差 N_i 不同导致边际收益不同；固定总功率预算；指出 complex mode 的系数/噪声约定需另外声明，本章使用实维模型。
- claims：claim_id=e13-kkt-waterfilling-c03_parallel-01; identity=established_result; parallel Gaussian channel model，Lecture 10 PDF pp. 37–38；real independent modes，sum-power constraint。
- visual_events：`e1` 锚点“拆成本征模式”，每个噪声水平 N_i 单独一列，保留总功率框；落点可分离总目标。`e2` 锚点“比较边际斜率”，低噪声 mode 的初始导数更大；落点为何不能均分。
- outcome_check：能从模式噪声列写目标并指出约束耦合点只有总功率。
- next：令各已用模式边际收益相等即得 water-filling。

### `c04-waterfill`
- question：KKT 如何推出 `p_i=(ν−N_i)^+`，水位 ν 怎样由预算确定？
- requires：c02 KKT、c03 parallel objective、正部函数。
- teaching_sequence：令 λ≥0 为总功率约束的 shadow price；stationarity 给导数 `(1/(2ln2))/(N_i+p_i)=λ` 对活跃 mode 成立，未用 mode 满足导数≤λ。定义水位 `ν=1/(2ln2λ)`，于是 `p_i=(ν−N_i)^+`；求 ν 使功率和为 P，逐步排序并剔除不活跃 mode。λ 与 ν 是不同量，log base 改变 λ 刻度。
- claims：claim_id=e13-kkt-waterfilling-c04_waterfill-01; identity=established_result; water-filling solution，Lecture 10 PDF pp. 38–40；实独立 mode 与 sum-power 条件。
- visual_events：`e1` 锚点“升高水位”，容器底噪声高度各异，水量按 `(ν−N_i)^+` 填入并保留底面；λ 标作边际价格，落点活跃模式集合。`e2` 锚点“调预算到总和 P”，ν 数值变化直到守恒，保留前次分配；落点预算方程。
- outcome_check：给噪声列表能手算活跃集与功率分配。
- next：用讲义计算样例验证残差、容量和均分基准。

### `c05-check`
- question：如何检查水位解满足预算和 KKT，并与等功率方案公平比较？
- requires：c04 水位法、功率/容量计算、数值舍入。
- teaching_sequence：用 `N=(1,2,5), P=6`，得 ν=4.5、`p=(3.5,2.5,0)`，`Σp=6`；活跃/不活跃模式逐项验 KKT 梯度不等式，报预算残差；容量约 `1.6699250` bit/vector-use，等功率容量约 `1.5351947`。同功率同模式对照；数据是公式演算非物理测量。
- claims：claim_id=e13-kkt-waterfilling-c05_check-01; identity=established_result; water-fill numerical example，Lecture 10 PDF pp. 39–40；输入/精确结果见 `docs/mathematical-examples.md`，不是 measured_result。
- visual_events：`e1` 锚点“逐项验约束”，残差条归零并保留各 mode p；落点 KKT audit。`e2` 锚点“比较等功率”，两柱列并排、同一预算锁定；落点容量增益的计算值。
- outcome_check：观众能用残差验证解而非凭水面示意判对。
- next：频率模式连续化后，谱密度的约束变为积分版本。

## 未使用的选择与开启阈值

五处hold对应未使用行散度、正功率互补乘子、第三模式开启阈值、数值例子的干模式及均分比较。噪声底(1,2,5)的第三模式在P=7仍分到零功率，严格超过七才激活；P=9是动画终点，不是开启阈值。在P=9固定时，把第三噪声底由五升高，N₃=6时又关闭。对应音乐进入/退出由同一smoothstep交叉点确定。原DMC可达输出、方向导数/充分性、KKT符号与Slater、矢量高斯归约和所有KKT数值检查保持完整。
