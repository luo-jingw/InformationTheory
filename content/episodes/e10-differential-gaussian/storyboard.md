# E10｜微分熵与高斯界

## 全片结构

核心问题：连续变量的密度如何量化不确定性，协方差为何令高斯成为最大熵分布？受众起点：E02 KL/Gibbs、有限变量熵、Jacobian；本片建立 differential entropy、协方差和高斯界。主线从量化格距解释 differential entropy 可为负，到变量变换与 MI 不变，再用 KL 证明 Gaussian maximum entropy 并连接连续 AEP。内容依赖：密度积分、微积分、正定矩阵。术语表：differential entropy（微分熵）、covariance（协方差）、Gaussian maximum entropy（高斯最大熵）、continuous AEP（连续 AEP）。

## 章节

### `c01-density`
- question：连续密度的 `h(X)=−∫f log₂f` 为什么能为负，量化格距给出什么解释？
- requires：概率密度、积分、离散熵。
- teaching_sequence：宽均匀分布令密度小于1而 h>0，窄均匀令 h<0；量化格距 Δ 下离散熵约 `h(X)+log₂(1/Δ)`；差异单位依赖坐标尺度，所以 differential entropy 不具离散熵的非负/坐标不变性；说明绝对连续和积分存在条件。
- claims：claim_id=e10-differential-gaussian-c01_density-01; identity=definition; density entropy 与量化关系，Lecture 10 PDF pp. 14–16；选择有界均匀例演算。
- visual_events：`e1` 锚点“缩窄同一分布族”，密度峰变高、宽度变小，面积保持一；落点 h 可变负。`e2` 锚点“细分量化格”，离散柱熵增长同时减去 `log(1/Δ)`；落点连续极限解释。
- outcome_check：能解释微分熵负不代表概率为负。
- next：变量变换公式显示尺度变化怎样进入熵。

### `c02-transform`
- question：可逆光滑变换如何通过 Jacobian 改变 differential entropy，互信息为何不变？
- requires：密度变换、Jacobian 行列式、联合熵。
- teaching_sequence：推 `h(g(X))=h(X)+E log₂|det J_g(X)|`；缩放 `aX` 得 `h(X)+d log₂|a|`；对 `(X,Y)` 分别变换，Jacobian 项在 MI 熵差中抵消；条件是双射可微、Jacobian 非零及积分存在。
- claims：claim_id=e10-differential-gaussian-c02_transform-01; identity=established_result; change-of-variables 与 MI 不变性，Lecture 10 PDF pp. 14–16；仅可逆变换。
- visual_events：`e1` 锚点“拉伸坐标”，小概率体积元随 det J 缩放，保留原密度质量；落点 Jacobian 项。`e2` 锚点“代入互信息差”，两项尺度修正相消，保留联合/边缘两路；落点 invariance。
- outcome_check：能对一维缩放算熵变化，并指出 MI 中抵消机制。
- next：固定协方差后，高斯提供熵上界。

### `c03-covariance`
- question：协方差矩阵如何通过旋转本征轴呈现多维高斯的体积尺度？
- requires：均值、协方差、对称矩阵谱分解、椭球。
- teaching_sequence：定义 `K=E[(X−μ)(X−μ)^T]`；正交对角化为主轴方差；椭球体积由 `det K` 控制；说明 `K≻0` 才有全维高斯密度，奇异情形分布落在低维子空间，普通 Lebesgue differential entropy 公式不适用。
- claims：claim_id=e10-differential-gaussian-c03_covariance-01; identity=definition; 协方差谱分解解释，Lecture 10 PDF pp. 16–17；正定与半正定区别按 source-review。
- visual_events：`e1` 锚点“转动坐标轴”，云团协方差椭圆旋到特征向量轴，原坐标轴保留；落点本征值方差。`e2` 锚点“一个特征值趋零”，椭球压成薄片并失去全维体积；落点奇异协方差边界。
- outcome_check：能从本征值判断高斯密度是否全维。
- next：用高斯作参照分布，Gibbs 不等式立即给最大熵。

