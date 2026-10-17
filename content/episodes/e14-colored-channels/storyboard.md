# E14｜彩色噪声与反馈边界

## 全片结构

核心问题：有记忆的平稳信号/噪声如何经协方差谱分解成频率模式，反馈增益又应按什么单位解释？受众起点：E13 并行 water-filling、有限 Toeplitz 矩阵、PSD；本片建立有限谱近似、连续频域公式和过滤噪声模型。主线从 Toeplitz 特征值到频率积分，再读 filtered channel，最后明确 Cover–Pombra 的离散反馈界限。内容依赖：平稳过程、协方差 Fourier 谱、积分单位。术语表：Toeplitz matrix（Toeplitz 矩阵）、power spectral density（功率谱密度）、colored noise（彩色噪声）、Cover–Pombra feedback bound（反馈界）。

## 章节

### `c01-toeplitz`
- question：有限长平稳高斯向量的协方差为何形成 Toeplitz 矩阵，特征值代表什么？
- requires：自协方差、平稳性、对称矩阵谱分解。
- teaching_sequence：平稳使 `K_ij=r(i−j)`；显示有限 Toeplitz 矩阵；本征向量/本征值给有限块 principal modes；说明有限 n 下近似 Fourier modes 而非严格逐频率独立，需渐近和正则条件。
- claims：claim_id=e14-colored-channels-c01_toeplitz-01; identity=established_result; Toeplitz covariance，Lecture 10 PDF pp. 41–42；实平稳二阶过程。
- visual_events：`e1` 锚点“按 lag 填矩阵”，相同对角线复制同一 r(k)，保留索引；落点 Toeplitz 结构。`e2` 锚点“对角化”，相关样本旋转成无相关 mode，保留变换矩阵；落点 eigenvalues。
- outcome_check：能从 lag covariance 写前三阶矩阵。
- next：大矩阵特征值分布趋向由 PSD 决定的谱分布。

### `c02-spectrum`
- question：Toeplitz 特征值分布如何连接 PSD，使用极限需要哪些假设？
- requires：Fourier series、协方差绝对可和、连续 test function。
- teaching_sequence：定义符号 `S(ω)=Σr(k)e^{-ikω}` 并说明实非负 PSD；在绝对可和协方差、实符号及连续 test function 等充分条件下，特征值经验分布对谱积分收敛；逐一声明有限矩阵特征值与 PSD 值的对应只是渐近分布；不声称覆盖所有平稳过程。
- claims：claim_id=e14-colored-channels-c02_spectrum-01; identity=established_result; Toeplitz eigenvalue distribution，Lecture 10 PDF pp. 41–43；充分条件参 Gray Theorem 4.2 printed pp. 55–56，source-review 已核。
- visual_events：`e1` 锚点“协方差系数 Fourier 合成”，lag 柱变为频率曲线，原系数留作图例；落点 PSD。`e2` 锚点“加大矩阵维数”，特征值直方图逐渐贴合谱值分布，有限 n 波动保留；落点渐近条件标签。
- outcome_check：能说出采用哪个充分正则条件，而不是泛称 stationary 即足够。
- next：模式容量和水位法在连续频谱上变成积分优化。

### `c03-frequency`
- question：频率模式的容量积分为何需要双边频率及 `1/2` 因子，单位怎样核对？
- requires：E12 实连续时间 AWGN、PSD、E13 water-filling、频率单位 Hz。
- teaching_sequence：对 real channel 的正负频率积分容量密度；利用共轭对称将双边积分折成正频率时保留因子；写功率积分约束；由 KKT 得谱水位 `S_X(f)=(μ−S_Z(f))^+`（按讲义约定）；逐项核算两边 Hz 与 bit/s；指出不同单边/双边 PSD 定义需一致换算。
- claims：claim_id=e14-colored-channels-c03_frequency-01; identity=established_result; spectral water-filling 与容量积分，Lecture 10 PDF pp. 37–44；实信号双边谱约定：`C=½∫_R log₂(1+S_X(f)/S_Z(f))df`，`∫_R S_X(f)df=P`，`S_X(f)=(ν−S_Z(f))^+`；任何公式常数标明 convention。
- visual_events：`e1` 锚点“画正负频率”，共轭谱对称，积分范围和 1/2 明示且两侧面积保留；落点 `C=½∫_R...df`。`e2` 锚点“注入频谱功率”，水位跨越噪声谱低谷，功率密度积分保持；再令 `S_Z=N₀/2`、频带 `[-W,W]`，验证均匀最优 `S_X=P/(2W)` 并还原 `Wlog₂(1+P/(N₀W))`；落点连续 water-filling。
- outcome_check：能根据给定 PSD 约定判断是否应乘 1/2，并核对单位为 bit/s。
- next：滤波器会改变有效信号与噪声谱，需先推导等效通道。

