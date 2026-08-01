---
title: 장거리 Point Tracking (TAP·2D→3D 궤적)
area: concepts
created: 2026-07-26
sources: [ShapeOfMotion.md, MoVieS.md, DGS-LRM.md]
tags: [concept, point-tracking, TAP, correspondence, scene-flow, benchmark, dynamic]
---

# 장거리 Point Tracking (Tracking Any Point)

**한 줄 요약**: 영상에서 **임의의 점 하나를 전 프레임에 걸쳐 추적**하는 문제(TAP, Tracking Any Point). 인접 프레임만 잇는 optical flow·scene flow와 달리 **영상 전체를 관통하는 궤적**과 **가림(occlusion) 상태**를 다룬다. 3D Vision 연구에서 (1) 동적 복원의 **감독 신호·prior**, (2) 복원 결과의 **평가 축**, (3) 복원 모델이 부가로 내놓는 **출력**으로 반복 등장하는 공통 도구.

## 왜 어려운가
- **장거리**: 프레임 쌍 대응(optical flow)을 단순 chaining하면 오차가 누적·drift. 가림 구간을 건너뛰어 재획득(re-identification)해야 함.
- **occlusion**: 점이 가려진 동안에도 위치를 추정하거나 최소한 "안 보임"을 판정해야 함(visibility 예측).
- **2D→3D 리프팅의 모호성**: 2D 트랙에 단안 깊이를 붙여 3D로 올리면 **가시 영역만** 가능하고, 깊이 노이즈가 궤적에 그대로 전파.

## 주요 방법·벤치마크 (평문 — raw 미수집)
- **TAP-Vid**: TAP 문제의 표준 벤치마크. 지표 **AJ**(Average Jaccard)·**<δavg**(위치 정확도)·**OA**(Occlusion Accuracy). 3D 확장판 **TAPVid-3D**.
- **TAPIR**: per-frame 초기화 + temporal refinement. 불확실성·가시성 점수를 함께 출력해 하류 최적화의 가중치로 쓰인다.
- **CoTracker**: 여러 점을 **함께**(jointly) 추적해 점 간 상관을 활용. 후속 CoTracker3.
- **SpatialTracker / SpatialTrackerV2** — 위키에서 **가장 많이 인용되는 트래커**(research 5노트 + 본 앵커). 2D가 아닌 **3D 공간에서** 추적: 프레임을 triplane으로 인코딩하고 궤적을 **반복 갱신**(iterative). V2는 카메라 모션을 명시 분리. 각 노트가 보는 위치:
  - [[POMATO]] — GT intrinsic을 쓰는 SpatialTracker도 능가한다고 보고.
  - [[DGS-LRM]] — 단안 3D scene flow 직접 비교군(ATE-3D 대등).
  - [[MoVieS]] — TAPIR·CoTracker3와 함께 "**단안 depth 의존**" 계열로 묶어 대비.
  - [[ShapeOfMotion]] — DELTA와 함께 **frame-space 3D 트래킹**으로 분류, world-space 영속 궤적과 대비.
  - [[OmniX]] — 최초의 feed-forward 3D 트래커로 인정하되 **반복 갱신의 효율 한계**를 지적하며 dense 회귀로 전환(TAPVid-3D에서 SpatialTrackerV2 능가).
  > 공통 한계(위 노트들의 일치된 지적): 프레임 좌표계 예측이라 카메라·객체 모션이 얽히고, 반복 갱신이라 dense 예측으로 확장할수록 비용이 크다.
- **RAFT-3D**: scene flow 계열. 3D 지표 **EPE**(end-point error)·$\delta^{0.05}_{3D}$·$\delta^{0.10}_{3D}$의 출처.

## 3D/4D 연구에서의 세 가지 역할
1. **입력 prior(감독)** — 노이즈 있는 2D 트랙을 4D 표현에 융합해 전역 일관 궤적을 얻는다. [[ShapeOfMotion]]이 TAPIR 트랙 + 단안 깊이를 SE(3) 모션 기저로 consolidate하는 것이 대표(입력 baseline "TAPIR+DA"를 크게 상회).
2. **평가 축** — 동적 복원 모델의 모션 정확도를 재는 잣대. [[MoVieS]]·[[DGS-LRM]]·[[POMATO]]가 TAPIR·CoTracker·SpatialTracker를 비교군으로 삼는다.
3. **부가 출력** — 복원 모델이 트래킹을 함께 내놓음. [[VGGT]]는 CoTracker2 구조의 트래킹 헤드를 달고, [[DGS-LRM]]은 scene flow chaining으로, [[NeoVerse]]는 3D flow로 3D 트래킹을 수행.

> [!note] 반복되는 대비 구도
> **frame-space 트래킹**(SpatialTracker·DELTA 등, 카메라·객체 모션 얽힘) ↔ **world-space 영속 궤적**([[ShapeOfMotion]]). 그리고 **2.5D 리프팅**(2D 트랙+단안 깊이, 가시 영역 한정) ↔ **전역 4D 표현**(가림 구간도 이웃 기하로 추론). 여러 논문이 이 축 위에서 자기 위치를 설명한다.

## 관련
- **연구 노트(다른 영역)**: [[ShapeOfMotion]](입력 prior·최적화 융합) · [[MoVieS]]·[[DGS-LRM]]·[[POMATO]](평가·대조) · [[VGGT]]·[[NeoVerse]]·[[C4G]](부가 출력) · [[OmniX]](**반복 트래킹 → dense 회귀** 전환, TAPVid-3D SOTA).
- **개념(concepts)**: [[SfM-COLMAP]] — 정적 대응·포즈 추정(트래킹의 고전적 짝) / [[Transformer]] — 최신 트래커·트래킹 헤드의 백본 / [[Radiance Field-Volume Rendering]] — 궤적을 렌더로 감독할 때의 image formation.
- **주의**: 본 노트는 research 7노트가 평문 공유하던 트래킹 개념을 묶은 **앵커**. TAPIR·CoTracker·SpatialTracker·TAP-Vid 전용 raw는 미수집이라, 수식·구현 상세는 각 논문 노트의 인용 범위로 한정한다.