### `c04-gaussian`
- question：为何固定均值和正定协方差时 Gaussian 最大化 differential entropy？
- requires：E02 KL 非负、Gaussian 密度公式、协方差迹恒等式。
- teaching_sequence：取同均值协方差的 Gaussian q；写 `D(f‖q)≥0`；代入 `−log q` 的二次型期望只依赖均值/协方差，整理出 `h(X)≤(1/2)log₂((2πe)^d det K)`；等号 f=q；Hadamard determinant bound 的对角等号需适当零/非零条件，避免奇异情形两边同为零却误判相等。
- claims：claim_id=e10-differential-gaussian-c04_gaussian-01; identity=established_result; Gaussian maximum entropy 与 Hadamard，Lecture 10 PDF p. 17；全维公式要求 `K≻0`；退化界等号依 source-review 限定。
- visual_events：`e1` 锚点“代入 Gaussian log density”，二次项按协方差迹化简，保留积分项；落点上界。`e2` 锚点“KL 等号”，两密度逐渐重合且协方差固定；落点仅 Gaussian 达等号。
- outcome_check：能说出证明使用 KL 非负和同协方差，非只靠钟形图。
- next：最大熵界可转成估计下界与连续变量典型体积。

### `c05-maximum`
- question：高斯最大熵怎样约束微分熵差、互信息及估计误差？
- requires：c04 高斯最大熵、条件微分熵、估计函数 `g(Y)`。
- teaching_sequence：对任意估计器 `g(Y)` 令 `E=X−g(Y)`；给定 Y 时平移不改条件熵，所以 `h(X|Y)=h(E|Y)≤h(E)≤½log₂(2πe E[E²])`。整理得 `E[(X−g(Y))²]≥2^{2h(X|Y)}/(2πe)`；声明标量误差、条件熵存在及有限二阶误差。无观测时 g 为常数才可使用 `h(X)` 版本；不对可依赖 X 的随机估计器声称无条件界，也不额外要求独立噪声。
- claims：claim_id=e10-differential-gaussian-c05_maximum-01; identity=established_result; Gaussian maximum entropy 与估计误差下界，Lecture 10 PDF pp. 17–18；标量条件熵和有限二阶误差。
- visual_events：`e1` 锚点“减去估计值”，X 与 g(Y) 平移成误差 E，给定 Y 的熵不变；保留条件信息；落点 `h(X|Y)=h(E|Y)`。`e2` 锚点“逐步放松”，条件熵≤无条件误差熵≤同方差 Gaussian 熵，前态逐级保留；落点 MSE 下界。
- outcome_check：能区分最大熵给出的上界与某个估计器的可达性能。
- next：连续 AEP 把微分熵变成高维体积增长率。

### `c06-continuous-aep`
- question：连续 IID 源的典型集为何体积约 `2^{nh(X)}`，何时该表述成立？
- requires：c01 differential entropy、IID、对数似然 LLN。
- teaching_sequence：连续 AEP 由 `−(1/n)log f(Xⁿ)→h(X)` 推得典型密度约 `2^{-nh}`；典型区概率近一，故体积指数约 `2^{nh}`；微分熵可负时体积指数仍由密度单位共同决定；说明连续 AEP 的可积/正则条件并非任意密度自动满足。
- claims：claim_id=e10-differential-gaussian-c06_continuous_aep-01; identity=established_result; continuous AEP，Lecture 10 PDF pp. 18–19；按讲义规定的 IID 与对数密度期望/LLN 条件。
- visual_events：`e1` 锚点“高维样本对数密度”，n 个 log density 求平均趋 h，保留 LLN 波动；落点典型密度。`e2` 锚点“质量除以密度”，近一质量除以典型高度得到体积尺度；落点 `2^{nh}` 及条件标签。
- outcome_check：能指出连续典型体积与离散典型序列数量的对应及单位限制。
- next：将高斯熵界用到离散时间 AWGN 编码率。

## 标尺、预测和精确体积

开场用同一物理区间的厘米/米标尺。坐标宽度1/.01，密度1 cm⁻¹/100 m⁻¹，微分熵0/−6.643856 bits。两把标尺长度相同，端点单位明确；停顿后才说明物理概率未变，随后保留原有密度定义和完整推导。

另外五处hold对应雅可比项在互信息中是否抵消、小特征值到零、高斯与同均值方差均匀密度的熵比较、估计例子中的全部取等，以及概率一能否伴随体积趋零。雅可比的联合/边缘说明移到右侧空间，与底部公式分开。

连续AEP最后用U[0,1/4]的精确块支持集回答负熵问题：h=−2，密度4ⁿ，体积4⁻ⁿ，概率一。n=1..4条形图绘制数值坐标体积；它们不充当高维形状投影。一般AEP的绝对可积条件与两侧体积界仍保留。

高斯KL非负、迹计算、Hadamard正定取等条件、奇异半正定反例和条件熵到MSE的完整推导保持原有范围。
