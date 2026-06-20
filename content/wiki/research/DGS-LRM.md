---
title: DGS-LRM (Deformable Gaussian Splats LRM)
area: research
created: 2026-06-16
sources: [DGS-LRM.md]
tags: [research, 4D-reconstruction, dynamic-scene, gaussian-splatting, feed-forward, scene-flow, 3D-tracking, LRM]
---

# DGS-LRM: Real-Time Deformable 3D Gaussian Reconstruction From Monocular Videos

> Lin, Lv, Wu, Xu, Nguyen-Phuoc, Tseng, Straub, Khan, Xiao, Yang, Ren, Newcombe, Dong, Li (Meta · UC Merced · UC Santa Barbara). *"DGS-LRM"*, arXiv:2506.09997 (2025).

**한 줄 요약**: posed 단안 영상에서 **per-pixel deformable 3D Gaussian + 3D scene flow** 를 single forward로 예측하는 **최초의** feed-forward deformable GS LRM. 멀티뷰 합성 데이터(Kubric)의 **dense 3D scene flow** 를 주 supervision으로, 실시간(0.6s)에 동적 NVS·장거리 3D tracking 동시 수행. (출처: [[2026-06-16-DGS-LRM-논문]])

## 문제의식
- 기존 feed-forward 복원([[GS-LRM]] 등)은 **정적 장면 한정** — 움직이는 물체의 모션 예측 불가. 동적 feed-forward의 난제: 학습 데이터 희소 + 적절한 3D 표현·학습 패러다임 부재.
- 단안 영상의 photometric supervision만으론 모션·기하 ambiguity → 멀티뷰 + GT scene flow가 필요.

## 표현: Per-Pixel Deformable 3D Gaussian
- 키프레임 $x\cdot l$ 의 각 픽셀이 1개 가우시안 $g_p$(깊이·RGB·쿼터니언·scale·opacity) + **deformation vector 집합 $f_p=\{f_0,...,f_N\}$**(현재→모든 timestep으로 warp). deformation은 **translation만** 모델(회전·opacity 변형은 무익).
- 시각 $n$ 렌더: 모든 $g_p$ 를 $f_p$ 로 warp해 $W_n$ 구성 → rasterize. occlusion·discontinuity에 강건, scene flow를 sliding window로 **chaining**하면 장거리 3D tracking.

## 아키텍처
- 입력: 단안 영상 + per-frame **Plücker rays(+timestamp, 7D)**. 선택적 **reference frames** $R$(시간적으로 먼 프레임 → 큰 baseline으로 기하 ambiguity 완화, GS는 예측 안 함).
- **Temporal tokenization**(MovieGen 영감): 프레임별 patchify 대신 $s\times s\times l$ 큐브를 1토큰으로($l=4$, 토큰 4배↓) → 학습·추론 가속. 24층 self-attention 트랜스포머 + weight norm + 2층 MLP.

## 학습 (Kubric 합성)
- 손실: MSE + LPIPS + **depth $L_{depth}$**(키프레임 pixel-aligned GT 깊이) + **flow $L_{flow}$**(키프레임 deformation을 GT로 직접 supervise — 끊김·frustum 이탈 정규화). $\lambda_{depth}=\lambda_{flow}=10$.
- **Dual-view sampling**: 같은 timestamp의 두 뷰를 출력 supervision으로 — 단안 학습의 기하·모션 ambiguity 제거(수렴·성능 향상).
- **데이터**: 커스텀 Kubric(MOVi-E), 4 동기 카메라, 카메라 궤적 0.5m로 축소(실세계 근사), motion blur·focal 도메인 랜덤화. scene flow는 object coordinate + 궤적으로 추출, sparse tensor로 80% 절감.
- **Scene normalization**: metric depth estimator로 스케일 정규화(20th percentile disparity=2). 64×H100, 256→512 2단계.

## 결과
- **동적 NVS**(DyCheck iPhone): 예측 기반 L4GM 능가(masked PSNR 5.84→11.97), 최적화 기반 D3DGS·PGDVS(수 시간)와 대등하면서 **0.495s**. DAVIS in-the-wild서 thin geometry·water deformation 잘 복원.
- **3D tracking**(PointOdyssey, flow chaining): SpatialTracker와 대등(ATE-3D 0.21 vs 0.22), texture-less 영역서 더 일관(전체 기하 복원 덕). Native(24f)·FV variant는 chaining 손실 없이 더 우수.
- Ablation: temporal tokenization(없으면 OOM)·dual-view·scene flow loss·reference frames 모두 기여(특히 flow loss가 deformation rigidity, reference가 스케일·깊이).

## 한계
- 시간적으로 너무 먼 이산 프레임 처리 불가(연속 영상 가정). 극단적 큰 모션은 합성 데이터 모션 분포 한계로 어려움. 입력 baseline·시점 이탈 시 아티팩트.

## 관련
- **표현 기반**: [[3D-Gaussian-Splatting]] — deformable 확장 / [[NeRF]] — Radiance Field 동적 NVS 계보.
- **계보**: [[GS-LRM]](정적 pixel-aligned GS LRM)의 **deformable·scene flow** 후계. 정적 feed-forward 형제 [[MVSplat]](cost volume sparse-view GS)를 동적으로 확장한 위치. [[4DGT]]·[[MoVieS]]·[[StreamSplat]] 와 같은 feed-forward 4D GS 클러스터.
- **tracking 대조**: SpatialTracker(단안 3D scene flow)와 직접 비교. [[POMATO]] — pointmap matching 기반 3D tracking 대조(GS vs pointmap).
- **개념(다른 영역)**: [[Transformer]] — temporal tokenization 백본 / [[Radiance Field-Volume Rendering]] — GS rasterization / [[위치인코딩-positional-encoding]] — Plücker+timestamp.
- **출처 메타**: [[2026-06-16-DGS-LRM-논문]]
