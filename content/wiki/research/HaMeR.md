---
title: HaMeR (Hand Mesh Recovery with Transformers)
area: research
created: 2026-06-13
sources: [hamer.md]
tags: [research, HaMeR, hand-mesh, MANO, ViT, transformer, monocular, in-the-wild]
---

# HaMeR — Reconstructing Hands in 3D with Transformers

> Pavlakos, Shan, Radosavovic, Kanazawa, Fouhey, Malik (UC Berkeley·UMich·NYU). *"Reconstructing Hands in 3D with Transformers"*, CVPR 2024. arXiv:2312.05251.

**한 줄 요약**: 단일 RGB에서 **[[MANO]] 파라미터를 회귀**하는 **완전 Transformer**(ViT-H 백본) 손 메쉬 복원기. 핵심은 **데이터·모델 규모 확대** — 2.7M 학습샘플 + ViT-H로 in-the-wild 손 복원에서 기존 대비 PCK@0.05 **2–3× 향상**. [[HMR]]의 회귀 철학을 손에 적용(HMR2.0 계열). (출처: [[2026-06-13-HaMeR-논문]])

## 방법 (Fig.2)
- **표현**: [[MANO]] $M(\theta,\beta)$, $\theta\in\mathbb R^{48}$·$\beta\in\mathbb R^{10}$ → 메쉬 $V{=}778$ 정점, $K{=}21$ 관절. 출력 $\Theta=\{\theta,\beta,\pi\}$ ($\pi$=카메라 translation, 투영 $x=\Pi_K(X+t)$).
- **아키텍처(완전 transformerized)**: 이미지→패치→**[[ViT|ViT-H]]** 백본 → 출력 토큰. **transformer decoder head**가 단일 쿼리 토큰으로 ViT 토큰을 **cross-attention** → $\Theta$ 회귀. ([[HMR]]2.0과 유사, bells & whistles 없음.)
- **손실**: 3D 정답 시 $L_{3D}=\|\theta-\theta^*\|^2+\|\beta-\beta^*\|^2+\|X-X^*\|_1$, 항상 $L_{2D}=\|x-x^*\|_1$(재투영), + **adversarial**(형상·자세·관절별 판별자, [[HMR]] 방식)로 자연스러운 손 유도.

## 핵심: 스케일업 (데이터 + 모델)
- **데이터 2.7M**: FreiHAND·HO3D·MTC·RHD·InterHand2.6M·H2O3D·DexYCB·COCO-WholeBody·Halpe·MPII NZSL 통합(FrankMocap의 4×). 단 5%만 in-the-wild.
- **모델**: 대규모 ViT-H. **ablation(Table 5): 큰 데이터와 큰 모델이 둘 다 있어야** 큰 향상(둘 중 하나만으론 부족).

## HInt 데이터셋 (기여)
- **Hand Interactions in the wild**: 비디오(New Days/Hands23, Epic-Kitchens/VISOR, Ego4D)에서 **40.4K 손**의 2D 키포인트(21개) + **가림(occlusion) 라벨** 주석. 2D 손 키포인트에 **occlusion 라벨을 단 최초** 데이터셋. 86.7%가 자연 접촉 상태.

## 결과
- **3D 벤치**: FreiHAND PA-MPVPE **5.7mm**, HO3Dv2 등 대부분 지표 SOTA(이미 포화 기미라 개선폭 작음).
- **in-the-wild(HInt PCK@0.05)**: New Days **48.0** vs FrankMocap 16.1 / MeshGraphormer 16.8 — **2–3× 향상**. 가림 관절서도 큰 우위(robustness). 단일 프레임이나 비디오서 시간적으로 안정.

## 관련
- **개념**: [[MANO]](출력) · [[ViT]]·[[Transformer]](백본·헤드) (concepts)
- **계보/대조**: [[HMR]](인체 메쉬 회귀 원형) · [[WiLoR]](in-the-wild 손, localization+recon) · [[Hamba]](Mamba 기반 대안 백본)
- **출처 메타**: [[2026-06-13-HaMeR-논문]]
