---
title: OmniX (Any-view·Any-time 4D 복원, Feed-forward 궤적장)
area: research
created: 2026-07-27
sources: [OmniX.md]
tags: [research, 4D-reconstruction, feed-forward, point-trajectory, 3D-point-tracking, sparse-attention, dynamic, synthetic-dataset, DUSt3R-lineage]
---

# OmniX: Feed-forward 궤적장으로 임의 시점·시간 4D 복원

> Yanqin Jiang, Tengfei Wang, Zhengwei Wang, Chenjie Cao, Junta Wu, Wenhan Luo, Weiming Hu, Jin Gao, Chunchao Guo (CASIA · Tencent Hunyuan · HKUST). *"OmniX: Any-view and Any-time 4D Reconstruction via Feed-forward Trajectory Fields"*, arXiv:2607.10840 (2026.07). 프로젝트: omnix4d.github.io

**한 줄 요약**: **큰 카메라 모션**이 있는 영상에서도 **모든 픽셀의 dense 3D 점 궤적**을 단일 forward로 예측하는 feed-forward 4D 복원. 핵심은 **동적 전경 모션과 정적 기하를 명시적으로 분리**하고, 3D 모션의 **희소·저랭크 구조**를 이용해 **소수의 dynamic token**으로 전 픽셀·전 시점의 궤적장을 파라미터화(SSA). 단안 영상뿐 아니라 **시간적으로 끊긴 영상 쌍·이미지+영상 혼합** 입력까지 처리. dense 궤적 예측·3D point tracking SOTA. (출처: [[2026-07-27-OmniX-논문]])

## 문제의식
- 기존 feed-forward 4D는 두 갈래 모두 한계: (1) **프레임별 정적 점군만** 예측([[MONST3R]] 계열 등) → 전경 모션 무시, 시간 대응 없음. (2) 점 궤적을 예측하되 **작은 카메라 모션의 단안 영상에 국한**.
- 원인 진단: **정적 기하의 feature matching**과 **동적 전경의 시간 대응 학습**을 분리 없이 함께 수행 → 서로를 방해(distract). 큰 시점 변화에서 붕괴.
- 반복 쿼리·트래킹 방식([[장거리-point-tracking]] 계열 SpatialTracker 등)은 dense 예측으로 확장하기엔 계산 비용이 큼.

## 정식화 (§3.1)
- 입력: 영상 집합 $V=\{V^{(i)}\}$ — 단일 영상·다중 영상·이미지+영상 혼합 모두 허용.
- 각 이미지에 depth $D$·ray map $R$·카메라 $v=(t,q,f)\in\mathbb R^9$. 3D 점 $\mathbf P=\mathbf t+D(u,v)\cdot\mathbf d$.
- **궤적**: 기준 점 $\mathbf P^{(i_0)}_{j_0}$를 궤적 변환 $\tau=[A|b]$로 이동 → $\mathbf P^{(i)}_j = A\mathbf P + b$. **[[ShapeOfMotion]]에서 착안**하되, 모션의 희소성을 살려 $K$개 **궤적 변환 기저**의 가중합으로 per-pixel 변환을 구성: $\tau=\sum_k w_k\tau_k$ (가중치 $w_k$도 학습 예측).

## 아키텍처 (§3.2)
- **백본**: DepthAnything3 기반 트랜스포머 + DPT 헤드(depth·ray·카메라). 이미지 토큰에 **sinusoidal 타임스탬프 인코딩** 주입 + cross-view self-attention.
- **① SSA (Sparse Spatiotemporal Attention)** — 핵심. MLP가 토큰별 **dynamic probability** $\Theta$를 예측해 **상위 $\rho\%$(기본 20%)만 dynamic token**으로 선별. 이를 시간축으로 확장(식 4: 온도 임베딩을 토큰별 계수로 변조 — AdaLN보다 우수)해 **trajectory query**로 삼고, **전체 이미지 토큰에 cross-attention**해 궤적 변환 기저를 예측. 8블록. → 소수 토큰만으로 전역 상호작용을 보존하며 효율 확보.
- **② Sparse Trajectory Field** — 예측된 기저(9채널 = 6D 회전 + 3D 이동)를 dynamic token의 원래 2D 격자 위치로 **scatter** → 희소 궤적장.
- **③ DTSH (Deformable Trajectory Sampling Head)** — DPT 기반. 궤적장을 통계 분기(시간 평균·분산)와 salient 분기(시간 max-pool)로 임베딩해 이미지 토큰과 concat → **sampling offset·weight** 예측 → multi-scale deformable 샘플링으로 per-pixel 변환 $\tau$와 dynamic score $\theta$를 동시 획득. 이 설계가 **dynamic token 선택을 미분 가능**하게 만듦.
- 최종: $\hat{\mathbf P}_{traj}=\mathbf P+\theta\cdot(\mathbf P_{traj}-\mathbf P)$ — dynamic score를 곱해 **배경 점은 정적으로 유지**되도록 유도.

