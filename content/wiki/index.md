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

### 방사장 NVS (Radiance Field)
**계보**: [[NeRF]] (2020, 연속 MLP) → [[3D-Gaussian-Splatting|3DGS]] (2023, 명시적·실시간) → 응용 [[lighthouseGS]] · [[CoherentRaster]] · 동적 [[Relaxed-Rigidity-동적GS]]
- [[NeRF]] — 연속 5D MLP + 볼륨 렌더링. 위치 인코딩·계층 샘플링 (ECCV'20)
- [[3D-Gaussian-Splatting]] — 비등방 3D 가우시안 + 타일 래스터화, 실시간 (SIGGRAPH'23)
- [[lighthouseGS]] — 실내 파노라마 모바일 캡처용 3DGS, plane scaffold·SfM-free (2026)
- [[CoherentRaster]] — 라이트필드 디스플레이용 서브픽셀 3DGS, cross-view reuse·view-coherent remapping (SIGGRAPH'26)
- [[Relaxed-Rigidity-동적GS]] — 동적(4D) GS, ray-based grouping 모션 정규화, plug-in (2026)

### 3D 손/인체 복원 (Mesh Recovery)
**계보**: [[HMR]] (2018, 인체 SMPL 회귀) → [[HaMeR]] (2024, ViT 손) → 대안 백본 [[Hamba]] (Mamba+graph) · full-stack [[WiLoR]] (검출+정렬)
- [[HMR]] — 이미지→[[SMPL]] end-to-end 회귀, IEF + adversarial prior (CVPR'18)
- [[HaMeR]] — ViT-H로 [[MANO]] 회귀, 데이터·모델 스케일업 + HInt (CVPR'24)
- [[Hamba]] — graph-guided Mamba(GSS/GBS), 토큰 88.5%↓, HO3D Rank1 (NeurIPS'24)
- [[WiLoR]] — 검출+복원 full-stack, 다중스케일 refinement, WHIM 2M (2024)

- _sources_: 방사장 [[2026-06-13-3DGS-논문]]·[[2026-06-13-NeRF-논문]]·[[2026-06-13-LighthouseGS-논문]]·[[2026-06-13-RelaxedRigidity-논문]]·[[2026-06-16-CoherentRaster-논문]] / 손복원 [[2026-06-13-HMR-논문]]·[[2026-06-13-HaMeR-논문]]·[[2026-06-13-Hamba-논문]]·[[2026-06-13-WiLoR-논문]]
- `Zotero/`는 **ingest 대상 아님** (raw/ 전용 — [[raw-wiki-규칙]] §A 참조)

## concepts — 공통 개념 (courses ↔ research)
**수학·암호 기초** (블록체인)
- [[유한체와-군]] · [[페르마의-소정리]] · [[해시함수-SHA256]] · [[영지식증명]]

**방사장 NVS 기초**
- [[방사장-볼륨렌더링]] — radiance field·$\alpha$-blending. NeRF·3DGS·동적GS 공통 image formation
- [[구면조화함수-SH]] — 시점의존 색 표현. 방사장 연구 공통 도구
- [[SfM-COLMAP]] — Structure-from-Motion. NeRF·3DGS 초기화 입력

**ML 아키텍처 (시퀀스·비전 백본)**
- [[Transformer]] — attention. 모든 후속 백본의 토대
- [[ViT]] — Vision Transformer. 3D 복원 백본(HaMeR·Hamba·WiLoR)
- [[SSM]] — 상태공간모델(S4). 장거리 의존성, 선형
- [[Mamba-선형시간시퀀스]] — 선택적 SSM(S6). attention 대안, Hamba 차용
- [[위치인코딩-positional-encoding]] — Fourier features. NeRF·Transformer 공통

**파라메트릭 인체 모델**
- [[SMPL]] — 인체 형상+자세 모델. HMR 출력
- [[MANO]] — 손 모델(SMPL 손 버전). HaMeR·Hamba·WiLoR 출력

## system — 운영
- [[raw-wiki-규칙]] — vault 헌법: 진입 결정트리 / 영역 분류 / 압축룰 / 모호 처리
