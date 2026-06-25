---
title: pixelSplat (feed-forward generalizable GS, 확률적 깊이)
area: research
created: 2026-06-25
sources: [PixelSplat.md]
tags: [research, 3DGS, feed-forward, generalizable, epipolar-transformer, probabilistic-depth]
---

# pixelSplat: 3D Gaussian Splats from Image Pairs for Scalable Generalizable 3D Reconstruction

> Charatan, Li, Tagliasacchi, Sitzmann (MIT·SFU/Toronto). CVPR 2024. arXiv:2312.12337. 프로젝트: dcharatan.github.io/pixelsplat (출처: [[2026-06-25-pixelSplat-논문]])

**한 줄 요약**: **이미지 2장**에서 단일 forward로 pixel-aligned [[3D-Gaussian-Splatting|3D 가우시안]] radiance field를 예측하는 **feed-forward generalizable NVS의 시초**. 실세계의 두 난제 — **스케일 모호성**(epipolar transformer)과 **local minima**(확률적 깊이 + reparameterization) — 를 풀어, light field transformer 대비 렌더를 **2.5 자릿수(~650×)** 가속하면서 편집 가능한 명시적 3D를 생성. ([[3D-Gaussian-Splatting]]의 feed-forward·sparse-view 분기)

## 문제의식
- generalizable NVS(소수 이미지→3D)는 미분 렌더링 기반이라 학습·렌더가 메모리·시간 부담. light field transformer(GPNR·Du et al.)는 빠르지만 실시간 미달 + **명시적 3D 미생성**(편집·downstream 불가). (출처: [[2026-06-25-pixelSplat-논문]])
- 3DGS를 generalizable로 가져올 때 두 벽: ① **스케일 모호성** ② **local minima**(아래).

## 핵심 ① 스케일 모호성 해결 — Epipolar Transformer
- SfM 포즈는 메트릭이 아니라 **장면마다 임의 스케일 $s_i$** 로 곱해짐 → 단일 이미지로는 깊이 예측 불가(원리적 모호).
- **2-view epipolar 인코더**: 뷰 $I$의 픽셀 $u$ 광선이 다른 뷰 $\tilde I$에 만드는 **epipolar 선**을 따라 샘플 $\{\tilde u_l\}$ 추출, 각 샘플에 삼각측량 깊이 $\tilde d$ 를 **positional encoding** 으로 부착. **epipolar cross-attention** 으로 대응점을 찾아 그 깊이를 픽셀 feature에 기록 → 장면 스케일 $s_i$ 일관 깊이 확보. 대응 없는 픽셀은 **per-image self-attention** 으로 inpaint. (ablation: 제거 시 26.09→**19.89dB**, 가장 치명적)

## 핵심 ② local minima 회피 — 확률적 깊이 + Reparameterization
- 가우시안 위치를 **직접 회귀하면 local minima**(국소 support로 그래디언트 소실 + empty space 가로지르는 단조경로 부재). 3D-GS의 비미분 ADC(pruning/split)는 generalizable에선 사용 불가(그래디언트 필요).
- **해법**: 픽셀별로 깊이를 직접 안 내고 **깊이 버킷 $Z$개 위의 이산 확률분포 $p_\phi(z)$** 예측 → 위치를 **샘플링**($z\sim p_\phi$, $\mu=o+(b_z+\delta_z)d_u$).
- **샘플링을 미분 가능하게**(VAE reparameterization 영감): opacity를 **$\alpha=\phi_z$**(샘플 버킷 확률)로 설정 → $\nabla_\phi L=\nabla_\alpha L$. 직관: 올바른 깊이면 opacity↑ → 그 위치 재샘플 확률↑(확률질량 집중·불투명 표면 형성); 틀리면 opacity↓. (ablation: 제거 시 −1.5dB)
- 픽셀당 $(\mu,\Sigma,\alpha,S)$ 예측(공분산·SH는 직접 회귀). 최종 가우시안 = 두 뷰 예측의 **union**.

## 결과
- **RealEstate10k 26.09 / ACID 28.27**(PSNR), 전 baseline(pixelNeRF·GPNR·Du et al.) 압도 — 특히 LPIPS. 렌더 0.002s, 인코딩 0.102s → 다음으로 빠른 baseline 대비 **~650× 저비용**.
- 인코더: **DINO 사전학습** ResNet-50 + ViT-B/8 합산([[DINO]]·[[ViT]]). 300k step, MSE+LPIPS. 3-view 확장 시 28.31.
- **Ablation(Tab.2)**: epipolar 인코더(필수, −6dB)·확률적 샘플링(−1.5dB)·깊이 positional encoding(−1dB) 모두 핵심.

## 한계
- 가우시안 **union**(두 뷰 융합·중복제거 없음). 미관측부 **생성(generative) 미지원**. 다뷰로 확장 시 epipolar attention **메모리 폭증**. 반사면 투명·OOD 시점서 billboard 아티팩트(3D-GS 공통).

## 관련
- **기반**: [[3D-Gaussian-Splatting]] — 예측 표현(미분 splatting). 본 논문은 그 feed-forward·2-view 일반화.
- **개념(다른 영역)**: [[DINO]] — 인코더(ResNet+ViT) 사전학습 / [[ViT]] — backbone / [[위치인코딩-positional-encoding]] — epipolar 깊이 인코딩 / [[SfM-COLMAP]] — 스케일 모호성의 출처 / [[Radiance Field-Volume Rendering]] — α-blending image formation.
- **직접 후속·대조**: [[MVSplat]] — pixelSplat을 **cost volume 매칭**으로 대체(확률적 깊이 대비 기하 우수·10×↓·2× 빠름, 본 논문이 직접 baseline) / [[GS-LRM]] — self-attention 회귀로 RealEstate10k서 +2.2dB, "pixelSplat 프로토콜" 채택 / [[DGS-LRM]] — feed-forward의 동적 확장.
- **선행**: [[NeRF]]·pixelNeRF(feed-forward NeRF)·light field transformer(GPNR·Du et al., 본 논문이 추월).
- **출처 메타**: [[2026-06-25-pixelSplat-논문]]
