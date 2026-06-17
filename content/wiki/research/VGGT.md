---
title: VGGT (Visual Geometry Grounded Transformer)
area: research
created: 2026-06-16
sources: [VGGT.md]
tags: [research, 3D-reconstruction, feed-forward, transformer, camera-pose, depth, point-map, point-tracking, DUSt3R-lineage]
---

# VGGT: Visual Geometry Grounded Transformer

> Wang, Chen, Karaev, Vedaldi, Rupprecht, Novotny (Oxford VGG · Meta AI). *"VGGT: Visual Geometry Grounded Transformer"*, arXiv:2503.11651 (2025.03). 코드: github.com/facebookresearch/vggt

**한 줄 요약**: 한 장·몇 장·수백 장의 이미지를 받아 **카메라 파라미터·깊이맵·포인트맵·3D 포인트트랙**을 단일 forward pass(1초 이내)로 한꺼번에 추정하는 **1.2B 파라미터 feed-forward 트랜스포머**. [[DUSt3R]]·MASt3R(2장 한정 + 후처리 최적화)와 달리 기하 후처리를 거의 제거하고도 최적화 기반 기법들을 능가. (출처: [[2026-06-16-VGGT-논문]])

## 문제의식
- 전통 3D 복원은 Bundle Adjustment 등 반복 최적화(SfM·MVS)에 의존 → 복잡·고비용. [[DUSt3R]]/MASt3R가 학습으로 일부 대체했지만 **이미지 쌍(pair)만** 처리, 여러 장은 pairwise 결과를 융합하는 **후처리 최적화** 필요.
- VGGT는 "3D task를 신경망이 직접 풀 수 있나"를 끝까지 밀어붙임 → 단일 네트워크가 **모든 3D 속성을 공동 예측**, 후처리 없이 바로 사용 가능.
- 특별한 3D 아키텍처 불필요: GPT·[[ViT]]·DINO·Stable Diffusion처럼 **표준 대형 트랜스포머 + 대량 3D 주석 데이터**로 충분. (3D inductive bias는 frame-wise/global attention 교대뿐)

## 출력 정의 (식 1)
입력 $N$장 이미지 $\to$ 프레임마다 $(g_i, D_i, P_i, T_i)$:
- **카메라** $g_i\in\mathbb R^9 = [q,t,f]$ (회전 쿼터니언 $q\in\mathbb R^4$, 평행이동 $t\in\mathbb R^3$, FoV $f\in\mathbb R^2$). 주점은 이미지 중심 가정.
- **깊이맵** $D_i\in\mathbb R^{H\times W}$, **포인트맵** $P_i\in\mathbb R^{3\times H\times W}$ — DUSt3R처럼 **첫 카메라 $g_1$ 좌표계(=세계 기준 프레임)에서 viewpoint-invariant**.
- **트래킹 피처** $T_i\in\mathbb R^{C\times H\times W}$ — 별도 트래킹 모듈이 소비(직접 트랙 출력 X).
- 입력 순서는 임의(첫 프레임만 reference로 고정) → 첫 프레임 제외 **순열 등변(permutation equivariant)**.

## 아키텍처 (Fig. 2)
- **패치화**: 각 이미지를 [[DINO|DINOv2]]로 토큰화(K개) + 위치 임베딩.
- **Alternating-Attention (AA)**: frame-wise self-attention(프레임 내부)과 global self-attention(전 프레임)을 **교대**. 기본 $L=24$층. **cross-attention 없이 self-attention만** 사용 → 이미지 간 정보 통합과 토큰 정규화의 균형.
- **특수 토큰**: 프레임마다 camera token + register token 4개 추가. **첫 프레임은 다른 학습 토큰** 부여 → 모델이 첫 카메라를 식별하고 그 좌표계로 예측하게 함.
- **헤드**:
  - *카메라 헤드*: camera token에 self-attention 4층 + linear → intrinsic·extrinsic.
  - *DPT 헤드*: image token → 밀집 피처 $F_i$ → 3×3 conv로 깊이·포인트맵 + 트래킹 피처 + **aleatoric uncertainty** $\Sigma^D,\Sigma^P$(손실 가중·신뢰도).
  - *트래킹*: CoTracker2 구조. query point 피처를 다른 프레임 피처와 상관 → 2D 대응점. 시간 순서 가정 없음(영상 아닌 임의 집합에도 적용).

