# E12｜带宽、功率与能量

## 全片结构

核心问题：实连续时间 AWGN 每秒可传多少 bit，扩大带宽和降低每 bit 能量有何边界？受众起点：E11 bits/real use、信号功率/噪声 PSD；本片建立约 `2WT` 实维数、带宽容量和能量效率。主线从时间带宽自由度数换算容量，再看 wideband 极限和 `E_b/N₀` 曲线。内容依赖：连续时间采样/自由度解释、双边 PSD、log 极限。术语表：bandwidth（带宽）、spectral efficiency（频谱效率）、energy per bit（每 bit 能量）。

## 章节

### `c01-dimensions`
- question：带宽 W 持续 T 秒为何约有 `2WT` 个实自由度？
- requires：Hz=cycles/s、Nyquist 采样、实带通信号模型。
- teaching_sequence：以低通实基带信号、频率支持 `[-W,W]`、时长 T 的自由度近似 `2WT`；解释每 Hz 每秒约两实维；说明精确严格带限有限时区信号并非有限维，故 `2WT` 是 Shannon time-bandwidth 近似/渐近观点，非任意波形精确等式。
- claims：claim_id=e12-bandwidth-energy-c01_dimensions-01; identity=established_result; 时间带宽维数，Lecture 10 PDF pp. 30–32；适用的近似信号空间模型。
- visual_events：`e1` 锚点“增加频率上限”，时频平面可用格点增加，保留 T 窗；落点约 2WT。`e2` 锚点“严格带限尾部”，窗口外振铃仍可见，避免把有限时长截断画成精确限带；落点近似标签。
- outcome_check：能将 W、T 乘积转成实维数量级并说出近似边界。
- next：每个实维承载 E11 的 bit/use 容量。

### `c02-capacity`
- question：从每实使用的 `½log₂(1+P/N)` 如何得到每秒 `Wlog₂(1+P/(N₀W))`？
- requires：E11 AWGN capacity、约 2W real uses/s、双边 PSD `N₀/2`。
- teaching_sequence：对低通 `[-W,W]` 区间采用约 `2W` 个实正交系数/秒；均匀分配时每个系数输入二阶矩为 `P/(2W)`，白噪声双边 PSD `N₀/2` 给每系数方差 `N₀/2`，故 SNR 比为 `P/(N₀W)`；每系数容量 `½log₂(1+P/(N₀W))`，乘 `2W` 得 bit/s。区分每次使用方差与总功率，并注明 1/2 的来源；source-review 禁止把 bit/use 加常数直接当 bit/s。
- claims：claim_id=e12-bandwidth-energy-c02_capacity-01; identity=established_result; 连续时间实 AWGN 容量换算，Lecture 10 PDF pp. 30–32；单位 bits/s、real channel、two-sided PSD N₀/2。
- visual_events：`e1` 锚点“带宽变成使用率”，2W 实维/s 与单用公式并列，保留两因子；落点 W log 公式。`e2` 锚点“噪声积分双边谱”，正负频域面积合并并标 PSD N₀/2；落点 N₀W。
- outcome_check：能从 bit/use 换算 bit/s 并追踪两个因子 1/2。
- next：让 W 增大时单位带宽容量下降、总容量趋向有限功率极限。

### `c03-wideband`
- question：固定 P,N₀ 时 W→∞ 为何容量趋 `P/(N₀ ln2)`，而不是无限增长？
- requires：c02 capacity、`ln(1+x)≈x`、线性单位换算。
- teaching_sequence：令 `x=P/(N₀W)`；总容量 `W log₂(1+x)`；小 x 展开得极限 `P/(N₀ln2)` bit/s；频谱效率 C/W→0；说明每秒容量饱和但带宽无限增加，不声称有限 W 已达到极限。
- claims：claim_id=e12-bandwidth-energy-c03_wideband-01; identity=established_result; wideband limit，Lecture 10 PDF pp. 32–34；固定 P 与 N₀。
- visual_events：`e1` 锚点“增大 W”，工作点沿归一化带宽 u=.1→6 移动，同时显示 C/(P/N₀) 上升而 C/W 下降；落点乘积曲线趋平。`e2` 锚点“展开 log”，Taylor 首项与高阶余项显式保留；落点极限。
- outcome_check：能说清固定的是总功率，而不是每 Hz 功率。
- next：把容量归一到每个 bit，得到能量效率边界。

