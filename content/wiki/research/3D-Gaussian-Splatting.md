---
title: 3D Gaussian Splatting (3DGS)
area: research
created: 2026-06-13
sources: [3dgs.md]
tags: [research, 3DGS, radiance-field, novel-view-synthesis, real-time-rendering, rasterization]
---

# 3D Gaussian Splatting (3DGS)

> Kerbl, Kopanas, Leimkühler, Drettakis. *"3D Gaussian Splatting for Real-Time Radiance Field Rendering"*, ACM ToG 42(4) / SIGGRAPH 2023. arXiv:2308.04079.

**한 줄 요약**: 장면을 수백만 개의 **비등방성(anisotropic) 3D 가우시안**으로 명시적 표현하고, **타일 기반 미분가능 래스터라이저**로 렌더링하여 — NeRF급 품질을 **실시간(≥30fps, 1080p)** 과 **수 분의 학습 시간**으로 달성한 방사장 신규시점합성(NVS) 기법. (출처: [[2026-06-13-3DGS-논문]])

## 문제의식
- NeRF 계열(특히 Mip-NeRF360)은 최고 품질이지만 학습 **최대 48시간**, 렌더링 10s/frame로 느림.
- 빠른 방법(InstantNGP·Plenoxels)은 격자/해시 구조로 가속하지만 품질을 일부 희생하고, 1080p **실시간 디스플레이 불가**.
- 근본 원인: 연속 표현의 **확률적 샘플링(ray-marching)** 비용과 빈 공간 처리 비효율.
- → 연속 표현의 최적화 친화성 + 점 기반의 빠른 래스터화를 **둘 다** 취하자.

## 3대 기여 (논문 직접 인용 ≤3줄)
> ① anisotropic 3D Gaussian을 고품질 비정형 방사장 표현으로 도입
> ② adaptive density control과 결합한 3D Gaussian 속성 최적화
> ③ 가시성 인식·비등방 스플래팅·빠른 역전파를 지원하는 GPU 미분가능 렌더러

## 표현: 3D 가우시안
- 각 가우시안 $G(x)=\exp\!\big(-\tfrac12\,x^{T}\Sigma^{-1}x\big)$, 평균 $\mu$(=위치) 중심. 렌더 시 $\alpha$를 곱해 블렌딩.
- **공분산 $\Sigma$** 가 모양(타원체)을 결정. 직접 최적화하면 positive semi-definite 제약 위반 위험 → 분해 사용:
  $$\Sigma = R\,S\,S^{T}\,R^{T}$$
  - $S$: 스케일(3D 벡터 $s$), $R$: 회전(쿼터니언 $q$). 분리 저장 → 항상 유효한 공분산 보장.
- **2D 투영**(렌더용): 시점변환 $W$, 투영 야코비안 $J$ 에 대해 $\Sigma' = J\,W\,\Sigma\,W^{T}J^{T}$ (Zwicker EWA splatting). 3행·3열 제거 → 2×2 평면 공분산.
- **최적화 파라미터 4종**: 위치 $\mu$ · 불투명도 $\alpha$ · 공분산 $\Sigma(s,q)$ · 색상([[구면조화함수-SH|SH]] 계수, 시점의존 색).

## 파이프라인
```
SfM 희소 점군 → 3D 가우시안 초기화 → [미분가능 타일 래스터화 → L1+D-SSIM loss → Adam]
                                          ↕ (interleaved)
                                   Adaptive Density Control
```
![[raw/assets/3dgs/extracted-images/page-005-image-009.png]]
- 입력: 정적 장면 다중 사진 + SfM(Structure-from-Motion) 카메라 보정 → 부산물인 **희소 점군으로 초기화** (MVS 불필요). 합성 데이터셋은 랜덤 초기화도 가능.
- 명시적 그래디언트 유도(부록 A)로 autodiff 오버헤드 제거.

## Adaptive Density Control (§5.2) — 핵심
warm-up 후 **100 iter마다** 밀도 조정. 뷰공간 위치 그래디언트 $\nabla_p L > \tau_{pos}\,(=0.0002)$ 인 가우시안이 대상:

