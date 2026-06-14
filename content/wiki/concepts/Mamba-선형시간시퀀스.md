---
title: Mamba (선택적 상태공간 모델, S6)
area: concepts
created: 2026-06-13
sources: [mamba.md]
tags: [concepts, mamba, selective-SSM, S6, sequence-model, long-context, ML]
---

# Mamba (선택적 상태공간 모델, S6)

> Gu, Dao. *"Mamba: Linear-Time Sequence Modeling with Selective State Spaces"*, arXiv:2312.00752v2 (2024).

**한 줄 요약**: [[SSM|S4]]의 파라미터 $(\Delta,B,C)$ 를 **입력 의존(selective)** 으로 만들어 "기억할지 무시할지"를 토큰별로 정하게 하고(=S6), 이를 **hardware-aware 병렬 스캔**으로 빠르게 계산한 attention 없는 시퀀스 백본. 시퀀스 길이에 **선형**, Transformer 품질을 처음으로 따라잡은 선형시간 모델.

## 문제의식 — "맥락을 상태로 압축"
- attention은 맥락을 **전혀 압축하지 않음**(KV 캐시) → 강력하지만 $O(n^2)$ 학습·선형 추론·무한 KV.
- 재귀(RNN/SSM)는 **유한 상태**라 효율적이나, 그 상태가 맥락을 잘 압축해야 효과적.
- 기존 SSM(S4 등)은 **LTI(시불변)** — $(\Delta,A,B,C)$ 가 시간 불변이라 합성곱으로 효율화되지만, **내용 기반 선택**을 못함(Selective Copying·Induction Heads 실패).

## 핵심 ①: 선택 메커니즘 (S6)
- $B,C,\Delta$ 를 **입력의 함수**로: $s_B(x)=\mathrm{Linear}_N(x)$, $s_C(x)=\mathrm{Linear}_N(x)$, $\Delta=\mathrm{softplus}(\cdot+s_\Delta(x))$ → 파라미터에 길이축 $L$ 이 생겨 **시변(time-varying)**.
- 이산화 $\bar A=\exp(\Delta A)$ 등 ZOH. → 합성곱 등가성을 잃지만 토큰별 **선택적 전파/망각** 획득.
- **RNN 게이트와 연결**(Theorem 1): $N{=}1,A{=}{-}1,B{=}1$ 이면 $h_t=(1-g_t)h_{t-1}+g_t x_t$, $g_t=\sigma(\mathrm{Linear}(x_t))$. **$\Delta$ 가 가장 중요한 선택 파라미터**(큰 $\Delta$=현재입력에 집중·상태리셋, 작은 $\Delta$=무시).

## 핵심 ②: Hardware-aware 병렬 스캔
- 시변 SSM은 합성곱 불가 → **재귀를 스캔(parallel scan)** 으로 병렬화.
- 큰 상태 $(B,L,D,N)$ 를 HBM에 구체화하지 않고, $(\Delta,A,B,C)$ 만 **SRAM으로 로드 → 이산화·재귀를 SRAM에서 수행 → 출력만 HBM에 기록**(kernel fusion). 역전파용 중간상태는 **재계산**(FlashAttention식). → 표준 스캔 대비 20–40× 빠름, A100서 길이 2K 넘으면 FlashAttention-2보다 빠름.

## 핵심 ③: Mamba 아키텍처
- **H3 블록 + MLP 블록을 단일 블록으로 통합**해 동질적으로 쌓음(attention도 MLP 블록도 없음). 확장계수 $E{=}2$, SiLU/Swish(→SwiGLU), 선택적 LayerNorm.

## 결과
- **합성**: Selective Copying·Induction Heads를 풀고, 학습 길이의 **4000× = 100만 토큰**까지 외삽(타 모델은 2× 못 넘김).
- **언어**: attention-free 최초로 강력한 **Transformer++(LLaMa식) 레시피와 동급** 스케일링. **Mamba-3B가 Pythia-3B를 +4점, Pythia-7B도 상회**. 추론 throughput **5×**(KV 캐시 없음).
- **DNA·오디오**: HyenaDNA·SaShiMi 등 SOTA 상회, **맥락 길수록(최대 1M) 좋아짐**(LTI는 반대로 나빠짐). SC09 음성생성서 소형 Mamba가 대형 GAN·diffusion 능가.
- **ablation**: S4→S6 선택성이 큰 향상, $\Delta$ 가 핵심, 상태크기 $N$ 키우면(+1% 파라미터) perplexity 1.0↓ — 단 $B,C$ 도 선택적일 때만.

## 의미 (왜 공통 개념인가)
- [[SSM]]의 직계 후속, [[Transformer]]의 attention 대안. 비전·3D로 확장 → 3D 손 복원 [[Hamba]]가 Mamba로 관절 토큰을 모델링.

## 관련
- [[SSM]] · [[Transformer]] · [[위치인코딩-positional-encoding]] (concepts)
- [[Hamba]] (research) — Mamba 기반 단일뷰 3D 손 복원