### `c04-energy`
- question：`E_b/N₀` 与频谱效率如何关联，低频谱效率最低能量极限是什么？
- requires：C/W、每 bit 能量定义、log₂关系。
- teaching_sequence：令 `η=C/W`，由 Shannon 得 `P/(N₀W)=2^η−1`；`E_b/N₀=P/(N₀C)=(2^η−1)/η`；η→0 得 ln2；说明功率/噪声谱密度定义及单位，曲线为公式数值不是测量；有限星座和编码限制可高于极限。
- claims：claim_id=e12-bandwidth-energy-c04_energy-01; identity=established_result; spectral efficiency-energy relation，Lecture 10 PDF pp. 32–34；实 AWGN 连续时间设定。
- visual_events：`e1` 锚点“除以 bit rate”，P、C 比值重组为每 bit 能量，保留 η 定义；落点比值公式。`e2` 锚点“η 趋零”，曲线趋 ln2 且有限 η 点保留；落点理论下界。
- outcome_check：给定 η 能代公式计算归一化能量，并识别低效率极限。
- next：调制信号的实际能量效率要与假设曲线比较。

### `c05-signaling`
- question：调制方式的能量/频谱效率曲线依赖哪些输入、编码与解调假设？
- requires：E11 BPSK/受限输入、E12 `E_b/N₀` 定义。
- teaching_sequence：对 BPSK 及讲义列出的 signaling 例分别定义符号率、带宽、编码/检测假设；把计算曲线与 Gaussian-input Shannon frontier 分开展示；注明 hard/soft decision 和 uncoded/coded 设置；没有明示条件的点不外推为普适效率定理。
- claims：claim_id=e12-bandwidth-energy-c05_signaling-01; identity=established_result; 调制效率例，Lecture 10 PDF pp. 25–34；公式演算值明确标作计算结果，非 measured_result；具体曲线列假设。
- visual_events：`e1` 锚点“选择调制”，QAM、PAM、PSK、DPSK 星座及正交余弦模式逐个出现，标签说明代表的信号族。`e2` 锚点“比较假设”，显示来源误差目标与带宽、符号率、码率、检测器的缺失条件；保留 Shannon 容量公式作为独立基准。该章不重建未定义条件的数值性能曲线。
- outcome_check：能在读曲线前先说出其调制和检测假设。
- next：功率与带宽互换的代价由 Shannon 的 tradeoff 曲线统一表达。

### `c06-tradeoff`
- question：有限带宽、有限功率下容量怎样权衡，极限不能同时免费取得什么？
- requires：capacity expression、wideband limit、spectral efficiency。
- teaching_sequence：固定 N₀ 时绘制 C(W,P)；固定 W 增功率对数增长，固定 P 增 W 有饱和；用两个极限说明 bandwidth 与 energy efficiency 的资源代价；若比较 bandwidth-independent feedback 增益，需按下集频域/离散模型单位谨慎限定。
- claims：claim_id=e12-bandwidth-energy-c06_tradeoff-01; identity=established_result; capacity tradeoff，Lecture 10 PDF pp. 30–34；曲线标为公式评估而非实验测量。
- visual_events：`e1` 锚点“沿固定 P 移动”，工作点沿左图 u=.1→6 移动，数值显示归一化速率上升与 η 下降；保留固定资源与宽带极限。`e2` 锚点“沿固定 W 移动”，右图工作点随 SNR=.1→16 移动，显示功率增加时频谱效率按 log 增长；两个终点保留用于比较。
- outcome_check：能区分增加带宽与增加功率各自对 C、η 的效果。
- next：并行信道的最优功率分配把总体功率预算分配到有利模式。

## 带宽与能量预测

开场提出总功率固定时无限带宽能否给出无限速率。五处hold分别对应c01 s6的2WT精确性、c02 s18的实高斯二分之一、c03 s0的无限带宽、c04 s14的能量趋零以及c05 s24的信号族比较假设。原有效模式/PSWF适用范围、P/(2W)与N₀/2归一化、对数极限和ln2正阈值推导保持完整。能量一阶展开在s15明确给出；−1.591745 dB在原结论句出现。未指定脉冲/检测/编码的参考曲线继续只作定性说明。
