# E09｜信道编码定理

## 全片结构

核心问题：噪声信道的可靠传输率为何恰好由最大互信息决定，反馈与分离又怎样改变解释？受众起点：E04 AEP/随机编码/Fano、E08 DMC capacity；本片建立码率、平均/最大错误、联合典型性和操作定理。主线先达成，再 converse，随后分离与反馈边界。内容依赖：DMC memoryless、有限字母源、错误概率。术语表：code rate（码率）、average/maximal error（平均/最大错误）、expurgation（剔除）、separation（分离定理）、feedback（反馈）。

## 章节

### `c01-code`
- question：一个 block code 如何定义消息、码字、解码器、码率和错误概率？
- requires：有限消息集合、DMC、随机输出。
- teaching_sequence：长度 n 编码映射 `f:{1,…,M}→Xⁿ`、解码 `g:Yⁿ→message`；`R=(1/n)log₂M`；分别定义平均错误（均匀消息）与最大条件错误；MAP/ML 在均匀先验时等价，非均匀时 MAP 加先验；指出编码可随机但本片定理先讲确定码。
- claims：claim_id=e09-channel-coding-c01_code-01; identity=definition; 码与错误定义，Lecture 9 PDF pp. 7–13；先验条件写明。
- visual_events：`e1` 锚点“一个消息走 n 次信道”，消息表映到码字点列，保留 M 与 n 标记；落点码率。`e2` 锚点“接收后判决”，条件输出分布汇到解码区域，错误区域不消失；落点 error measure 区别。
- outcome_check：能从 M,n 算 R 并区分平均与最大错误。
- next：随机码本通过联合典型性让正确码字易认、错误码字难碰。

### `c02-joint`
- question：联合典型性如何同时检验输入输出是否符合信道，又界定错误候选？
- requires：AEP、联合分布、条件典型集与信道记忆无关。
- teaching_sequence：采用讲义的 weak joint typicality：分别要求 `xⁿ`、`yⁿ` 的 marginal surprisal 接近各自熵，并要求 `−(1/n)log P(xⁿ,yⁿ)` 接近联合熵；不以经验联合频率定义替代。真实对不典型概率趋零。随机码本中错误码字独立生成于真实信道输出，ensemble 条件下二者精确独立；由独立序列联合典型性界得到约 `2^{-n(I−δ)}`，不是把依赖近似成独立。
- claims：claim_id=e09-channel-coding-c02_joint-01; identity=established_result; weak joint typicality lemma，Lecture 10 PDF pp. 3–9；有限字母 IID 输入与 DMC。
- visual_events：`e1` 锚点“信道产生输出”，真实配对在 joint-count 窗内聚集，边际保留；落点真实对高概率。`e2` 锚点“试错码字”，独立输入与既定输出碰入典型区的概率条缩小；落点指数误匹配界。
- outcome_check：能解释真实对与独立错误候选用的是不同概率论证。
- next：随机码本 union bound 合并所有错误候选。

### `c03-random`
- question：随机编码可达证明中，怎样通过码本期望和 union bound 得到 R<I？
- requires：c02 典型性、有限消息 M≈2^{nR}、随机独立码本。
- teaching_sequence：随机生成 M 个 IID 输入序列；联合典型解码；错误事件拆为真实对非典型与任一错误码字典型；union bound 得 `P_e≤ε_n+2^{nR}2^{-n(I−δ)}`；选 `R<I−δ` 后 n 增大；期望码错误小推出存在确定码本，避免“平均码本必个个好”。
- claims：claim_id=e09-channel-coding-c03_random-01; identity=established_result; DMC achievability，Lecture 8 PDF p. 12、Lecture 10 PDF pp. 3–9；输入分布固定时可达 I(P_X,W)。
- visual_events：`e1` 锚点“抽样码字”，每条消息独立生成并保留随机种子概念；落点码本。`e2` 锚点“错误事件求和”，非典型项与 M 个候选逐一相加，旧项保留；落点指数为 R−I。
- outcome_check：能指出率条件由候选数量指数与单个误匹配指数比较而来。
- next：平均错误好码可经剔除变成最大错误仍小的码。

### `c04-expurgation`
- question：如何从平均错误小的码剔除少量坏消息，得到 maximal error 控制？
- requires：平均 Pe、消息集合、Markov inequality/排序。
- teaching_sequence：平均条件错误为 ε；阈值 √ε，坏消息比例至多 √ε；删去坏消息后剩余率损失 `(1/n)log(1−√ε)` 趋零，最大错误 ≤√ε；重命名解码区域；说明平均/最大容量等价结论需要对称性/编码转换条件，不泛化为任意有限块逐码等价。
- claims：claim_id=e09-channel-coding-c04_expurgation-01; identity=established_result; expurgation，Lecture 9 PDF pp. 9–12；确定码及均匀消息平均。
- visual_events：`e1` 锚点“排序错误概率”，坏消息尾部标红，保留累计均值；落点 Markov 界。`e2` 锚点“删除尾部”，消息集合缩小而剩余每个错误低于阈值；落点最大错误保证。
- outcome_check：能说明为何删去的比例趋零时码率损失也趋零。
- next：反方向 converse 用 Fano 和 memoryless 迫使 R≤C。

