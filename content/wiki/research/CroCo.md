---
title: CroCo (Cross-view Completion)
area: research
created: 2026-06-17
sources: [CroCo.md]
tags: [research, self-supervised, pretraining, cross-view-completion, 3D-vision, DUSt3R-lineage]
---

# CroCo: Self-Supervised Pre-training by Cross-View Completion

> Weinzaepfel, Leroy, Lucas, Brégier, Cabon, Arora, Antsfeld, Chidlovskii, Csurka, Revaud (NAVER LABS Europe). *"CroCo: Self-Supervised Pre-training for 3D Vision Tasks by Cross-View Completion"*, NeurIPS 2022. arXiv:2210.10716

**한 줄 요약**: 같은 장면의 **두 시점 이미지**로 마스킹된 첫 이미지를 복원하는 **cross-view completion** 사전학습 — 단일뷰 MAE의 모호성을 두 번째 뷰로 해소해 **3D 기하·저수준 task**에 강한 피처를 학습. [[DUSt3R]]·[[MASt3R]]·[[MONST3R]] 계보의 **인코더 사전학습 토대**. (출처: [[2026-06-17-CroCo-논문]])

## 문제의식
- MAE 등 **단일뷰 MIM**(masked image modeling)은 가려진 영역을 보이는 부분만으로 추론 → 고수준 semantic prior에 의존, ImageNet 학습 시 분류·검출엔 좋으나 **깊이·플로우 등 3D 기하 task엔 부적합**.
- CroCo: 첫 이미지를 마스킹하되 **같은 장면의 두 번째(reference) 뷰**를 함께 줌 → 모호성 대부분이 **장면 기하 + 두 뷰의 공간 관계** 추론으로 해소(Fig. 1). MIM을 3D vision용으로 재설계한 최초 시도.

## 방법
- 두 이미지를 patch로 분할, 첫 이미지의 **90%(높은 비율)** 마스킹. **Siamese [[ViT]] 인코더**(공유 가중치)로 보이는 패치 $\tilde p_1$ 과 reference $p_2$ 를 각각 인코딩.
- **디코더**: 마스크 토큰 + $E_\theta(\tilde p_1)$ 를 reference 토큰 $E_\theta(p_2)$ 에 조건화해 복원. 두 블록 비교: **CrossBlock**(self→cross-attention 교대, 파라미터↑·연산↓) vs **CatBlock**(두 뷰 토큰 concat 후 self-attention). 성능 유사, CrossBlock 채택.
- 손실: 마스크 패치 픽셀 **MSE**(MAE식, patch 정규화 변형이 더 좋음). 데이터: Habitat 시뮬레이터로 HM3D·ScanNet·Replica에서 **co-visibility ≈0.5** 의 합성 쌍 182만 장(겹침 너무 적으면 auto-completion, 너무 많으면 trivial).

## 활용·결과
- **단안 task**: 디코더 버리고 인코더만 → DPT head. 단안 깊이(NYUv2 85.6% δ1)·Taskonomy서 MAE·MultiMAE 능가(같은 Habitat 데이터에서도). 단, ImageNet 분류는 indoor 데이터 탓에 낮음(사전학습 데이터 문제).
- **양안 task**(인코더+디코더 그대로): optical flow(MPI-Sintel)·**상대 포즈 회귀**(7-scenes)·stereo matching(VKITTI)을 task별 설계 없이 경쟁력 있게. CroCo init이 random·MAE init보다 큰 폭 우수(특히 적은 데이터·깊은 디코더).

## 한계
- 합성 indoor 쌍 의존 → 고수준 semantic task 약함(데이터 선택 문제). 실세계 쌍(SfM·geo-referencing)으로 확장이 향후 과제. 224² 저해상도라 큰 변위에 한계.

## 관련
- **직접 후계(연구)**: [[DUSt3R]] — CroCo 구조(ViT 인코더 + cross-attention 디코더)와 가중치를 **사전학습 초기값**으로 차용, pointmap 회귀로 발전 / [[MASt3R]]·[[MONST3R]] — DUSt3R 경유 CroCo 계승.
- **대조 사전학습(다른 영역)**: [[DINO]] — 범용 instance/MIM 자기지도(DINOv2 백본) vs CroCo의 3D 특화 cross-view. 둘 다 MAE 계열 MIM에서 출발.
- **개념(다른 영역)**: [[ViT]] — Siamese 인코더 / [[Transformer]] — cross-attention 디코더 / [[SfM-COLMAP]] — 실세계 쌍 확장 수단.
- **출처 메타**: [[2026-06-17-CroCo-논문]]
