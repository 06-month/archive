---
title: 2026-06-13 LighthouseGS 논문 (Han et al. 2026)
area: research
created: 2026-06-13
sources: [lighthouseGS.md]
tags: [research, 3DGS, indoor, source, paper]
---

# LighthouseGS 논문 (출처 메타)

- **원본**: `raw/lighthouseGS.md` (1356줄, asset `raw/assets/lighthouseGS/` extracted-images 17장 + page-renders 10장. 본문 임베드 7개 정상)
- **서지**: Han, Jang, Kim, Surh, Kwak, Ha, Joo. *LighthouseGS: Indoor Structure-aware 3D Gaussian Splatting for Panorama-Style Mobile Captures*. arXiv:2507.06109v2 (2026-02). UNIST · Bucketplace(오늘의집).
- **프로젝트**: https://vision3d-lab.github.io/lighthousegs/
- **진입 판정**: [통과] / **영역**: research

## 핵심 takeaway
1. **SfM이 실패하는 파노라마형 모바일 캡처**에서 3DGS를 돌리는 실용 프레임워크. → [[lighthouseGS]]
2. ARKit 포즈 + 단안 깊이 + **실내 평면 구조** → plane scaffold로 초기화.
3. **stable pruning**(불투명도>0.5 유지) + 잔차 포즈 + 컬러 보정이 품질 핵심.

## 후속 질문
- 단안 깊이/법선 추정 backbone(Depth Anything V2, DSINE) 의존도 — foundation model 발전으로 완화 예상.
- 평면 가정이 약한 야외/비정형 장면 일반화? → [[Relaxed-Rigidity-동적GS]] 같은 비강체/동적 확장과 대비.
- 국내(UNIST·오늘의집) 연구 — 연구실 컨택·후속 추적 후보.