### `c04-filter`
- question：经过线性滤波后，输入响应、噪声谱和谱零点怎样决定容量表达？
- requires：LTI transfer function、PSD 乘 `|H(f)|²`、log 积分。
- teaching_sequence：频域写 `Y=H X+N`；输出信号谱受 `|H|²` 加权；白噪声经过接收滤波亦成色噪声；容量模式按有效 SNR 积分；谱零点处可用信号模态消失，不能除零得到虚假无限容量；说明发射/接收滤波器与约束位置需按模型给定。
- claims：claim_id=e14-colored-channels-c04_filter-01; identity=established_result; filtered channel model/capacity，Lecture 10 PDF pp. 43–45；线性时不变模型及噪声 PSD 假设。
- visual_events：`e1` 锚点“滤波器频响”，输入频谱乘 `|H|²`，原谱保留；落点接收信号 PSD。`e2` 锚点“频响出现零点”，有效信噪比凹槽同步显现，积分频带保留；落点不可用 mode。
- outcome_check：能追踪信号和噪声经各自滤波后的谱。
- next：带记忆反馈信道的界限需回到离散模型，不能把 per-use 常数写成 bit/s。

### `c05-feedback-boundary`
- question：Gaussian feedback 的半 bit 增益边界如何按每次实传输量解释，不能推出什么？
- requires：E09 DMC feedback converse、实 AWGN sequence channel、Cover–Pombra 因果反馈和功率约束。
- teaching_sequence：陈述 Cover–Pombra finite-block 高斯反馈模型：因果 noiseless output feedback、平均期望功率；其上下界中的半 bit/因子 2 均按 bits per transmission（real use）度量；解释 feedback 允许输入依赖既往输出，不是 DMC memoryless converse；不可改写为 bandwidth-independent half bit/second，连续时间换算需显式 use rate 和模型。
- claims：claim_id=e14-colored-channels-c05_feedback_boundary-01; identity=established_result; Cover–Pombra 1989 p. 37 的反馈上/下界；source-review 核验其单位与约束。属于 established_result，非连续时间通用定理。
- visual_events：`e1` 锚点“反馈时序”，`Y^{i−1}` 回到当前 `X_i`，未来输出遮蔽，保留因果顺序；落点模型假设。`e2` 锚点“标单位”，半 bit 附着每 real transmission 标记，换成 bit/s 时需乘明确速率；落点限制说明。
- outcome_check：能指出 gain 是 per real use，并列出反馈与功率条件。
- next：收束全课：熵率压缩、容量传输、谱资源分配由共同的信息量账本连接。

### `c06-course-map`
- question：熵率、编码定理、信道容量与谱水位法如何构成一条可复用推理链？
- requires：E04 source coding、E05 entropy rate、E09 channel coding、E13/E14 optimization。
- teaching_sequence：回顾源的典型信息量 `H̄`、可靠传输预算 `C`、所需信道使用数比例；再把 AWGN 容量的可用 modes 替换为谱积分；区分离散 memoryless 定理与平稳遍历扩展、数值示例与证明；展示每一结论的假设入口，不引入新定理。
- claims：claim_id=e14-colored-channels-c06_course_map-01; identity=established_result; 本章综合既有定理，不新增主张；来源物理页为 Lecture 4 PDF pp. 3–13、Lecture 5 PDF pp. 3–19、Lecture 8 PDF pp. 3–12、Lecture 9 PDF pp. 3–13、Lecture 10 PDF pp. 14–45。
- visual_events：`e1` 锚点“从源到信道”，熵率条进入容量预算，保留单位 H̄ bit/source symbol、C bit/use；落点 `mH̄<nC`。`e2` 锚点“连续频谱”，离散 modes 平滑为频率域，保留功率约束与谱水位；落点全课地图。
- outcome_check：能为一个端到端率问题找到所需源定理、信道定理和单位。
- next：课程主线完成；后续若扩展非平稳/非高斯模型，应先声明新的条件与证据。

## Prediction and callback stages

The c01 s18 hold asks whether Toeplitz implies exact finite DFT diagonalization; the n=5 tridiagonal example and sine vector answer at s28. The c02 s27 hold asks how two fixed water levels constrain the finite solution; monotonicity and narrowing brackets answer at s28–29. The c04 s19 hold asks whether receive amplification improves a ratio when it multiplies both spectra; s20 cancels the nonzero factor. The c05 s17 hold tests the unit of the half-bit term; s18–21 specify real uses and the additional rate needed for continuous time. The c06 s17 hold tests whether a necessary weak inequality proves achievability at its boundary; s18 preserves the separate equality analysis. The closing return matches source and channel information budgets, then applies their hypotheses.