| 상황                       | 조건                                   | 동작                                                       | 효과        |
| ------------------------ | ------------------------------------ | -------------------------------------------------------- | --------- |
| **Under-reconstruction** | 작은 가우시안, 미복원 영역                      | **Clone**: 복제 후 그래디언트 방향 이동                              | 총 부피↑·개수↑ |
| **Over-reconstruction**  | 큰 가우시안, 고분산 영역                       | **Split**: 둘로 분할, 스케일 $\div\phi\,(=1.6)$, 원본을 PDF로 위치 샘플 | 부피 보존·개수↑ |
| **Pruning**              | $\alpha<\epsilon_\alpha$ / 월드·뷰공간 과대 | 제거                                                       | 개수↓       |

- floater 억제: **3000 iter마다 $\alpha\!\approx\!0$ 으로 리셋** → 필요한 곳만 다시 $\alpha$ 상승, 나머지는 culling.

## Tile-based 래스터라이저 (§6) — 속도의 핵심
- 화면을 **16×16 타일**로 분할, 99% 신뢰구간이 frustum과 교차하는 가우시안만 유지(+guard band로 극단 위치 제거).
- 타일별 인스턴스에 **`키 = 뷰공간 깊이 + 타일 ID`** 부여 → **단일 GPU Radix sort** 1회. (픽셀별 정렬 없음 → 근사 $\alpha$-blending이지만 스플랫이 픽셀 크기에 가까워지면 오차 무시 가능.)
- 타일당 thread block: 가우시안을 shared memory로 협력 로드 → 픽셀별 **front-to-back** 누적, $\alpha$ 포화 시 정지.
- **역전파**: back-to-front 재순회. 누적 불투명도를 매 단계 저장하지 않고, forward 종료 시점의 **최종 누적 $\alpha$ 를 각 점의 $\alpha$ 로 나눠** 복원 → 메모리 절약.
- 핵심 차별점: 그래디언트 받는 splat **개수 제한 없음** → 임의 깊이 복잡도 장면을 하이퍼파라미터 튜닝 없이 학습.

## 학습 디테일
- Loss: $L=(1-\lambda)L_1+\lambda L_{\text{D-SSIM}}$, $\lambda=0.2$. (출처: [[방사장-볼륨렌더링]] 의 $\alpha$-blending image formation 공유)
- 활성화: $\alpha$ 는 sigmoid$[0,1)$, 스케일은 exponential.
- **SH warm-up**: 0차(diffuse 색)만 먼저 최적화 → 1000 iter마다 한 밴드씩 추가(총 4밴드) → 각도 정보 부족 시 base color 발산 방지.
- 해상도 warm-up: 1/4 해상도로 시작, 250·500 iter에서 업샘플.
- 구현: PyTorch + 커스텀 CUDA(NVIDIA CUB Radix sort), SIBR 뷰어.

## 결과
- **품질**: Mip-NeRF360과 동급~약간 상회(예: Mip-NeRF360 데이터셋 Ours-30K SSIM 0.815 / PSNR 27.21 / LPIPS 0.214).
- **속도**: 134–160 fps(7K), 실시간. 학습 6–51분 vs Mip-NeRF360 **48시간**.
- **규모**: 장면당 1–5M 가우시안. 메모리 270–734MB(학습 peak >20GB — NeRF 대비 큰 단점).
- 데이터셋: Mip-NeRF360 · Tanks&Temples · Deep Blending · 합성 Blender.

## Ablation (Table 3) — 무엇이 품질을 만드나
SfM 초기화 · densification(clone/split) · **비등방 공분산** · splat 그래디언트 무제한 · SH — 모두 기여. Full = avg 26.05(30K). 특히 splat 개수 제한(N=10)은 PSNR **11dB** 급락.

## 한계
- 관측 부족 영역 아티팩트, 길쭉한/얼룩진(splotchy) 가우시안, **popping**(guard band 제거 + 단순 가시성 정렬 탓), 정규화 부재, **높은 메모리**, 대형 장면은 위치 LR 감소 필요.

## 관련
- **개념 기반**: [[방사장-볼륨렌더링]] · [[구면조화함수-SH]] · [[SfM-COLMAP]] (concepts)
- **선행/대조**: [[NeRF]] — 연속 MLP 표현, 본 논문이 속도로 추월한 대상
- **후속/응용**: [[lighthouseGS]] · [[Relaxed-Rigidity-동적GS]] (3DGS 변형·확장)
- **출처 메타**: [[2026-06-13-3DGS-논문]]
