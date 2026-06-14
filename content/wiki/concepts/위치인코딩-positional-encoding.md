---
title: 위치 인코딩 (Positional Encoding)
area: concepts
created: 2026-06-13
sources: [NeRF.md]
tags: [concepts, positional-encoding, fourier-features, spectral-bias, math]
---

# 위치 인코딩 (Positional Encoding)

저차원 좌표(위치·방향·시퀀스 인덱스)를 **사인·코사인 기저로 고차원에 사상**해, 신경망이 **고주파 정보**를 학습하게 돕는 기법. 3D Vision·시퀀스 모델 양쪽에서 반복 등장하는 공통 도구.

## 왜 필요한가 — 스펙트럼 편향(spectral bias)
- 일반 MLP는 **저주파 함수에 편향**되어, 좌표를 날것으로 넣으면 세밀한 변화(고주파 기하·질감)를 못 배움 → 결과가 뭉개짐(over-smooth).
- 입력을 **고주파 함수로 먼저 매핑**하면 고주파 데이터 적합력이 크게 향상(Rahaman et al. 2018).

## 형태 (Fourier features)
$$\gamma(p)=\big(\sin(2^0\pi p),\cos(2^0\pi p),\dots,\sin(2^{L-1}\pi p),\cos(2^{L-1}\pi p)\big)\in\mathbb{R}^{2L}$$
- $L$ 이 클수록 고주파까지 표현. 단, $2^L$ 이 데이터의 최대 주파수를 넘으면 이득 포화.

## 쓰임 (공통 개념인 이유)
- [[NeRF]]: 위치 $\mathbf{x}$ 에 $L{=}10$, 방향 $\mathbf{d}$ 에 $L{=}4$. **없으면 SOTA 품질 불가**(ablation 1순위).
- **[[Transformer]]**: 같은 sin/cos 인코딩을 토큰 *순서* 주입에 사용(목적은 다름 — 순서 vs 고주파 적합). 이후 [[SSM]]·[[Mamba-선형시간시퀀스|Mamba]] 계열 시퀀스 모델로 이어짐.
- InstantNGP의 해시 격자 인코딩 등 *학습형 인코딩*으로 발전.

## 관련
- [[NeRF]] · [[3D-Gaussian-Splatting]] (research) — 좌표 기반 방사장 표현
- [[방사장-볼륨렌더링]] — 인코딩된 좌표가 MLP/표현의 입력
