---
title: Native 4D-GS (native 4D primitive, 시공간 일체)
area: research
created: 2026-06-20
sources: [native4DGS.md]
tags: [research, 4DGS, dynamic-scene, native-4D-primitive, 4DSH, real-time-rendering]
---

# 4D Gaussian Splatting: Modeling Dynamic Scenes with Native 4D Primitives

> Yang, Pan, Zhu, Zhang, Feng, Jiang, Torr (푸단·서리·옥스퍼드). arXiv:2412.20720 (ICLR'24 [Real-time Photorealistic 4DGS]의 확장판). 프로젝트: fudan-zvg.github.io/4d-gaussian-splatting (출처: [[2026-06-20-native4DGS-논문]])

> [!warning] 이름 충돌 — 두 개의 "4DGS"
> 본 노트(Yang et al., **native 4D primitive**)와 [[4DGS]](Wu et al., CVPR'24, **canonical+deformation+HexPlane**)는 **둘 다 "4DGS"로 불리는 별개 논문**이다. 본 논문은 시간을 변형장이 아니라 **가우시안 자체의 4번째 축**으로 본다. 서로를 baseline으로 인용.

**한 줄 요약**: 동적 장면 복원을 **시공간 4D 볼륨 학습** 문제로 재정식화하고, deformation·tracking 없이 **native 4D 가우시안**(4D 타원체 + 4D 회전)으로 직접 피팅. 조건부 3D + 주변 1D 가우시안 분해로 splatting, **4DSH**로 시간진화 색 → **첫 실시간 고해상도 photorealistic 동적 NVS**. ([[3D-Gaussian-Splatting]]의 시공간 확장)

## 동기 — 동적 NVS 두 갈래의 한계
(출처: [[2026-06-20-native4DGS-논문]])
- **① 암시적 6D plenoptic**(MLP·grid·저랭크 분해; K-Planes·HexPlane): 모션을 명시 안 함 → 공유 파라미터 간섭, 상관 활용 약함.
- **② canonical+motion/deformation**([[Deformable3DGS]]·[[4DGS]]·DynMF): 모션 명시하나 **global tracking 모호성**·특이점 → sudden appear/disappear 같은 복잡 실세계서 한계.
- **본 논문**: 모션 구성에 **최소 가정**. 시공간을 동등하게 다루는 native 4D primitive → versatile·확장 가능.

## 방법
### native 4D 가우시안 (시공간 일체)
- 평균 $\mu=(\mu_x,\mu_y,\mu_z,\mu_t)$, 공분산 $\Sigma=RSS^\top R^\top$ 에서 $S=\text{diag}(s_x,s_y,s_z,s_t)$. **4D 회전 $R$ = 한 쌍의 isotropic rotation**(이중 쿼터니언 $q_l,q_r$)로 구성. (출처: [[2026-06-20-native4DGS-논문]])
- **단순 분리형(No-4DRot, 공간⊥시간)** = 3D 가우시안 + 1D 시간 가우시안 = Wu et al.이 비판한 "marginal 시간 분포" 방식 → 4D 매니폴드는 맞춰도 **모션 포착 실패**(ablation Tab.3). 완전 4D 회전이 핵심 — 4D 회전이 **3D 변위를 유발**해 모션 supervision 없이도 optical flow 창발(Fig.6).

### 렌더 = 조건부 3D + 주변 1D 분해
- 픽셀 $(u,v,t)$ 색: $p_i(u,v,t)=p_i(t)\,p_i(u,v|t)$ 로 인수분해. 조건부 $p(xyz|t)$ 는 3D 가우시안(식 9) → 2D splat 투영, 주변 $p(t)=N(t;\mu_4,\Sigma_{4,4})$ 는 1D 가우시안. 비정규화 가우시안의 조건·주변 분해 가능성을 증명(식 11–19). 타일 래스터라이저에 $p_i(t)$ 가중 누적.
- **4D Spherindrical Harmonics(4DSH)**: 시간+시점 의존 색 $c_i(d,\Delta t)$. SH $Y^m_l(\theta,\phi)$ ⊗ Fourier 1D basis $\cos(2\pi n t/T)$ → 시공간 직교기저(식 20). 같은 점을 시각별 다른 가우시안으로 두는 중복 회피.

### 학습 + 압축(4DGSC)
- end-to-end·**photometric만**. 시간 batch 샘플링으로 flicker 억제, **시공간 densification**($\mu_t$ 그래디언트 + 시간축 split). 시간 anisotropy로 배경 가우시안이 전 구간 cover → 긴 영상서 렌더 가우시안 수 거의 일정(속도 안정).
- **압축**: 형상·색은 **RVQ**(잔차 벡터 양자화)+codebook fine-tune+Huffman, 위치 half-precision, opacity 8-bit, 무의미 가우시안 **mask pruning**. → 1183MB **→ 56.74MB(−95%)**, 화질 −0.1dB.

## 결과·확장
- **Plenoptic Video**(Tab.1): PSNR **32.01**/DSSIM 0.014, **114 FPS** — 유일 실시간 고화질. **Technicolor** 34.03(4DGSC 33.75@1.6MB). **D-NeRF 단안** 34.09.
- **urban**(Waymo-NOTR, §5): LiDAR 4D 초기화·sky cube map·rigid/sparse/cov-t loss → recon **35.04**/NVS 28.67dB, S3Gaussian·StreetGaussian 능가.
- **generative 4D**(Consistent4D): SDS(Stable-Zero123)로 단안→4D, 9분30초 수렴(최속). **4D segmentation**: SAM mask + scale-gated feature 대조학습으로 다중 granularity 시공간 분할.

## 한계
- vanilla는 4D 볼륨이 커 **저장 급증**(→4DGSC로 완화). 단안은 본질적 ill-posed라 강한 prior(생성) 필요. urban 희소뷰는 $L_{sparse}$·warm-up 등 정적 prior 의존.

## 관련
- **기반**: [[3D-Gaussian-Splatting]] — 미분 splatting·densification 토대. 본 논문은 그 시공간(4D) 일반화.
- **개념(다른 영역)**: [[구면조화함수-SH]] — 4DSH가 SH⊗Fourier 확장 / [[Radiance Field-Volume Rendering]] — $\alpha$-blending image formation / [[SfM-COLMAP]] — Plenoptic/Technicolor 초기화.
- **표현 패러다임 대조**: [[4DGS]](Wu, deformation+HexPlane, **동명이론**) / [[Deformable3DGS]](MLP 변형) — 본 논문은 변형 대신 **native 4D 회전**. No-4DRot이 곧 Wu가 비판한 marginal 시간분포.
- **동적 GS 이웃**: [[SpacetimeGS]](시간 의존 feature splatting) · [[Ex4DGS]](명시 키프레임) · [[3D-4DGS]]·[[Relaxed-Rigidity-동적GS]] / [[Scaffold-GS]](앵커 구조, 압축 계보) / feed-forward [[4DGT]]·[[DGS-LRM]]·[[MoVieS]]·[[StreamSplat]].
- **출처 메타**: [[2026-06-20-native4DGS-논문]]
