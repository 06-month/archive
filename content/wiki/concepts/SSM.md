---
title: 상태공간모델 (SSM) · S4
area: concepts
created: 2026-06-13
sources: [SSM.md]
tags: [concepts, SSM, S4, state-space, long-range, sequence-model, ML]
---

# 상태공간모델 (SSM) · S4

> Gu, Goel, Ré. *"Efficiently Modeling Long Sequences with Structured State Spaces (S4)"*, ICLR 2022. arXiv:2111.00396.

**한 줄 요약**: 제어이론의 **상태공간모델(SSM)** $x'=Ax+Bu,\ y=Cx+Du$ 를 딥러닝 시퀀스 모델로 쓰되, 상태행렬 $A$ 를 **NPLR로 재매개변수화(S4)** 해 계산을 $\tilde O(N{+}L)$ 로 낮추고, **초장거리 의존성(LRD)** 을 원리적으로 푸는 모델. [[Mamba-선형시간시퀀스|Mamba]]의 직계 조상.

## SSM의 세 가지 표현 (Fig.1)
하나의 SSM이 세 얼굴을 가짐 — CTM·RNN·CNN의 장점을 통합:
- **연속시간**: $x'(t)=Ax(t)+Bu(t)$. 불규칙 샘플링·해상도 변화에 적응(스텝 $\Delta$만 바꾸면 됨).
- **재귀(이산)**: $x_k=\bar A x_{k-1}+\bar B u_k$ — RNN처럼 **추론 시 토큰당 $O(N)$ 상수 비용**(자기회귀 생성 60× 빠름).
- **합성곱**: $y=\bar K * u$, 커널 $\bar K=(\bar C\bar B, \bar C\bar A\bar B,\dots)$ — **FFT로 병렬 학습**.

## 핵심 난제와 S4의 해법
- **HiPPO 행렬**: 특정 $A$(식 2)가 상태에 입력 이력을 "기억"시켜 LRD를 가능케 함(랜덤→HiPPO로 sMNIST 60%→98%). **S4 성능의 진짜 원천은 HiPPO 초기화**(ablation).
- **계산 병목**: 순진한 SSM(LSSL)은 $A$ 거듭제곱 때문에 $O(N^2L)$ 연산·$O(NL)$ 메모리. HiPPO 행렬은 비정규(non-normal)라 안정적 대각화 불가.
- **S4 = NPLR**: $A$ 를 **정규+저랭크(Normal Plus Low-Rank)** 로 분해 → 생성함수를 주파수영역에서 평가 + **Woodbury 항등식**으로 저랭크 보정 + **Cauchy 커널**(FMM)로 환원 → $\tilde O(N{+}L)$ 연산·$O(N{+}L)$ 메모리. LSSL 대비 **30× 빠르고 400× 적은 메모리**.

## 결과
- **Long Range Arena**: 전 과제 SOTA, 평균 80–86%(기존 <60%). 길이 **16384 Path-X를 최초로 해결**(88–96%, 기존 전부 랜덤 50%).
- **원시 음성 분류**(길이 16000): 98.3% — MFCC 전처리한 기준선들 상회.
- **생성 속도**: Transformer 대비 **60×**. **순차 CIFAR** 91%(≈ResNet18). 시계열 예측서 Informer를 40/50 세팅에서 능가.

## 의미 (왜 공통 개념인가)
- Transformer의 $O(n^2)$ attention 대안으로 **긴 시퀀스**에 강함. 이 계열이 입력선택성을 더한 [[Mamba-선형시간시퀀스|Mamba(선택적 SSM)]]로 발전.
- 비전·시간 모델링 백본으로 확장 → 3D 손 복원 [[Hamba]]가 Mamba 블록을 차용.

## 관련
- [[Mamba-선형시간시퀀스]] · [[Transformer]] (concepts) — 선택적 SSM 후속 / attention 대안
- [[Hamba]] (research) — SSM/Mamba 기반 3D 손 복원
