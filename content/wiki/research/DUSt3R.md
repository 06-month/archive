---
title: DUSt3R (Geometric 3D Vision Made Easy)
area: research
created: 2026-06-16
sources: [DUSt3R.md]
tags: [research, 3D-reconstruction, pointmap, MVS, SfM, camera-pose, depth, CroCo, foundation]
---

# DUSt3R: Dense and Unconstrained Stereo 3D Reconstruction

> Wang, Leroy, Cabon, Chidlovskii, Revaud (Aalto Univ · Naver Labs Europe). *"DUSt3R: Geometric 3D Vision Made Easy"*, CVPR 2024. arXiv:2312.14132. dust3r.europe.naverlabs.com

**한 줄 요약**: 보정·포즈 정보가 **전혀 없는** 이미지 쌍에서 3D 복원을 **포인트맵 회귀**로 푸는 패러다임. 투영 카메라 모델의 하드 제약을 풀고, 단일 회귀 출력에서 카메라·깊이·매칭·3D를 모두 끌어낸다. 이후 [[VGGT]]·[[MONST3R]]·[[POMATO]]·[[MoRe]] 등 "feed-forward 3D 복원" 계보 전체의 **뿌리**. (출처: [[2026-06-16-DUSt3R-논문]])

## 문제의식
- 전통 MVS는 카메라 intrinsic·extrinsic를 먼저 추정해야 삼각측량 가능 → [[SfM-COLMAP|SfM]]/BA 파이프라인이 매칭→essential matrix→삼각측량→희소복원→카메라→밀집복원의 **연쇄 최소문제**. 각 단계가 다음에 노이즈를 전파, 뷰 부족·비람버시안·카메라 모션 부족 시 취약.
- DUSt3R는 정반대 입장: **카메라 파라미터 없이** 한 쌍의 이미지에서 밀집·정확한 장면 표현을 직접 회귀. 단안과 양안 복원을 하나의 정식으로 통일.

## 포인트맵 표현 (핵심)
- **포인트맵** $X\in\mathbb R^{W\times H\times3}$: 각 픽셀 $(i,j)$ ↔ 3D 점 $X_{i,j}$ 의 1:1 밀집 사상. GT는 intrinsic·깊이로 $X_{i,j}=K^{-1}[iD,jD,D]^\top$.
- $X^{n,m}=P_mP_n^{-1}h(X^n)$ — 카메라 $n$의 포인트맵을 카메라 $m$ 좌표계로 (rigid 변환).
- 네트워크는 두 포인트맵 $X^{1,1},X^{2,1}$ 을 **모두 첫 이미지 $I_1$ 좌표계**로 출력 → 카메라 포즈를 암묵적으로 처리, 회귀 문제를 well-posed로. 스케일은 unknown factor up to.

## 아키텍처 (Fig. 2)
- **CroCo 영감** 구조 (cross-view completion 사전학습 활용). 두 이미지를 weight-sharing **[[ViT]] 인코더**(Siamese)로 토큰화 $F^1,F^2$.
- **두 개의 [[Transformer]] 디코더**가 각 블록에서 self-attention → **cross-attention(상대 브랜치 토큰)** → MLP. 디코더 내내 두 브랜치가 정보 교환 — 정렬된 포인트맵 출력의 핵심.
- 각 브랜치 회귀 헤드(DPT)가 포인트맵 + **confidence map** 출력. 기하 제약을 명시 강제하지 않고 train set에서 prior를 학습.
- 백본: ViT-Large 인코더 + ViT-Base 디코더 + DPT 헤드, CroCo 가중치로 초기화.

## 학습 목표 (식 2–4)
- **3D 회귀 손실**: 예측·GT 포인트맵을 각각 스케일 $z,\bar z$(원점까지 평균거리)로 정규화 후 유클리드 거리 $\ell_{regr}=\lVert \frac1z X^{v,1}_i - \frac1{\bar z}\bar X^{v,1}_i\rVert$.
- **Confidence-aware 손실**: $L_{conf}=\sum C^{v,1}_i\ell_{regr}-\alpha\log C^{v,1}_i$ — 하늘·반투명 등 ill-defined 영역에 신뢰도를 함께 학습(명시 supervision 없이). $C>1$ 강제.
- 8개 데이터셋 혼합(Habitat·MegaDepth·ARKitScenes·ScanNet++·CO3D-v2·Waymo 등) 8.5M 쌍. 224→512 순차 학습, aspect ratio 랜덤화.

