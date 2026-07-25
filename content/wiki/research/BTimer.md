---
title: BTimer (Bullet-Time 피드포워드 동적 장면 복원)
area: research
created: 2026-07-26
sources: [BTimer.md]
tags: [research, 3DGS, feed-forward, dynamic, bullet-time, novel-view-synthesis, real-time, monocular, GS-LRM-lineage]
---

# BTimer: 단안 영상의 Bullet-Time 피드포워드 복원

> Hanxue Liang, Jiawei Ren, Ashkan Mirzaei, Antonio Torralba, Ziwei Liu, Sanja Fidler, Huan Ling, Zan Gojcic, Jiahui Huang 외 (NVIDIA · Cambridge · NTU · Toronto · MIT · Vector). *"Feed-Forward Bullet-Time Reconstruction of Dynamic Scenes from Monocular Videos"*, arXiv:2412.03526 (NeurIPS 2025). 프로젝트: research.nvidia.com/labs/toronto-ai/bullet-timer

**한 줄 요약**: 단안 동적 영상을 **실시간 feed-forward**로 복원·NVS하는 최초의 motion-aware 모델(저자 주장, 2024-12 기준 — **실세계 장면 NVS** 범위. cf. [[DGS-LRM]]의 "최초 deformable GS LRM"은 deformable+scene flow 범위·6개월 후속이라 양립). 핵심은 **bullet-time 정식화** — context 프레임들에 **목표 timestamp(bullet time) 임베딩**을 붙여, 모델이 모든 context를 aggregate해 그 순간에 고정된 완전한 3DGS를 출력. 모든 timestamp를 순회하면 전체 영상 복원. 정적·동적을 통일하고 RGB 손실만으로 약지도 → 방대한 정적 데이터로 사전학습. 12뷰 256² 150ms. (출처: [[2026-07-26-BTimer-논문]])

## 문제의식
- 정적 feed-forward 복원([[GS-LRM]] 등)은 발전했으나 **동적 확장이 난제**(4D 감독 데이터 부족·모션 모델링 복잡). 유일한 feed-forward 동적 모델 L4GM([[LGM]]의 4D 확장)은 **객체 중심·고정 시점·멀티뷰 감독**이라 실세계 장면에 일반화 불가.
- 최적화 기반(HyperNeRF·[[ShapeOfMotion]]·4D-GS)은 per-scene 최적화라 느리고 스케일 불가.
- 질문: "동적 장면을 잘 다루는 feed-forward 모델을 어떻게?"

## Bullet-Time 정식화 (핵심, §3.1)
- context 프레임 $I_c$ + 포즈 + timestamp → **bullet timestamp $t_b$에 고정된 완전한 3DGS** 출력. $t_b$를 전 timestamp로 순회 = 3DGS 시퀀스 = 영상 복원(병렬 가능).
- **이점**: (i) 정적 = 모든 timestamp를 동일하게 두면 됨 → **정적·동적 통일**, 대량 정적 데이터로 사전학습 (ii) 영상 길이·frame rate 무관 스케일 (iii) 볼류메트릭 = 다시점 지원. 명시적 감독 없이 **암묵적 motion-aware**.
- **아키텍처**: [[GS-LRM]] 착안 ViT(24 self-attention 블록), 8×8 패치. 입력 토큰 = RGB + **Plücker 포즈** + **시간 임베딩**(context timestamp $f^{ctx}$ + bullet timestamp $f^{bullet}$, sinusoidal PE). 출력 토큰 → linear로 12파라미터 가우시안(RGB·scale·quat·opacity·ray distance τ), 위치는 $\mu=o+\tau d$ pixel-aligned unprojection.
- **감독**: RGB 공간 손실만(MSE+LPIPS, 3D GT 불요). **interpolation supervision**(인접 context 사이 timestamp 감독)이 핵심 — 없으면 가우시안을 카메라 근처에 숨겨 loss를 속이는 local minima.

## Novel Time Enhancer (NTE, §3.2)
- 빠른 모션서 novel intermediate timestamp($t_b\notin T$) 복원 실패(pixel-aligned 예측의 inductive bias). → **3D-free NTE**: LVSM 착안 decoder-only ViT가 목표 시점 RGB를 직접 예측 → BTimer의 bullet frame으로 입력. QK-norm·KV-cache 가속. 단독 NVS는 열등해 BTimer와 결합.

## Curriculum 학습 (§3.3)
- **Stage 1** 정적 사전학습(저→고해상도): Objaverse·RE10K·MVImgNet·DL3DV 390K 샘플, 128→256→512.
- **Stage 2** 동적 co-training: Kubric·PointOdyssey·DynamicReplica·Spring + **PANDA-70M 인터넷 영상 40K**(SAM 동적 마스킹 + DROID-SLAM 포즈, reproj error 필터). 정적 co-train으로 안정화.
- **Stage 3** long-context(4→12 뷰). 32×A100.

## 결과
- **동적**(DyCheck·NVIDIA, Tab.1): per-scene 최적화 baseline 상회·경합. NVIDIA서 4D-GS·Casual-FVS(명시적 3DGS) 대비 PSNR +5%(25.82 vs 24.57), 렌더 115fps. 12뷰 256² **150ms**·<10GB.
- **정적**(RE10K·Tanks&Temples, Fig.7): GS-LRM·MVSplat·pixelSplat 능가(RE10K LPIPS 0.070). 다중 데이터셋 사전학습이 일반화의 핵심(단일 데이터셋 대비).
- **backward compatible**: 같은 모델이 정적·동적 모두. DAVIS 실세계 일반화.

## 한계
- NVS 특화 → **지오메트리(depth) 부정확**. pixel-aligned 가우시안이 **시간적 변형(deformation)을 표현 못 함** → 명시적 모션 복원엔 후처리 필요(대비: [[ShapeOfMotion]]의 SE(3) 궤적).

## 관련
- **계보(research)**: [[GS-LRM]]의 **동적 확장**(bullet-time). feed-forward GS 복원(LRM 계보) 동적 분파. [[pixelSplat]]·[[MVSplat]] — per-pixel feed-forward GS 대비군.
- **feed-forward 동적 peer(research)**: [[Long-LRM]] — 같은 GS-LRM 계보 many-view(정적) 자매 / [[DGS-LRM]] — **"최초" 주장 범위 대조**(BTimer=bullet-time 장면 NVS 선행, DGS-LRM=deformable+scene flow 명시 예측 후속) / [[4DGT]]·[[MoVieS]]·[[StreamSplat]]·[[NeoVerse]]·[[C4G]] — feed-forward 4D 클러스터.
- **최적화 대비(research)**: [[ShapeOfMotion]] — 최적화 기반 단안 4D(BTimer가 baseline·대안으로 인용). [[NeRF]] — 동적 NeRF baseline(HyperNeRF·DynNeRF·RoDynRF).
- **표현·개념**: [[3D-Gaussian-Splatting]] — 가우시안 표현 / [[Transformer]]·[[ViT]] — ViT 백본·NTE / [[위치인코딩-positional-encoding]] — 시간 sinusoidal PE.
- **출처 메타**: [[2026-07-26-BTimer-논문]]
