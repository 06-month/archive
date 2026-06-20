---
title: Scaffold-GS (anchor 구조화 정적 GS)
area: research
created: 2026-06-20
sources: [Scaffold-GS.md]
tags: [research, 3DGS, anchor-structured, view-adaptive, compact, real-time-rendering]
---

# Scaffold-GS: Structured 3D Gaussians for View-Adaptive Rendering

> Lu, Yu, Xu, Xiangli, Wang, Lin, Dai (상하이 AI Lab·CUHK·난징대·코넬). CVPR 2024. arXiv:2312.00109. 프로젝트: city-super.github.io/scaffold-gs (출처: [[2026-06-20-Scaffold-GS-논문]])

**한 줄 요약**: [[3D-Gaussian-Splatting|3DGS]]의 **중복 가우시안·구조 무시** 문제를, SfM 기반 **anchor 점**으로 가우시안 분포를 조직하고 속성을 **시점 의존 MLP로 on-the-fly 디코딩**하는 이중 계층 구조로 해결 — 화질은 동급/상회, 저장은 4~10× 압축, view-adaptive. (정적 장면 대상, [[3D-Gaussian-Splatting]] 구조 개선)

## 문제의식
바닐라 3DGS는 모든 학습 뷰를 맞추려 가우시안을 과도 팽창 → **중복 多·구조 무시**, 시점 변화·texture-less·조명효과에 취약(속성이 개별 가우시안에 baked, 보간 능력 없음). (출처: [[2026-06-20-Scaffold-GS-논문]])

## 방법 (Fig. 2)
### Anchor 초기화
- COLMAP sparse 점을 voxel화($V=\lfloor P/\epsilon\rfloor\cdot\epsilon$, 중복 제거) → 각 voxel 중심이 **anchor**. anchor마다 context feature $f_v\in\mathbb{R}^{32}$, 스케일 $l_v$, $k$개 학습 offset $O_v$.
- **다해상도 feature bank** $\{f_v,f_{v\downarrow1},f_{v\downarrow2}\}$ 를 시점 의존 가중치(MLP $F_w$)로 블렌딩 → $\hat f_v$ (장면 granularity를 시점별 포착).

### Neural Gaussian 유도
- frustum 내 보이는 anchor마다 $k$개 neural Gaussian 생성: 위치 $\mu=x_v+\{O\}\cdot l_v$. 속성(opacity·color·scale·quaternion)을 $\hat f_v$ + 상대 거리 $\delta_{vc}$·방향 $\vec d_{vc}$ 로 **개별 MLP** $F_\alpha,F_c,F_s,F_q$(2-layer, hidden 32)가 one-pass 디코딩.
- **view-adaptive**: 같은 가우시안도 시점 따라 속성이 변함(국소 연속성 유지) → 시점 변화·조명에 강건. **2단 pre-filter**: ① frustum 내 anchor만 활성 ② opacity $\alpha<\tau_\alpha$ neural Gaussian 제거 → 3DGS 수준 속도(~100 FPS) 유지.

### Anchor 정제 + Loss
- **growing**: neural Gaussian 그래디언트가 큰 다해상도 voxel($\nabla_g>\tau_g$)에 새 anchor 추가(texture-less·미관측 영역 보강). **pruning**: anchor의 누적 opacity가 낮으면 제거.
- $L=L_1+\lambda_{SSIM}L_{SSIM}+\lambda_{vol}L_{vol}$, **volume 정규화** $L_{vol}=\sum\text{Prod}(s_i)$ 로 가우시안을 작고 겹침 없게.

## 결과
- **실세계**(Tab.1): Mip-NeRF360 28.84 / **T&T 23.96·DB 30.21**(3DGS 능가). 저장 **4.4~10.2×↓**(DB 676→66MB), 속도 동급~↑(102~139 FPS), 수렴도 빠름.
- **다스케일·대규모**(Tab.3): **BungeeNeRF 27.01 vs 3DGS 24.89**@저장 7.9×↓. 미관측 거리로 부드럽게 외삽(3DGS의 needle 아티팩트 해소). Synthetic Blender 33.68@3.8×↓.
- **분석**: anchor feature가 K-means서 의미적 군집(난간·책상 등) → 해석성·확장성. opacity selector가 geometry proxy처럼 작동. $k$ 값 무관하게 활성 가우시안 수 수렴(비중복 선호).

## 한계
- 초기 SfM 점에 민감 — 극희소 점·대형 texture-less 영역은 anchor 정제로도 완전 해소 못 함.

## 관련
- **기반**: [[3D-Gaussian-Splatting]] — 미분 래스터화·density control 토대. 본 논문은 그 **구조화·압축·view-adaptive** 개선.
- **개념(다른 영역)**: [[SfM-COLMAP]] — anchor voxel 초기화 입력 / [[Radiance Field-Volume Rendering]] — $\alpha$-blending / [[구면조화함수-SH]] — 본 논문이 시점 의존 MLP로 **대체**한 색 표현 / [[위치인코딩-positional-encoding]] — 시점 거리·방향 인코딩 계열.
- **선행/대조**: [[NeRF]]·Mip-NeRF360·Instant-NGP·Plenoxels(grid/MLP Radiance Field) / Point-NeRF(point 기반).
- **압축·구조 계보**: [[native4DGS]] 의 4DGSC 등 compact GS가 본 anchor 구조를 차용(native4DGS [38]). feed-forward 예측 헤드([[GS-LRM]]·[[DGS-LRM]])와 on-the-fly 디코딩 철학 비교 대상.
- **출처 메타**: [[2026-06-20-Scaffold-GS-논문]]