## 다운스트림 (§3.3) — 포인트맵에서 끌어내기
- **점 매칭**: 3D 포인트맵 공간 최근접(NN) 상호 대응 $M^{1,2}$.
- **Intrinsic 복원**: $X^{1,1}$ 이 $I_1$ 좌표계이므로 focal $f^*_1$ 만 최적화(주점 중심·정사각 픽셀 가정, Weiszfeld 반복).
- **상대 포즈**: 포인트맵 Procrustes 정렬(closed-form, 노이즈 민감) 또는 더 견고하게 **PnP + RANSAC**.
- **절대 포즈(visual localization)**: 2D-3D 대응 → PnP-RANSAC. (학습 안 한 7Scenes·Cambridge서도 경쟁적)

## 전역 정렬 (§3.4) — 다중뷰 MVS
- pairwise만 가능한 $F$ 를 전체 장면으로 확장하는 **후처리 최적화**. 연결 그래프 $G(V,E)$ 구성(이미지 검색 또는 전체 쌍 통과, H100서 쌍당 ≈40ms).
- 전역 최적화: $\chi^*=\arg\min\sum_e\sum_v\sum_i C^{v,e}_i\lVert\chi^v_i-\sigma_e P_e X^{v,e}_i\rVert$ — 각 쌍을 공통 좌표로 회전, 쌍별 포즈 $P_e$·스케일 $\sigma_e$. $\prod_e\sigma_e=1$ 로 trivial 해 회피.
- **전통 BA와 달리 2D 재투영 오차가 아니라 3D 투영 오차를 직접 최소화** → 빠르고 수렴 우수(수백 스텝, 수초). 카메라 핀홀 모델 대입으로 모든 $\{P_n,K_n,D_n\}$ 복원.

## 결과
- **다중뷰 포즈**(CO3Dv2·RealEstate10K): PnP·전역정렬 모두 PoseDiffusion 등 SOTA 능가, 프레임 수에 안정적, 180° 반대 시점도 처리.
- **단안 깊이**(zero-shot): 자기지도 baseline 능가, 지도학습급. 깊이 = 포인트맵 $z$ 좌표, $F(I,I)$ 로 입력.
- **다중뷰 깊이**: ETH3D SOTA, COLMAP보다 빠름.
- **3D 복원**(DTU): GT 카메라 없이 Overall ≈1.7mm — 삼각측량 기반 최고정확도엔 못 미치나 plug-and-play 가치.
- **Ablation**: CroCo 사전학습·고해상도가 일관되게 향상.

## 한계
- 회귀 기반이라 sub-pixel 삼각측량 정밀도엔 못 미침. unknown intrinsic visual localization에서 sparse GT 시 스케일 불안정. **정적 장면 한정** — 동적은 후속 [[MONST3R]]·[[POMATO]]가 해결.

## 관련
- **계보(연구 후계)**: [[VGGT]] — pairwise+전역정렬을 단일 트랜스포머로 / [[MONST3R]] — per-timestep 포인트맵 동적 확장 / [[POMATO]] — 포인트맵 매칭 헤드로 동적 대응 / [[MoRe]] — VGGT 기반 동적 4D. 모두 DUSt3R 포인트맵 표현 계승.
- **개념(다른 영역)**: [[ViT]] — Siamese 인코더 / [[Transformer]] — cross-attention 디코더 / [[SfM-COLMAP]] — DUSt3R가 대체하는 전통 SfM/MVS.
- **응용 연결**: [[NeRF]]·[[3D-Gaussian-Splatting]] — 포인트맵·복원 카메라는 방사장 초기화 입력.
- **출처 메타**: [[2026-06-16-DUSt3R-논문]]
