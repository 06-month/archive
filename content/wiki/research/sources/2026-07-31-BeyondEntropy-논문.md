---
title: 2026-07-31 Beyond Entropy 논문 (Feng et al. HKUST 2026)
area: research
created: 2026-07-31
sources: [BeyondEntropy.md]
tags: [research, LLM, RLVR, GRPO, entropy, source, paper]
---

# Beyond Entropy 논문 (출처 메타)

- **원본**: `raw/BeyondEntropy.md` (2667줄, PDF 추출본 30p, 이미지 `raw/assets/BeyondEntropy/`)
- **서지**: Xuanzhi Feng, Zhengyang Li, Zeyu Liu, Haoxi Li, Yuming Jiang, Bing Guo, Jingcai Guo, Jie Zhang, Song Guo. *Beyond Entropy: Learning from Token-Level Distributional Deviations for LLM Reasoning*. arXiv:2606.19771v1 (2026.06.18). (HKUST · Sichuan University · HK PolyU)
- **진입 판정**: **[모호] → [통과]** (사용자 선택) / **영역**: research (**도메인 확장** — LLM/RL)
- **특이사항**: 30p 전체 통독 — 본문(§1~5) + 부록 A.1~A.10(관련연구·2차 엔트로피 도출·strategy purity 증명·homogeneity 증명·JS 선택자 이론·상세 알고리즘·ablation·실험설정·통계신뢰성·한계) + References.

> [!warning] 도메인 확장 결정
> vault 정체성은 "전공 수업 + 3D Vision 연구"였고 본 자료는 어디에도 안 맞아 룰북 §A Q1/§B ④의 **[모호]**로 판정, §D에 따라 사용자에게 2옵션 제시 → **"research로 ingest(도메인 확장)"** 선택(2026-07-31). 모호 사례 로그에 기록. 현재 research 클러스터의 유일한 LLM 노트라 3D 노트와 계보 연결은 없음.

## 핵심 takeaway
1. **Shannon 엔트로피의 한계**: 같은 엔트로피라도 분포 모양이 다름 → 스칼라로 토큰 중요도를 재면 맹목적 탐색. 분포 편차로 전환. → [[BeyondEntropy-ICT]]
2. **2차 Rényi $H_2$ + strategy purity $\beta$**: $\pi(a^*)$와 $\beta(\pi)$의 대소가 엔트로피 붕괴/폭발을 가른다는 1차 근사 분기 정리.
3. **ICT 선택자**: 그룹 평균분포와의 **JS divergence** 상위 10% unique token만 갱신(Sparse-GRPO). 보상·advantage·KL은 불변, 마스크만 추가.
4. Qwen2.5 0.5B~7B·7벤치에서 GRPO/20-Entropy/STAPO 전부 상회, **P@4 상승폭 > P@1**(탐색 다양성 증거), 수학→GPQA 일반화.
5. JS > Wasserstein > KL(비대칭 편향)·무작위. unique token의 high/low 엔트로피 비 ≈1:1로 이론 부합.

## 후속 질문
- **10% 스파스 갱신으로 full-parameter와 동등**은 RLVR 그래디언트의 대부분이 소수 결정 노드에서 온다는 뜻 — 이 "less is more"가 3D/비전 모델 파인튜닝에도 성립하나?
- 1차 근사의 한계(다토큰 결합·모멘텀 생략)를 저자도 인정 — 실제 옵티마이저 동역학에서 분기 정리가 얼마나 견디나?
- JS 기반 선택이 advantage와 암묵 정렬된다는 주장(A.3.4)의 인과성 검증은?
- **위키 내 연결 지점**: 분포 간 거리(KL/JS)라는 도구를 생성 모델 쪽에서 쓰는 [[flow-matching-생성prior]]·[[Drifting-Model-원스텝생성]]과 수학적 뿌리를 공유 — 정보이론 공통 개념 노트 신설 여지.
