---
title: Beyond Entropy / ICT (토큰 분포편차 기반 LLM 추론 RLVR)
area: research
created: 2026-07-31
sources: [BeyondEntropy.md]
tags: [research, LLM, RLVR, GRPO, reasoning, entropy, JS-divergence, sparse-update, token-selection]
---

# Beyond Entropy: ICT — 토큰 분포편차로 LLM 추론 탐색 유도

> Xuanzhi Feng, Zhengyang Li, Zeyu Liu, Haoxi Li, Yuming Jiang, Bing Guo, Jingcai Guo, Jie Zhang, Song Guo (HKUST · 쓰촨대 · 홍콩폴리텍). *"Beyond Entropy: Learning from Token-Level Distributional Deviations for LLM Reasoning"*, arXiv:2606.19771 (2026.06).

**한 줄 요약**: RLVR(검증가능 보상 강화학습)의 최적화 불안정 — 균일 토큰 갱신은 **엔트로피 붕괴**, 과도한 Shannon 엔트로피 최대화는 **엔트로피 폭발** — 을, 스칼라 불확실성 대신 **토큰 로짓 분포의 편차**로 해소. 그룹 평균분포와의 **JS divergence**가 큰 "unique token" 상위 10%만 갱신하는 **ICT** 프레임워크로 Qwen2.5(0.5B~7B)에서 GRPO 대비 pass@4 평균 +4.58%. (출처: [[2026-07-31-BeyondEntropy-논문]])

> [!note] 이 노트의 위치
> 본 vault의 research는 3D Vision 중심이나, 사용자 판단으로 **LLM/RL까지 도메인을 확장**해 편입(2026-07-31). 현재 이 클러스터의 유일한 LLM 노트이므로 3D 노트들과의 직접 계보는 없다 — 공유 지점은 [[Transformer]] 등 아키텍처 개념과 **분포 간 divergence**라는 수학 도구다.

## 문제의식
- RLVR([[Transformer]] 기반 LLM을 수학·코딩 정답성으로 최적화)이 추론 능력을 크게 올렸으나, 학습 신호를 **모든 토큰에 균일 적용**하면 조기 수렴·엔트로피 붕괴로 탐색 능력이 사라진다.
- 대안으로 나온 **high-entropy 토큰만 갱신**(20/80 등)은 반대로 **맹목적 탐색**을 유발. 근본 원인은 Shannon 엔트로피가 **불확실성의 크기만 알려주고 방향을 못 준다**는 것.
- 결정적 관찰: **엔트로피가 같아도 분포 모양은 전혀 다를 수 있다**(Fig.1) → 스칼라 하나로 토큰 중요도를 재는 것은 불충분.

## 핵심 아이디어 (§2~3)
- **2차 Rényi 엔트로피 $H_2$ 채택**: $H_2=-\log\sum_a\pi(a)^2$ (collision probability 기반). 어휘가 크고 heavy-tail인 LLM에서 Shannon($H_1$)보다 **롱테일 노이즈에 둔감**하고 확률 질량 집중도를 잘 포착.
- **strategy purity $\beta(\pi)=\sum_a\pi(a)^2$** 를 임계값으로 하는 **엔트로피 분기(bifurcation)** — 단일 토큰 로짓을 $\Delta\theta>0$만큼 올릴 때 1차 근사(식 6): $\Delta H_2 \approx -2\Delta\theta\,\pi(a^*)\!\left(\frac{\pi(a^*)}{\beta(\pi)}-1\right)$
  - $\pi(a^*)>\beta$ (고확신) → $\Delta H_2<0$ **붕괴 영역**
  - $\pi(a^*)<\beta$ (롱테일) → $\Delta H_2>0$ **폭발 영역**
  - 전 토큰 균일 학습 = 두 영역의 **상충하는 그래디언트**를 동시에 받는 것 → 불안정의 근원.
- **unique token = 두 영역의 경계**: 그룹 평균분포 $P_{avg}$와의 JS divergence가 큰 토큰은 $\pi(a)\approx\beta(\pi)$ 근방에 위치(부록 A.3.1~2의 구조적·동역학적 논증) → 갱신해도 엔트로피를 크게 흔들지 않으면서 **모델이 아직 분기를 확정하지 않은 지점**이라 탐색 유도에 최적.

