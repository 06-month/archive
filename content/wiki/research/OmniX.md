---
title: OmniX (통합 파노라마 생성·인지·완성 → PBR 3D 장면)
area: research
created: 2026-07-25
sources: [OmniX.md]
tags: [research, 3D-scene-generation, panorama, 2D-lifting, flow-matching, inverse-rendering, PBR, diffusion, LoRA]
---

# OmniX: 통합 파노라마 프레임워크로 그래픽스-레디 3D 장면 생성

> Yukun Huang, Jiwen Yu, Yanning Zhou, Jianan Wang, Xintao Wang, Pengfei Wan, Xihui Liu (HKU · Kuaishou · Tencent · Astribot). *"OmniX: From Unified Panoramic Generation and Perception To Graphics-Ready 3D Scenes"*, arXiv:2510.26800v2 (2026.07). 프로젝트: yukun-huang.github.io/OmniX

**한 줄 요약**: 사전학습된 **2D flow matching 모델(Flux.1-dev)을 파노라마 생성·인지·완성으로 재활용**하는 통합 프레임워크. 기존 2D-lifting이 외형 생성에만 집중하고 깊이는 off-the-shelf로 때운 것과 달리, **기하(distance·normal) + PBR 재질(albedo·roughness·metallic)까지 인지**해 **relighting·시뮬레이션 가능한 PBR-레디 3D 장면**을 자동 구축. (출처: [[2026-07-25-OmniX-논문]])

## 문제의식
- 자동 3D 장면 구축의 두 갈래: **절차적 생성**(규칙 기반, 다양성·사실성 부족)과 **2D lifting**(2D 생성 prior 재활용, 다양·고품질). 파노라마 표현은 2D↔3D 다리로 뷰 일관성↑.
- 그러나 기존 파노라마 2D-lifting은 **외형(appearance) 생성만** 하고, 깊이만 별도 추정 → 텍스처·PBR 재질 없음 → **현대 그래픽스 파이프라인(PBR·relighting)에 통합 불가**.
- OmniX의 통찰: **2D 생성 모델을 기하·재질의 "인지(perception)"에 재활용**하자. RGB→X 인지와 masked X→X 완성을 모두 하나의 생성 패러다임으로 통합.

## 통합 정식화 (식 3·5)
- flow matching 생성기 $f_\theta$가 잠재 $z_0\to z_1$ 속도 벡터 $v$를 예측(ODE 적분). 이를 **다중 조건 입력** $\{c^i\}$로 일반화.
- 세 task = 조건 구성의 차이(Fig.3): **(생성·완성)** masked 파노라마 입력→완전 파노라마 / **(인지 RGB→X)** RGB 조건→목표 모달리티 / **(가이드 인지)** RGB+masked X→완전 X.
- **MIMO flow matching loss**: 다중 조건 입력 + 다중 목표 출력. 생성만 텍스트 프롬프트 사용(나머지는 빈 문자열).

## 두 가지 핵심 기술
1. **Circular Synchronization** (학습 불필요) — ERP 파노라마의 **경계 이음새(seam) 불연속**을 근본 해결. 원인은 spatial operator의 **circular translation equivariance 부재**. conv는 **circular padding**, RoPE attention은 **token padding + attention masking**으로 각 query에 원형·균일 수용장 부여. 사전학습 파라미터 미수정 → 생성력 보존하며 near-seamless(Fig.10). 기존 latent blending·rotation(잠재 조작)보다 근본적.
2. **Modality-specific Adapters (Separate-Adapter)** — 다중 2D 입력을 다루는 cross-modal 어댑터 3안 비교(Fig.5): Shared-Branch(채널 concat) / Shared-Adapter(토큰 concat) / **Separate-Adapter(모달리티별 LoRA 배정, ours)**. 후자가 인지 성능 최고 + 새 모달리티 확장 유연(가중치 분포 교란 최소). 모든 입출력은 공간 정렬·동일 2D 위치인코딩 공유.

