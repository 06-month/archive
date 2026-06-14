---
title: SMPL (Skinned Multi-Person Linear body model)
area: concepts
created: 2026-06-13
sources: [SMPL.md]
tags: [concepts, SMPL, parametric-model, body-model, blend-skinning, 3D-human]
---

# SMPL (Skinned Multi-Person Linear body model)

> Loper, Mahmood, Romero, Pons-Moll, Black (MPI-IS). *"SMPL: A Skinned Multi-Person Linear Model"*, ACM ToG / SIGGRAPH Asia 2015.

**한 줄 요약**: 사람 몸을 **형상(shape) $\vec\beta$ + 자세(pose) $\vec\theta$** 두 저차원 벡터로 제어하는 **정점 기반 파라메트릭 모델**. 표준 블렌드 스키닝과 호환돼 게임엔진에서 바로 돌고, 데이터로 학습돼 사실적. 3D 인체/손 복원 연구가 회귀 대상으로 삼는 표준 표현(손 버전이 [[MANO]]).

## 모델 정식화
정점 $N{=}6890$, 관절 $K{=}23$(부위 24)의 템플릿 $\bar T$ 에 두 블렌드셰이프를 더하고 스키닝:
$$M(\vec\beta,\vec\theta)=W\big(\bar T+B_S(\vec\beta)+B_P(\vec\theta),\ J(\vec\beta),\ \vec\theta,\ \mathcal W\big)$$
- $W$: 표준 블렌드 스키닝(LBS 또는 DQBS). 정점당 최대 4관절 영향(희소).
- **형상 블렌드셰이프** $B_S(\vec\beta)=\sum_n\beta_n S_n$ — CAESAR 스캔 **PCA**의 주성분 $S_n$. $\vec\beta$ 에 **선형**.
- **자세 블렌드셰이프** $B_P(\vec\theta)=\sum_n (R_n(\vec\theta)-R_n(\vec\theta^*))P_n$ — **핵심 혁신**: $\vec\theta$ 가 아니라 **부위 회전행렬의 원소**에 선형(207 = 23×9). 회전행렬 원소는 유계라 외삽 시 "터지지" 않음. 휴식자세 $\vec\theta^*$ 빼서 rest pose 기여=0.
- **관절 회귀자** $J(\vec\beta)$: 형상에 따라 관절 위치를 표면 정점의 희소 가중합으로 예측(NNLS 학습).
- 자세 $\vec\theta$: 관절당 axis-angle, **72 = 23×3 + 3(루트)** 파라미터. Rodrigues로 회전행렬화.

## 학습·성능
- 학습 파라미터 $\Phi=\{\bar T,\mathcal W,S,\mathcal J,P\}$ 를 정점 재구성오차 최소화로 추정. 1786 자세 스캔 + CAESAR 형상 스캔(~성별당 2000), 남녀 별도. **자세/형상을 분리 학습**(형상 PCA 전 pose-normalize 필수).
- 같은 데이터로 학습한 **BlendSCAPE보다 정확**(삼각형 변형 기반 대비 정점 기반이 더 정확·6× 빠름). LBS·DQBS 거의 동등.
- **렌더 엔진 호환**: FBX로 export, Maya·Unity·Blender·Unreal에서 구동. → 학습 모델을 애니메이터가 바로 사용.

## DMPL (Dynamic SMPL)
4D 스캔으로 학습한 **동적 연조직(soft-tissue) 블렌드셰이프** $B_D(\vec\phi_t,\vec\beta)$ 추가 — 속도·가속도·이력에 의존, 체형에 따라 달라짐. 정점 기반이라 표준 SW와 여전히 호환.

## 의미 (왜 공통 개념인가)
- 3D 인체/손 복원의 **출력 표현 표준**. 이미지→$(\vec\beta,\vec\theta)$ 회귀가 [[HMR]]·HaMeR 등 방법론의 공통 틀.
- 손 전용 변형이 [[MANO]]. 두 모델 모두 "블렌드셰이프 + 스키닝 + 관절회귀" 골격을 공유.

## 관련
- [[MANO]] (concepts) — 손 버전(같은 정식화)
- [[HMR]] · [[HaMeR]] · [[WiLoR]] (research) — 이미지에서 SMPL/MANO 파라미터 회귀
