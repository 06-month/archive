---
title: 2026-07-26 Shape of Motion 논문 (Wang et al. UC Berkeley CVPR 2025)
area: research
created: 2026-07-26
sources: [ShapeOfMotion.md]
tags: [research, 4D-reconstruction, monocular, SE3-motion-basis, 3D-tracking, source, paper]
---

# Shape of Motion 논문 (출처 메타)

- **원본**: `raw/ShapeOfMotion.md` (2202줄, PDF 추출본 17p, 이미지 `raw/assets/ShapeOfMotion/`)
- **서지**: Qianqian Wang, Vickie Ye, Hang Gao, Weijia Zeng, Jake Austin, Zhengqi Li, Angjoo Kanazawa (공동 1저자 4인). *Shape of Motion: 4D Reconstruction from a Single Video*. CVPR 2025. arXiv:2407.13764v2 (2025.10.16). (UC Berkeley · Google DeepMind · UCSD · Adobe Research)
- **진입 판정**: [통과] / **영역**: research (동적 GS 모션 표현 뿌리 — 최적화 기반 4D + 장거리 3D 트래킹)
- **특이사항**: 17p 전체 통독 — 본문(§1~5) + References + Supplement A~G(전처리[포즈·깊이정렬]·학습 상세[초기화·손실 가중]·평가 상세·Kubric/복잡장면 시각화·NVIDIA 프로토콜·DynMF 재구현). 세션 중 Drive 동기화로 raw/ 신규 출현(41→42 md).

## 핵심 takeaway
1. **SE(3) 모션 기저**: 3D 모션을 소수(B=10) 전역 공유 SE(3) 기저의 선형결합으로 → 저차원 강체 그룹 소프트 분해. per-Gaussian·평행이동 기저보다 우수(ablation). → [[ShapeOfMotion]]
2. **영속 장거리 3D 궤적**: scene flow(인접)·변형장 아닌 영상 전체 관통 궤적 → 임의 점의 장거리 3D/2D 트래킹.
3. **노이즈 prior 융합**: MegaSaM(포즈)·Depth Anything(깊이)·TAPIR(2D 트랙)·Track-Anything(마스크)를 전역 일관 4D로 consolidate → 입력 baseline("TAPIR+DA") 크게 상회.
4. iPhone·Kubric에서 3D/2D 트래킹·NVS SOTA. per-scene 최적화(A100 2h)·140fps 렌더.
5. rigidity(k-NN 거리보존)·시간평활 정규화가 가림 모션 추론·궤적 일관성의 열쇠.

## 후속 질문
- SE(3) 모션 기저(최적화, Shape of Motion) vs learnable query token(feed-forward, [[C4G]]) vs 변형장([[Deformable3DGS]]) — 4D 모션 표현의 저차원성·트래킹·속도 trade-off?
- per-scene 최적화 한계 → feed-forward 트래킹(St4RTrack·[[MoVieS]] scene flow)이 궤적 품질에서 어디까지 따라오나?
- off-the-shelf prior 융합(consolidation)이 곧 방법의 본질 — prior 발전(MegaSaM→VGGT-Ω 류)이 성능에 직결되는가?
- concepts 갭(평문): 장거리 point tracking(TAPIR·CoTracker·TAP-Vid) — 여러 노트(MoVieS·StreamSplat·본 논문) 공유. 향후 앵커 신설 검토.