### `c05-converse`
- question：Fano 与单字母化如何证明任何可靠 DMC 码率都不超过 C？
- requires：E03 Fano、DMC memoryless、码率和互信息链式法则。
- teaching_sequence：M 均匀，`(1−Pe)log M−1≤I(M;Yⁿ)`；由编码器与 DPI ≤`I(Xⁿ;Yⁿ)`；链式法则加 memorylessness ≤`Σ I(X_i;Y_i)`；凹性及时间共享变量将平均输入分布化为单字母容量界 `nC`；Pe→0 得 R≤C；逐步注明确定 encoder 与 memoryless 假设。
- claims：claim_id=e09-channel-coding-c05_converse-01; identity=established_result; channel coding converse，Lecture 9 PDF pp. 10–12；Fano 和 memoryless DMC。
- visual_events：`e1` 锚点“错误趋零”，Fano 左侧消息信息趋 `log M`，保留 Pe 项；落点 `I(M;Yⁿ)`。`e2` 锚点“逐次拆输出”，序列 MI 展开成 n 项再平均输入，保留每项；落点 `nC`。
- outcome_check：观众能指出 converse 中分别使用 Fano、DPI、memorylessness 和凹性的位置。
- next：源信道分离把两个独立定理组合成端到端通信保障。

### `c06-separation`
- question：源压缩率与信道容量之比如何决定稳定传送，何时分离表达有效？
- requires：E04 source coding、E05 stationary ergodic source entropy rate、DMC operational capacity。
- teaching_sequence：先以 DMS 熵 H 作易读例：m 个源符号的典型信息约 mH bit，n 次 DMC 使用提供约 nC bit，因此需 `mH<nC` 并留裕量。推广到 stationary ergodic source 时用 E05 的熵率 H̄，条件为 `mH̄<nC`；渐近分离允许 source coding rate 接近 H̄、channel coding rate 接近 C。说明信源/信道分离与长块、可靠性假设；不把结果缩成仅 DMS，也不扩展到有限时延/任意非平稳源。
- claims：claim_id=e09-channel-coding-c06_separation-01; identity=established_result; separation theorem，Lecture 10 PDF p. 10；DMS 特例和 stationary ergodic source 熵率推广，配 DMC 渐近可靠设置。
- visual_events：`e1` 锚点“源输出典型块”，源编码减少符号数量并保留解码映射；落点 H。`e2` 锚点“放进信道使用预算”，每个源符号条分配 H/C 次用，留裕量；落点可行率条件。
- outcome_check：给 H,C 能算 uses/symbol 并说出渐近假设。
- next：有因果反馈时，converse 还要在每一步条件于过去输出。

### `c07-feedback`
- question：因果 noiseless feedback 为什么不提高 memoryless DMC 容量，证明依赖什么？
- requires：DMC、链式法则、因果编码器 `X_i=f_i(M,Y^{i−1})`。
- teaching_sequence：写因果编码结构；由 Fano 起步；逐步条件化输出历史，用 memoryless 得 `I(M;Y_i|Y^{i−1})≤I(X_i;Y_i)`；对每个 i 用容量 C 上界并求和；可达下界由忽略反馈得到；说明反馈仍可能改变延迟/错误指数/策略表现，结论仅容量不变。
- claims：claim_id=e09-channel-coding-c07_feedback-01; identity=established_result; feedback converse，Lecture 10 PDF pp. 11–13；无记忆信道与因果 noiseless feedback。
- visual_events：`e1` 锚点“上一输出返回编码器”，箭头只从 `Y^{i−1}` 到 `X_i`，未来输出不可见；落点因果约束。`e2` 锚点“条件 MI 逐项界”，每一轮贡献条均 ≤C，旧轮次保留；落点总信息 ≤nC。
- outcome_check：能画出反馈时序并说明 memoryless 在哪一步消去历史。
- next：下一集扩展到连续变量，先重建密度下的信息量与单位。

## 具体实验与预测

开场用000/111三次重复码，在三个独立BSC(.10)使用上接收010，停顿后用多数判决恢复0。错误须至少两次翻转，P_e=3(.1)^2(.9)+(.1)^3=.028，R=1/3 bit/use。有限改进不能代替渐近信道编码定理。

c01的BSC(.20)先验例子按四句配音展开：收到011，似然.032/.128，先验.9/.1，预测后比较.0288/.0128。MAP=000和ML=111在各自语义位置揭示。

c02先显示中性的16×16串对表。公平边缘串全通过并不保证联合典型；停顿后揭示ε=.04下相差一位的64对，真实概率.421875与独立概率.25分开。完整大数律、联合典型集计数和错码字独立概率证明保留。

c03在接收序列和码表出现后停顿，再高亮第1/8个候选。此码表的检验失败不否定集合平均与存在性证明。c04在阈值显示后先预测坏消息比例，随后完整证明删除、解码区域与速率损失。c07在因果结构显示后提问反馈能否提高容量，直到结论句才揭示不变性。

六处hold由独立空音符cue清除混响尾音。Fano逆定理、压缩与信道编码的严格裕量、相等边界未决以及反馈的逐时刻条件化保持原有严谨范围。
