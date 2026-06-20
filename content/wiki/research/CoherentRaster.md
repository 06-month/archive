---
title: CoherentRaster (LFD용 3DGS)
area: research
created: 2026-06-16
sources: [CoherentRaster.md]
tags: [research, 3DGS, light-field-display, rasterization, real-time-rendering, GPU]
---

# CoherentRaster: Efficient 3DGS for Light Field Displays

> Sim, Shin, Jeon, Lee, Choo, Cho (POSTECH·ETRI). *"CoherentRaster: Efficient 3D Gaussian Splatting for Light Field Displays"*, SIGGRAPH Conference Papers '26. arXiv:2605.04509. 코드: github.com/sgj0402/coherent-raster

**한 줄 요약**: **라이트필드 디스플레이(LFD)** 의 인터레이스 영상을 [[3D-Gaussian-Splatting|3DGS]]로 **실시간** 렌더링하는 프레임워크. **서브픽셀 단위 래스터화**에 ① 인접 시점 간 중복 계산을 없애는 **Cross-view Coherent Attribute Reuse** 와 ② 인터레이스 레이아웃이 깨뜨린 GPU 메모리 효율을 복원하는 **View-coherent Remapping** 을 더해, RTX 5090에서 71시점 4K 인터레이스를 최대 23 FPS로 합성. (출처: [[2026-06-16-CoherentRaster-논문]])

## 문제의식
- LFD(렌티큘러)는 안경 없이 연속 모션 패럴랙스를 주지만, 한 프레임이 수십~수백 시점을 동시에 담은 **인터레이스 영상**(패널 해상도)을 요구 → 계산·메모리가 시점 수에 **선형 증가**, 2K↑ 고해상도에서 실시간 불가.
- 3DGS는 단일 시점엔 효율적이나 LFD에 직접 적용하면 비용 폭증.
- 선행 가속의 한계: **서브픽셀 기반**([[3D-Gaussian-Splatting|3DGS]]에 적용한 Ji et al. 2025)은 인접 서브픽셀이 서로 다른 시점에서 와 **공간 일관성(spatial coherence) 상실** → warp 효율 저하. **MPI 기반**(Kim et al. 2025)은 고해상도에서 아티팩트 억제에 수백 평면이 필요해 **무겁다**.

## 배경
### 렌티큘러 LFD (Fig. 2)
- LCD 패널 위 수직 렌티큘러 렌즈 어레이가 각 서브픽셀 빛을 특정 각도로 굴절 → 시점별 서브픽셀만 관찰.
- 모든 서브픽셀 $(x,y,u)$($u$=RGB 채널)에 **시점 인덱스 행렬** $\mathbf{V}\in\mathbb{Z}^{W\times H\times3}$ 를 배정. 디스플레이 3파라미터(틸트각 $\alpha$, 격자선 수 $L_x$, 오프셋 $K_{\text{offset}}$)로 결정:
  $$d_{\text{offset}}=3x+u+3y\tan\alpha-K_{\text{offset}},\quad x_{\text{offset}}=d_{\text{offset}}\bmod L_x,\quad j=\lfloor N\cdot x_{\text{offset}}/L_x\rfloor$$

### GPU warp & memory coalescing (concepts 기초)
- NVIDIA SIMT: 32스레드 **warp**가 lock-step 실행. warp 내 스레드들이 **연속·정렬된** 주소를 접근하면 메모리 컨트롤러가 transaction을 합치는 **coalescing**으로 대역폭 최대화. 흩어진(divergent) 접근은 transaction이 쪼개져 지연·낭비 → 이것이 서브픽셀 래스터화의 핵심 병목.

## 4.1 서브픽셀 단위 래스터화 (베이스)
- 시점별 풀 RGB 영상을 만든 뒤 샘플링하는 전통 방식과 달리, **각 서브픽셀에 어떤 가우시안이 어떤 색으로 기여하는지 직접** 계산 → 불필요 픽셀 연산 제거.
- 타일 기반 4단계로 확장: **projection → key generation → sorting → alpha blending**. 키 = 타일 ID + 시점 ID $j$ + 깊이 $d_{i,j}$.
- 단순(naive) 서브픽셀 파이프라인의 **두 비효율**: ⑴ 시점별 **중복** 평가, ⑵ 인터레이스 레이아웃의 **uncoalesced** 메모리 접근. → 아래 두 전략이 각각 해결.

![[raw/assets/CoherentRaster/page-renders/page-005.png]]

## 4.2 Cross-view Coherent Attribute Reuse — 중복 제거
인접 시점에서 **부드럽게 변하는** 투영 속성을 재사용. 전체 시점 $\mathbf{V}=\{v_i\}_{0}^{N-1}$ 을 $K$개 disjoint 클러스터로 균등 분할($K<N$), 각 클러스터를 **대표 시점** $v'_k$ 로 표현. projection·key gen·sorting 세 단계에 일관 적용.

