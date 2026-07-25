---
title: Shape of Motion (단안 영상 4D 복원 + 장거리 3D 트래킹)
area: research
created: 2026-07-26
sources: [ShapeOfMotion.md]
tags: [research, 4D-reconstruction, dynamic, monocular, SE3-motion-basis, 3D-tracking, novel-view-synthesis, optimization-based]
---

# Shape of Motion: 단일 영상에서 4D 복원

> Qianqian Wang, Vickie Ye, Hang Gao, Weijia Zeng, Jake Austin, Zhengqi Li, Angjoo Kanazawa (UC Berkeley · Google DeepMind · UCSD · Adobe). *"Shape of Motion: 4D Reconstruction from a Single Video"*, arXiv:2407.13764 (CVPR 2025). 프로젝트: shape-of-motion.github.io

**한 줄 요약**: 일상적으로 촬영한 **단안(monocular) 영상 하나**에서 동적 장면의 지오메트리와 **월드 좌표계의 영속적 장거리 3D 모션 궤적**을 복원. 핵심은 (1) 3D 모션을 **소수의 공유 SE(3) 모션 기저(basis)의 선형결합**으로 표현해 저차원 강체 그룹으로 소프트 분해, (2) off-the-shelf 노이즈 prior(단안 깊이·장거리 2D 트랙)를 전역 일관 표현으로 융합. 장거리 3D/2D 트래킹·NVS 모두 SOTA. (출처: [[2026-07-26-ShapeOfMotion-논문]])

## 문제의식
- 단안 동적 복원은 **심하게 ill-posed**(매 순간 한 시점만 관측). 기존은 동기화 멀티뷰·LiDAR 요구, 또는 모션을 **인접 프레임 scene flow**나 canonical↔view **변형장**으로만 모델링 → **영상 전체를 관통하는 영속 3D 궤적**을 못 잡음.
- 두 통찰: (1) 2D 이미지 동역학은 복잡·불연속이어도 **바탕의 3D 모션은 저차원**(단순 강체 운동의 조합). (2) 데이터 기반 prior는 상보적이나 노이즈가 있어 **융합**이 필요.

## 표현: 영속 3D 가우시안 + SE(3) 모션 기저 (§3.2)
- 장면을 **canonical 3D 가우시안** 집합 $\vec g_0=(\mu_0,R_0,s,o,c)$으로 표현(외형·지오메트리는 시간 공유). 프레임 $t$에서 강체 변환 $T_{0\to t}\in SE(3)$로 위치·자세만 변함.
- **모션 기저(motion basis)**: 가우시안마다 궤적을 독립 모델링하지 않고, $B\ll N$개 **전역 공유 기저 궤적** $\{T^{(b)}_{0\to t}\}$의 가중합으로 $T_{0\to t}=\sum_b w^{(b)}T^{(b)}_{0\to t}$. 기저는 6D 회전+평행이동. **비슷하게 움직이는 가우시안 → 비슷한 계수** → 강체 그룹으로 소프트 분해(모션 계수 PCA가 강체 파트와 상관). $B{=}10$.
- **정적/동적 분리**: 정적부는 표준 static 가우시안(깊이 unproject 초기화), 동적부(40k)와 공동 최적화·래스터화.

## 최적화: 노이즈 prior 융합 (§3.3)
- **입력 prior**(off-the-shelf): 카메라 포즈 MegaSaM, 이동 마스크 Track-Anything, 단안 깊이 Depth Anything(상대깊이→per-frame scale·shift 정렬), 장거리 2D 트랙 TAPIR.
- **초기화**: 3D 트랙 가시성 최대 프레임을 canonical로, 노이즈 3D 트랙 velocity에 **k-means → 클러스터별 weighted Procrustes**로 SE(3) 기저 초기화(TAPIR 불확실성 가중).
- **손실**: 재구성(RGB·깊이·마스크 $\ell_1$) + 모션(렌더한 2D 트랙·재투영 깊이를 장거리 트랙으로 감독) + **rigidity**(k-NN 동적 가우시안 간 거리 보존, 물리 prior) + 시간 평활(가속도 $\ell_2$).
- per-scene test-time 최적화. 300프레임 960×720 → A100 2시간, 렌더 ~140fps.

## 결과
- **iPhone 데이터셋**(Tab.1): 3D 트래킹·2D 트래킹·NVS **전부 SOTA**. 입력이던 "TAPIR+DA" baseline을 크게 상회(EPE 0.114→0.082) — 융합(consolidation)의 효과. NVS도 동적 NeRF·3DGS baseline(HyperNeRF·[[Deformable3DGS|D-3DGS]]·DynIBaR·DynMF) 능가.
- **Kubric MOVi-F**(Tab.2): 장거리 3D 트래킹 baseline 능가. **NVIDIA**(Tab.3): DGM과 대등.
- **왜 우수한가**: (1) 저차원 SE(3) 표현이 **가려진(occluded) 모션을 이웃 가시 영역에서 추론** (2) 3D 정규화(저가속) (3) 전 pairwise 트랙을 단일 4D 표현으로 통합 → 노이즈 2D 트랙 교정.
- **ablation**(Tab.4): SE(3) 기저 > 평행이동 기저 > per-Gaussian(팝핑·지터). SE(3) 초기화·2D 트랙 감독 각각 결정적. **+2DGS** 변종(단안 normal 감독)으로 지오메트리 강화.

## 한계
- **per-scene test-time 최적화** 필요 → 스트리밍 부적합(feed-forward St4RTrack 류가 대안). off-the-shelf 예측(포즈·깊이·모션) 품질에 의존(textureless·큰 모션서 저하)하나 그 발전의 수혜도 받음. 이동 객체 마스킹에 **사용자 입력** 필요(SAM 계열로 자동화 여지).

## 관련
- **계보(research)**: 동적 GS **최적화 기반 4D** 클러스터. 모션 factorization 직접 peer = DynMF(신경망 모션 기저, 본 논문이 재구현·비교). [[Deformable3DGS]] — canonical+변형MLP 방식의 직접 baseline(D-3DGS). [[4DGS]]·[[SpacetimeGS]]·[[native4DGS]] — 최적화 기반 4D 모션 표현 형제 / [[OR2-온라인동적GS]] — 최적화 기반 동적 GS 시간 일관성 이웃(online vs per-scene).
- **트래킹 대비(research)**: [[MoVieS]] — feed-forward 4D + zero-shot scene flow(Shape of Motion은 최적화 기반, tracking에 특화). [[StreamSplat]]·[[NeoVerse]] — feed-forward 동적, 한계의 대안 방향(SpatialTracker·DELTA 등 frame-space 3D 트래킹과 대비).
- **표현(research)**: [[3D-Gaussian-Splatting]] — 가우시안 래스터화·alpha compositing / [[NeRF]] — 동적 NeRF baseline(HyperNeRF·DynIBaR·T-NeRF) 계보.
- **개념(다른 영역)**: [[장거리-point-tracking]] — TAPIR 트랙을 입력 prior로 융합·3D 궤적으로 평가하는 개념 앵커 / [[SfM-COLMAP]] — 카메라 포즈·정적 점군(깊이 정렬) / [[Radiance Field-Volume Rendering]] — α-compositing image formation / [[위치인코딩-positional-encoding]] — DynMF 재구현의 time 입력 인코딩.
- **출처 메타**: [[2026-07-26-ShapeOfMotion-논문]]
