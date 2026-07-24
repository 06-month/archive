---
title: Flow Matching·생성 prior (Diffusion/Rectified Flow)
area: concepts
created: 2026-07-25
sources: [OmniX.md, NeoVerse.md, C4G.md]
tags: [concept, generative-model, flow-matching, rectified-flow, diffusion, video-diffusion, LoRA]
---

# Flow Matching · 생성 prior (확산·정류 흐름)

**한 줄 요약**: 3D/4D 복원 연구가 "관측→기하"를 넘어 **생성(generation)**으로 확장되며 공통으로 차용하는 **2D/영상 생성 prior**의 개념 묶음. 확산(diffusion)·**flow matching**·**rectified flow**는 노이즈↔데이터 사이 경로를 학습하는 생성 모델 계열이고, 이를 사전학습된 대형 모델(Flux·Wan 등)로 가져와 파노라마 인지·novel-view 보강·4D feature lifting에 재활용한다. courses(수학 기초)와 research(3D 생성)를 가로지르는 공통 도구.

## Flow Matching / Rectified Flow
- **생성 모델의 목표**: 단순 분포(가우시안 노이즈 $z_0$)에서 데이터 분포($z_1$)로 가는 변환을 학습.
- **Flow Matching**: 시점 $t$의 잠재 $z_t$에서 **속도 벡터장(velocity) $v_t$**를 예측하도록 학습하고, 추론 시 ODE $z_1=z_0+\int_0^1 v_t\,dt$를 적분해 샘플 생성. 확산의 확률미분방정식(SDE)을 결정론적 ODE로 단순화한 관점.
- **Rectified Flow**: 노이즈-데이터를 **직선 경로**로 잇도록 흐름을 "곧게 펴" 적은 적분 스텝으로 고품질 생성. Stable Diffusion 3·Flux·Wan 등 최신 대형 생성모델의 학습 목표(velocity 예측 $v=z_1-z_0$).
- **DiT(Diffusion Transformer)**: 확산/flow의 backbone을 U-Net 대신 [[Transformer]]([[ViT]] 계열)로 구성. Flux·Wan이 채택.

## 3D/4D 연구에서의 재활용 패턴
- **사전학습 prior 재활용**: 대규모로 학습된 2D/영상 생성 prior를 **인지·복원 보강**에 전용. 처음부터 학습하는 것보다 강한 일반화.
- **경량 적응(LoRA)**: Low-Rank Adaptation — 사전학습 가중치를 동결하고 저랭크 행렬만 학습해 태스크·모달리티별로 값싸게 적응. 어댑터 여러 개를 갈아끼워 멀티태스크 지원.
- **조건 주입(control branch)**: ControlNet 류 — 생성모델 본체는 동결하고 별도 분기로 조건(depth·mask·카메라 등)을 넣어 제어. distillation 가속과 호환.

## 이 개념을 쓰는 연구 (research, 다른 영역)
- [[OmniX]] — **flow matching** 모델(Flux.1-dev)을 파노라마 생성·인지·완성으로 재활용, **modality-specific LoRA**·circular synchronization. 기하+PBR 재질 인지.
- [[NeoVerse]] — **rectified flow + video diffusion**(Wan-T2V 14B)으로 degraded novel-view를 고품질 영상으로 생성, **control branch만 학습**(본체 동결).
- [[C4G]] — feed-forward 4D 복원 후 **VDM(video diffusion, Wan2.1-VACE)**으로 디테일 refine. query token 기반 4D feature lifting.

## 관련
- **생성 backbone(다른 영역 아님, concept)**: [[Transformer]]·[[ViT]] — DiT의 토대. [[위치인코딩-positional-encoding]] — 시퀀스·2D 위치 조건.
- **대비 개념(concept)**: [[Radiance Field-Volume Rendering]] — 신경 렌더링(관측 재현) vs 생성 prior(새 콘텐츠 합성)의 대비. OmniX는 신경 렌더링과 PBR 렌더링 간극을 한계로 지적.
- **주의**: 본 노트는 세 논문(OmniX·NeoVerse·C4G)이 평문으로 의존하던 생성 개념을 묶은 **앵커 노트**. 개별 논문의 전용 raw는 미수집(수학적 정식화는 각 논문 부록 수준으로만 인용).
