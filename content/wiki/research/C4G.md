---
title: C4G (Compact 4D Representation with Gaussians)
area: research
created: 2026-07-14
sources: [C4G.md]
tags: [research, 4D-reconstruction, dynamic-scene, gaussian-splatting, feed-forward, view-synthesis, query-based, compact, VGGT-based, feature-lifting]
---

# C4G: Learning Global Motion with Compact Gaussians for Feed-Forward 4D Reconstruction

> Ko, Han, Yu, Shin, Kim, Jeon, An, Jung, Hong, Narihira, Fukuda, Mitsufuji, S. Kim (KAIST AI · ETH Zürich · Sony AI). *"Learning Global Motion with Compact Gaussians for Feed-Forward 4D Reconstruction"*, arXiv:2605.31595v1 (2026.05.29). cvlab-kaist.github.io/C4G

**한 줄 요약**: 단안 영상 feed-forward 4D 복원에서 **per-pixel 가우시안 예측을 버리고**, timestamp로 조건화된 **소수(N=2048)의 learnable Gaussian query token**으로 전체 시간 컨텍스트를 aggregate해 global motion을 학습하는 프레임워크. **2K 가우시안(경쟁모델의 0.007×↓)**·**포즈 불필요**로 SOTA, 큰 시간 간격에 강건. (출처: [[2026-07-14-C4G-논문]])

## 문제의식 — per-pixel feed-forward 4D의 두 실패 (Fig. 1)
기존 per-pixel feed-forward 4D([[4DGT]]·[[MoVieS]]·NeoVerse)는 프레임마다 픽셀별 가우시안을 찍는다. 두 가지 실패:
- **(a) 중복 가우시안 → ghost artifact**: 보간 timestamp 렌더 시 인접 입력뷰마다 한 세트씩 겹쳐 유령상.
- **(b) view-dependent bias → occlusion hole**: 특정 timestamp 렌더가 시간적으로 가까운 뷰의 가우시안에만 의존 → 시간적으로 먼 뷰의 정보(가림 영역 복원용)를 못 씀.
- **근본 원인**: per-pixel 예측은 표현 용량이 과잉이라([[pixelSplat]]/[[GS-LRM]] 계열 static 분석 인용) 입력뷰 분포에 overfit. 게다가 연속 프레임은 부드럽게 움직이므로, **가까운 가우시안을 보간만 해도 렌더 점수가 높아** 진짜 모션을 학습할 유인이 없다.

## 핵심 설계 — Compact 4D Representation with Gaussians (§3.2, Fig. 3)
per-pixel 예측을 **query-based 예측**으로 교체:
- **Visual feature extractor**: [[VGGT]] 가중치로 초기화한 인코더 $E$ — 대규모 기하 사전지식.
- **Query-based Gaussian decoder $D_G$**: 고정 개수 $N$ learnable query $Q$를 시각 feature와 concat $[Q;F]$ → $L{=}2$ transformer 층 **full self-attention**(양방향 상호작용) → refined query $\bar Q_i$를 **단일 MLP Gaussian head**로 3D 가우시안 $G_i=\{\mu,\sigma,\Sigma,c\}$ 디코딩. SH degree는 0(RGB 1색)으로 고정해 시점의존 bias 억제·안정화.
- **Time embedding (핵심)**: 프레임별 timestamp $t$를 feature에 주입($\hat F_t = F_t + H(\psi(t))$), query는 **target timestamp $t_b$로 조건화**($\hat Q_{t_b}=Q+H(\psi(t_b))$, $\psi$=sinusoidal PE, $H$=2-layer MLP). timestamp는 target=1이 되도록 상대 정규화(절대 시간척도 불변).
- **효율**: feature는 한 번만 추출하고 **$t_b$만 바꿔 가벼운 디코더를 재실행** → 임의 시각의 가우시안을 같은 query/feature 재사용으로 디코딩. compact bottleneck이 **정적·동적을 같은 토큰으로 표현**하도록 강제 → 프레임 암기 대신 global motion 학습.

## Rendering Enhancement — VDM refinement (§3.2)
compact 가우시안은 고주파 디테일에서 화질 손실. 정적 가정의 3DGS test-time 최적화는 동적에 부적용 → **VDM(Wan2.1-VACE-1.3B [37]) 기반 후처리**. VACE/ControlNet 방식: 컨텍스트 영상=inactive(reference), 렌더 영상=reactive(생성 타깃), Qwen3-VL-8B 캡션 조건, **flow matching**으로 학습. C4G가 disocclusion 없는 기하적으로 일관된 novel view를 주므로 VDM은 **디테일 refine에만 집중**(NeoVerse 대비 hole·ghost 적어 hallucination 완화, Fig. 5).

