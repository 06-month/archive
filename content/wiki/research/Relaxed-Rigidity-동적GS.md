---
title: Relaxed Rigidity (Ray-based Grouping 동적 GS)
area: research
created: 2026-06-13
sources:
  - Relaxed Rigidity with Ray-based Grouping for Dynamic Gaussian Splatting.md
tags:
  - research
  - 4DGS
  - dynamic-scene
  - motion-regularization
  - monocular-video
  - novel-view-synthesis
---

# Relaxed Rigidity — Ray-based Grouping 동적(4D) Gaussian Splatting

> Junoh Lee, Junmyeong Lee, Yeon-Ji Song, Inhwan Bae, Jisu Shin, Hae-Gon Jeon, Jin-Hwa Kim (GIST·Yonsei·SNU·DGIST·NAVER AI Lab). *"Relaxed Rigidity with Ray-based Grouping for Dynamic Gaussian Splatting"*, arXiv:2603.24994v2 (2026).

**한 줄 요약**: 단안 비디오 **동적(4D) 장면** 복원에서, 광선 단위로 가우시안을 묶고(**ray-based grouping**) 그 그룹에 **느슨한 강체성(relaxed rigidity)** 제약을 걸어 — **옵티컬 플로우·깊이 같은 외부 prior 없이** 물리적으로 그럴듯한 모션을 학습하는 **모델 비종속(plug-in) 정규화**. (출처: [[2026-06-13-RelaxedRigidity-논문]])

## 문제의식
- 동적 3DGS(=4DGS)는 캐노니컬 가우시안에 시간 offset을 더해 움직임을 표현하나, 추정 모션이 **물리적 타당성에 의해 규율되지 않아** under/over-constrained → 국소 기하 붕괴, floater.
- 기존 해법의 한계:
  - **외부 prior**(optical flow·2D track·depth): 2D **스크린 공간** 신호라 3D 기하에 간접적·오류 전파. 텍스처 없는 배경·시점의존 영역서 실패.
  - **엄격한 강체(KNN+rigid/ARAP)**: 유클리드 거리로 묶어 가우시안의 **scale·opacity 무시**, 위상 변화(topology change)서 거리 가정 붕괴, 비강체 모션 표현 불가.

## 핵심 아이디어 (2단계, 외부 prior 0)
### ① Ray-based Gaussian Grouping (§3.2)
- 각 픽셀 광선이 관통하는 가우시안 중 **α-blending 기여 가중치** $w_i=T_i(1-e^{-\alpha_i})$ 가 임계 $\tau$ 초과인 것만 그룹 $\mathcal{N}_j=\{\mathcal{G}_i\mid w_i>\tau\}$ 로 선택.
- **래스터화의 정렬·블렌딩(가시성)을 그룹핑 함수로 재활용** → 추가 연산 없음. 투과율 $T_i$ 가 가림막 뒤에서 급감 → 자연히 **비가림 표면**의 인접 가우시안만 분리(전경/배경 뒤섞임 방지). 그룹 크기 적응적.
- KNN 거리 그룹핑 대비: 물리적으로 가깝지만 구조적으로 독립인 부분의 오결합을 회피. (기반: [[3D-Gaussian-Splatting]]의 $\alpha$-blending, [[방사장-볼륨렌더링]])

### ② 느슨한 강체성 = 두 정규화
- **Motion Coherence Regularization (MCR, §3.3)**: 그룹 내 변위 $\mathbf{d}_{i,t}=\mu_{i,t+\Delta t}-\mu_{i,t}$ 와 그룹 평균 $\bar{\mathbf{d}}$ 의 **방향만** 코사인 유사도로 정렬: $L_{MCR}=1-\frac{\mathbf{d}_{i,t}\cdot\bar{\mathbf{d}}}{\|\mathbf{d}_{i,t}\|\|\bar{\mathbf{d}}\|+\epsilon}$. **크기(magnitude)는 제약 안 함** → 강체 병진으로 오인하지 않고 비균일 모션 허용. ($\|\mathbf{d}\|>10^{-4}$ 인 움직이는 가우시안만.)
- **Spectral Regularization (SR, §3.4)**: 그룹 위치들의 **공분산 고유값 스펙트럼**을 시간 $t,t{+}\Delta t$ 간 Huber로 일치: $L_{SR}=\sum_{r}\mathrm{Huber}(\sigma_{t,r},\sigma_{t+\Delta t,r})$. **회전 불변·비강체 변형 허용**, 국소 형상 통계(부피) 보존. 스케일 자체는 안 줄여서 먼 가우시안을 수축시키지 않음. (그룹 크기>1만.)
- 비교용 **ARAP**(엄격 국소 강체, Eq.12)는 미세 형상 변화를 막아 오히려 손해 → 느슨한 제약의 정당화.
- **Welford 알고리즘**(§3.5): 공분산을 단일 패스 온라인 계산 → 래스터화 파이프라인에 통합.

## 목적함수
$$L=(1-\lambda_{dssim})L_1+\lambda_{dssim}L_{dssim}+\lambda_{MCR}L_{MCR}+\lambda_{SR}L_{SR}$$

## 결과
- **모델 비종속**: 4개 baseline에 그대로 부착 — RTD·MoDec-GS·Grid4D(deformation-field), [[Ex4DGS]](spline). 구조 변경 0.
- 정량(Table 1·2): 전 baseline·전 데이터셋 일관된 향상. **D-NeRF 평균 +1.19 dB**, MoDec-GS +2.35 dB, Grid4D+Ours가 최고 PSNR **42.20**. 도전적 NeRF-DS(반사체)서 더 큰 개선.
- 데이터셋: D-NeRF(합성 8씬 360° 단안), HyperNeRF·NeRF-DS(실제, vrig/반사).
- 비용: 학습 시간 2–3×(래스터화 중 공분산·SVD), 단 **렌더링 비용은 불변**(구조 동일). RG가 KNN보다 6–25% 빠름.
- Ablation(Table 3): RG > KNN; MCR은 선형 모션(D-NeRF)에, SR은 형상 보존에 유효 — **둘 다** 필요. 가시성 임계가 가림 영역 넘는 그룹핑을 막아 미세구조(닭 눈, Trex 이빨) 보존.

## 관련
- **기반/확장**: [[3D-Gaussian-Splatting]](정적 원본)을 **동적·다중 baseline**으로 확장. cf. [[lighthouseGS]](정적 실내 응용)
- **데이터·계보**: [[NeRF]] 파생 동적 벤치마크(D-NeRF/HyperNeRF/NeRF-DS)
- **개념**: [[방사장-볼륨렌더링]](α-blending 가중치가 그룹핑 근거) · [[SfM-COLMAP]](실제 데이터 포즈) (concepts)
- **출처 메타**: [[2026-06-13-RelaxedRigidity-논문]]
