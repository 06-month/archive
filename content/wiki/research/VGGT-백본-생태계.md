---
title: VGGT 백본 생태계 (MOC)
area: research
created: 2026-07-25
sources: []
tags: [research, MOC, VGGT, index, feed-forward]
---

# VGGT 백본 생태계 — Map of Content

**목적**: [[VGGT]]를 **백본·인코더**로 삼아 확장한 후속 연구를 한데 모은 가로지르는 지도(MOC). 이 노트들은 index의 서로 다른 세 클러스터(DUSt3R 계보 · Feed-forward GS 복원 · 3D 장면 생성)에 흩어져 있어, 여기서 "무엇을 VGGT 위에 얹었는가" 축으로 재배열한다.

> 왜 VGGT가 허브인가: 단일 forward로 카메라·깊이·포인트맵을 주는 [[VGGT]]는 **기하 인지(geometry-aware) 피처 추출기** 역할을 해, 다양한 후속작이 이를 동결/미세조정 백본으로 재활용한다. (VGGT 자체 상세는 [[VGGT]], 스케일 법칙은 [[VGGT-Ω]].)

## 뿌리
- [[VGGT]] — Visual Geometry Grounded Transformer. 1.2B, Alternating-Attention, DINOv2 토큰화. 카메라·깊이·포인트맵·트랙 단일 forward. (CVPR'25)

## ① 백본 자체를 키움 (스케일업)
- [[VGGT-Ω]] — 모델 0.2B→10B·데이터 2K→2M seq 거듭제곱법칙. register attention·단일 head로 학습 메모리 70%↓, DINOv3 백본. prediction head는 단순화하고 **백본 품질이 본질**이라는 철학. (2026)

## ② 동적 분리·스트리밍 (기하 그대로, 모션 추가)
- [[MoRe]] — VGGT 위 attention-forcing 모션분리 + grouped causal attention 스트리밍 + BA-like refinement. (2026)

## ③ Gaussianize (VGGT 피처 → 3D/4D 가우시안 예측)
- [[MoVieS]] — VGGT 기반 **per-pixel** dynamic splatter pixel, NVS·깊이·tracking 통합 1초. (2026)
- [[C3G]] — VGGT 인코더 + **query token(2K)** 컴팩트 정적 가우시안, 창발적 attention 재활용 feature lifting. (2026)
- [[C4G]] — C3G를 **4D(시간 조건 query)**로 확장, 2K 가우시안·포즈 불필요·VDM refine. (2026)
- [[NeoVerse]] — VGGT를 "Gaussianize" + 양방향 모션 → pose-free feed-forward **4DGS 복원 + 영상 생성** 하이브리드 4D 세계모델. (2026)

## 대비 (VGGT 백본 아님 — 혼동 주의)
- [[NoPoSplat]] — pose-free generalizable 3DGS이나 백본은 **MASt3R** init(VGGT 아님). C3G가 `VGGT+NoPo`로 백본만 VGGT로 바꿔 비교.
- [[DUSt3R]]·[[MASt3R]] — VGGT의 **선행(ancestor)**, 후속 아님. pairwise pointmap + 후처리 최적화.

## 관련
- **개념(다른 영역)**: [[DINO]] — VGGT(DINOv2)·VGGT-Ω(DINOv3) 토큰화 백본의 뿌리 / [[Transformer]]·[[ViT]] — Alternating-Attention·query token의 토대.
- **표현(research)**: [[3D-Gaussian-Splatting]] — ③ Gaussianize 계열의 출력 표현.
- **전체 카탈로그**: `index.md`(클러스터별) — 본 MOC는 그 중 VGGT 의존 노드만 축으로 재편.
