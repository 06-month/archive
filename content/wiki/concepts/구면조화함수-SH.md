---
title: 구면조화함수 (Spherical Harmonics, SH)
area: concepts
created: 2026-06-13
sources: [3dgs.md]
tags: [concepts, spherical-harmonics, view-dependent, math]
---

# 구면조화함수 (Spherical Harmonics, SH)

구(球) 위에서 정의되는 직교 기저 함수족. **방향(view direction)에 따라 변하는 값**을 소수의 계수로 압축 표현할 때 쓴다. Radiance Field 연구에서는 **시점의존 색(view-dependent color)** 표현의 표준 도구.

## 핵심 아이디어
- 임의의 구면 함수 $f(\theta,\phi)$ 를 SH 기저 $Y_\ell^m$ 의 가중합으로 근사: $f \approx \sum_{\ell,m} k_\ell^m\,Y_\ell^m$.
- **밴드(band) $\ell$** 가 커질수록 고주파(세밀한 각도 변화) 표현. 보통 0~3차(4밴드) 사용.
- 계수 $k_\ell^m$ 만 저장 → 방향마다 MLP를 부르지 않고 색을 평가 → **빠르고 컴팩트**.

## Radiance Field에서의 쓰임
- **0차(diffuse)**: 방향 무관 기본 색. **고차**: 반사·하이라이트 등 시점의존 효과.
- [[3D-Gaussian-Splatting]]: 각 가우시안이 SH 계수를 들고 시점의존 색을 표현. **SH warm-up**(0차부터 1000 iter마다 한 밴드씩 추가)으로 각도 정보 부족 시 발산 방지.
- Plenoxels·InstantNGP 등도 SH로 방향 효과/입력 인코딩 처리.

## 관련
- [[Radiance Field-Volume Rendering]] — $\alpha$-blending의 색 $c_i$ 가 SH로 평가됨
- [[3D-Gaussian-Splatting]] · [[NeRF]] (research) — 시점의존 색 표현 대상
