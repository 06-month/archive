---
title: 2026-08-01 4D Scaffold-GS 논문 (Cho et al. 연세대 2025)
area: research
created: 2026-08-01
sources: [4DScaffold-GS.md]
tags: [research, 3DGS, dynamic, 4D-gaussian, anchor, storage-efficiency, source, paper]
---

# 4D Scaffold-GS 논문 (출처 메타)

- **원본**: `raw/4DScaffold-GS.md` (2556줄, PDF 추출본 17p, 이미지 `raw/assets/4DScaffold-GS/`)
- **서지**: Woong Oh Cho, In Cho, Seoha Kim, Jeongmin Bae, Youngjung Uh, Seon Joo Kim. *4D Scaffold Gaussian Splatting with Dynamic-Aware Anchor Growing for Efficient and High-Fidelity Dynamic Scene Reconstruction*. arXiv:2411.17044v2 (2025.08.05). (Yonsei University)
- **진입 판정**: [통과] / **영역**: research (동적 GS 모션 표현 뿌리 — 최적화 기반 4D, 저장 효율)
- **특이사항**: 17p 전체 통독 — 본문 + References + Appendix(STG 50프레임 비교·시간 불투명도 분석·하이퍼파라미터 K/γ/β 효과·anchor growing 시각화·아키텍처 상세·4-shot·per-scene 결과).

## 핵심 takeaway
1. **관점 전환**: 저장 절감을 위해 가우시안 **수를 줄이는** 대신, 수는 유지하고 **격자 정렬 4D anchor 특징으로 압축**. → [[4D-Scaffold-GS]]
2. **Scaff-naive의 실패 진단**: [[Scaffold-GS]]의 anchor growing은 전 프레임 그래디언트를 **평균**해, 짧게 등장하는 동적 영역이 분모 N에 눌려 신호를 못 받음.
3. **dynamic-aware anchor growing**: 시간 불투명도 활성 시에만 누적 + 커버리지 σ가 짧을수록 큰 가중치 → 부족한 동적 영역에 anchor 배분. **ablation서 가장 결정적**(29.57→25.77).
4. **compact 파라미터화**: 선형 모션(3 파라미터) + **일반화 가우시안 시간 불투명도**(급격한 등장/소멸을 단일 가우시안으로).
5. N3DV 동적 PSNR 28.86@149MB(4DGS 27.65@6194MB), Technicolor 전 지표 SOTA. 같은 저장서 3.37~7.0× 많은 가우시안 사용.

## 후속 질문
- **다시점 전용**(저자 한계) → 단안 확장 시 [[MoSca]]·[[SC-GS]]의 포즈·prior 전략과 결합 가능한가?
- anchor "성장"의 기준: 본 논문은 **시간 커버리지 보정 그래디언트**, [[ATSplat]]은 **학습된 불확실도** — 같은 그룹의 두 답을 통합할 수 있나?
- 일반화 가우시안 불투명도(β)가 Ex4DGS·4DGS식보다 우수 — 다른 4D 계열([[Ex4DGS]]·[[SpacetimeGS]])에 이식 시 이득은?
- 1~2 프레임만 등장하는 요소는 여전히 난제 — 시간 해상도 적응이 필요한가?
