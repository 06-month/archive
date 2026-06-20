---
title: 2026-06-20 Scaffold-GS 논문 (Lu et al. CVPR 2024)
area: research
created: 2026-06-20
sources: [Scaffold-GS.md]
tags: [research, 3DGS, anchor-structured, view-adaptive, source, paper]
---

# Scaffold-GS 논문 (출처 메타)

- **원본**: `raw/Scaffold-GS.md` (2179줄, PDF 추출본 14p, 이미지 `raw/assets/Scaffold-GS/`)
- **서지**: Tao Lu, Mulin Yu, Linning Xu, Yuanbo Xiangli, Limin Wang, Dahua Lin, Bo Dai. *Scaffold-GS: Structured 3D Gaussians for View-Adaptive Rendering*. CVPR 2024. arXiv:2312.00109v1 (2023.11.30). (상하이 AI Lab·CUHK·난징대·코넬)
- **진입 판정**: [통과] / **영역**: research (Radiance Field NVS — **정적** GS 구조화/압축)
- **특이사항**: 14p 전체 통독 — 본문(anchor·neural Gaussian·growing/pruning·losses) + 부록(MLP 구조 Fig.12·feature bank·voxel size·per-scene 표 6~17). 본 논문은 **동적이 아니라 정적 3DGS의 구조·압축 개선**.

## 핵심 takeaway
1. **이중 계층 구조**: SfM 점 voxel화 → **anchor**(feature $f_v\in\mathbb{R}^{32}$·스케일·$k$ offset). 각 anchor가 $k$개 **neural Gaussian** 생성, 속성(opacity·color·scale·quaternion)을 시점 방향·거리로 **on-the-fly MLP 디코딩**($F_\alpha,F_c,F_s,F_q$). → [[Scaffold-GS]]
2. **view-adaptive**: 속성이 가우시안에 baked되지 않고 매 시점 예측 → 시점 변화·조명·반사·texture-less·LOD에 강건(다중해상도 feature bank).
3. **anchor growing(그래디언트 기반 다해상도 voxel) + pruning(opacity 누적)** + 2단 pre-filter(frustum·opacity τα).
4. 3DGS 동급/상회 화질 + **저장 4~10×↓**(DB 10.2×, BungeeNeRF 7.9×), 실시간 ~100 FPS. 대규모·다스케일서 특히 우위.

## 후속 질문
- anchor 구조가 [[native4DGS]] 압축(4DGSC)·HAC 등 **compact GS 계보**의 뿌리 — 동적 GS에 anchor 적용 시(4D Scaffold) 메모리 이득?
- on-the-fly MLP 디코딩이 feed-forward GS([[GS-LRM]]·[[DGS-LRM]])의 예측 헤드와 어떻게 다른가?
- 극희소 SfM 점·texture-less 한계 → 단안 prior([[VGGT]]·[[DUSt3R]] 기하)로 anchor 초기화 보강?
