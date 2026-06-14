---
title: 2026-06-13 Relaxed Rigidity 논문 (Lee et al. 2026)
area: research
created: 2026-06-13
sources: [Relaxed Rigidity with Ray-based Grouping for Dynamic Gaussian Splatting.md]
tags: [research, 4DGS, dynamic, source, paper]
---

# Relaxed Rigidity (동적 GS) 논문 (출처 메타)

- **원본**: `raw/Relaxed Rigidity with Ray-based Grouping for Dynamic Gaussian Splatting.md` (2977줄, asset extracted-images 37장 + page-renders 24장. **본문 임베드 없음** — 그림은 page-render로 교차확인)
- **서지**: Junoh Lee, Junmyeong Lee, Yeon-Ji Song, Inhwan Bae, Jisu Shin, Hae-Gon Jeon, Jin-Hwa Kim. *Relaxed Rigidity with Ray-based Grouping for Dynamic Gaussian Splatting*. arXiv:2603.24994v2 (2026-03). GIST·Yonsei·SNU·DGIST·NAVER AI Lab.
- **진입 판정**: [통과] / **영역**: research

## 핵심 takeaway
1. 래스터화의 **α-blending 가시성**을 그룹핑 함수로 재활용(ray-based grouping). → [[Relaxed-Rigidity-동적GS]]
2. **방향만 맞추는 MCR + 고유값 스펙트럼 맞추는 SR** = 느슨한 강체성. 외부 prior 불필요.
3. 4개 동적 baseline에 plug-in, D-NeRF +1.19 dB.

## 후속 질문
- 정적 [[3D-Gaussian-Splatting]] → 동적 4DGS로의 일반적 확장 계열(deformation-field vs basis-trajectory vs native-4D) 정리 필요.
- 학습 2–3× 오버헤드(공분산 SVD) 경량화 여지?
- 국내(GIST·SNU·NAVER) 연구 — 연구실 컨택·후속 추적 후보. cf. [[lighthouseGS]](UNIST).
