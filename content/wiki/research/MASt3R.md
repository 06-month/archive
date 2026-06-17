---
title: MASt3R (Matching And Stereo 3D Reconstruction)
area: research
created: 2026-06-17
sources: [MASt3R.md]
tags: [research, 3D-reconstruction, image-matching, camera-pose, visual-localization, pointmap, DUSt3R-lineage]
---

# MASt3R: Grounding Image Matching in 3D

> Leroy, Cabon, Revaud (NAVER LABS Europe). *"Grounding Image Matching in 3D with MASt3R"*, ECCV 2024. arXiv:2406.09756. github.com/naver/mast3r

**한 줄 요약**: [[DUSt3R]]에 **dense local feature 헤드**(InfoNCE 매칭 손실)를 더해, 이미지 매칭을 2D가 아닌 **3D 문제**로 풀어 robust·정밀한 대응을 얻는 모델. **fast reciprocal matching**으로 dense 매칭을 2 orders 가속. Map-free localization에서 VCRE AUC를 **30%p** 끌어올림. [[DUSt3R]]→MASt3R→[[VGGT]]/[[MONST3R]] 분기의 핵심 후계. (출처: [[2026-06-17-MASt3R-논문]])

## 문제의식
- 이미지 매칭은 본질적으로 **3D 문제**(대응 픽셀 = 같은 3D점 관측, 상대 포즈와 epipolar로 직결)인데 거의 모든 방법이 **2D 문제로** 취급 → 극단 시점·저텍스처서 실패(LoFTR도 Map-free VCRE 34%).
- [[DUSt3R]]는 매칭 학습을 안 했는데도 pointmap에서 뽑은 대응이 Map-free 1위 — 단 **회귀 기반이라 부정확**. MASt3R는 robustness는 유지하며 **정밀도**를 보강.

## 방법 (Fig. 2)
- DUSt3R 구조([[CroCo]] 사전학습 ViT-L 인코더 + ViT-B 디코더, cross-attention) 위에 **두 번째 헤드 Head_desc** 추가 → 픽셀당 dense local feature $D_1, D_2\in\mathbb R^{H\times W\times d}$($d=24$, 2-layer MLP+GELU, unit-norm).
- **Matching 손실**: GT 3D 대응 $\hat M$ 에 **InfoNCE**(cross-entropy classification) — 정확한 픽셀만 보상(회귀와 달리 근처 픽셀 무보상) → 고정밀 유도. 최종 $L=L_{conf}+\beta L_{match}$. DUSt3R 회귀 + 매칭 동시 학습이 매칭만 학습보다 우수(**3D grounding이 매칭에 결정적**).
- **Metric 예측**: GT가 metric일 땐 정규화 무시($z:=\hat z$) → metric-scale 포즈(map-free localization에 필수).

## Fast Reciprocal Matching (FRM, §3.3)
- naive reciprocal NN은 $O(W^2H^2)$ — dense 피처 계산보다 **매칭이 더 느림**. 해법: $k\ll WH$ 개 sparse 시드에서 시작, $I_1\to I_2\to I_1$ NN을 **반복**해 cycle(상호 대응)을 모으고 수렴한 점은 제거(Fig. 3). 복잡도 $O(kWH)$, $WH/k$ 배 빠름.
- **이론 보장**(부록 B): 각 sub-graph는 단일 cycle을 가진 arborescence → 임의 시작점이 reciprocal match로 수렴. FRM은 **큰 convergence basin에 편향** 샘플링 → 공간 균일 커버리지 → RANSAC 포즈 추정이 더 안정 → **subsampling이 오히려 정확도↑**(k=3000서 64× 빠르고 성능↑).
- **Coarse-to-fine**(§3.4): 512px 한계라 고해상도는 다운스케일 매칭 후, 겹치는 window crop 쌍에서 세밀 매칭 → 원해상도 dense 대응. coarse-only 대비 큰 향상.

## 결과
- **Map-free localization**: VCRE AUC **93%+**, 2위 LoFTR+KBR(63.4%) 대비 **+30%p**, median translation 2m→36cm. metric depth + 매칭 덕. direct regression(PnP)도 SOTA 능가.
- **상대 포즈**(CO3Dv2·RealEstate10K): RayDiffusion·DUSt3R 능가, RealEstate mAA가 DUSt3R 대비 +15.2점(쌍 단위 예측인데도).
- **Visual localization**(Aachen·InLoc): top40서 InLoc SOTA 대폭 능가. top1(단일 검색)에도 robust.
- **Dense MVS**(DTU, zero-shot): GT 카메라·포즈 없이 삼각측량만으로 DUSt3R(Chamfer 1.741) → **0.374**, 학습형 기법에 필적. 학습: DUSt3R 체크포인트 초기화, 14 데이터셋, 35 epoch.

## 한계
- 512px 해상도 한계(coarse-to-fine로 우회). 회귀 direct regression은 큰 장면서 localization 오차 큼(매칭이 안전). ViT 고해상도 일반화 미흡.

## 관련
- **직접 기반(연구)**: [[DUSt3R]] — 구조·pointmap·confidence 손실 계승, 체크포인트 초기화. MASt3R = DUSt3R + 매칭 헤드. / [[CroCo]] — 인코더 사전학습 토대.
- **계보 형제**: [[VGGT]]·[[MONST3R]]·[[POMATO]] — 같은 DUSt3R 계보(VGGT는 다중뷰 단일 forward, MASt3R는 2뷰 매칭 특화) / [[GS-LRM]] 계보와 함께 feed-forward 3D 복원의 두 축.
- **개념(다른 영역)**: [[SfM-COLMAP]] — MASt3R가 대체·보강하는 전통 매칭+localization / [[ViT]]·[[Transformer]] — 백본 / [[DINO]] — 대조적 백본 사전학습.
- **출처 메타**: [[2026-06-17-MASt3R-논문]]
