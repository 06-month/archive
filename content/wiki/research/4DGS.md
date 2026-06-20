---
title: 4D-GS (deformation-field 동적 가우시안)
area: research
created: 2026-06-20
sources: [4DGS.md]
tags: [research, 4DGS, dynamic-scene, deformation-field, HexPlane, real-time-rendering]
---

# 4D Gaussian Splatting for Real-Time Dynamic Scene Rendering

> Wu, Yi, Fang, Xie, Zhang, Wei, Liu, Tian, Wang (HUST·Huawei). CVPR 2024. arXiv:2310.08528. 코드: guanjunwu.github.io/4dgs (출처: [[2026-06-20-4DGS-논문]])

**한 줄 요약**: 프레임마다 가우시안을 새로 두는 대신 **정준(canonical) 3D 가우시안 1세트** 를 유지하고, **Gaussian deformation field $F$** 로 시각 $t$ 마다 위치·형상을 변형해 렌더 → 실시간(82 FPS@800×800, RTX3090)·저장 18MB로 동적 장면을 표현. 다수 후속 동적 GS의 **deformation-field 정전(定典)**. ([[3D-Gaussian-Splatting|3DGS]]의 동적 확장)

## 문제의식 — 동적 GS의 세 갈래
정적 [[3D-Gaussian-Splatting]]를 4D로 올리는 선행 접근의 한계 (출처: [[2026-06-20-4DGS-논문]]):
- **프레임별 GS / Dynamic3DGS**(Luiten): 매 시각 가우시안 위치·분산을 추적·저장 → 메모리 **$O(tN)$** 선형 증가, 장기 영상서 부담.
- **native 4D 마진 분포**([[native4DGS]], Yang et al. — **이 논문도 "4DGS"라 불림**, 별개): 3D 가우시안에 시간 마진 분포를 더해 4D로 uplift. 본 노트가 본 것은 그 단순 분리형이고, native4DGS는 완전 4D 회전으로 발전.
- **본 논문(4D-GS)**: 정준 가우시안 + 변형장 네트워크 $F$ → 메모리 **$O(N+F)$**. 인접 가우시안을 연결해 개별 추적보다 정확한 모션.

## 방법
### 전체 파이프라인 (Fig. 3)
- 입력: 뷰행렬 $M$, 시각 $t$, 정준 가우시안 $G$. 변형 $\Delta G = F(G,t)$ 후 $G' = G + \Delta G$ 를 미분 splatting $\hat I = S(M,G')$ 로 렌더.
- **canonical-to-world 직접 매핑**: NeRF 계열(world→canonical $\phi_t:(x,t)\to\Delta x$)과 반대로, 변형장이 정준→시각 t를 직접 계산 → backward flow·트래킹 가능.

### Gaussian deformation field $F$ = 인코더 $H$ + 디코더 $D$
- **Spatial-Temporal Structure Encoder $H$**: 4D 신경 voxel을 **6개 다해상도 평면**으로 분해(K-Planes/HexPlane식): $(x,y),(x,z),(y,z),(x,t),(y,t),(z,t)$. 가우시안 중심 $\mu$·시각 $t$ 로 각 평면 bilinear 조회 → 특징을 작은 MLP $\phi_d$ 로 융합. 인접 가우시안이 같은 voxel을 공유해 **공간·시간 구조**를 함께 인코딩(부록 Fig.13서 $R(x,y)$=공간, $R(x,t)$=모션 확인).
- **Multi-head Deformation Decoder $D=\{\phi_x,\phi_r,\phi_s\}$**: 위치 $\Delta X$·회전 $\Delta r$·스케일 $\Delta s$ 를 분리 MLP로 예측. $(X',r',s')=(X+\Delta X,\ r+\Delta r,\ s+\Delta s)$. (유체·비강체엔 색·불투명도 $\phi_C,\phi_\alpha$ 추가 가능 — 단 트래킹 저해.)

### 최적화
- **3D Gaussian warm-up**: 초기 3000 iter은 정준 3D 가우시안만 학습(SfM 점 초기화) → 동적부 가우시안 확보·수치 안정·변형장이 동적부에 집중. warm-up 없으면 화질 하락(Tab.4).
- Loss: $L = |\hat I - I| + L_{tv}$ (L1 색 + 격자 total-variation).

## 결과
- **합성 D-NeRF**(Tab.1): PSNR **34.05**/SSIM 0.98/LPIPS 0.02, 학습 8분, **82 FPS**, 18MB — 3D-GS(23.19, 동적 모델링 없어 실패) 대비 압도, V4D(33.72, 6.9h)보다 빠르고 좋음.
- **HyperNeRF vrig**(Tab.2): PSNR 25.2/MS-SSIM 0.845, 34 FPS. **Neu3D**(Tab.3): 31.15, 30 FPS, 40분 — 멀티캠 고화질.
- **Ablation(Tab.4)**: HexPlane 제거 시 27.05(얕은 MLP만으론 복잡 변형 불가), 위치헤드 $\phi_x$ 제거 시 26.67로 급락(모션 핵심). warm-up·$\phi_r$·$\phi_s$ 도 기여.
- **속도-가우시안 수**(Fig.9): 가우시안 <30k면 ~90 FPS. 트래킹·4D 합성/편집 가능(저장 10MB+8MB).

## 한계
- **단안** setting 강한 overfitting → train view는 좋아도 novel view 실패(depth/optical-flow prior 필요).
- 대모션·배경점 부재·부정확 포즈서 정적/동적 **joint motion 분리 실패**(Fig.16 broom·teapot).
- 도시규모서 거대 가우시안의 변형장 querying이 병목.

## 관련
- **기반**: [[3D-Gaussian-Splatting]] — 정적 GS의 미분 splatting 토대. 본 논문은 그 동적(4D) 확장.
- **개념(다른 영역)**: [[Radiance Field-Volume Rendering]] — $\alpha$-blending 공유 / [[위치인코딩-positional-encoding]] — HexPlane 다해상도 평면이 공간 위치 인코딩과 같은 계열 / [[SfM-COLMAP]] — 정준 가우시안 초기화.
- **선행/대조**: [[NeRF]]·HexPlane·K-Planes(변형장 인코더의 뿌리) / **Dynamic3DGS**(per-frame $O(tN)$) 대비 압축.
- **동시기·후속 동적 GS**: [[Deformable3DGS]](MLP 변형, 동시기) · [[SpacetimeGS]](가우시안별 시간 추적) · [[Ex4DGS]]·[[3D-4DGS]]·[[Relaxed-Rigidity-동적GS]](최적화 기반) · [[4DGT]]·[[DGS-LRM]]·[[MoVieS]]·[[StreamSplat]](feed-forward 4D) — 모두 본 deformation-field 패러다임을 baseline/계보로 참조.
- **출처 메타**: [[2026-06-20-4DGS-논문]]
