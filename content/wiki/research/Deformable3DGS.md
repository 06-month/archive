---
title: Deformable 3D-GS (단안 동적, MLP 변형장)
area: research
created: 2026-06-20
sources: [Deformable3DGS.md]
tags: [research, 4DGS, dynamic-scene, deformation-field, monocular, real-time-rendering]
---

# Deformable 3D Gaussians for High-Fidelity Monocular Dynamic Scene Reconstruction

> Yang, Gao, Zhou, Jiao, Zhang, Jin (저장성대 CAD&CG·ByteDance). CVPR 2024. arXiv:2309.13101. 코드: github.com/ingra14m/Deformable-3D-Gaussians (출처: [[2026-06-20-Deformable3DGS-논문]])

**한 줄 요약**: 정준(canonical) 공간에서 학습한 [[3D-Gaussian-Splatting|3D 가우시안]]을 **순수 implicit MLP 변형장** $F_\theta(\gamma(x),\gamma(t))\to(\delta x,\delta r,\delta s)$ 으로 시각별 변형해 **단안(monocular)** 동적 장면을 실시간 복원. 저자 주장 "**3D-GS를 deformation field로 동적 확장한 최초**" 프레임워크이며, [[4DGS]](Wu et al.)와 **동시기 작업**. ([[3D-Gaussian-Splatting]]의 동적 확장)

## 핵심 설계
### 정준공간 가우시안 + 변형장 분리 (Fig. 2)
- SfM(COLMAP) 점으로 3D 가우시안 $G(x,r,s,\sigma)$ 초기화. 시간조건 변형을 가우시안 자체에 붙이지 않고(=물리적 의미·시공간 연속성 보존), **별도 변형장** 으로 분리. (출처: [[2026-06-20-Deformable3DGS-논문]])
- 변형: $(\delta x,\delta r,\delta s)=F_\theta(\gamma(\text{sg}(x)),\gamma(t))$. `sg`=stop-gradient(가우시안 위치를 변형장 입력으로만, 그래디언트 차단), $\gamma$=위치인코딩(공간 $L=10$, 시간 $L=6$~10).
- 변형된 $G(x+\delta x,r+\delta r,s+\delta s,\sigma)$ 를 미분 타일 래스터라이저로 $\alpha$-blending 렌더.

### 변형장 = 순수 MLP (격자 X)
- MLP $F_\theta$: 8 FC layer(ReLU, hidden 256) + NeRF식 4번째 layer skip-concat → 위치·회전·스케일 3-head. 저장 **+2MB**.
- **왜 grid/plane(HexPlane·K-Planes)을 안 쓰나**: 격자법은 **low-rank 가정**에 기댐. 동적 장면은 정적보다 **high-rank**이고 explicit point 렌더가 rank를 더 키워 → 격자 상한에 막힘. ⇒ implicit MLP 선택. **이 점이 [[4DGS]](HexPlane 격자 사용)와의 핵심 분기.**

### Annealing Smooth Training (AST)
- 실세계 데이터의 **부정확 COLMAP 포즈** → 시간보간 시 프레임 간 jitter·overfitting. 해법: 시간 입력에 **선형 감쇠 가우시안 노이즈** $X(i)=N(0,1)\cdot\beta\cdot\Delta t\cdot(1-i/\tau)$ 를 더함($\beta=0.1$, $\tau\approx$20k).
- 초기엔 시간 일반화↑, 후기엔 노이즈 소멸로 디테일 보존. **추가 연산 0**(기존 smooth loss 대비 장점).

## 결과
- **합성 D-NeRF**(Tab.1, 800×800): 8개 장면 대부분 SOTA(예 Mutant 42.63dB/SSIM 0.9951, Standup 44.62dB) — 3D-GS·D-NeRF·TiNeuVox·Tensor4D·K-Planes 능가, 특히 LPIPS·SSIM에서 우위.
- **실세계 NeRF-DS**(Tab.2): 평균 PSNR 24.11/SSIM 0.8525 — HyperNeRF·NeRF-DS baseline 상회. AST 없으면 23.97로 하락.
- **속도**: 가우시안 <250k면 RTX3090서 **>30 FPS** 실시간. 3k warm-up + 40k iter, Adam(가우시안/변형장 별도 LR).
- **Ablation**: 위치헤드 $\delta x$ 핵심, $\delta r$·$\delta s$ 보조(Tab.7). SE(3) 변형장은 합성서 미세 개선·실세계선 악화 + 학습 50%↑·FPS 20%↓ → 단순 덧셈 채택.

## 한계
- 시점 다양성·**포즈 정확도에 민감** — HyperNeRF처럼 부정확 포즈선 PSNR 불리(가우시안 수 1,000k로 폭증), 희소 시점(DeVRF 4뷰)서 overfitting(Fig.10).
- 가우시안 수에 시간복잡도 비례, 미세 얼굴표정 등 복잡 인체 모션은 미해결.

## 관련
- **기반**: [[3D-Gaussian-Splatting]] — 정적 GS의 미분 래스터화 토대. 본 논문은 그 단안 동적 확장.
- **개념(다른 영역)**: [[위치인코딩-positional-encoding]] — 변형장 입력 $\gamma(x),\gamma(t)$ 에 직접 사용(고주파 디테일 향상) / [[Radiance Field-Volume Rendering]] — $\alpha$-blending image formation / [[SfM-COLMAP]] — 초기화 + 포즈(부정확성이 본 논문 핵심 난점).
- **동시기·대조**: [[4DGS]](Wu et al.) — 같은 canonical+deformation이나 **MLP vs HexPlane** 인코더로 분기, 서로 concurrent 인용 / [[NeRF]]·D-NeRF·Nerfies·HyperNeRF(implicit 변형장 선행).
- **후속 동적 GS**: [[SpacetimeGS]]·[[Ex4DGS]]·[[3D-4DGS]]·[[Relaxed-Rigidity-동적GS]](최적화 기반) / [[DGS-LRM]]·[[4DGT]](feed-forward) — 모두 deformation/명시 4D 계보.
- **출처 메타**: [[2026-06-20-Deformable3DGS-논문]]
