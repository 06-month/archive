---
title: MANO (hand Model with Articulated and Non-rigid defOrmations)
area: concepts
created: 2026-06-13
sources: [mano.md]
tags: [concepts, MANO, hand-model, parametric-model, SMPL, 3D-hand]
---

# MANO (손 파라메트릭 모델)

> Romero, Tzionas, Black (MPI-IS / Body Labs). *"Embodied Hands: Modeling and Capturing Hands and Bodies Together"*, ACM ToG / SIGGRAPH Asia 2017. arXiv:2201.02610.

**한 줄 요약**: [[SMPL]]과 **같은 정식화**(형상+자세 블렌드셰이프 + 블렌드 스키닝)를 손에 적용한 파라메트릭 손 모델. 저차원·사실적·그래픽엔진 호환. 단일뷰 3D 손 복원 연구가 이미지→$(\vec\beta,\vec\theta)$ 로 회귀하는 **출력 표준**.

## 모델 (SMPL과 동일 골격)
$$M(\vec\beta,\vec\theta)=W\big(\bar T+B_S(\vec\beta)+B_P(\vec\theta),\ J(\vec\beta),\ \vec\theta,\ \mathcal W\big)$$
- SMPL 손 토폴로지 사용. 손 메쉬 **778 정점**, **15 관절 + 글로벌 방향**(16) 키네마틱(통상 21 키포인트). 자세 $\vec\theta$=관절 axis-angle.
- 형상 $B_S(\vec\beta)=\sum\beta_n S_n$ (스캔 PCA), 자세 $B_P(\vec\theta)=\sum(R_n(\vec\theta)-R_n(\vec\theta^*))P_n$ — SMPL처럼 **회전행렬 원소에 선형**. 관절 회귀자 $J(\vec\beta)$.
- 데이터: 31명·최대 51포즈(Feix grasp taxonomy) **~2018 스캔(1554 등록)**, 3dMDhand 0.2mm 정밀.

## SMPL과의 3가지 차이 (손의 특수성)
1. **국소화된 pose blendshape**: 손은 관절이 많고 과매개변수 → 과적합·비국소 변형. 보정이 **측지거리(geodesic)상 먼 관절**에 의존하지 못하게 가중치 $\Lambda_P=\mathcal J_j D_{geo}$ 로 정규화 → 국소 변형.
2. **저차원 자세 임베딩(PCA)**: 손 자세는 본질적으로 저차원(신경과학: 2 PC>80%). axis-angle에 PCA → **~6 PC가 81% 변산** 설명. 노이즈·결측 많은 풀바디 스캔에 강건(적은 PC), 깨끗한 손 데이터엔 많은 PC.
3. **좌우 대칭**: 오른손 모델 하나를 학습(미러링한 왼손 데이터로 증강) 후 미러해 왼손 생성 → 데이터 2배·편향 제거.

## SMPL+H — 몸+손 통합
- MANO 손(블렌드웨이트·pose blendshape·관절회귀)을 [[SMPL]] 몸에 부착. 형상은 **몸 형상공간**에서(몸-손 상관 포착).
- DOF: SMPL 66(손 제외) → SMPL+H **78**(각 손 6D PCA). 4D 스캐너로 몸+손 동시 캡처(손이 노이즈·결측이어도 강건).

## 평가
- pose blendshape on/off: **0.93 vs 1.3mm**(피팅도 개선). 파라미터 학습 전/후: 2.90→**1.01mm**(60%↑). 저차원이라 실시간·메모리 효율적(LBS급).

## 의미 (왜 공통 개념인가)
- 3D 손 복원의 **출력 표현 표준**. 이미지→MANO 파라미터 회귀가 [[HaMeR]]·[[Hamba]]·[[WiLoR]] 등 방법론의 공통 틀. 몸 버전이 [[SMPL]].

## 관련
- [[SMPL]] (concepts) — 몸 버전(같은 정식화), SMPL+H로 통합
- [[HMR]] · [[HaMeR]] · [[WiLoR]] (research) — 이미지에서 MANO/SMPL 파라미터 회귀
