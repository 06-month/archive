---
title: index
area: system
created: 2026-06-11
tags: [index]
---

<nav class="pf-site-nav pf-site-nav-contained" aria-label="Site">
  <a class="pf-brand" href="../">06-month</a>
  <div class="pf-nav-links">
    <a href="../">Home</a>
    <a href="../blog/">Blog</a>
    <a href="https://github.com/06-month/blog">GitHub</a>
    <button class="pf-theme-toggle" type="button" data-pf-theme-toggle aria-label="Toggle dark mode">◐</button>
  </div>
</nav>
<script>;(()=>{const a=t=>{document.documentElement.setAttribute("saved-theme",t);try{localStorage.setItem("theme",t)}catch(e){}};document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-pf-theme-toggle]");if(!b)return;const c=document.documentElement.getAttribute("saved-theme")==="dark"?"dark":"light";a(c==="dark"?"light":"dark")})})()</script>

<div class="pf-list-head">
  <p class="pf-kicker">Wiki</p>
  <h1>index</h1>
  <p class="pf-page-copy">전체 wiki의 영역·카테고리별 카탈로그. <code>/query</code>의 진입점이자 <code>/ingest</code>마다 갱신되는 지도입니다.</p>
</div>

운영 규칙: `CLAUDE.md` · 결정 트리/압축룰: [[raw-wiki-규칙]] · 시간순 기록: `log.md`

---

## courses — 학과 수업
### 블록체인
- [[블록체인]] — 과목 허브(MOC)
- [[타원곡선암호-ECC]] — 유한체 곡선·스칼라곱셈·이산로그·`secp256k1`
- [[ECDSA-디지털서명]] — `(r,s)` 생성·검증, k 재사용 위험
- [[직렬화-SEC-DER]] — SEC·DER·Base58·WIF·엔디언
- [[비트코인-트랜잭션]] — 입력/출력/록타임, UTXO, varint, Script
- [[블록체인2.0-알트코인]] — 알트코인·합의(PoW/PoS/PoI)
- [[스마트계약-플랫폼]] — 이더리움·네오·DApps
- [[지갑-채굴]] — 핫/콜드 지갑, 채굴
- [[2026-06-11-블록체인-강의]] — (source) 175p PDF

## research — 3D Vision / 3DGS / NeRF / Scene Reconstruction

- **가로지르는 지도(MOC)**: [[VGGT-백본-생태계]] — [[VGGT]]를 백본으로 쓰는 후속작(VGGT-Ω·MoRe·MoVieS·C3G·C4G·NeoVerse)을 클러스터 넘어 재편.

### Radiance Field NVS (Radiance Field)
**계보**: [[NeRF]] (2020, 연속 MLP) → [[3D-Gaussian-Splatting|3DGS]] (2023, 명시적·실시간) → 구조화 [[Scaffold-GS]] · 응용 [[lighthouseGS]] · [[CoherentRaster]] · 동적 [[Ex4DGS]]·[[3D-4DGS]]·[[Relaxed-Rigidity-동적GS]]
- [[NeRF]] — 연속 5D MLP + Volume Rendering. 위치 인코딩·계층 샘플링 (ECCV'20)
- [[3D-Gaussian-Splatting]] — 비등방 3D 가우시안 + 타일 래스터화, 실시간 (SIGGRAPH'23)
- [[Scaffold-GS]] — anchor 구조화 정적 GS, 시점 의존 MLP 디코딩(view-adaptive)+anchor growing, 저장 4~10×↓ (CVPR'24)
- [[lighthouseGS]] — 실내 파노라마 모바일 캡처용 3DGS, plane scaffold·SfM-free (2026)
- [[CoherentRaster]] — 라이트필드 디스플레이용 서브픽셀 3DGS, cross-view reuse·view-coherent remapping (SIGGRAPH'26)
- [[Ex4DGS]] — 완전 명시적 동적(4D) GS, 키프레임 보간(CHip·Slerp·GMM)+정적/동적 분리, 62fps (NeurIPS'24)
- [[3D-4DGS]] — 하이브리드: 정적=3D·동적=4D 가우시안 적응 분리(시간축 scale 임계), 4DGS 대비 3~5× 빠른 12분 학습 (2025)
- [[Relaxed-Rigidity-동적GS]] — 동적(4D) GS, ray-based grouping 모션 정규화, plug-in(Ex4DGS 등에 부착) (2026)

### 동적 GS 모션 표현 뿌리 (최적화 기반 4D)
**계보**: [[3D-Gaussian-Splatting|3DGS]]를 4D로 올리는 패러다임들 — **변형장**([[4DGS]]·[[Deformable3DGS]]) / **native 4D**([[native4DGS]]) / **다항식 모션**([[SpacetimeGS]]) / **모션 기저 분해**([[ShapeOfMotion]]·[[SC-GS]]·[[MoSca]]) / **anchor 압축**([[4D-Scaffold-GS]]). 위 [[Ex4DGS]]·[[3D-4DGS]]·[[Relaxed-Rigidity-동적GS]]가 이들을 baseline·계보로 인용.
- [[4DGS]] — (Wu et al.) canonical 가우시안 + HexPlane deformation field, 82fps·O(N+F) (CVPR'24)
- [[Deformable3DGS]] — (Yang et al.) 단안 동적, 순수 MLP 변형장(고rank)+Annealing Smooth Training (CVPR'24)
- [[native4DGS]] — (Yang et al., **동명이론**) native 4D primitive(4D 회전)+4D Spherindrical Harmonics, 압축 4DGSC (ICLR'24 확장)
- [[SpacetimeGS]] — (Li et al.) STG: 시간 opacity+다항식 모션 + feature splatting(SH 대체), 8K@60fps lite (CVPR'24)
- [[OR2-온라인동적GS|OR²]] — **online 재구성 plug-in**. 관측 오차를 학습 residual map으로 분리 → 정적 영역 시간 일관성↑, 3DGStream/HiCoM/Dynamic3DG 위 부착 (SIGGRAPH'25)
- [[ShapeOfMotion]] — **단안 영상 4D 복원**. SE(3) 모션 기저(B=10) 선형결합으로 저차원 강체 분해 + off-the-shelf prior(MegaSaM·Depth Anything·TAPIR) 융합 → 영속 **장거리 3D 트래킹**+NVS SOTA, per-scene 최적화 (CVPR'25)
- [[SC-GS]] — **편집 가능 동적 GS**. 모션=희소 제어점(~512)·외형=조밀 가우시안 분해, 제어점 6-DoF를 LBS 보간 + ARAP 국소강체 정규화 → control graph 조작으로 **학습 밖 모션 편집**, D-NeRF PSNR 43.31 (CVPR'24)
- [[MoSca]] — **casual 단안 pose-free 시스템**. 2D foundation prior(깊이·장거리 트랙)를 curve-distance 그래프로 3D lift + DQB·ARAP 정련 → **전 시점 가우시안 전역 융합**, tracklet BA로 포즈 자체 해결, DyCheck 19.32 (2024)
- [[4D-Scaffold-GS]] — **저장 효율 4D anchor**. 가우시안 수는 유지하고 격자 4D anchor 특징으로 압축 + **dynamic-aware anchor growing**(시간 커버리지 보정 그래디언트), 동적영역 28.86@149MB vs 4DGS 27.65@6GB (2025)

### 3D 손/인체 복원 (Mesh Recovery)
**계보**: [[HMR]] (2018, 인체 SMPL 회귀) → [[HaMeR]] (2024, ViT 손) → 대안 백본 [[Hamba]] (Mamba+graph) · full-stack [[WiLoR]] (검출+정렬)
- [[HMR]] — 이미지→[[SMPL]] end-to-end 회귀, IEF + adversarial prior (CVPR'18)
- [[HaMeR]] — ViT-H로 [[MANO]] 회귀, 데이터·모델 스케일업 + HInt (CVPR'24)
- [[Hamba]] — graph-guided Mamba(GSS/GBS), 토큰 88.5%↓, HO3D Rank1 (NeurIPS'24)
- [[WiLoR]] — 검출+복원 full-stack, 다중스케일 refinement, WHIM 2M (2024)

### Feed-forward 3D 복원 (DUSt3R 계보 — pointmap 직접회귀)
**계보**: [[CroCo]] (2022, cross-view 사전학습) → [[DUSt3R]] (2024, 뿌리·쌍 pointmap·정적) → 매칭 [[MASt3R]] · 정적 다중뷰 [[VGGT]]→스케일업 [[VGGT-Ω]] · 동적 분기 [[MONST3R]]→[[POMATO]] / [[MoRe]] → **4D 궤적장** [[OmniX]]
- [[CroCo]] — DUSt3R 계보 **사전학습 토대**. cross-view completion(두 뷰로 마스킹 복원), Siamese ViT+cross-attention (NeurIPS'22)
- [[DUSt3R]] — **뿌리**. 보정·포즈 없는 쌍에서 pointmap 회귀, CroCo+ViT 2-디코더, 3D 전역정렬 (CVPR'24)
- [[MASt3R]] — DUSt3R+dense feature 매칭 헤드(InfoNCE) + fast reciprocal matching, Map-free localization +30%p (ECCV'24)
- [[VGGT]] — 1.2B 트랜스포머, 카메라·깊이·포인트맵·트랙 단일 forward(<1s), Alternating-Attention, 후처리 제거 (2025)
- [[MONST3R]] — "Motion DUSt3R", timestep별 pointmap 동적 장면, 소규모 fine-tune + 경량 전역최적화 (ICLR'25)
- [[POMATO]] — DUSt3R+pointmap matching 헤드(동적 대응) + temporal motion module, 3D point tracking SOTA, MonST3R 초기화 (2025)
- [[MoRe]] — VGGT 기반, attention-forcing 모션분리 + grouped causal attention 스트리밍 + BA-like refinement (2026)
- [[VGGT-Ω]] — VGGT 직계 스케일업(0.2B→10B·2K→2M seq, 거듭제곱법칙), register attention·단일 head로 학습 메모리 70%↓, 정적·동적 6벤치 SOTA, register→VLA·언어정렬 (2026)
- [[OmniX]] — **4D 궤적장**. 동적/정적 분리 + 희소 dynamic token(상위 20%)으로 전 픽셀 dense 3D 궤적 단일 forward 예측(SSA+DTSH), 큰 카메라 모션·시간단절 입력 강건, UE5 80K장면 데이터 엔진, 궤적·TAPVid-3D 트래킹 SOTA (2026)

### Feed-forward GS 복원 (LRM 계보: 정적 → 4D/동적)
**계보**: 시초 [[pixelSplat]] · 매칭 기반 [[MVSplat]] · LRM 기반 [[GS-LRM]] (2024, 정적 뿌리·per-pixel GS LRM) · pose-free [[NoPoSplat]] → 스케일업 축: 뷰·범위 [[Long-LRM]] / 시간(동적) [[BTimer]] / 객체 생성 [[LGM]] → 동적/4D 후계 [[4DGT]]·[[DGS-LRM]]·[[MoVieS]]·[[StreamSplat]]·[[C4G]] → 복원+생성 4D 세계모델 [[NeoVerse]]. posed/uncalibrated 영상 → GS를 feed-forward 예측, 최적화 기반 대비 수백~수천배 빠름. Radiance Field([[3D-Gaussian-Splatting]]) × DUSt3R 계보([[VGGT]]) 교차.
- [[pixelSplat]] — **시초**. 이미지 2뷰 → feed-forward 3DGS, epipolar transformer(스케일 모호성)+확률적 깊이 샘플링(reparameterization), light field 대비 ~650× 빠름 (CVPR'24)
- [[MVSplat]] — sparse(2뷰) → feed-forward 3DGS, plane-sweep **cost volume** 매칭으로 깊이 추정, pixelSplat 대비 10×↓·2× 빠름·일반화 우위 (ECCV'24)
- [[GS-LRM]] — **정적 뿌리**. 2~4 posed 이미지 → per-pixel 3DGS, 단순 트랜스포머, 객체·장면 통합, 0.23s (ECCV'24)
- [[LGM]] — **객체 생성**. 텍스트/이미지 → 멀티뷰 확산(MVDream·ImageDream) 4뷰 → 비대칭 U-Net per-pixel 가우시안(65,536개)·512 해상도·~5초, mesh 추출 (ECCV'24)
- [[Long-LRM]] — **many-view·광범위**. 32뷰 960×540 → 360° 장면 3DGS 1초, Mamba2+트랜스포머 하이브리드(250K 토큰)·token merging·Gaussian pruning, 최적화 대비 800× (2025)
- [[BTimer]] — **동적(bullet-time)**. context에 목표 timestamp 임베딩 → 그 순간 완전한 3DGS aggregate, 정적·동적 통일·RGB 손실만, NTE로 빠른 모션 보강, 12뷰 150ms (NeurIPS'25)
- [[NoPoSplat]] — **pose-free**. unposed sparse(2뷰) → **정준공간** 직접 3DGS(transform-then-fuse 탈피), 광도손실만 학습·intrinsic token·순수 ViT, 저overlap서 pose-required 능가, 66fps (ICLR'25)
- [[C3G]] — **컴팩트 정적**. per-pixel 탈피, N=2048 query token으로 필수 위치 가우시안(~2K, 65×↓)만, 창발적 attention 재활용 view-invariant feature lifting(C3G-F), 3D 이해·대응 SOTA. [[C4G]]의 정적 선행작 (2026)
- [[ATSplat]] — **적응적 용량 배분**. 성긴 3D anchor token + 상대 offset(픽셀격자 탈피) + **불확실도 기반 토큰 확장(ATE)** — 실제 오차맵을 래스터화해 지도. 가우시안 5.7×↓로 SOTA, 저overlap·외삽서 특히 강함 (2026)
- [[4DGT]] — 4DGS(2DGS+life-span/velocity)로 정적·동적 통일, density control, 실세계 단안 학습 (NeurIPS'25)
- [[DGS-LRM]] — per-pixel deformable 3DGS + 3D scene flow, Kubric 멀티뷰 학습, flow chaining 3D tracking (2025)
- [[MoVieS]] — VGGT 기반 dynamic splatter pixel, NVS·깊이·tracking 통합 1초, zero-shot scene flow (2026)
- [[StreamSplat]] — uncalibrated 스트림 온라인 동적 3DGS, 양방향 deformation + adaptive fusion, 1200× (ICLR'26)
- [[C4G]] — **per-pixel 탈피**. timestamp 조건 learnable query token(N=2048)으로 global motion aggregate, 2K 가우시안(0.007×↓)·포즈 불필요 SOTA, 최초 feed-forward 4D feature lifting + VDM refine (2026)
- [[NeoVerse]] — **복원+생성 4D 세계모델**. VGGT Gaussianize + 양방향 모션 pose-free 4DGS 복원 → degradation 시뮬로 novel-view 조건 생성(Wan+Rectified Flow), in-the-wild 단안 1M clip 스케일러블, 복원·생성 SOTA (2026)

- _sources_: Radiance Field [[2026-06-13-3DGS-논문]]·[[2026-06-13-NeRF-논문]]·[[2026-06-13-LighthouseGS-논문]]·[[2026-06-13-RelaxedRigidity-논문]]·[[2026-06-16-CoherentRaster-논문]]·[[2026-06-18-Ex4DGS-논문]]·[[2026-06-18-3D-4DGS-논문]]·[[2026-06-20-Scaffold-GS-논문]] / 동적GS뿌리 [[2026-06-20-4DGS-논문]]·[[2026-06-20-Deformable3DGS-논문]]·[[2026-06-20-native4DGS-논문]]·[[2026-06-20-SpacetimeGS-논문]] / feed-forward GS [[2026-06-20-MVSplat-논문]]·[[2026-06-25-pixelSplat-논문]] / 손복원 [[2026-06-13-HMR-논문]]·[[2026-06-13-HaMeR-논문]]·[[2026-06-13-Hamba-논문]]·[[2026-06-13-WiLoR-논문]] / DUSt3R계보 [[2026-06-17-CroCo-논문]]·[[2026-06-16-DUSt3R-논문]]·[[2026-06-17-MASt3R-논문]]·[[2026-06-16-VGGT-논문]]·[[2026-06-16-MONST3R-논문]]·[[2026-06-16-POMATO-논문]]·[[2026-06-16-MoRe-논문]] / GS-LRM계보 [[2026-06-17-GS-LRM-논문]]·[[2026-06-16-4DGT-논문]]·[[2026-06-16-DGS-LRM-논문]]·[[2026-06-16-MoVieS-논문]]·[[2026-06-16-StreamSplat-논문]]·[[2026-07-14-C4G-논문]] / VGGT스케일업 [[2026-07-25-VGGT-Omega-논문]] / online동적 [[2026-07-01-OR2-논문]] / pose-free GS [[2026-07-25-NoPoSplat-논문]] / 4D세계모델 [[2026-07-25-NeoVerse-논문]] / 컴팩트GS [[2026-07-25-C3G-논문]] / 단안4D트래킹 [[2026-07-26-ShapeOfMotion-논문]] / LRM확장 [[2026-07-26-LGM-논문]]·[[2026-07-26-Long-LRM-논문]]·[[2026-07-26-BTimer-논문]] / 4D궤적장 [[2026-07-27-OmniX-논문]] / 동적GS 모션·저장 [[2026-08-01-SC-GS-논문]]·[[2026-08-01-MoSca-논문]]·[[2026-08-01-4DScaffold-GS-논문]] / 컴팩트 feed-forward [[2026-08-01-ATSplat-논문]]
- `Zotero/`는 **ingest 대상 아님** (raw/ 전용 — [[raw-wiki-규칙]] §A 참조)

### LLM / 강화학습 (도메인 확장, 2026-07-31~)
**주의**: 위 3D Vision 클러스터들과 계보가 이어지지 않는 **별도 갈래**. 공유점은 [[Transformer]] 등 아키텍처 개념과 분포 divergence 같은 수학 도구.
- [[BeyondEntropy-ICT]] — RLVR 엔트로피 붕괴/폭발을 **토큰 로짓 분포편차**로 해소. 그룹평균과 JS divergence 상위 10% unique token만 갱신(Sparse-GRPO), 2차 Rényi 엔트로피·strategy purity 분기 이론, Qwen2.5 7벤치 pass@4 +4.58% (2026)
- _sources_: [[2026-07-31-BeyondEntropy-논문]]

## concepts — 공통 개념 (courses ↔ research)
**수학·암호 기초** (블록체인)
- [[유한체와-군]] · [[페르마의-소정리]] · [[해시함수-SHA256]] · [[영지식증명]]

**Radiance Field NVS 기초**
- [[Radiance Field-Volume Rendering]] — radiance field·$\alpha$-blending. NeRF·3DGS·동적GS 공통 image formation
- [[구면조화함수-SH]] — 시점의존 색 표현. Radiance Field 연구 공통 도구
- [[SfM-COLMAP]] — Structure-from-Motion. NeRF·3DGS 초기화 입력

**정보이론 (3D ↔ LLM 가로지름)**
- [[정보이론-분포거리]] — 엔트로피($H_1$/$H_2$)·KL·JS·InfoNCE. 매칭([[MASt3R]])·자기지도([[VGGT-Ω]])·탐색([[BeyondEntropy-ICT]])·생성([[Drifting-Model-원스텝생성]])이 **같은 도구를 다른 목적**에 쓰는 구조 정리

**생성 prior (확산·flow matching)**
- [[flow-matching-생성prior]] — flow matching·rectified flow·video diffusion·LoRA. 3D→생성 확장 연구(NeoVerse·C4G) 공통 도구
- [[Drifting-Model-원스텝생성]] — **위 패러다임의 대안**. 추론 반복 대신 **학습 시간에 분포 진화**(drifting field·반대칭 평형) → 1-NFE 생성, ImageNet FID 1.54 (2026)

**모션·대응 (동적 복원 공통)**
- [[장거리-point-tracking]] — TAP·TAPIR·CoTracker·SpatialTracker·TAP-Vid. 동적 복원의 입력 prior·평가 축·부가 출력 3역할(ShapeOfMotion·MoVieS·DGS-LRM·VGGT 등 7노트 공유)

**ML 아키텍처 (시퀀스·비전 백본)**
- [[Transformer]] — attention. 모든 후속 백본의 토대
- [[ViT]] — Vision Transformer. 3D 복원 백본(HaMeR·Hamba·WiLoR)
- [[DINO]] — 자기지도 ViT(DINO/DINOv2). 동결 피처 백본(VGGT·4DGT·StreamSplat·MoVieS)
- [[SSM]] — 상태공간모델(S4). 장거리 의존성, 선형
- [[Mamba-선형시간시퀀스]] — 선택적 SSM(S6). attention 대안, Hamba(손 복원)·Long-LRM(3D 장면, 250K 토큰) 차용
- [[위치인코딩-positional-encoding]] — Fourier features. NeRF·Transformer 공통

**파라메트릭 인체 모델**
- [[SMPL]] — 인체 형상+자세 모델. HMR 출력
- [[MANO]] — 손 모델(SMPL 손 버전). HaMeR·Hamba·WiLoR 출력

- _sources_: 생성 prior [[2026-07-31-GMD-논문]] (개념 노트 중 유일하게 전용 source-meta 보유 — 나머지는 research/sources 참조)

## system — 운영
- [[raw-wiki-규칙]] — vault 헌법: 진입 결정트리 / 영역 분류 / 압축룰 / 모호 처리
- [[Hermes-Agent-활용-가이드북]] — Hermes로 할 수 있는 작업 메뉴판: wiki 운영·코딩·조사·문서화·자동화