| 속성 | 계산 단위 | 이유 |
|---|---|---|
| 2D 평균 $\boldsymbol\mu^{2D}_{i,j}$ | **시점별** (per-view) | 투영 중심이라 작은 시점 이동에도 크게 움직여 **타일 배정**에 직접 영향 → 재사용 시 기하 아티팩트 |
| 2D 공분산 $\Sigma^{2D}_{i,k}$, 깊이 $d_{i,k}$, SH 색 $c_{i,k}$ | **클러스터별** (대표 $v'_k$서 1회) | 국소 표면 방향·셰이딩 의존이라 시점 변화에 완만 → 클러스터 내 공유 |

- **Key generation**: 가우시안마다 클러스터 내 ≥1 시점과 겹치는 타일을 모아 **per-cluster** Gaussian-tile 쌍 생성(per-view 중복 제거). 64-bit 키 $=(t,k,d_{i,k})$ — 타일→클러스터→깊이 순 정렬되도록 비트 패킹: `key = (t << (32+Bit_K)) | (k << 32) | d`.
- **Sorting**: 키 정렬로 $(t,k)$ 쌍별 연속 리스트 $[S_{t,k},E_{t,k})$ 생성, 각 리스트는 깊이순. 쌍 개수가 줄어 정렬 부하 대폭 감소.
- **Discussion**: 일부 시점엔 안 보이는 타일에 가우시안이 배정될 수 있으나, alpha blending이 평균·공분산·서브픽셀 좌표로 정밀 평가 → 불필요 가우시안은 opacity≈0으로 자연 처리. 정렬 절감 이득이 비용을 능가.

## 4.3 View-coherent Remapping — 메모리 coalescing 복원
- 렌즈 기하가 시점을 패널 전역에 뒤섞어, **같은 타일 내 스레드도 시점 인덱스가 발산** → 서로 다른 Gaussian 리스트 접근.
- 해법: 스레드→서브픽셀 매핑을 raster 순서가 아니라 **시점 인덱스로 정렬**. 타일별 서브픽셀을 row-major 선형화 후 $\mathbf{V}[\mathbf{x}]$ 로 정렬 → 룩업테이블 $\Psi$ 에 저장(렌즈 기하 고정이라 **1회 사전계산**).
- 효과: warp 내 **시점 단조성** $\mathbf{V}[\Psi(r)]\le\mathbf{V}[\Psi(r+1)]$ 보장 → 이웃 스레드가 같은/인접 Gaussian 리스트 접근 → **coalesced**. 블렌딩: 스레드 rank $r$ → $\hat{\mathbf{x}}=\Psi(r)$, 시점 $j$·클러스터 $k$로 리스트 식별, per-view $\boldsymbol\mu^{2D}_{i,j}$ + 재사용 $\Sigma^{2D}_{i,k},c_{i,k}$ 로 front-to-back 누적.

## 실험
- **구현**: gsplat 기반 커스텀 CUDA, **AccuTile**(정확한 가우시안-타일 교차)을 베이스라인 포함 기본 적용. 실제 장면엔 3DGS-MCMC 정규화. 기본 클러스터 |V_k|=8. **RTX 5090(32GB)**.
- **데이터**: 합성 Blender 8 + Mip-NeRF 360 7장. 디스플레이: landscape 71뷰/53°/4K(Looking Glass 16"), portrait 63뷰/53°/2K(Looking Glass Go). 화질은 원본 3DGS 렌더를 **pseudo-GT** 로 PSNR/SSIM/LPIPS 측정.

| (FPS) | 합성 2K | 합성 4K | MipNeRF 2K | MipNeRF 4K |
|---|---|---|---|---|
| 3DGS (full-frame) | 5.8 | 4.1 | 3.9 | 2.1 |
| Subpixel-3DGS | 28 | 19 | 11 | 5.7 |
| MPI (64 plane) | 0.8 | 0.4 | 0.8 | 0.4 |
| **Ours (|V_k|=8)** | **88** | **56** | **30** | **16** |

- **vs full-frame 3DGS 7.6× 가속**, 화질 열화 미미. MPI는 깊이 이산화로 PSNR ~20dB(우리 >40dB). 클러스터 ↑ → 속도↑·화질↓ (|V_k|=8이 최적 균형).
- **Ablation (Table 3, 합성2K/4K·Mip2K/4K)**: 둘 다 없음 28/19/11/5.7 → +Remap만 34/22/12/6.4 → +Reuse만 67/41/21/11 → **둘 다 88/56/30/16**. Reuse가 속도 기여 최대, Remap은 실제 장면 blending에서 결정적.
- **부록**: 클러스터=궤적 순 연속 그룹(대표=중앙 인덱스 카메라, 잔여는 마지막 카메라 복제 패딩). RTX 3090(L2 6MB)에서도 베이스라인 능가. 시간 분해(Table 5·6): Reuse가 Proj/KeyGen/Sort·#Pairs(예: Mip 2K 259.6M→62.8M) 절감, Remap이 Blend 절감.

## 한계
- 클러스터 내 **국소 일관성**에 의존 → 고주파 **specular** 표면에서 Cross-view Reuse 아티팩트(Fig. 6, Materials). 상용 LFD의 높은 각 밀도 + SH의 고주파 감쇠로 대부분 완화.
- **정적 장면** 한정 — 동적(4D) 확장은 향후 과제.

## 관련
- **기반**: [[3D-Gaussian-Splatting]] — 타일 래스터화·서브픽셀 확장의 토대. 본 논문은 단일시점 3DGS의 **다중시점 확장** 문제를 푼다.
- **개념(다른 영역)**: [[구면조화함수-SH]] — 클러스터 공유되는 시점의존 색 / [[Radiance Field-Volume Rendering]] — $\alpha$-blending image formation 공유 / [[SfM-COLMAP]] — 3DGS 초기화 입력.
- **선행/대조**: [[NeRF]] — Radiance Field 표현 계보. 서브픽셀 선행 DirectL(Yang 2024)·MPI(Kim 2025)와 대비.
- **동적 확장 단서**: [[Relaxed-Rigidity-동적GS]] (정적→동적 확장 방향).
- **출처 메타**: [[2026-06-16-CoherentRaster-논문]]