## 학습 (loss)
photometric $L_{color}$(MSE+LPIPS) + 파운데이션모델 유도 보조손실: **depth·normal**([[MoRe|MoGe-2]]) scale-shift invariant + **tracking**(CowTracker Huber, 가우시안 궤적을 point tracker에 정박). $\lambda_{depth}{=}\lambda_{normal}{=}0.001$, $\lambda_{track}{=}0.1$. Ablation(Tab.6): depth·normal·track 모두 monocular 기하 모호성 완화에 유효, 특히 normal이 큼.

## 창발 속성 — 층별 역할 분담 (§3.3, Fig. 4)
supervision 없이 두 self-attention 층이 상보적:
- **Layer 1**: timestamp 무관, 모든 프레임의 **기하적으로 대응하는 영역**에 넓게 attend (공간 대응).
- **Layer 2**: **target timestamp에 시간적으로 가까운 프레임**에 집중 (시간 인지).
→ 각 query가 자기 가우시안 디코딩에 필요한 feature만 선별. compact 예산으로 임의 시각을 복원하려는 암묵적 최적화 압력의 결과로 해석.

## Any-feature 4D Lifting (§3.4)
위 창발 속성을 재활용해 **임의 2D VFM feature를 feed-forward로 4D field에 lifting** — 최초의 feed-forward feature-lifting. 기존은 per-scene 최적화(궤적 backward warping) 필요.
- **View-invariant feature decoder $D_F$**: $D_G$와 동일 구조·동일 query, 임의 인코더 $E'$([[DINO|DINOv3]]·[[VGGT]]) feature 입력. $D_G$의 **query·key를 재사용하고 value projection만 학습**(5K step) → 가우시안과 feature가 같은 토큰·같은 attention에서 나오므로 **가우시안에 feature를 직접 부착 = 4D feature field**.

## 결과
- **NVS**(Tab.1–2, DyCheck·ADT·TUM-Dynamics·NVIDIA): **2K 가우시안**(NeoVerse 802K, MoSca 342K 대비 0.007×↓)으로 GT 포즈 없이 SOTA/경쟁. per-scene 최적화(Shape-of-Motion·MoSca)는 sparse 입력에 overfit하거나 복원 실패.
- **시간 간격 강건성**(Tab.2, TUM $\Delta t\in\{2,4,6,8\}$): per-pixel 대비 성능 저하 훨씬 적음 — 전 시간 컨텍스트 aggregate 덕.
- **Point tracking**(Tab.10, ADT·DriveTrack): 가우시안 중심 궤적 전파로 per-pixel baseline 능가(pixel-aligned 아니라 초기 위치 노이즈에도).
- **4D feature field**(Tab.3–4): 투영 feature가 원본 DINOv3·VGGT feature보다 시간·기하 일관성↑, LSeg 기반 dynamic scene understanding에서 LSeg 자체도 상회.
- **구현**: $N{=}2048$, $L{=}2$, VGGT 인코더, 224², Spring·Kubric·RealEstate10K, AdamW(디코더 1e-5·백본 1e-7), 4×H100. **정적 사전학습 [[C3G]] 가중치로 초기화**(동적 모델링에 집중).

## 한계 (§F)
입력뷰에서 한 번도 관측 안 된 영역·극단 시점은 zero-hole 생성 불가(VDM이 채우되 hallucinate). **시간 외삽 불가** — 보간 timestamp로만 학습해 미래 프레임 예측 실패.

## 관련
- **직접 계보(sister work)**: [[C3G]](Jeon et al. 2026, 정적 장면 2K 가우시안 compact 표현 — 초기화 가중치·query decoder 원형) → C4G가 시간 조건 query로 4D 확장.
- **per-pixel 대조군**: [[4DGT]]·[[MoVieS]]·[[NeoVerse]] — feed-forward 4D GS 클러스터, C4G가 겨냥한 duplicated/view-bias 실패의 당사자 / [[DGS-LRM]]·[[StreamSplat]] peer.
- **백본·기반**: [[VGGT]] — 인코더·기하 사전지식(feature lifting 대상이기도) / [[3D-Gaussian-Splatting]] — 가우시안 표현·rasterization 토대 / [[NeRF]] — 동적 NVS Radiance Field 계보.
- **개념(다른 영역)**: [[flow-matching-생성prior]] — VDM(Wan2.1-VACE, flow matching) refine의 개념 앵커 / [[Transformer]] — query-based self-attention 디코더 / [[위치인코딩-positional-encoding]] — sinusoidal time embedding(RoPE보다 우수, Tab.5) / [[구면조화함수-SH]] — SH degree 0 선택 / [[DINO]] — DINOv3 feature lifting / [[Radiance Field-Volume Rendering]] — alpha-blending image formation.
- **출처 메타**: [[2026-07-14-C4G-논문]]
