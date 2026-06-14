---
title: WiLoR (in-the-Wild 손 Localization + Reconstruction)
area: research
created: 2026-06-13
sources: [wilor.md]
tags: [research, WiLoR, hand-mesh, MANO, detection, refinement, in-the-wild, monocular]
---

# WiLoR — End-to-end 3D Hand Localization and Reconstruction in-the-wild

> Potamias, Zhang, Deng, Zafeiriou (Imperial College London·SJTU). *"WiLoR: End-to-end 3D Hand Localization and Reconstruction in-the-wild"*, 2024. arXiv:2409.12259.

**한 줄 요약**: **검출(localization) + 복원(reconstruction)** 을 한 파이프라인으로 묶은 **full-stack** 손 시스템 — 실시간 FCN 손 검출기 + ViT 기반 복원기에 **다중스케일 정렬 보정(refinement) 모듈**을 더해, in-the-wild 다중 손을 SOTA 정확도로 복원하고 비디오서 시간적 안정성까지 확보. 출력은 [[MANO]] 파라미터. (출처: [[2026-06-13-WiLoR-논문]])

## 문제의식
- 3D 손 추정은 **타이트 크롭** 입력을 가정하나, **실시간 다중 손 검출기 부재**가 in-the-wild 일반화의 병목.
- [[HaMeR]]처럼 이미지→MANO **한 번에 회귀**하면 정렬(alignment) 어긋남·부정확 자세. 기존 정렬 개선은 중간 heatmap 등 차선책.

## 구성 ① 검출 (WHIM 데이터셋 + FCN)
- **WHIM**: YouTube 1400+ 영상에서 앙상블(ViTPose·AlphaPose로 사람 → MediaPipe·OpenPose·ContactHands로 손, 가중평균 bbox) 자동주석한 **2M+ in-the-wild 다중 손** 데이터셋. 생체역학(bone length·각도) + ARCTIC PCA 3D prior로 라벨 정제.
- **검출기**: anchor-free 1-stage FCN, DarkNet 백본 + **PANet** neck + 3 헤드(bbox·손좌우·관절). multi-task loss(BCE+DFL+CIoU+keypoint).
- 성능: **130–175 FPS**, ContactHands 대비 **45× 빠르고 32× 작음**, mAP 평균 +26%. 강건한 검출이 4D 안정성의 토대.

## 구성 ② 복원 (ViT + 다중스케일 refinement)
- 크롭 이미지 → **[[ViT|ViT(ViTPose)]]** 백본, 이미지 토큰 + 학습형 **pose·shape·camera 토큰** concat → rough MANO·카메라 추정.
- **Multi-Scale Pose Refinement(핵심)**: 이미지 토큰을 reshape→deconv로 다해상도 특징맵 $F_0,...,F_n$ 생성. rough 메쉬를 카메라로 투영해 **정점별 image-aligned 특징을 bilinear 샘플** → 집계 → **잔차 $\Delta\theta,\Delta\beta$** 회귀(coarse-to-fine). 저해상=구조, 고해상=세부.
- 손실: $L_{3D}$(정점)+$L_{2D}$+$L_{mano}$+$L_{adv}$(판별자). 학습 **4.2M 이미지**(HaMeR보다 55%↑, BEDLAM·ARCTIC·Hot3D 등 포함).

## 결과
- **FreiHAND** PA-MPVPE **5.1mm**·F@15 **0.993**, **HO3Dv2** PA-MPJPE 7.5·AUCV 0.846 — 전 지표 SOTA([[HaMeR]] 5.7 상회). refinement의 image-aligned 특징이 고난도 자세서 정렬 개선.
- **4D/동적**: 시간 모듈 없이도 프레임별 jitter 최소(HaMeR보다 우수) — 강건 검출 → 안정 트래킹.
- ablation: refinement·ViTPose 사전학습·다중스케일·대규모 데이터 모두 기여(FastViT로 바꾸면 하락).

## 관련
- **개념**: [[MANO]](출력) · [[ViT]](백본) (concepts)
- **계보/대조**: [[HaMeR]](회귀, WiLoR이 검출+정렬로 보완) · [[Hamba]](Mamba 대안) · [[HMR]](인체 원형)
- **출처 메타**: [[2026-06-13-WiLoR-논문]]
