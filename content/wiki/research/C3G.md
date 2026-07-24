---
title: C3G (Compact 3D Representations with 2K Gaussians)
area: research
created: 2026-07-25
sources: [C3G.md]
tags: [research, 3DGS, feed-forward, compact, query-token, feature-lifting, scene-understanding, pose-free]
---

# C3G: 2K 가우시안으로 배우는 컴팩트 3D 표현

> Minkyeong Jeon, Honggyu An, Jaewoo Jung, Jisang Han, Sunghwan Hong, Yuki Mitsufuji, Seungryong Kim 외 (KAIST AI · ETH AI Center · SONY AI). *"C3G: Learning Compact 3D Representations with 2K Gaussians"*, arXiv:2512.04021 (2026.04). 프로젝트: cvlab-kaist.github.io/C3G

**한 줄 요약**: unposed 다중뷰 이미지에서 **per-pixel(수백만 개)이 아니라 학습가능 query token으로 필수 위치의 컴팩트 가우시안(~2K개, LSM 대비 65×↓·메모리 15×↓)만** 예측하는 feed-forward 프레임워크. 광도손실만으로 학습해도 **각 토큰이 뷰 간 공간적으로 일관된 영역에 attend하는 창발**이 일어나, 이 attention을 재활용해 **어떤 2D 피처든 view-invariant하게 3D로 lifting**(C3G-F). NVS는 경쟁적, 3D 이해·대응은 SOTA. **[[C4G]]의 정적 선행작**(C4G가 C3G 가중치로 초기화). (출처: [[2026-07-25-C3G-논문]])

## 문제의식
- feed-forward 3DGS([[NoPoSplat]] 등)는 **per-pixel 가우시안 예측** → (1) 뷰 간 오정렬된 **중복 primitive** 남발(Fig.2), (2) semantic feature를 2D→3D lift할 때 막대한 계산량 → 피처를 저차원 압축 → **정보 손실·이해 저하**.
- 근본 질문: "장면 복원·이해에 정말 pixel-aligned 가우시안이 필요한가?" 인간은 픽셀 단위 복원이 아니라 **컴팩트·의미 있는 추상**으로 이해.
- C3G: 필수 위치에만 컴팩트 가우시안 → 중복·오정렬 제거 + **압축 없는 피처 lifting** 가능.

## C3G-G: 컴팩트 가우시안 디코더 (§3.2)
- **인코더**: 사전학습 [[VGGT]](풍부한 기하 prior)로 다중뷰 피처 $F_v$ 추출.
- **query 기반 디코딩**: $N{=}2048$개 학습가능 query token $Q$를 이미지 피처와 concat → $X=[Q;F]$ → **$L{=}2$층 full self-attention**. 각 토큰이 (1) 여러 뷰의 특정 영역 정보 집계 (2) 토큰 간 정보교환으로 중복 회피·전체 커버 (3) 담당 3D 영역 정련.
- **디코딩**: 정련된 각 토큰 $\bar Q_i$ → 경량 MLP head로 가우시안 1개 $(\mu,\sigma,\Sigma,c)$. **SH degree 0**(RGB만, 컴팩트 가우시안 학습 안정화).
- **학습**: novel view alpha-blending 렌더 → GT와 광도손실($\lambda_{MSE}L_{MSE}+\lambda_{LPIPS}L_{LPIPS}$)**만**. GT depth·장면 분해 라벨 불요.
- **Low-pass filtering**(RAIN-GS 차용): 가우시안 크기 $s$를 10→0.3 점진 annealing → 초기 위치 부정확할 때 sparse gradient·mode collapse 방지(ablation 필수 확인).

## 창발적 attention (핵심 통찰, §3.4)
- 감독 없이도, 특정 가우시안의 query token attention map을 보면 **여러 뷰에서 대응 객체 영역에 sharp하게 집중** → 명시적 감독 없이 **다중뷰 대응(correspondence) 발견**.
- 원인: 제한된 $N$개로 novel view를 정확히 복원하려면 모델이 **기하적으로 일관된 영역에 가우시안을 배치**하도록 학습되는 암묵적 최적화 압력.

## C3G-F: any-feature 3D lifting (§3.5)
- 기존 feature lifting의 두 난제: (1) 어떤 3D 가우시안이 해당 픽셀 렌더에 기여하는지 **역매핑 비용** (2) 뷰마다 독립 추출된 피처의 **다중뷰 불일치**.
- 해결: C3G-G의 **학습된 attention map을 그대로 재활용** — attention이 곧 correspondence(역매핑 불요), attention weight를 **보간 가중치**로 써서 불일치 피처 집계.
- 구현: C3G-G 구조·가중치 복사, **attention은 동결하고 value projection만 학습**(1K step). 새 인코더 $E'$(LSeg·MaskCLIP·[[DINO|DINOv2/v3]]·VGGT tracking)의 피처를 받아 뷰-불변 집계 피처를 가우시안에 부착 → 피처맵 렌더.

## 결과
- **NVS**(RE10K, 12/24/36뷰): AnySplat과 경쟁하며 **2K 가우시안**(AnySplat 1.5M~3.3M). VGGT+NoPo(per-pixel)는 뷰 늘수록 **정렬오차 누적**으로 저하. TTO 시 양쪽 크게 능가.
- **3D 이해**(ScanNet·Replica open-vocab seg): 2 입력뷰만으로 feed-forward LSM + per-scene 최적화(Feature-3DGS·CF3, 전체 뷰 사용) 능가. **렌더 피처가 타깃 이미지서 직접 추출한 피처보다도 우수**(다중뷰 인지 효과).
- **다중뷰 대응**(Probe3D PCK@10px): 대폭 향상 — VGGT-tracking 34.0→**68.1**, DINOv2 23.8→**68.5**, DINOv3 37.7→**68.8** avg. AnyUp·FiT3D 능가. 피처 upsampling도 AnyUp 능가.
- **ablation**: low-pass filter 없으면 collapse; $N{=}2048$ 최적(4096은 불안정 — 부최적 위치 다수가 local minima); 백본 unfreeze 유리; 인코더 VGGT>DINOv3이나 **DINOv3(기하감독 없음)도 작동** → 강한 기하 prior 없이도 학습 가능(per-pixel 방식은 실패하는 지점).
- **C3G++**(부록 A): 다중 데이터셋 + intrinsic 임베딩 + Gaussian head 복제($N{\times}N_G$) + VGGT pointmap 유사-GT depth·normal loss로 확장.

## 관련
- **직계 후속(research)**: [[C4G]] — 같은 KAIST CVLAB. C3G의 정적 2K-query 설계를 **4D(동적)**로 확장, C3G 가중치로 초기화. (C4G 노트의 "정적 선행작 C3G" 평문 갭 해소.)
- **대조군(research)**: [[NoPoSplat]] — per-pixel 방식(VGGT+NoPo baseline, 뷰 증가 시 정렬오차)에 대한 컴팩트 대안. [[pixelSplat]]·[[MVSplat]]·[[GS-LRM]] per-pixel feed-forward GS 계보에서 이탈.
- **백본(research)**: [[VGGT]] — 기본 비주얼 인코더(기하 prior).
- **표현(research)**: [[3D-Gaussian-Splatting]] — 가우시안 표현·alpha blending·RAIN-GS류 안정화.
- **개념(다른 영역)**: [[DINO]] — DINOv2/v3(대안 인코더 + lifting 대상) / [[구면조화함수-SH]] — SH degree 0 선택 / [[Transformer]]·[[ViT]] — query token·self-attention 디코더의 토대.
- **출처 메타**: [[2026-07-25-C3G-논문]]
