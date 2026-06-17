---
title: DINO · DINOv2 (자기지도 ViT 백본)
area: concepts
created: 2026-06-17
sources: [Dino.md, DINOv2.md]
tags: [concepts, self-supervised, ViT, foundation-model, backbone, representation-learning]
---

# DINO · DINOv2 — 자기지도 Vision Transformer 백본

> ① Caron et al. (FAIR·Inria). *"Emerging Properties in Self-Supervised Vision Transformers"*, ICCV 2021 (DINO). ② Oquab et al. (Meta AI·Inria). *"DINOv2: Learning Robust Visual Features without Supervision"*, TMLR 2024.

**한 줄 요약**: 라벨 없이 [[ViT]]를 학습해 **범용 동결 피처**(frozen feature)를 얻는 자기지도 계보. DINO는 "라벨 없는 자기증류"로 객체 분할이 창발하는 ViT 피처를, DINOv2는 이를 **대규모 큐레이션 데이터로 스케일업**해 깊이·분할까지 finetune 없이 SOTA. [[VGGT]]·[[4DGT]]·[[StreamSplat]]·[[MoVieS]] 등 3D 복원 모델의 **이미지 인코더 백본**으로 직접 차용된다. (출처: `raw/Dino.md`(ICCV'21)·`raw/DINOv2.md`(TMLR'24))

## DINO (2021) — Self-distillation with NO labels
- **핵심**: student/teacher 동일 구조([[ViT]]) + 다른 파라미터. 같은 이미지의 다른 crop을 각각 통과시켜, student가 teacher 출력을 **cross-entropy로 매칭**(Fig. 2). teacher는 student의 **EMA(momentum encoder)**, gradient는 student로만(stop-grad).
- **collapse 회피**: teacher 출력에 **centering**(한 차원 지배 방지) + **sharpening**(낮은 temperature, uniform 방지)만으로 충분 — contrastive·predictor 불필요.
- **multi-crop**: 2개 global(224²) + 여러 local(96²) view, "local-to-global" 대응 유도.
- **창발 특성**: ⑴ 마지막 블록 self-attention이 **객체 경계·scene layout을 명시적으로** 담음(라벨 없이, Fig. 1) ⑵ **k-NN 분류**가 linear probe에 근접(ImageNet 78.3% k-NN). 작은 패치(/8)일수록 dense task↑. ViT-B/8 linear 80.1%.

## DINOv2 (2024) — 큐레이션 데이터로 스케일업
- **데이터(LVD-142M)**: 메타데이터·텍스트 없이 **자기지도 retrieval**로 큐레이션 — 큐레이션 셋과 가까운 이미지를 1.2B uncurated에서 검색·dedup·rebalance(Fig. 3). 큐레이션이 uncurated보다 일관되게 우수(Tab. 2).
- **학습**: [[DINO]] 이미지수준 손실 + **iBOT** 패치수준(masked image modeling) + SwAV의 Sinkhorn-Knopp centering + **KoLeo** 정규화(피처 균등 분산). head는 두 손실 분리(untied).
- **스케일**: ViT-g(1.1B) 학습 후 작은 모델로 **distill**(scratch보다 우수). FlashAttention·sequence packing·FSDP·efficient stochastic depth로 iBOT 대비 2× 빠르고 메모리 1/3.
- **결과**: 동결 피처가 SSL SOTA를 큰 폭 능가, weakly-supervised(OpenCLIP)에 필적/초과. **dense task**: linear/DPT 깊이(NYUd·KITTI)서 iBOT·OpenCLIP 능가(Tab. 11), 분할 ADE20k(Tab. 10). **PCA 패치 피처**가 객체 부위를 정렬(창발, Fig. 1) — finetune 없이도 강력.

## 왜 3D 복원의 백본인가
- finetune 없이 쓰는 **고품질 dense 피처**(특히 깊이·기하 정보가 linear-separable) → feed-forward 3D 모델이 무거운 사전학습 없이 기하 추론을 시작할 좋은 출발점. 패치 토큰이 공간 구조를 담아 pixel-aligned 예측에 적합.

## 관련
- **기반 구조(같은 영역)**: [[ViT]] — DINO·DINOv2가 학습하는 백본 아키텍처 / [[Transformer]] — self-attention·EMA·distillation 토대.
- **백본으로 쓰는 연구(다른 영역)**: [[VGGT]]·[[4DGT]]·[[StreamSplat]]·[[MoVieS]] — DINOv2를 이미지 인코더로 차용 / [[DUSt3R]] — 다른 자기지도 사전학습([[CroCo]])을 쓰는 대조 계보.
- **대조 사전학습**: [[CroCo]] — cross-view completion(3D 특화) vs DINO(범용 instance/MIM). MAE·iBOT은 DINOv2 구성요소.
- **원본**: `raw/Dino.md`(21p, Caron et al. ICCV'21, github.com/facebookresearch/dino) · `raw/DINOv2.md`(32p, Oquab et al. TMLR'24, github.com/facebookresearch/dinov2) — 둘 다 부록 포함 전체 통독.
