---
title: Transformer (Attention Is All You Need)
area: concepts
created: 2026-06-13
sources: [transformer.md]
tags: [concepts, transformer, attention, sequence-model, ML, architecture]
---

# Transformer (Attention Is All You Need)

> Vaswani et al. *"Attention Is All You Need"*, NeurIPS 2017. arXiv:1706.03762.

**한 줄 요약**: 순환(RNN)·합성곱 없이 **오직 attention** 만으로 시퀀스 의존성을 모델링하는 인코더-디코더 아키텍처. 병렬화가 쉽고 장거리 의존성 학습이 강력해, 이후 거의 모든 딥러닝 기반 모델의 토대가 됨.

## 핵심: Scaled Dot-Product Attention
$$\mathrm{Attention}(Q,K,V)=\mathrm{softmax}\!\Big(\frac{QK^{\top}}{\sqrt{d_k}}\Big)V$$
- Query·Key·Value 벡터. Q·K 내적으로 호환도 → softmax 가중치 → V의 가중합.
- $\sqrt{d_k}$ 로 나누는 이유: $d_k$ 가 크면 내적이 커져 softmax 기울기 소실 → 스케일링으로 완화.

## Multi-Head Attention
- $Q,K,V$ 를 $h$개(=8)의 부분공간으로 선형사상해 **병렬 attention** 후 concat → 서로 다른 표현 부분공간·위치 정보를 동시에 포착. 헤드당 $d_k=d_v=d_{model}/h=64$.

## 블록 구성
- **인코더**: $N{=}6$ 층, 각 층 = [멀티헤드 self-attention] + [position-wise FFN]. 각 서브층에 **residual + LayerNorm**. $d_{model}=512$.
- **디코더**: $N{=}6$ 층, 추가로 인코더 출력에 대한 cross-attention. self-attention은 **마스킹**(미래 위치 차단 → autoregressive).
- **FFN**: $\mathrm{FFN}(x)=\max(0,xW_1+b_1)W_2+b_2$, 내부차원 $d_{ff}=2048$.
- **[[위치인코딩-positional-encoding|위치 인코딩]]**: 순환·합성곱이 없어 순서 정보가 없음 → sin/cos 위치 인코딩을 임베딩에 더함. (이 논문이 그 sin/cos PE의 출처.)

## 왜 self-attention인가 (Table 1)
| 층 | 층당 복잡도 | 순차 연산 | 최대 경로길이 |
|---|---|---|---|
| **Self-Attention** | $O(n^2\cdot d)$ | $O(1)$ | $O(1)$ |
| Recurrent | $O(n\cdot d^2)$ | $O(n)$ | $O(n)$ |
| Convolutional | $O(k\cdot n\cdot d^2)$ | $O(1)$ | $O(\log_k n)$ |
- 모든 위치를 **상수 경로**로 연결 → 장거리 의존성 학습 용이·완전 병렬. 단, 시퀀스 길이에 **2차($n^2$)** 비용 → 긴 시퀀스에서 비효율(→ [[Mamba-선형시간시퀀스|Mamba]] 등 선형 대안의 동기).

## 학습·ablation 메모
- 학습: Adam + **warmup 후 역제곱근 감쇠** LR 스케줄, dropout 0.1, **label smoothing 0.1**(perplexity는 나빠지나 BLEU↑).
- ablation(Table 3): 헤드 수는 너무 적/많아도 손해, $d_k$ 줄이면 품질↓, **학습형 위치임베딩 ≈ sin/cos**(거의 동일). 번역 외 영어 구문분석에도 잘 일반화.

## 영향 (왜 공통 개념인가)
- 비전으로 확장 → [[ViT]] → 3D 복원 백본([[HaMeR]] 등). NLP·오디오·게놈 전반의 foundation model 기반.

## 관련
- [[위치인코딩-positional-encoding]] · [[ViT]] · [[Mamba-선형시간시퀀스]] (concepts)
- [[HaMeR]] (research) — Transformer 디코더로 손 파라미터 회귀