## Over-complete 예측 (핵심 통찰)
- 예측량이 서로 **중복**: 카메라는 포인트맵에서 PnP로, 깊이는 포인트맵+카메라에서 유도 가능.
- 그럼에도 **학습 시 전부 명시적으로 예측**하면 정확도 크게 상승(closed-form 관계여도). (출처: [[2026-06-16-VGGT-논문]])
- **추론 시**: 포인트맵 헤드 직접 사용보다 **깊이맵+카메라를 unproject**한 3D점이 더 정확 → 복잡한 task를 단순 하위문제로 분해한 이득.

## 학습 (식 2)
- 다중 task 손실 $L=L_{camera}+L_{depth}+L_{pmap}+\lambda L_{track}$, $\lambda=0.05$.
  - $L_{camera}$: Huber. $L_{depth}/L_{pmap}$: aleatoric-uncertainty 가중 + **gradient 항**(단안 깊이 관행). $L_{track}$: CoTracker2식 + visibility BCE.
- **GT 좌표 정규화**: 첫 카메라 좌표계로 표현 후 전 3D점의 평균 유클리드 거리로 스케일 정규화. **DUSt3R와 달리 예측에는 정규화를 적용하지 않고** 모델이 데이터에서 학습하도록 강제.
- 1.2B params, 64×A100 9일, 160K iter, AdamW, cosine LR(peak 2e-4), 프레임당 2–24장, 해상도 ≤518, bfloat16 + gradient checkpointing.
- 데이터: Co3Dv2·BlendMVS·MegaDepth·ScanNet·Kubric·Hypersim·Habitat·Replica·Virtual KITTI·Aria 등(실내외·합성·실사). 규모·다양성 MASt3R급.

## 결과
- **카메라 포즈**: Re10K·CO3Dv2(Tab.1)·IMC(Tab.10) SOTA. Feed-forward 0.2s로 DUSt3R/MASt3R/VGGSfM(7–10s) 능가. **+BA 1.8s**면 더 향상(예측 3D점이 BA 초기화라 삼각측량 불필요 → VGGSfM보다 빠름).
- **MV 깊이**(DTU): GT 카메라 없이도 DUSt3R Overall 1.741→0.382, GT 카메라 아는 기법에 근접.
- **포인트맵**(ETH3D): feed-forward 0.2s로 global alignment 기법 능가. *Depth+Cam* > *Point* 헤드 확인.
- **2뷰 매칭**(ScanNet): 전용 학습 안 됐는데도 Roma 등 능가.
- **Ablation**: AA > global-only > cross-attention(Tab.5); 멀티태스크가 포인트맵 정확도↑(특히 **카메라** 항이 결정적, 깊이는 미미, Tab.6); 패치화는 DINOv2 > conv(안정성).
- **다운스트림**: 사전학습 백본이 NVS(LVSM식, 입력 카메라 불요)·**동적 포인트 트래킹**(CoTracker+VGGT, TAP-Vid SOTA) 강화.
- **확장성**: 200프레임 8.75s/40.6GB(H100, flash-attn v3).

## 한계
- fisheye·파노라마 미지원, 극단적 입력 회전에서 성능 저하, **큰 비강체 변형 실패**(작은 비강체는 가능). → 타깃 데이터 fine-tune으로 보완 가능.

## 관련
- **계보(다른 영역 아님, research)**: [[DUSt3R]]/MASt3R의 **다중프레임·후처리 제거** 후계. pairwise + global alignment를 단일 forward로 대체.
- **동적 대조**: [[MONST3R]] — 같은 DUSt3R 포인트맵 표현을 **동적 영상**으로 확장(VGGT는 정적 다중뷰 + 다운스트림 동적). 둘 다 "pointmap을 직접 회귀" 패러다임.
- **개념(다른 영역)**: [[Transformer]]·[[ViT]] — AA 백본의 토대 / [[SfM-COLMAP]] — VGGT가 대체·가속하려는 전통 SfM 파이프라인.
- **응용 연결**: [[3D-Gaussian-Splatting]] — 포인트맵은 3DGS 초기화로 직결되는 over-parameterized 표현.
- **출처 메타**: [[2026-06-16-VGGT-논문]]