## 학습·데이터
- 손실(식 12): depth·ray·궤적에 **confidence-aware 회귀**(식 13, 불확실 영역 재가중) + gradient loss(엣지 보존) + 카메라 Huber + dynamic score BCE(토큰·픽셀 2단계, 가중 0.01).
- **UE5 4D 데이터 엔진**: 정적 환경 + 동적 객체를 합성하고 다중 카메라로 렌더 → 160K 장면 생성, 정제 후 **80K 장면·1.28M 다중뷰 영상**(depth·포즈·dense 궤적 주석). 큰 카메라 모션·360° 커버리지 데이터 부재를 해결.
- 공개 데이터셋 8종 병용(DynamicReplica·PointOdyssey·Spring·OmniGame·HOI4D·Waymo·DL3DV·Stereo4D). 280×504·16프레임 학습, 64 GPU·12일. 추론 시 32프레임 이상으로 일반화.

## 결과
- **dense 3D 궤적**(자체 벤치, Tab.1): TraceAnything·VDPM 대비 큰 폭 우위. 특히 **disjoint video pairs·hybrid image-video**에서 격차 큼(경쟁 기법은 큰 카메라 모션 학습 부재). 비교 기법의 FG > ALL 성적은 **부정확한 카메라 추정으로 배경 점이 화면 밖으로 투영**된 탓이라 분석.
- **3D point tracking**(TAPVid-3D, Tab.2): ADT·DriveTrack·PStudio 전부 **2026년 기준 SOTA**(ADT APD3D 0.266→**0.367**). SpatialTrackerV2·St4RTrack·VDPM 능가. 선행 [[POMATO]](2025 SOTA)와 ADT·PStudio가 겹치며, OmniX가 이를 갱신.
- **부가 태스크**: video depth(KITTI AbsRel **0.024**, DA3·π³ 능가)·카메라 포즈(Sintel ATE **0.108** 최고) 경쟁력.
- **효율**(Tab.5): 12.07 TFLOPs·2.15s — sparse 설계로 non-sparse 대비 FLOPs·런타임 감소. 반복 추론 루프가 필요한 VDPM(11.7s)·St4RTrack(20.6s)보다 훨씬 빠름.
- **ablation**: cross-attention 제거 시 **전경을 정적으로 오예측**하며 급락(필수). SSA 내 **self-attention은 이득 미미**해 제거(효율↑). $\rho$=20 채택. 데이터 스케일링 효과 확인(2.8K→13.9K).

## 관련
- **계보(research)**: [[DUSt3R]]→[[VGGT]] feed-forward 복원 계보의 **4D 궤적 확장**. [[MONST3R]] — 프레임별 동적 pointmap(시간 대응 없음)의 한계를 정면으로 겨냥. [[POMATO]]·[[MoRe]] — 같은 계보 동적 분기(matching·스트리밍)와 peer.
- **2026 계보 진전 대비(research)**: [[VGGT-Ω]] — 같은 DUSt3R 계보의 **백본 축** 진전(register attention·15× 데이터로 스케일업, 깊이·카메라 정확도)인 반면 OmniX는 **출력 축** 진전(정적 기하 위에 dense 궤적장 추가). 상보적 — VGGT-Ω류 백본 위에 OmniX식 궤적 모듈을 얹는 조합이 자연스러운 다음 수순.
- **핵심 교차**: [[ShapeOfMotion]] — **궤적 변환 정식화를 명시 인용**(§3.1). 최적화 기반 SE(3) 모션 기저를 **feed-forward 궤적장 기저**로 옮긴 셈 → per-scene 최적화 없이 dense 궤적 확보. 두 노트가 "저차원 모션 기저" 아이디어의 최적화↔feed-forward 양단.
- **트래킹(개념, 다른 영역)**: [[장거리-point-tracking]] — TAPVid-3D 평가·SpatialTracker/CoTracker 대비군의 개념 앵커. OmniX는 **반복 트래킹 없이 dense 회귀**로 전환한 사례.
- **개념(다른 영역)**: [[Transformer]]·[[ViT]] — 백본·cross-attention·deformable 샘플링 / [[위치인코딩-positional-encoding]] — 타임스탬프 sinusoidal 인코딩(식 4 변조) / [[SfM-COLMAP]] — 대체 대상인 전통 포즈 추정.
- **출처 메타**: [[2026-07-27-OmniX-논문]]
