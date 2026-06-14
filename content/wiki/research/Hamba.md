---
title: Hamba (Graph-guided Bi-Scanning Mamba 손 복원)
area: research
created: 2026-06-13
sources: [hamba.md]
tags: [research, Hamba, hand-mesh, MANO, mamba, graph, SSM, monocular]
---

# Hamba — Single-view 3D Hand Reconstruction with Graph-guided Bi-Scanning Mamba

> Dong, Chharia, Gou, Vicente Carrasco, De la Torre (CMU). *"Hamba: Single-view 3D Hand Reconstruction with Graph-guided Bi-Scanning Mamba"*, NeurIPS 2024. arXiv:2407.09646.

**한 줄 요약**: 손 복원에서 attention 대신 **[[Mamba-선형시간시퀀스|Mamba]](SSM) + 그래프 학습**을 결합 — Mamba의 스캔을 **관절 그래프 기반 양방향 스캔(GBS)** 으로 재구성해, 소수의 유효 토큰(attention 대비 **88.5%↓**)으로 관절 공간관계를 효율적으로 학습. FreiHAND PA-MPVPE **5.3mm**, HO3D 리더보드 **Rank 1**. (출처: [[2026-06-13-Hamba-논문]])

## 문제의식
- [[HaMeR]]·METRO·MeshGraphormer 등 transformer 기반은 **관절 간 공간관계 모델링이 비효율**: 모든 이미지 토큰에 attention → 토큰 과다·배경 상관 유입 → in-the-wild 가림·절단서 부정확.
- [[Mamba-선형시간시퀀스|Mamba]]는 전역 수용야·선형 비용이나 **단방향 스캔**이고 3D용 설계 부재, **국소(관절 의미)관계**엔 약함 → 그래프로 보완.

## 방법 (Fig.3)
- **표현**: [[MANO]] $\{\theta(48),\beta(10),\pi(3)\}$ → 778 정점·21 관절. 백본 [[ViT|ViT(ViTPose)]] → 토큰 다운샘플(1280→512).
- **Token Sampler(TS) + Joints Regressor(JR)**: JR(SS2D+MLP)이 초기 MANO·2D 관절 $\hat J_{2D}$ 예측 → TS가 그 위치로 **유효 토큰 21개만 샘플**(bilinear). 배경/불필요 특징 차단.
- **Graph-guided Bidirectional Scan(GBS)**: Mamba 단방향 스캔을 **관절 그래프 패턴 따라 양방향(forward/backward "두 뱀")** 으로. 스캔 토큰 192→**22(88.5%↓)**. (VMamba의 SS2D 블록 차용.)
- **Graph-guided State Space(GSS) 블록**(decoder, L개): **GCN**(MANO 골격 인접행렬, 관절 의미관계 학습) → global mean 토큰과 concat → **SS2D(Mamba)** + residual + LN + FFN. $T_{GSS}=FFN(LN(SS2D(T)+T))+SS2D(T)+T$.
- **Fusion**: GSS 토큰 + global mean + 샘플 토큰 + 2D 관절 특징 → MLP로 MANO 회귀.
- **손실**($L_{2D},L_{3D},L_\theta,L_\beta,L_{adv}$) [[HaMeR]] 방식, 동일 2.7M 데이터.

## 결과
- **FreiHAND**: PA-MPVPE 5.5(→TTA **5.3**), F@15 **0.992** — HaMeR(5.7) 상회. **HO3Dv2** PA-MPJPE 7.5, **HO3Dv3** 6.9 SOTA, 두 리더보드 **Rank 1**.
- **in-the-wild(HInt)**: HaMeR 대비 큰 폭 향상 — 가림·절단서 관절 공간 시퀀스를 SSM으로 학습한 덕.
- **ablation**: GSS 분기 기여 최대(빼면 큰 하락). 2D 관절 위치 직접 쓰는 것보다 **공간관계 모델링 토큰**이 우수(가림 시 2D 관절 부정확하므로).

## 관련
- **개념 핵심**: [[Mamba-선형시간시퀀스]]·[[SSM]] (SSM/스캔), [[MANO]](출력), [[ViT]](백본) (concepts)
- **대조/계보**: [[HaMeR]](attention 기반 SOTA, Hamba가 능가) · [[WiLoR]] · [[HMR]]
- **출처 메타**: [[2026-06-13-Hamba-논문]]