## PanoX 데이터셋 (기여)
- **UE5 렌더링 합성 다중모달 파노라마**. 8개 대규모 장면(실내 5 + 실외 3: 상점·창고·야생 등). 각 장면당 RGB + distance·world normal·albedo·roughness·metallic + 텍스트(Florence-2).
- **>10,000 인스턴스 = 60,000 파노라마 이미지**. Train/Val/Test(8:1:1) + 별도 2장면 OutDomain(일반화 평가).
- **실내·실외 모두 + 조밀 기하·재질 주석을 갖춘 최초의 파노라마 데이터셋**(Tab.1, 기존은 실내 한정·재질 없음).

## 응용: PBR-레디 3D 장면 생성 (§3.4)
- (a) **다중모달 파노라마 생성**: 어댑터 전환으로 "이미지→파노라마→내재속성 파노라마" 생성 사슬.
- (b) **장면 복원**: 파노라마 distance map → 픽셀별 광선 방향으로 3D 정점 unproject, 이웃·거리로 연결성 결정 → mesh. 다른 모달리티 맵을 **구면 UV 언래핑**으로 삼각면에 할당 → **PBR-레디 3D 에셋**.
- (c) **반복 완성(OmniX-Fill)**: 고정 시점 파노라마는 자유 탐험 불가 → 어댑터에 mask 입력 추가 + **occlusion-aware mask**(distance map + 랜덤 3D 변위의 광선 교차로 가림 영역 추정) fine-tune → 그래픽스 엔진과 상호작용하며 새 영역 생성·기존 보존.

## 결과
- **생성**: CubeDiff·Diffusion360 등 대비 SOTA(Laval Indoor FID 7.4·CLIP-FID 2.5·FAED 5.2, SUN360 KID 0.66). 대규모 레이아웃 구조 일관성 우위.
- **내재 분해**(albedo·roughness·metallic): RGB↔X·IDArb·DiffusionRenderer 등 5기법 대비 3속성 모두 SOTA(PanoX-OutDomain·Structured3D).
- **기하 추정**: normal 최고, depth 2위(MoGe는 9.0M vs 0.087M 주석·다중뷰 stitching 필요 — OmniX는 훨씬 적은 데이터).
- **완성**: OmniX-Fill이 Flux-Fill을 전 지표에서 능가(가림·시점 변화 하 강건).
- **구현**: Flux.1-dev 위 **12개 어댑터**(각 2+ LoRA), 512×1024, 4×L40S, AdamW lr 1e-4. Blender에서 자유 탐험·relighting·물리 시뮬 시연(Fig.11).
- **ablation**: Separate-Adapter > 대안, 2D 생성 prior 초기화 > from-scratch(픽셀 분포 달라도 일관 향상). camera ray 조건은 normal만 소폭↑, distance-normal 공동 모델링은 이득 없음.

## 한계
- 2D flow matching 상속: **느린 학습·추론**. distance 예측 부정확 → 복원 표면 울퉁불퉁 → PBR 렌더 품질 저하. **metallic 일반화 취약**(파노라마 PBR 재질 데이터 희소). 신경 렌더링(2D 생성) vs PBR 렌더링 간극 → 2D prior의 재질 추정 기여 제한적.

## 관련
- **개념(다른 영역)**: [[flow-matching-생성prior]] — Flux(flow matching)·LoRA 재활용의 개념 앵커 / [[Transformer]]·[[ViT]] — 백본 DiT(Flux)·RoPE attention의 토대. circular synchronization이 손대는 spatial operator가 곧 attention·conv.
- **2D-lifting 이웃(research)**: [[3D-Gaussian-Splatting]] — 파노라마 GS 계열(DreamScene360·SceneDreamer360·LayerPano3D)이 OmniX가 넘어서려는 "외형만 생성" 2D-lifting baseline. OmniX는 mesh+PBR로 대체.
- **기하 인지 대조**: [[VGGT-Ω]] — 둘 다 이미지→장면 기하(depth·normal). VGGT-Ω는 다중뷰 feed-forward **복원(reconstruction)**, OmniX는 단일 파노라마 생성 prior 재활용 **인지(perception)** — 상보적 경로.
- **image formation 맥락**: [[NeRF]] — radiance field 2D-lifting/신경 렌더링 계보. OmniX는 명시적 PBR mesh로 그래픽스 파이프라인 통합을 지향(신경 렌더링과 대비).
- **출처 메타**: [[2026-07-25-OmniX-논문]]
