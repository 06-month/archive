---
title: Spacetime GS (STG, 다항식 모션 + feature splatting)
area: research
created: 2026-06-20
sources: [SpacetimeGS.md]
tags: [research, 4DGS, dynamic-scene, feature-splatting, polynomial-motion, real-time-rendering]
---

# Spacetime Gaussian Feature Splatting for Real-Time Dynamic View Synthesis

> Li, Chen, Li, Xu (OPPO US·Portland State). CVPR 2024. arXiv:2312.16812. 코드: github.com/oppo-us-research/SpacetimeGaussians (출처: [[2026-06-20-SpacetimeGS-논문]])

**한 줄 요약**: 3D 가우시안에 **시간 opacity + 다항식 모션/회전** 을 부착한 **Spacetime Gaussian(STG)** 으로 멀티뷰 비디오 동적 장면을 표현하고, SH를 **neural feature splatting** 으로 대체해 화질·속도·용량을 동시 달성 — lite 모델이 **8K@60FPS**(RTX4090). ([[3D-Gaussian-Splatting|3DGS]]의 멀티뷰 동적 확장)

## 핵심 설계 (Fig. 2)
### Spacetime Gaussian (STG)
시공간 점 $(x,t)$ 의 opacity $\alpha_i(t)=\sigma_i(t)\exp(-\tfrac12(x-\mu_i(t))^\top\Sigma_i(t)^{-1}(x-\mu_i(t)))$ — 세 시간 성분 추가 (출처: [[2026-06-20-SpacetimeGS-논문]]):
- **시간 opacity**(1D temporal RBF): $\sigma_i(t)=\sigma^s_i\exp(-s^\tau_i|t-\mu^\tau_i|^2)$. $\mu^\tau$=최대 가시 시점, $s^\tau$=지속 구간. → **생성/소멸(transient)** 콘텐츠를 자연 표현, 긴 모션을 **짧은 세그먼트로 분할**(단일 300프레임 모델 가능).
- **다항식 모션**: $\mu_i(t)=\sum_{k=0}^{n_p}b_{i,k}(t-\mu^\tau_i)^k$, $n_p=3$. **다항식 회전**: 쿼터니언 $q_i(t)=\sum c_{i,k}(t-\mu^\tau)^k$, $n_q=1$. 스케일 $S$ 는 시간무관(개선 없음 확인).

### Splatted Feature Rendering
- SH 대신 **9차원 feature** $f_i(t)=[f^{base}_i,\ f^{dir}_i,\ (t-\mu^\tau_i)f^{time}_i]$ 저장(base 색·시점·시간). splat 후 픽셀별 $F_{base},F_{dir},F_{time}$ 분리 → 2-layer MLP $\Phi$: $I=F_{base}+\Phi(F_{dir},F_{time},r)$.
- SH 48차 대비 **9차**로 압축하면서 표현력 유지. **lite-version**: $\Phi$ 제거하고 $F_{base}$만 → **8K@60FPS, >300FPS**.

### Guided Sampling
- 초기화 SfM 점이 sparse한 **원거리 영역**은 수렴 난항(blur). → 학습 오차 큰 패치의 ray를 따라 coarse depth 범위 내에 새 가우시안 샘플링(density control 보완, 장면당 ≤3회). 불필요분은 낮은 opacity로 pruning.

## 결과
- **Neural 3D Video**(Tab.1): PSNR **32.05**@**140 FPS**@200MB(전 baseline 압도, 최저 LPIPS). lite 31.59@310FPS@103MB.
- **Google Immersive** 29.2@99FPS(HyperReel 대비 10×↑). **Technicolor** 33.6@86.7FPS@1.1MB/프레임.
- **vs 동류 GS**(부록 Tab.6): Dynamic3DGS(per-frame, 시간 floater·flicker), [[native4DGS]](4D Gaussian=**선형 모션**, STG 다항식이 더 expressive·빠름), 4DGaussians([[4DGS]])보다 화질·속도 우위. 멀티뷰서 단일 시퀀스 학습으로 **시간 일관성** 우수(Fig.6).
- **Ablation**: 시간 opacity 제거 시 31.0으로 최대 하락(핵심), 모션>회전, feature splatting·guided sampling 모두 기여. SfM 초기화 프레임 수↓ → 용량↓·화질 약간↓.

## 한계
- **on-the-fly 학습 불가**(스트리밍 응용 제약). 멀티뷰 전용 — 단안은 정규화/생성 prior 필요. guided sampling도 정확 depth 없으면 창밖 등 완전 해소 못 함.

## 관련
- **기반**: [[3D-Gaussian-Splatting]] — 미분 splatting·density control 토대.
- **개념(다른 영역)**: [[구면조화함수-SH]] — 본 논문이 **대체**하는 대상(neural feature로) / [[Radiance Field-Volume Rendering]] — $\alpha$-blending / [[SfM-COLMAP]] — 전 시각 점으로 STG 초기화.
- **모션 모델 대조**: [[4DGS]]·[[Deformable3DGS]](deformation MLP) / [[native4DGS]](native 4D 회전, 선형) vs 본 논문(명시적 **다항식**) — 동적 GS 모션 표현 3분류. [[4DGS]]가 본 논문을 "가우시안별 개별 추적"으로 인용.
- **동적 GS 이웃**: Dynamic3DGS(per-frame 추적, 본 논문 baseline) / [[Ex4DGS]]·[[3D-4DGS]]·[[Relaxed-Rigidity-동적GS]] / feed-forward [[StreamSplat]]·[[4DGT]]·[[DGS-LRM]]·[[MoVieS]].
- **출처 메타**: [[2026-06-20-SpacetimeGS-논문]]
