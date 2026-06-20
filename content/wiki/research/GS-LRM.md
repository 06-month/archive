---
title: GS-LRM (Large Reconstruction Model for 3DGS)
area: research
created: 2026-06-17
sources: [GS-LRM.md]
tags: [research, 3D-reconstruction, gaussian-splatting, feed-forward, LRM, sparse-view, ECCV2024]
---

# GS-LRM: Large Reconstruction Model for 3D Gaussian Splatting

> Zhang, Bi, Tan, Xiangli, Zhao, Sunkavalli, Xu (Adobe Research · Cornell Univ). *"GS-LRM: Large Reconstruction Model for 3D Gaussian Splatting"*, ECCV 2024. arXiv:2404.19702. sai-bi.github.io/project/gs-lrm/

**한 줄 요약**: 2~4장의 posed sparse 이미지에서 고품질 **per-pixel 3D Gaussian** 을 ~0.23초(A100)에 예측하는 단순·확장 가능한 트랜스포머 LRM. patchify → multi-view 토큰 self-attention → 픽셀당 가우시안 디코드. 객체·장면 모두 처리. [[4DGT]]·[[DGS-LRM]]·[[MoVieS]] 등 **feed-forward GS 복원 계보의 정적 뿌리**. (출처: [[2026-06-17-GS-LRM-논문]])

## 문제의식
- 전통 3D 복원(photogrammetry·MVS)은 dense 멀티뷰 필요·느림. NeRF류 per-scene 최적화도 뷰 多·느림.
- 기존 트랜스포머 LRM(LRM·Instant3D·DMV3D 등)은 **triplane NeRF** 표현 → 제한된 triplane 해상도 + 비싼 volume rendering → 학습·렌더 속도·디테일·대규모 장면 확장에 한계, **객체 중심**.
- GS-LRM은 [[3D-Gaussian-Splatting|3DGS]]를 표현으로 써서 빠른 렌더 + per-pixel 예측으로 **객체·장면 통합**, 입력 해상도에 자유롭게 적응.

## 아키텍처 (Fig. 2) — 단순함이 핵심
- 입력: $N$개 posed 이미지 + **Plücker ray 좌표**(카메라 파라미터에서 계산)를 RGB와 **채널 결합(9채널)** → 픽셀당 pose conditioning. Plücker가 픽셀·뷰마다 달라 **spatial embedding 역할** → 별도 positional/view embedding 불필요.
- patchify(patch $p=8$) → linear → multi-view 토큰 concat → **표준 트랜스포머 $L=24$층**(self-attention + MLP, Pre-LN, 16헤드, dim 1024, MLP 4096). 3D inductive bias(cost volume·epipolar) 없음 — dense self-attention이 멀티뷰 correspondence를 학습.
- 출력 토큰을 **linear 1개**로 디코드 → unpatchify → 패치당 $p^2$ 가우시안. 각 픽셀 = 1 가우시안 ($q=12$: RGB 3 + scale 3 + 쿼터니언 4 + opacity 1 + **ray distance 1**). 중심 $xyz=\text{ray}_o + t\cdot\text{ray}_d$. 총 $N\cdot HW$ 가우시안 — **입력 해상도에 비례**(triplane 고정 해상도와 대조).

## 학습
- 손실: $M$개 supervision 뷰 렌더링의 **MSE + Perceptual**(VGG-19 — LPIPS보다 안정), $\lambda=0.5$.
- 두 모델 독립 학습(동일 아키텍처): **객체** = Objaverse 730K(32뷰 렌더 중 4 입력+4 supervision), **장면** = RealEstate10K(2 입력+6 supervision, pixelSplat 프로토콜). 300M params, 최대 16K 토큰.
- 64×A100, 256-res 사전학습 2일 → 512-res finetune 1일. FlashAttention-v2·gradient checkpointing·BF16·deferred backprop.
- **Gaussian parameterization**(부록): scale=$\min(\exp(G-2.3), 0.3)$(선형 degenerate 방지 clip), opacity=$\sigma(G-2.0)$(초기 ~0.1), distance=$\sigma$→[near,far](객체 0.1~4.5, 장면 0~500), RGB=zero-order [[구면조화함수-SH|SH]]. bias 제거 + zero-mean 초기화로 원하는 GS 초기값 근사.

## 결과
- **객체**(GSO·ABO): Instant3D Triplane-LRM 대비 **+3.98dB**(GSO), concurrent LGM 대비 **+8dB**(거의 동일 compute). pixel-aligned 예측이 입력 RGB→가우시안 색의 shortcut → 고주파 디테일(텍스트·thin structure) 보존.
- **장면**(RealEstate10K): pixelSplat 대비 **+2.2dB PSNR**·+0.034 SSIM. epipolar 기반 aggregation 없이 self-attention만으로 intra/inter-view 전 픽셀 context 집약.
- **다운스트림 3D 생성**: text-to-3D(Instant3D SDXL)·image-to-3D(Zero123++ 6뷰, 4뷰 학습이나 가변 입력 가능)·text-to-scene(Sora 영상 + COLMAP 등록).

## 한계
- 최대 해상도 ~512×904(1K·2K 미지원). **known camera pose 필요**(SfM 의존 — 4뷰만 캡처 시 SfM 곤란) → pose-free 방향 향후 과제. pixel-aligned라 **view frustum 내 표면만** 모델(미관측 영역 복원 불가).

## 관련
- **직접 후계(연구)**: [[4DGT]]·[[DGS-LRM]] — GS-LRM의 정적 pixel-aligned GS를 **동적·deformable·4D** 로 확장(둘 다 본 노트를 기반으로 인용). [[MoVieS]] — GS-LRM 재구현을 정적 baseline으로 사용.
- **계보 형제**: LRM·Instant3D(triplane NeRF LRM, 본 논문이 GS로 대체)·pixelSplat·LGM(concurrent pixel-aligned GS). [[MVSplat]] — 같은 sparse-view feed-forward GS·동일 RealEstate10K 벤치마크지만 **cost volume 매칭**으로 차별(본 논문은 self-attention 회귀). [[VGGT]]·[[DUSt3R]] — feed-forward 복원의 다른 분기(pointmap·카메라까지 예측).
- **표현 기반(다른 영역 연결)**: [[3D-Gaussian-Splatting]] — 예측 표현 / [[NeRF]] — triplane-NeRF LRM 대조 / [[Radiance Field-Volume Rendering]] — splatting image formation.
- **개념(다른 영역)**: [[ViT]]·[[Transformer]] — patchify·self-attention 백본 / [[위치인코딩-positional-encoding]] — Plücker ray spatial embedding / [[SfM-COLMAP]] — known pose 입력 / [[구면조화함수-SH]] — zero-order SH 색.
- **출처 메타**: [[2026-06-17-GS-LRM-논문]]