## ICT 프레임워크 (§3.2~3.3)
- **선택자**: $u_{i,t}=D_{JS}(\mathrm{softmax}(L_{i,t})\,\|\,P_{avg}(\cdot|t))$, 상위 $k$%(기본 10%)만 이진 마스크 $M_{i,t}=1$.
- **Sparse-GRPO**(식 11): 표준 GRPO 목적 $\Psi_{i,t}$에 마스크를 곱하고 **활성 토큰 수로 정규화**. 보상·advantage·clipping·KL은 **손대지 않음** — 바뀌는 건 "어느 토큰이 그래디언트를 주는가"뿐.
- **warm-up**: 초기 $\Theta$ 스텝은 전 토큰 갱신 후 sparse 활성화(step 10/20/40 모두 수렴 유사 — 강건).
- JS 계산은 rollout 시 이미 나온 로짓을 배치 재사용 → **추가 forward 없음**, sparse backward로 일부 상쇄.

## 결과
- **7개 벤치**(GSM8K·Math500·MMLU-Stem·GPQA·AIME23/24/25), Qwen2.5 0.5B/1.5B/7B, 5-seed 평균. GRPO·20-Entropy·STAPO 대비 **모든 규모에서 최고**(총점 +3.38/+4.31/+3.94%p).
- **탐색 능력의 증거**: P@1보다 **P@4 상승폭이 일관되게 큼**(예: 1.5B +3.64 vs +4.98) → 중복 경로가 아닌 **다양한 정답 경로**를 만든다는 해석.
- 수학으로 학습했는데 **GPQA(비수학)로도 일반화**. 반면 20-Entropy는 수학은 올라도 전체 평균이 하락.
- **ablation**: 10% > 20%·30% > 90%-frequent. JS 정렬 곡선이 **10% 지점에서 급격한 elbow**를 보여 임계 선택을 뒷받침. 선택 지표는 **JS > Wasserstein > KL**(KL은 비대칭이라 mode-seeking 편향, Wasserstein은 어휘가 categorical이라 ground metric이 무의미). 무작위 10%(63.65)보다도 우수(66.23).
- unique token 중 high/low 엔트로피 비율이 **약 1:1**(GSM8K 1.03, MATH 0.99) → "두 영역의 경계에서 뽑힌다"는 이론과 부합.
- 정성: unique token은 문제 고유 내용어(remainder·duck·seventh), frequent token은 서식·기능어(####·the·is).

## 한계 (저자 명시)
- 1차 Taylor 근사는 **단일 토큰 갱신·미소 스텝** 가정 — 다토큰 결합·음의 advantage·옵티마이저 모멘텀은 생략(부록 A.8). 저자는 "완전한 옵티마이저 동역학 증명이 아니라 **국소 진단**"으로 해석하라 명시.
- $H_1/H_2$ 동조성 증명은 $\pi(a)>e^{-1}$ 조건이 필요하나 실제 LLM에서 드묾 → **$H_2$ 분석만 무조건 유효**하고 $H_1$은 근사적 정렬(선택 토큰 평균 확률 0.18±0.09).
- 고정 비율(10%) 사용 — 적응적 선택은 future work.

## 관련
- **수학 도구(concepts, 핵심 연결)**: [[정보이론-분포거리]] — 엔트로피($H_1$/$H_2$)·KL·JS·InfoNCE의 공통 앵커. 본 논문이 **JS로 토큰을 고르고 $H_2$로 분기를 판정**하는 것과, 3D 쪽 [[MASt3R]]·[[VGGT-Ω]]가 같은 InfoNCE를 매칭·정렬에 쓰는 것이 한 도구의 다른 목적임을 정리.
- **개념(다른 영역)**: [[Transformer]] — 정책 네트워크(LLM)의 백본이자 로짓·어휘 분포의 출처 / [[Drifting-Model-원스텝생성]] — 분포 정합을 **장(field)**으로 다루는 접근과, 본 논문의 **분포 편차로 토큰을 고르는** 접근의 대비(둘 다 "두 분포가 같아지는 지점"을 신호로 씀) / [[flow-matching-생성prior]] — 같은 divergence 도구를 생성 모델 쪽에서 쓰는 사례.
- **3D Vision과의 간접 연결**: 본 노트는 LLM/RL 도메인의 단독 노트라 3D 클러스터와 계보가 없으나, [[정보이론-분포거리]]를 경유해 [[VGGT-Ω]](자기지도·언어정렬)·[[MASt3R]](InfoNCE 매칭)와 **수학적으로** 이어진다.
- **출처 메타**: [[2026-07-31-BeyondEntropy-논문]]
