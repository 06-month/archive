---
title: 2026-06-20 Spacetime GS 논문 (Li et al. CVPR 2024)
area: research
created: 2026-06-20
sources: [SpacetimeGS.md]
tags: [research, 4DGS, dynamic-scene, feature-splatting, source, paper]
---

# Spacetime Gaussian Feature Splatting 논문 (출처 메타)

- **원본**: `raw/SpacetimeGS.md` (3166줄, PDF 추출본 27p, 이미지 `raw/assets/SpacetimeGS/`)
- **서지**: Zhan Li, Zhang Chen, Zhong Li, Yi Xu. *Spacetime Gaussian Feature Splatting for Real-Time Dynamic View Synthesis*. CVPR 2024. arXiv:2312.16812v2 (2024.04.04). (OPPO US Research Center · Portland State Univ.)
- **진입 판정**: [통과] / **영역**: research (Radiance Field NVS — 멀티뷰 비디오 동적 GS)
- **특이사항**: 27p 전체 통독 — 본문(STG·feature splatting·guided sampling) + 부록 B~F(concurrent 비교·polynomial order·feature 성분·긴 시퀀스·per-scene 표·카메라모델). 멀티뷰 비디오 입력 전용(단안 X).

## 핵심 takeaway
1. **Spacetime Gaussian(STG)**: 3D 가우시안에 ① **시간 opacity**(1D 시간 RBF $\sigma_i(t)=\sigma^s\exp(-s^\tau|t-\mu^\tau|^2)$) ② **다항식 모션**($n_p$=3) ③ **다항식 회전**($n_q$=1, 스케일은 시간무관) 부착 → static·dynamic·transient(생성/소멸) 모두 표현. → [[SpacetimeGS]]
2. **Splatted feature rendering**: SH(48차) 대신 **9차 neural feature**[$f^{base},f^{dir},(t{-}\mu^\tau)f^{time}$] 저장 → splat → 2-layer MLP. lite(MLP 제거, $F_{base}$만)=**8K@60FPS·>300FPS**.
3. **guided sampling**: 학습 오차+coarse depth로 sparse·원거리 영역에 가우시안 ray 샘플링.
4. 멀티뷰 SOTA(Neural3D 32.05@140FPS@200MB). 시간 opacity로 긴 모션을 짧은 세그먼트 분할 → 단일 300프레임 모델 가능.

## 후속 질문
- 다항식 모션(STG, 명시 expressive) vs deformation MLP([[Deformable3DGS]]·[[4DGS]]) vs native 4D 회전([[native4DGS]]) — 세 모션 모델의 표현력·속도 정량?
- on-the-fly 학습 불가 한계 → streaming([[StreamSplat]]) 결합?
- feature splatting(neural, 9차)이 SH 대비 시간 외삽서 더 나은 이유는? [[구면조화함수-SH]] 한계와 연결.
