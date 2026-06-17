---
title: MoVieS (Motion-Aware 4D Dynamic View Synthesis)
area: research
created: 2026-06-16
sources: [MoVieS.md]
tags: [research, 4D-reconstruction, dynamic-scene, gaussian-splatting, feed-forward, view-synthesis, point-tracking, VGGT-based]
---

# MoVieS: Motion-Aware 4D Dynamic View Synthesis in One Second

> Lin, Lin, Pan, Yu, Hu, Yan, Fragkiadaki, Mu (Peking Univ · ByteDance · CMU). *"MoVieS: Motion-Aware 4D Dynamic View Synthesis in One Second"*, arXiv:2507.10065 (2026). chenguolin.github.io/projects/MoVieS

**한 줄 요약**: [[VGGT]] 백본 위에서 단안 영상의 **appearance·geometry·motion을 하나로 통합** 예측하는 feed-forward 4D 모델. **dynamic splatter pixel**(정적 가우시안 + 시간 deformation field)로 1초 내에 NVS·깊이·3D point tracking을 단일 모델로, scene flow·moving object segmentation은 zero-shot. (출처: [[2026-06-16-MoVieS-논문]])

## 문제의식
- 기존 feed-forward 복원([[3D-Gaussian-Splatting|pixelSplat/GS-LRM]], [[DUSt3R]]·[[VGGT]])은 **정적 한정**. 동적 확장([[MONST3R]] 등)은 2프레임·sparse point cloud에 머물거나, BTimer는 프레임별 독립 GS(관계 미모델), NutWorld는 명시 supervision 없음.
- MoVieS는 NVS·기하·모션을 **공유 백본 + 3 헤드**로 통합 → task별 supervision 의존 최소화, 대규모 이종 데이터 학습.

## 표현: Dynamic Splatter Pixel
- 각 픽셀 = 첫 프레임 카메라 정준 공간의 splatter pixel $g=\{x, a\}$($x$ 위치 + 11D 속성 $a$: 쿼터니언·scale·opacity·color). 정적 splatter pixel에 **시간 deformation field $m(t)=\{\Delta x(t), \Delta a(t)\}$** 추가 → $x\leftarrow x+\Delta x(t)$. 모션을 기하에서 분리.

## 아키텍처 (Fig. 1–2)
- 입력: posed 영상 → patchify + pretrained encoder(DINOv2). 카메라는 **Plücker embedding(픽셀정렬) + camera token(linear)** 둘 다, timestamp는 sinusoidal token.
- **[[VGGT]]의 기하 사전학습 attention 블록** 으로 프레임 간 상호작용 → 공유 feature token.
- **3 DPT 헤드**: ① depth head(VGGT 초기화, 기하 grounding) ② splatter head(scratch, RGB shortcut으로 고주파 보존) ③ **motion head** — query time $t_q$ 를 **AdaLN**으로 주입해 임의 시각의 dense $\Delta x,\Delta a$ 예측(Fig. 2).

## 학습
- 다중 task $L=\lambda_d L_{depth}+\lambda_r L_{rendering}+\lambda_m L_{motion}$. depth=MSE+gradient, rendering=MSE+LPIPS.
- **Motion loss** = point-wise L1(tracking GT, 대부분 0으로 sparsity 유도) + **distribution loss**(프레임 내 상대 거리 구조 보존). 둘 조합이 경계 선명.
- 데이터 8종(RealEstate10K·TartanAir·MatrixCity 정적 + PointOdyssey·DynamicReplica·Spring·VKITTI2·Stereo4D 동적/tracking). VGGT식 scene scale 정규화, confidence weighting 생략.
- **Curriculum**(불안정 학습 안정화): 정적 사전학습 → 동적(5뷰→13뷰) → 고해상도 finetune. 32×H20 ~5일.

## 결과
- **정적 NVS**(RealEstate10K): DepthSplat·GS-LRM 능가, 정적 입력 시 예측 모션이 ~0으로 수렴(정적/동적 implicit 구분).
- **동적 NVS**(DyCheck·NVIDIA): 최적화 기반 MoSca·Shape-of-Motion과 경쟁/우위면서 **0.93s**(orders faster). 마스크 없이도 강건(SoM은 모션 분할 의존해 카메라 흔들림서 저하).
- **3D point tracking**(TAPVid-3D): BootsTAPIR·CoTracker3·SpatialTracker(모두 단안 depth 의존) 능가 — 공유 world 좌표 직접 추정 덕(EPE3D 0.55→0.22 on ADT).
- **Ablation**: camera token+Plücker 결합 최적, motion·NVS 상호 강화(NVS만으론 모션 학습 실패, motion만은 흐릿), VGGT 초기화는 ~3배 빠른 수렴(필수는 아님).
- **Zero-shot**: scene flow estimation, moving object segmentation(모션 norm thresholding).

## 한계
- 최적화 기반과 화질 갭 존재(저들은 여러 pretrained model 전처리 이점). 외부 카메라 추정 도구 의존(end-to-end 아님). 장영상·고해상도 스케일링 비용.

## 관련
- **직접 기반**: [[VGGT]] — 이미지 인코더·feature backbone·depth head 초기화(motion head는 pointmap head 초기화). [[DUSt3R]] 계보의 GS·모션 확장.
- **동적 peer**: [[4DGT]]·[[DGS-LRM]]·[[StreamSplat]] — feed-forward 4D GS 클러스터 / [[MoRe]]·[[POMATO]]·[[MONST3R]] — 동적 복원 대조.
- **개념(다른 영역)**: [[ViT]]·[[Transformer]] — 백본·AdaLN / [[방사장-볼륨렌더링]] — 3DGS rasterization / [[위치인코딩-positional-encoding]] — Plücker·sinusoidal time.
- **표현 기반**: [[3D-Gaussian-Splatting]] — splatter pixel의 토대 / [[NeRF]] — 동적 NVS 방사장 계보.
- **출처 메타**: [[2026-06-16-MoVieS-논문]]
