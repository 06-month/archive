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
**계보**: [[3D-Gaussian-Splatting|3DGS]]를 4D로 올리는 세 패러다임 — **변형장**([[4DGS]]·[[Deformable3DGS]]) / **native 4D**([[native4DGS]]) / **다항식 모션**([[SpacetimeGS]]). 위 [[Ex4DGS]]·[[3D-4DGS]]·[[Relaxed-Rigidity-동적GS]]가 이들을 baseline·계보로 인용.
- [[4DGS]] — (Wu et al.) canonical 가우시안 + HexPlane deformation field, 82fps·O(N+F) (CVPR'24)
- [[Deformable3DGS]] — (Yang et al.) 단안 동적, 순수 MLP 변형장(고rank)+Annealing Smooth Training (CVPR'24)
- [[native4DGS]] — (Yang et al., **동명이론**) native 4D primitive(4D 회전)+4D Spherindrical Harmonics, 압축 4DGSC (ICLR'24 확장)
- [[SpacetimeGS]] — (Li et al.) STG: 시간 opacity+다항식 모션 + feature splatting(SH 대체), 8K@60fps lite (CVPR'24)

### 3D 손/인체 복원 (Mesh Recovery)
**계보**: [[HMR]] (2018, 인체 SMPL 회귀) → [[HaMeR]] (2024, ViT 손) → 대안 백본 [[Hamba]] (Mamba+graph) · full-stack [[WiLoR]] (검출+정렬)
- [[HMR]] — 이미지→[[SMPL]] end-to-end 회귀, IEF + adversarial prior (CVPR'18)
- [[HaMeR]] — ViT-H로 [[MANO]] 회귀, 데이터·모델 스케일업 + HInt (CVPR'24)
- [[Hamba]] — graph-guided Mamba(GSS/GBS), 토큰 88.5%↓, HO3D Rank1 (NeurIPS'24)
- [[WiLoR]] — 검출+복원 full-stack, 다중스케일 refinement, WHIM 2M (2024)

### Feed-forward 3D 복원 (DUSt3R 계보 — pointmap 직접회귀)
**계보**: [[CroCo]] (2022, cross-view 사전학습) → [[DUSt3R]] (2024, 뿌리·쌍 pointmap·정적) → 매칭 [[MASt3R]] · 정적 다중뷰 [[VGGT]] · 동적 분기 [[MONST3R]]→[[POMATO]] / [[MoRe]]
- [[CroCo]] — DUSt3R 계보 **사전학습 토대**. cross-view completion(두 뷰로 마스킹 복원), Siamese ViT+cross-attention (NeurIPS'22)
- [[DUSt3R]] — **뿌리**. 보정·포즈 없는 쌍에서 pointmap 회귀, CroCo+ViT 2-디코더, 3D 전역정렬 (CVPR'24)
- [[MASt3R]] — DUSt3R+dense feature 매칭 헤드(InfoNCE) + fast reciprocal matching, Map-free localization +30%p (ECCV'24)
- [[VGGT]] — 1.2B 트랜스포머, 카메라·깊이·포인트맵·트랙 단일 forward(<1s), Alternating-Attention, 후처리 제거 (2025)
- [[MONST3R]] — "Motion DUSt3R", timestep별 pointmap 동적 장면, 소규모 fine-tune + 경량 전역최적화 (ICLR'25)
- [[POMATO]] — DUSt3R+pointmap matching 헤드(동적 대응) + temporal motion module, 3D point tracking SOTA, MonST3R 초기화 (2025)
- [[MoRe]] — VGGT 기반, attention-forcing 모션분리 + grouped causal attention 스트리밍 + BA-like refinement (2026)

### Feed-forward GS 복원 (LRM 계보: 정적 → 4D/동적)
**계보**: 매칭 기반 [[MVSplat]] · LRM 기반 [[GS-LRM]] (2024, 정적 뿌리·per-pixel GS LRM) → 동적/4D 후계 [[4DGT]]·[[DGS-LRM]]·[[MoVieS]]·[[StreamSplat]]. posed/uncalibrated 영상 → GS를 feed-forward 예측, 최적화 기반 대비 수백~수천배 빠름. Radiance Field([[3D-Gaussian-Splatting]]) × DUSt3R 계보([[VGGT]]) 교차.
- [[MVSplat]] — sparse(2뷰) → feed-forward 3DGS, plane-sweep **cost volume** 매칭으로 깊이 추정, pixelSplat 대비 10×↓·2× 빠름·일반화 우위 (ECCV'24)
- [[GS-LRM]] — **정적 뿌리**. 2~4 posed 이미지 → per-pixel 3DGS, 단순 트랜스포머, 객체·장면 통합, 0.23s (ECCV'24)
- [[4DGT]] — 4DGS(2DGS+life-span/velocity)로 정적·동적 통일, density control, 실세계 단안 학습 (NeurIPS'25)
- [[DGS-LRM]] — per-pixel deformable 3DGS + 3D scene flow, Kubric 멀티뷰 학습, flow chaining 3D tracking (2025)
- [[MoVieS]] — VGGT 기반 dynamic splatter pixel, NVS·깊이·tracking 통합 1초, zero-shot scene flow (2026)
- [[StreamSplat]] — uncalibrated 스트림 온라인 동적 3DGS, 양방향 deformation + adaptive fusion, 1200× (ICLR'26)

- _sources_: Radiance Field [[2026-06-13-3DGS-논문]]·[[2026-06-13-NeRF-논문]]·[[2026-06-13-LighthouseGS-논문]]·[[2026-06-13-RelaxedRigidity-논문]]·[[2026-06-16-CoherentRaster-논문]]·[[2026-06-18-Ex4DGS-논문]]·[[2026-06-18-3D-4DGS-논문]]·[[2026-06-20-Scaffold-GS-논문]] / 동적GS뿌리 [[2026-06-20-4DGS-논문]]·[[2026-06-20-Deformable3DGS-논문]]·[[2026-06-20-native4DGS-논문]]·[[2026-06-20-SpacetimeGS-논문]] / feed-forward GS [[2026-06-20-MVSplat-논문]] / 손복원 [[2026-06-13-HMR-논문]]·[[2026-06-13-HaMeR-논문]]·[[2026-06-13-Hamba-논문]]·[[2026-06-13-WiLoR-논문]] / DUSt3R계보 [[2026-06-17-CroCo-논문]]·[[2026-06-16-DUSt3R-논문]]·[[2026-06-17-MASt3R-논문]]·[[2026-06-16-VGGT-논문]]·[[2026-06-16-MONST3R-논문]]·[[2026-06-16-POMATO-논문]]·[[2026-06-16-MoRe-논문]] / GS-LRM계보 [[2026-06-17-GS-LRM-논문]]·[[2026-06-16-4DGT-논문]]·[[2026-06-16-DGS-LRM-논문]]·[[2026-06-16-MoVieS-논문]]·[[2026-06-16-StreamSplat-논문]]
- `Zotero/`는 **ingest 대상 아님** (raw/ 전용 — [[raw-wiki-규칙]] §A 참조)

## concepts — 공통 개념 (courses ↔ research)
**수학·암호 기초** (블록체인)
- [[유한체와-군]] · [[페르마의-소정리]] · [[해시함수-SHA256]] · [[영지식증명]]

**Radiance Field NVS 기초**
- [[Radiance Field-Volume Rendering]] — radiance field·$\alpha$-blending. NeRF·3DGS·동적GS 공통 image formation
- [[구면조화함수-SH]] — 시점의존 색 표현. Radiance Field 연구 공통 도구
- [[SfM-COLMAP]] — Structure-from-Motion. NeRF·3DGS 초기화 입력

**ML 아키텍처 (시퀀스·비전 백본)**
- [[Transformer]] — attention. 모든 후속 백본의 토대
- [[ViT]] — Vision Transformer. 3D 복원 백본(HaMeR·Hamba·WiLoR)
- [[DINO]] — 자기지도 ViT(DINO/DINOv2). 동결 피처 백본(VGGT·4DGT·StreamSplat·MoVieS)
- [[SSM]] — 상태공간모델(S4). 장거리 의존성, 선형
- [[Mamba-선형시간시퀀스]] — 선택적 SSM(S6). attention 대안, Hamba 차용
- [[위치인코딩-positional-encoding]] — Fourier features. NeRF·Transformer 공통

**파라메트릭 인체 모델**
- [[SMPL]] — 인체 형상+자세 모델. HMR 출력
- [[MANO]] — 손 모델(SMPL 손 버전). HaMeR·Hamba·WiLoR 출력

## system — 운영
- [[raw-wiki-규칙]] — vault 헌법: 진입 결정트리 / 영역 분류 / 압축룰 / 모호 처리
