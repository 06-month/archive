# 로그 (Log)

wiki의 시간순 append-only 기록. 최근 항목: `grep "^## \[" log.md | tail -5`
형식: `## [YYYY-MM-DD] ingest|query|lint|bootstrap | 요약`

## [2026-06-11] bootstrap | vault 초기화
- LLM Wiki 패턴 부트스트랩. 도메인: 학업·연구 통합 지식베이스.
- 4영역: courses / research / concepts / system(운영).
- 생성: CLAUDE.md(7섹션), wiki/system/raw-wiki-규칙.md(헌법), index.md, log.md, README.md, 슬래시 커맨드 3종(/ingest /query /lint).
- raw/BlockChain.md(+이미지 134장) 보존 — /ingest 대기.

## [2026-06-11] ingest | 블록체인 강의 (175p PDF)
- raw/BlockChain.md → [통과] → courses/블록체인 (+ concepts 1건 승격)
- 생성: 허브 [[블록체인]], source [[2026-06-11-블록체인-강의]], 개념 7p(ECC·ECDSA·직렬화·트랜잭션·2.0/알트코인·스마트계약·지갑채굴), 공통 [[유한체와-군]]
- index 갱신(courses/concepts). 압축 ~4205줄→9노트(각 ≤200줄), cross-link 타영역 ≥1 충족.

## [2026-06-11] lint | all
- 모순 0, 고립 0, 미해결 링크 0. 노트 전부 ≤200줄.
- 발견: 오링크 1([[ECDSA-디지털서명|영지식증명]]), 데이터 갭 4(페르마 소정리·해시함수·영지식증명·Script), 미처리 raw 2(Zotero 논문), §C 타영역링크 누락 2(스마트계약·지갑채굴).
- 자동 수정 X. 권고: 오링크 수정 / Zotero research ingest / concepts 갭 페이지.

## [2026-06-13] ingest | 3D Gaussian Splatting (14p 논문)
- raw/3dgs.md → [통과] → research (research 영역 첫 자료)
- 생성: research [[3D-Gaussian-Splatting]] + source [[2026-06-13-3DGS-논문]], concepts [[Radiance Field-Volume Rendering]]·[[구면조화함수-SH]]
- index 갱신(research·concepts). 압축 2357줄→4노트(각 ≤200줄), cross-link 타영역(concepts↔research) ≥1 충족.
- 미해결 forward link: [[NeRF]]·[[lighthouseGS]]·[[Relaxed-Rigidity-동적GS]] (raw 대기 중 — 다음 ingest에서 해소).

## [2026-06-13] ingest | NeRF (ECCV'20, 25p)
- raw/NeRF.md → [통과] → research
- 생성: research [[NeRF]] + source [[2026-06-13-NeRF-논문]], concept [[위치인코딩-positional-encoding]] (신규 공통개념)
- [[NeRF]] forward link 해소. 압축 2328줄→3노트.

## [2026-06-13] ingest | LighthouseGS (실내 파노라마 3DGS, 2026)
- raw/lighthouseGS.md → [통과] → research
- 생성: research [[lighthouseGS]] + source [[2026-06-13-LighthouseGS-논문]]
- [[lighthouseGS]] forward link 해소. 압축 1356줄→2노트.

## [2026-06-13] ingest | Relaxed Rigidity (동적/4D GS, 2026)
- raw/Relaxed Rigidity…GS.md → [통과] → research
- 생성: research [[Relaxed-Rigidity-동적GS]] + source [[2026-06-13-RelaxedRigidity-논문]]
- [[Relaxed-Rigidity-동적GS]] forward link 해소. 압축 2977줄→2노트.
- research 일괄 ingest 완료: 4논문(NeRF·3DGS·lighthouseGS·동적GS) + concepts 3(Radiance Field·SH·위치인코딩). 미처리 raw 0(Zotero 2건 제외).

## [2026-06-13] lint | all
- 노트 24개. 모순 0, 압축위반 0(전부 ≤200줄·cross-link≥3), 고립 0(raw-wiki-규칙=1은 헌법, CLAUDE.md서 참조).
- 발견: 오링크 1(잔존 [[ECDSA-디지털서명|영지식증명]]), 데이터 갭 5(SfM/COLMAP·페르마소정리·해시함수·영지식증명·Script), 미처리 raw 2(Zotero Mamba·Hands3D), 의도적 미해결링크 1(`Mamba-선형시간시퀀스`(삭제됨)), 잔여 템플릿 1(New Zotero Literature Note.md).
- 자동 수정 X. 권고: 오링크 수정 / concepts SfM 페이지 / Zotero 2건 ingest.

## [2026-06-13] lint-조치 | 갭 메우기 + 오링크 수정
- 오링크 수정: [[ECDSA-디지털서명|영지식증명]] → [[영지식증명]] 신규 페이지로 교정.
- concepts 신규 4: [[SfM-COLMAP]]·[[해시함수-SHA256]]·[[페르마의-소정리]]·[[영지식증명]]. courses 신규 1: [[Script]].
- 상호링크 보강(research 4노트에 [[SfM-COLMAP]], 블록체인 노트들에 새 개념 역링크) → 신규 페이지 전부 백링크 ≥3.

## [2026-06-13] 반려/규칙변경 | Zotero ingest 영구 금지
- 사용자 절대 지시: `Zotero/`는 ingest 대상 아님 — `raw/` 전용. 진행 중이던 Zotero Mamba ingest **취소**(노트 삭제), Hands3D ingest **미실행**.
- 규칙 반영: CLAUDE.md §2 + [[raw-wiki-규칙]] §A 상단에 **Q0 출처위치 게이트**(raw/ 외 즉시 거부) 추가.
- `Mamba-선형시간시퀀스`(삭제됨) forward link 제거(위치인코딩 노트서 평문화). 이전 lint의 "미처리 raw 2(Zotero)"는 **반려 처리**로 종결.

## [2026-06-13] 규칙변경 | ingest 멱등성 가드 추가
- [[raw-wiki-규칙]] §A에 **Q0.5 멱등성 가드** 추가: raw 본문 읽기 전 log.md·`sources:` grep으로 기존 ingest 여부 확인 → 이미 박제된 raw는 기본 skip(재처리는 명시 요청 시만).
- ingest.md 절차 0번(사전 점검)·제약에 반영. 목적: 동일 raw 재처리로 인한 토큰 중복 지불 방지.

## [2026-06-13] 규칙변경 | ingest 전체 통독 원칙
- 사용자 지시: ingest 대상 raw는 **전체 통독**(선택/표적 읽기 금지 — 부록·표·각주 누락 방지). 토큰 절약은 Q0.5(이미 처리한 raw skip)로만.
- [[raw-wiki-규칙]] §C 표 + ingest.md 절차1에 반영.

## [2026-06-13] ingest | 신규 raw 10건 (3D 손/인체 복원 클러스터)
- 멱등성 가드 작동: 기존 4건(3dgs·NeRF·Relaxed·lighthouseGS) skip. 신규 10건 전체 통독 후 ingest.
- **concepts 6**: [[Transformer]]·[[ViT]]·[[SSM]]·[[Mamba-선형시간시퀀스]](아키텍처) + [[SMPL]]·[[MANO]](파라메트릭 모델). (mamba.md는 raw/ 내부라 ingest 허용 — Zotero 제한과 무관.)
- **research 4**: [[HMR]](인체 SMPL 회귀) · [[HaMeR]](ViT 손) · [[Hamba]](Mamba+graph 손) · [[WiLoR]](검출+복원) + source 노트 4.
- cross-link: 손복원 research ↔ MANO/ViT/Mamba concepts 가교 형성. [[위치인코딩-positional-encoding]]에 [[Transformer]]·[[Mamba-선형시간시퀀스]] 재연결.
- index 갱신(research 2계보·concepts 4그룹 재편). 전부 통독·압축.

## [2026-06-16] ingest | CoherentRaster (LFD용 3DGS, SIGGRAPH'26)
- 멱등성 가드: 신규 raw(`raw/CoherentRaster.md`, 14p) — 부록 포함 전체 통독 후 ingest. [통과]/research.
- **research 신규**: [[CoherentRaster]] — 라이트필드 디스플레이 서브픽셀 3DGS. ① Cross-view Coherent Attribute Reuse(클러스터별 공분산·깊이·SH 재사용) ② View-coherent Remapping(시점 정렬 룩업 Ψ로 warp coalescing 복원). full-frame 3DGS 대비 7.6×, 4K 71뷰 23 FPS. + source 노트 [[2026-06-16-CoherentRaster-논문]].
- cross-link: [[3D-Gaussian-Splatting]](기반)·[[구면조화함수-SH]]·[[Radiance Field-Volume Rendering]]·[[SfM-COLMAP]](concepts)·[[NeRF]]·[[Relaxed-Rigidity-동적GS]]. index Radiance Field 계보에 응용으로 편입.

## [2026-06-16] ingest | VGGT + MonST3R (DUSt3R 계보 2논문)
- 멱등성 가드: 신규 raw 2건(`raw/VGGT.md` 20p·`raw/MONST3R.md` 24p) — 부록 포함 전체 통독 후 ingest. 둘 다 [통과]/research.
- **research 신규 2**: [[VGGT]](Oxford·Meta, arXiv'25) — 1.2B feed-forward 트랜스포머, 카메라·깊이·포인트맵·트랙 단일 forward(<1s), Alternating-Attention, over-complete 예측, +BA SOTA / [[MONST3R]](Berkeley·DeepMind, ICLR'25) — "Motion DUSt3R", per-timestep pointmap로 동적 장면, 인코더 freeze 소규모 fine-tune + sliding-window 전역최적화(align+smooth+flow), 동영상 깊이·포즈. + source 2 [[2026-06-16-VGGT-논문]]·[[2026-06-16-MONST3R-논문]].
- cross-link: 두 논문 상호(정적 다중뷰 ↔ 동적 영상) + 공통 기반 [[DUSt3R]](forward link, raw 미수집) + [[ViT]]·[[Transformer]]·[[SfM-COLMAP]](concepts) + [[3D-Gaussian-Splatting]]·[[Relaxed-Rigidity-동적GS]](응용). 
- index: research에 신규 계보 "Feed-forward 3D 복원(DUSt3R 계보)" 추가. 전부 통독·압축(각 ≤200줄). 미해결 forward link [[DUSt3R]] — raw 수집 시 해소(lint 갭 예상).

## [2026-06-16] ingest | DUSt3R + POMATO + MoRe (DUSt3R 계보 뿌리 + 동적 분기)
- 멱등성 가드: 신규 raw 3건(`raw/DUSt3R.md` 23p·`raw/POMATO.md` 14p·`raw/MoRe.md` 15p) — 부록 포함 전체 통독 후 ingest. 모두 [통과]/research. (log의 기존 [[DUSt3R]]는 forward link였을 뿐 sources 미등재 → 처음 ingest)
- **research 신규 3**: [[DUSt3R]](Naver Labs, CVPR'24) — 계보 **뿌리**, 보정·포즈 없는 쌍에서 pointmap 회귀, CroCo+ViT 2-디코더 cross-attention, confidence 손실, 3D 투영오차 전역정렬 / [[POMATO]](NTU·Zhejiang, 2025) — DUSt3R에 pointmap matching 헤드(Head3)로 동적 대응 모호성 해소 + temporal motion module, dynamic mask=‖Xm−X‖, 3D point tracking SOTA(MonST3R 초기화) / [[MoRe]](Tsinghua·Li Auto, 2026) — VGGT 기반 attention-forcing 모션분리 + grouped causal attention 스트리밍 + BA-like refinement. + source 3 [[2026-06-16-DUSt3R-논문]]·[[2026-06-16-POMATO-논문]]·[[2026-06-16-MoRe-논문]].
- **forward link 해소**: 기존 [[VGGT]]·[[MONST3R]]의 미해결 [[DUSt3R]] 링크가 뿌리 노트 생성으로 전부 연결됨.
- cross-link: DUSt3R↔(VGGT·MONST3R·POMATO·MoRe) 계보 형제 + [[ViT]]·[[Transformer]]·[[SfM-COLMAP]](concepts) + [[NeRF]]·[[3D-Gaussian-Splatting]](응용). POMATO↔MONST3R(초기화 체크포인트), MoRe↔VGGT(백본·동기).
- index: DUSt3R 계보 그룹을 정적([[VGGT]])/동적([[MONST3R]]→[[POMATO]], [[MoRe]]) 분기로 재편, 5논문+5source 정리. 전부 통독·압축.

## [2026-06-16] ingest | 4DGT + DGS-LRM + MoVieS + StreamSplat (feed-forward 4D GS 클러스터)
- 멱등성 가드: 신규 raw 4건(`raw/4DGT.md` 20p·`raw/DGS-LRM.md` 15p·`raw/MoVieS.md` 18p·`raw/StreamSplat.md` 24p) — 부록 포함 전체 통독 후 ingest. 모두 [통과]/research. (4DGT·DGS-LRM·MoVieS는 직전 turn에 삭제됐다 재생성된 raw, sources 미등재 → 처음 ingest)
- **research 신규 4** (feed-forward 동적/4D Gaussian 복원): [[4DGT]](Meta, NeurIPS'25) — 4DGS(2DGS+life-span/velocity)로 정적·동적 통일, opacity-histogram density control + multi-level spatiotemporal attention, 실세계 posed 단안 학습 / [[DGS-LRM]](Meta, 2025) — per-pixel deformable 3DGS + 3D scene flow, temporal tokenization, Kubric 멀티뷰+GT flow 학습, flow chaining 3D tracking / [[MoVieS]](PKU·ByteDance·CMU, 2026) — VGGT 백본 + dynamic splatter pixel(정적GS+deformation), depth/splatter/motion 3헤드(AdaLN), NVS·깊이·tracking 통합 1초+zero-shot scene flow/seg / [[StreamSplat]](UBC·Vector·NTU, ICLR'26) — uncalibrated 스트림 온라인 동적 3DGS, orthographic canonical + probabilistic position sampling + bidirectional deformation + adaptive Gaussian fusion(opacity life-cycle), 1200×. + source 4.
- cross-link: 4편 상호(feed-forward 4D GS 클러스터) + [[3D-Gaussian-Splatting]]·[[NeRF]](표현/Radiance Field) + [[VGGT]]·[[DUSt3R]]·[[MONST3R]]·[[MoRe]]·[[POMATO]](DUSt3R 계보 동적) + [[Relaxed-Rigidity-동적GS]](동적GS) + [[ViT]]·[[Transformer]]·[[Radiance Field-Volume Rendering]]·[[위치인코딩-positional-encoding]](concepts). MoVieS는 [[VGGT]] 백본 직접 차용.
- index: research에 신규 그룹 "Feed-forward 4D/동적 GS 복원(Radiance Field×DUSt3R 교차)" 추가. 미해결 forward link [[GS-LRM]] — 4DGT·DGS-LRM 공통 정적 LRM 기반(raw 미수집, lint 갭 예상). 전부 통독·압축(각 ≤200줄).

## [2026-06-17] 누락보고 | GS-LRM raw 부재 (DGS-LRM과 혼동 방지)
- 사용자 `/ingest GS-LRM.md` 요청했으나 `raw/GS-LRM.md` 미존재. 유사명 `raw/DGS-LRM.md`(이미 박제, Deformable)와 **별개 논문**(정적 GS-LRM, Zhang et al. ECCV'24)임을 보고하고 임의 대체 박제 안 함. 변환 후 재요청 안내.

## [2026-06-17] ingest | GS-LRM (정적 GS LRM 뿌리, ECCV'24)
- 멱등성 가드: 신규 raw(`raw/GS-LRM.md` 22p, 13:48 생성) — sources에 `GS-LRM.md` 미등재(DGS-LRM.md와 구별) → 처음 ingest. 부록(pseudo code·Gaussian parameterization) 포함 전체 통독. [통과]/research.
- **research 신규**: [[GS-LRM]](Adobe·Cornell, ECCV'24) — 2~4 posed sparse 이미지 → **per-pixel 3D Gaussian** 을 단순 트랜스포머(patchify→self-attention→linear decode)로 0.23s 예측. Plücker ray 채널결합 pose conditioning, ray distance로 가우시안 중심 unproject. 객체(Objaverse)·장면(RealEstate10K) 통합, +4dB(Triplane-LRM)·+8dB(LGM)·+2.2dB(pixelSplat). + source [[2026-06-17-GS-LRM-논문]].
- **forward link 해소**: 직전 turn [[4DGT]]·[[DGS-LRM]]이 가리키던 미해결 [[GS-LRM]] 링크가 뿌리 노트 생성으로 연결됨.
- cross-link: [[4DGT]]·[[DGS-LRM]]·[[MoVieS]](후계)·[[StreamSplat]] + [[3D-Gaussian-Splatting]]·[[NeRF]](표현/대조) + [[VGGT]]·[[DUSt3R]](feed-forward 다른 분기) + [[ViT]]·[[Transformer]]·[[위치인코딩-positional-encoding]]·[[SfM-COLMAP]]·[[구면조화함수-SH]]·[[Radiance Field-Volume Rendering]](concepts).
- index: 그룹명을 "Feed-forward GS 복원(LRM 계보: 정적→4D/동적)"으로 재편, GS-LRM을 뿌리로 명시. 압축(≤200줄).

## [2026-06-17] lint | all
- 노트 44개(non-source) + source 20개. 압축위반 0(전부 ≤180줄·cross-link≥3), 고립 0([[raw-wiki-규칙]]=백링크2는 헌법, CLAUDE.md서 참조). 미처리 raw 0(raw 25건 전부 sources 매핑). [[DUSt3R]]·[[GS-LRM]] forward link 해소 확인.
- **발견**: ① **오링크 1종×3곳** — `[[GS-LRM|L4GM]]`(4DGT.md 2곳·DGS-LRM.md 1곳): L4GM(Ren et al. NeurIPS'24, 합성 4D GS LRM)을 GS-LRM(Zhang et al. ECCV'24, 정적)으로 잘못 별칭. **별개 논문 — 두 페이지를 하나로 오표기**. ② 데이터 갭: [[DINO]](DINOv2) — VGGT·4DGT·StreamSplat 3노트서 `[[DINO|DINOv2]]` 링크하나 concepts 페이지 부재(ViT·Transformer는 있음). ③ 데이터 갭 후보(평문 다출현·무페이지): CroCo(6)·pixelSplat(6)·MASt3R(5)·SpatialTracker(4)·CUT3R(3).
- 모순 0. 모호 로그 누적 0(여전히 "아직 없음").
- 자동 수정 X. 권고: L4GM 오링크 교정(평문화 또는 L4GM 노트 신설) / DINO concepts 페이지 / CroCo·MASt3R ingest 검토.

## [2026-06-17] 누락보고 | GS-LRM 요청 시 raw 부재 → 재생성 후 처리
- (별도 turn) `/ingest GS-LRM.md` 1차엔 `raw/GS-LRM.md` 부재(DGS-LRM과 혼동 방지 안내), 사용자가 raw 생성 후 2차에 [[GS-LRM]] 정상 박제.

## [2026-06-17] ingest | CroCo + DINO/DINOv2 + MASt3R (lint 갭 해소)
- 입력 `Croro.md`(오타→`CroCo.md`)·`Dino.md`·`DINOv2.md`·`MASt3R.md`. 멱등성 가드: 4 raw 모두 sources 미등재 → 신규. 부록·증명 포함 전체 통독. 모두 [통과].
- **concepts 신규 1**: [[DINO]] — DINO(Caron ICCV'21, self-distillation no labels)+DINOv2(Oquab TMLR'24, 큐레이션 LVD-142M 스케일업, DINO+iBOT+SK+KoLeo, frozen 피처로 깊이·분할 SOTA)를 **한 페이지로 통합**(sources 2건). 범용 자기지도 ViT 백본 → [[VGGT]]·[[4DGT]]·[[StreamSplat]]·[[MoVieS]] 인코더. concepts 패턴상 별도 source-meta 노트 없음([[ViT]]·[[Transformer]] 선례).
- **research 신규 2**: [[CroCo]](Naver, NeurIPS'22) — cross-view completion 사전학습, [[DUSt3R]]·[[MASt3R]]·[[MONST3R]] 인코더 토대 / [[MASt3R]](Naver, ECCV'24) — DUSt3R+dense feature 매칭헤드(InfoNCE)+fast reciprocal matching, Map-free +30%p, DTU zero-shot MVS. + source 2 [[2026-06-17-CroCo-논문]]·[[2026-06-17-MASt3R-논문]].
- **lint 갭 해소**: 직전 lint의 데이터 갭 [[DINO]](wikilink) + 평문 CroCo·MASt3R 전부 페이지화. DUSt3R 계보에 누락이던 **MASt3R**(DUSt3R→MASt3R 분기점)와 **CroCo**(사전학습 뿌리) 채워 계보 그래프 완성.
- 영역 판정 근거: DINO/DINOv2=범용 비전 백본 → concepts([[ViT]] 급). CroCo/MASt3R=3D vision 논문 → research(§B②). cross-link: 계보 형제 + [[ViT]]·[[Transformer]]·[[SfM-COLMAP]] concepts + [[DINO]]↔[[CroCo]] 사전학습 대조.
- index: DUSt3R 계보에 CroCo(사전학습)·MASt3R(매칭) 편입, concepts ML백본에 [[DINO]] 추가. 전부 통독·압축(각 ≤200줄).
- **잔여 오링크**: `[[GS-LRM|L4GM]]`(4DGT 2곳·DGS-LRM 1곳) 미교정 — 이번 ingest는 갭 해소 범위, L4GM 교정은 별도(승인 대기).

## [2026-06-17] lint-조치 | 직전 lint 오류 일괄 교정
- 직전 [2026-06-17] lint 발견사항 전부 종결:
  - **① 오링크 [[GS-LRM|L4GM]] ×3 → 교정 완료**: 4DGT.md(2곳)·DGS-LRM.md(1곳)의 잘못된 별칭을 평문 `L4GM`으로 수정. L4GM(Ren et al. NeurIPS'24, 합성 4D)≠[[GS-LRM]](Zhang et al. ECCV'24, 정적) 별개 논문이라 link 제거(L4GM raw 미수집 → 평문이 정확, forward link로 두면 새 데이터갭 생성하므로 평문 선택). 4DGT.md 계보줄은 이미 올바른 사용([[GS-LRM]] link + 평문 L4GM)이라 유지.
  - **② 데이터 갭 [[DINO]] → 해소**: 직전 ingest로 concepts [[DINO]](DINO+DINOv2) 생성, VGGT·4DGT·StreamSplat·MoVieS 백본 링크 연결.
  - **③ 평문 다출현 CroCo·MASt3R → 해소**: research [[CroCo]]·[[MASt3R]] 생성.
- 잔여 데이터갭 후보(pixelSplat·SpatialTracker·CUT3R 평문)는 raw 미수집이라 보류 — 다음 ingest 대상. 재검 결과 **노트 내 미해결 wikilink 0, 오링크 0**.

## [2026-06-18] ingest | Ex4DGS (완전 명시적 동적 4D GS, NeurIPS'24)
- 멱등성 가드: 신규 raw(`raw/Ex4DGS.md` 19p) — sources 미등재 → 처음 ingest. 부록(ablation·occlusion·장기영상·per-scene 분해표) 포함 전체 통독. [통과]/research.
- **research 신규**: [[Ex4DGS]](Lee et al., GIST, NeurIPS'24) — 동적 가우시안을 sparse 키프레임에만 저장+보간(**CHip 위치·Slerp 회전·GMM opacity**), 마스크 없이 정적/동적 자동 분리(이미지공간 이동량 상위 2%), progressive training + point-backtracking pruning. 희소 point cloud(첫 프레임 COLMAP) 강건, 62fps(2080Ti)/120fps(4090), 115MB. + source [[2026-06-18-Ex4DGS-논문]].
- **영역**: Radiance Field NVS(§B② 3D Vision) — 최적화 기반 동적 4DGS, [[Relaxed-Rigidity-동적GS]]와 같은 그룹.
- **핵심 연결**: [[Relaxed-Rigidity-동적GS]]와 **동일 저자(GIST Lee·Jeon)** — RR이 Ex4DGS(spline base)에 plug-in 정규화 부착. RR 노트의 평문 "Ex4DGS"를 [[Ex4DGS]] 링크로 승격(양방향 연결).
- cross-link: [[3D-Gaussian-Splatting]](기반)·[[NeRF]](implicit 동적 대조)·[[Relaxed-Rigidity-동적GS]](확장)·[[Radiance Field-Volume Rendering]]·[[구면조화함수-SH]]·[[SfM-COLMAP]](concepts) + feed-forward 4D 대조 [[4DGT]]·[[DGS-LRM]]·[[MoVieS]]·[[StreamSplat]](최적화 vs feed-forward).
- index: Radiance Field NVS 동적에 Ex4DGS 편입. 전부 통독·압축(≤200줄).

## [2026-06-18] ingest | 3D-4DGS (하이브리드 3D-4D GS, 2025)
- 멱등성 가드: 신규 raw(`raw/3D-4DGS.md` 16p) — sources 미등재 → 처음 ingest. 부록(CUDA rasterization Alg.1·per-scene 곡선) 포함 전체 통독. [통과]/research.
- **research 신규**: [[3D-4DGS]](Oh et al., SKKU·Yonsei, arXiv'25) — 정적=3D·동적=4D 가우시안 **하이브리드**. 전부 4D로 시작 → **시간축 scale > τ(=정적) 가우시안을 매 densification마다 4D→3D 변환**(μ_t 폐기·R4D→q3D). 정적 3D 매 iter 갱신 + opacity reset 제거로 4DGS 5.5h → **12분**(3~5× 가속), 208 FPS, N3V 32.25dB. 통합 CUDA rasterization(4D를 시각 t에서 slice). + source [[2026-06-18-3D-4DGS-논문]].
- **영역**: Radiance Field NVS(§B② 3D Vision) — 최적화 기반 동적 4DGS, [[Ex4DGS]]·[[Relaxed-Rigidity-동적GS]]와 같은 그룹.
- **핵심 연결**: [[Ex4DGS]]를 직접 비교 baseline으로 사용(둘 다 최적화 기반 동적 4DGS) — Ex4DGS 노트에 [[3D-4DGS]] peer 역링크 추가(양방향).
- cross-link: [[3D-Gaussian-Splatting]]·[[NeRF]]·[[Ex4DGS]]·[[Relaxed-Rigidity-동적GS]] + concepts [[Radiance Field-Volume Rendering]]·[[구면조화함수-SH]]·[[SfM-COLMAP]] + feed-forward 4D 대조 [[4DGT]]·[[DGS-LRM]]·[[MoVieS]]·[[StreamSplat]].
- index: Radiance Field NVS 동적에 3D-4DGS 편입(`동적 [[Ex4DGS]]·[[3D-4DGS]]·[[Relaxed-Rigidity-동적GS]]`). 전부 통독·압축(≤200줄).
- 후속 후보: 기반 **4DGS(Yang et al., 4D rotor)**·**4DGaussians(deformation)** — Ex4DGS·3D-4DGS·4DGT·DGS-LRM 등 다수 노트서 평문 다출현, 동적 GS 뿌리로 ingest 가치(현재 raw 미수집이라 평문 유지).

## [2026-06-19] lint | all 영역 건강 진단
- 진단만(자동 수정 X). 노트 47개·sources 24개 스캔.
- **모순 0 / 미처리 raw 0**(top-level raw 31건 전부 sources 등재) / **압축 위반 0**(최대 콘텐츠 노트 85줄, 모든 노트 outgoing link ≥3).
- **고립 1**: [[CoherentRaster]] — index·log만 링크, peer 노트 역링크 0(out=8인데 backlink 콘텐츠 0).
- **데이터 갭(raw 미수집)**: 최우선 **4DGS(Yang et al., 4D rotor)** 9개 노트 평문 언급·무페이지. 그 외 deformation/Deformable3D(7)·pixelSplat(4)·SpatialTracker(4)·4DGaussians(3)·CUT3R(2)·L4GM(2).
- 잔여 오링크 0(직전 L4GM alias→평문 교정 확인). 모호 사례 로그 비어있음.

## [2026-06-19] fix | CoherentRaster 고립 해소 (lint 후속)
- 직전 lint 권고①. peer 역링크 0 → 2개 추가: [[3D-Gaussian-Splatting]] 후속/응용 줄 + [[lighthouseGS]] 관계 줄에 [[CoherentRaster]] 역링크(양방향화). 콘텐츠 backlink 0→2.
- 데이터 갭(4DGS 등)은 raw 미수집이라 미조치(평문 유지) — 자동 박제 안 함(§A Q0).

## [2026-06-20] ingest | 동적 GS 뿌리 4 + 정적 구조/feed-forward 2 (신규 raw 6건)
- 멱등성 가드: 신규 raw 6건(`raw/4DGS.md` 15p·`Deformable3DGS.md` 15p·`native4DGS.md` 26p·`SpacetimeGS.md` 27p·`Scaffold-GS.md` 14p·`MVSplat.md` 23p) — sources 미등재 → 처음 ingest. 부록·참조 포함 전부 전체 통독. 모두 [통과]/research. lint(2026-06-19) 데이터 갭(4DGS·deformation·pixelSplat) 직접 해소.
- **동적 GS 모션 뿌리 4**: [[4DGS]](Wu, canonical+HexPlane deformation) · [[Deformable3DGS]](Yang, 순수 MLP 변형장+AST) · [[native4DGS]](Yang Fudan, native 4D primitive+4DSH) · [[SpacetimeGS]](Li OPPO, 시간opacity+다항식모션+feature splatting). 기존 [[Ex4DGS]]·[[3D-4DGS]]·[[Relaxed-Rigidity-동적GS]]가 인용하던 평문 baseline을 실노트로 승격.
- **⚠️ 동명 disambiguation**: "4DGS"가 둘 — [[4DGS]](Wu et al., CVPR'24, deformation)와 [[native4DGS]](Yang et al., ICLR'24 확장, native 4D primitive)는 별개 논문. 양 노트에 `[!warning]` 콜아웃 + 상호 인용 명시. [[4DGS]] 문제의식 줄에 native4DGS 역링크 추가.
- **정적 구조 1**: [[Scaffold-GS]](Lu, anchor+neural Gaussian view-adaptive, 저장 4~10×↓) — Radiance Field NVS에 편입, 압축/anchor 계보로 [[native4DGS]] 4DGSC와 연결. **feed-forward 1**: [[MVSplat]](Chen, cost volume sparse-view→GS, pixelSplat 10×↓) — feed-forward GS 섹션 편입, [[GS-LRM]]·[[DUSt3R]]/[[VGGT]] 대조.
- index: Radiance Field NVS에 Scaffold-GS + 신규 "동적 GS 모션 표현 뿌리(최적화 기반 4D)" 하위섹션 + feed-forward GS에 MVSplat 추가. sources 줄 6건 등재. 전부 ≤200줄 압축.
- 잔여: pixelSplat·Splatter Image·4D-Rotor-GS 등 평문 다출현 — raw 미수집이라 보류(다음 ingest 후보).

## [2026-06-20] lint | all 영역 건강 진단 (6건 ingest 후)
- 진단만. 콘텐츠 노트 53 + sources 30 스캔.
- **모순 0 / 미처리 raw 0 / 압축 위반 0 / 오링크 0**(최대 콘텐츠 85줄, 신규 6노트 ≤50줄).
- **고립 1**: [[MVSplat]] — index·log만 링크, peer 역링크 0(out 풍부하나 backlink 콘텐츠 0). 직전 ingest 신규.
- **데이터 갭(raw 미수집)**: 최우선 **pixelSplat**(6노트, [[MVSplat]] 직접 baseline). 그 외 **HexPlane**(8)·**K-Planes**(6, NeRF voxel분해 → concepts 후보)·4DGaussians(4)·Dynamic3DGS/DynMF(4)·SpatialTracker(4)·4D-Rotor-GS(3)·CUT3R(2)·Splatter Image(1).
- 모호 사례 로그 비어있음.

## [2026-06-20] fix | MVSplat 고립 해소 (lint 후속)
- 직전 lint 권고①. peer 역링크 0 → 2개 추가: [[GS-LRM]] 계보형제 줄 + [[DGS-LRM]] 계보 줄에 [[MVSplat]] 역링크(같은 feed-forward GS, cost volume vs self-attention 대조 명시). 콘텐츠 backlink 0→2.
- 데이터 갭(pixelSplat·HexPlane·K-Planes 등)은 raw 미수집이라 미조치(평문 유지, §A Q0).

## [2026-06-20] 연결 | blog 리뷰 ↔ wiki 교차링크 (본문 미수정)
- 사용자 요청: blog 게시글을 위키와 연결만(ingest 아님). 6개 블로그 글 끝에 "관련 위키" 푸터 추가(blog→wiki), 본문 무수정.
- **blog→wiki**: NeRF리뷰→[[NeRF]] / 3DGS리뷰→[[3D-Gaussian-Splatting]] / MANO리뷰→[[MANO]] / 손포즈 3편(Depth-Based·Model-based·REN)→손복원 클러스터([[MANO]]·[[HaMeR]]·[[Hamba]]·[[WiLoR]]·[[HMR]]·[[SMPL]]) 선행으로 연결.
- **wiki→blog**(1:1 대응 3개): [[NeRF]]·[[3D-Gaussian-Splatting]]·[[MANO]] 관련 섹션에 "블로그 리뷰" 역링크 추가. 양방향 오링크 0.

## [2026-06-20] lint | all 영역 건강 진단 (방사장→Radiance Field 치환 후)
- 진단만. **모순 0 / 미처리 raw 0 / 압축 위반 0 / 고립 0 / 미해소 위키링크 0**(전 vault — 노트명 변경 `방사장-볼륨렌더링`→`Radiance Field-Volume Rendering` 27개 링크 정합 확인).
- 잔여 '방사장'·'볼륨렌더링' 0(raw 제외). MVSplat 고립도 직전 fix로 해소 유지.
- **데이터 갭(raw 미수집, 변동 없음)**: pixelSplat·HexPlane·K-Planes·Dynamic3DGS/DynMF·SpatialTracker·4D-Rotor·CUT3R·Splatter Image. 모호 로그 비어있음.

## [2026-06-25] ingest | pixelSplat (feed-forward generalizable GS 시초)
- 멱등성 가드: 신규 raw(`raw/PixelSplat.md` 16p) — sources 미등재 → 처음 ingest. 부록(학습 상세·3뷰·아키텍처·한계) 포함 전체 통독. [통과]/research.
- **lint(2026-06-20) 1순위 데이터 갭 해소**: pixelSplat 6노트 평문 언급 → 정식 노트 [[pixelSplat]] 생성. MVSplat·GS-LRM의 직접 baseline.
- **핵심**: 이미지 2뷰→feed-forward 3DGS. ① 스케일 모호성=epipolar transformer(삼각측량 깊이 PE) ② local minima=깊이 확률분포+샘플링, reparameterization(α=φ_z, VAE 영감). RE10k 26.09·ACID 28.27, ~650× 빠름. 인코더 DINO ResNet+ViT.
- 고립 방지: [[MVSplat]]·[[GS-LRM]] 계보 줄의 평문 "pixelSplat"→[[pixelSplat]] 전환(역링크 2). index feed-forward GS에 시초로 편입.
- 잔여 데이터 갭(다음 후보): HexPlane·K-Planes(concepts 후보)·Dynamic3DGS·SpatialTracker 등.

## [2026-07-01] ingest | OR² (online 동적 3DGS 시간 일관성, SIGGRAPH'25)
- 멱등성 가드: raw/ 39개 md 중 유일한 미처리 `raw/onlinedynamic3DGS.md`(13p, sources 미등재) → 처음 ingest. 부록 A~E(Algorithm 1·구현·offline/V3/노이즈레벨/뷰수 비교·per-scene 표)+References 전체 통독. [통과]/research.
- **핵심**: 관측=이상신호+시변오차(센서노이즈, 8-bit<4). online 재구성은 매 프레임 과적합→정적영역 깜빡임. 해결=뷰·프레임별 **학습 residual map** $\hat M^v_t$로 오차 흡수($\tilde I_t=\hat I_t+\hat M_t$), 가우시안은 이상관측만 학습. baseline-무관 plug-in(3DGStream/HiCoM/Dynamic3DG†).
- 효과: mTV↓(시간일관성), PSNR/SSIM↑, 가우시안 수↓($G_0$0.69×·$G^{new}$0.28×)→학습가속. residual은 학습때만 저장X. SH degree 3 유지·new Gaussian 재사용이 ablation 핵심.
- cross-link: [[3D-Gaussian-Splatting]]·[[NeRF]] / offline 비교군 [[SpacetimeGS]]·[[4DGS]]·[[Deformable3DGS]]·[[Ex4DGS]]·[[3D-4DGS]] / online 이웃 [[StreamSplat]] / 개념 [[구면조화함수-SH]]·[[SfM-COLMAP]](타영역) / 유사 plug-in [[Relaxed-Rigidity-동적GS]]. index "동적 GS 모션 표현 뿌리(최적화 기반)"에 편입.
- 잔여 데이터 갭(평문 다출현, raw 미수집): 3DGStream·HiCoM·Dynamic3DGS·HexPlane·K-Planes·NeRFPlayer 등.

## [2026-07-14] ingest | C4G (compact query-based feed-forward 4D GS, 2026)
- 멱등성 가드: raw/ 40개 md 중 유일한 미처리 `raw/C4G.md`(27p, sources 미등재) → 처음 ingest. 본문(§1~5)+부록 A~F(아키텍처·loss·feature lifting·VDM·데이터셋·평가 프로토콜·포즈정렬·ablation·tracking·attention 시각화·한계)+References 전체 통독. [통과]/research.
- **핵심**: per-pixel 4D의 실패(중복 가우시안 ghost·view-dependent bias occlusion) 원인=표현 과잉 overfit. 해결=timestamp 조건 **learnable query token(N=2048)** 로 전 시간 컨텍스트 aggregate → global motion 학습. [[VGGT]] 백본·L=2 full self-attention·SH degree 0. 2K 가우시안(경쟁 802K의 0.007×↓)·포즈 불필요 SOTA, ∆t 강건.
- **창발**: 2 attention 층 상보(L1 공간대응·L2 시간근접) → 재활용해 최초 feed-forward 4D feature lifting(query/key 재사용, value만 학습). VDM(Wan2.1-VACE) refine으로 디테일 보강. 정적 선행작 **C3G** 가중치 초기화.
- cross-link: per-pixel 대조군 [[4DGT]]·[[MoVieS]](겨냥 대상)·[[DGS-LRM]]·[[StreamSplat]] / 백본 [[VGGT]] / 표현 [[3D-Gaussian-Splatting]]·[[NeRF]] / 개념(타영역) [[Transformer]]·[[위치인코딩-positional-encoding]]·[[구면조화함수-SH]]·[[DINO]]·[[Radiance Field-Volume Rendering]]. index "Feed-forward GS 복원(LRM 계보)"에 편입.
- 잔여 데이터 갭(평문, raw 미수집): C3G(정적 2K 자매작)·NeoVerse·MoGe-2·CowTracker·VACE/Wan 등.

## [2026-07-07] system | Hermes Agent 활용 가이드북 생성
- 생성: [[Hermes-Agent-활용-가이드북]] — 사용자가 Hermes로 할 수 있는 일을 wiki 운영·코딩·조사·문서화·자동화 중심으로 정리.
- 공식 Hermes docs(도구·슬래시 커맨드·스킬·메모리·cron)와 현재 vault 규칙([[raw-wiki-규칙]])을 반영.
- index system 섹션에 신규 운영 문서로 등재.

## [2026-07-25] ingest | VGGT-Ω + OmniX (신규 raw 2건)
- 멱등성 가드: raw/ 41개 md 중 미처리 2건(`raw/VGGT-Ω.md` 28p·`raw/OmniX.md` 26p, sources 미등재) → 처음 ingest. 나머지 39건 skip. 부록·References 포함 전체 통독. 둘 다 [통과]/research.
- **[[VGGT-Ω]]**: [[VGGT]] 직계 스케일업(Oxford·Meta 동일팀). 모델 0.2B→10B·데이터 2K→2M seq 거듭제곱법칙. 효율 3종(register attention 25% 대체·단일 dense head·pixel-shuffle)로 학습메모리 70%↓→15× 데이터. 동적 주석 파이프라인(VLM·Grounding DINO·COLMAP·앙상블 필터, 40M→0.8M seq) + teacher-student 자기지도. Sintel 카메라 AUC@3° 22.5→40.0(+77%), MegaSaM 50×↑, 1000+프레임/A100. register→VLA(LIBERO 97.1→98.5)·언어정렬. index "Feed-forward 3D 복원(DUSt3R 계보)"에 편입.
- cross-link: [[VGGT]]·[[DUSt3R]]·[[MASt3R]]·[[MONST3R]]/파생대조 [[MoRe]]·[[MoVieS]]/개념(타영역) [[DINO]]·[[Transformer]]·[[ViT]]/응용 [[3D-Gaussian-Splatting]]·[[NeRF]].
- **OmniX(철회)**: 신규 하위영역(3D 장면 생성·파노라마 2D-lifting·inverse rendering). 2D flow matching(Flux.1-dev) 재활용 통합 파노라마 생성·인지·완성. 기하+PBR재질(albedo·roughness·metallic) 인지→PBR-레디 3D 장면. Circular Synchronization(seam 근본해결)·Separate-Adapter(모달리티별 LoRA)·PanoX 데이터셋(UE5 합성, 실내외+재질주석 최초). 생성·내재분해 SOTA. index에 신규 섹션 "3D 장면 생성" 추가.
- cross-link: 개념(타영역) [[Transformer]]·[[ViT]]/2D-lifting 이웃 [[3D-Gaussian-Splatting]]/기하인지 대조 [[VGGT-Ω]]/image formation [[NeRF]].
- 잔여 concepts 갭(평문, 페이지 없음): flow matching·rectified flow / inverse rendering·PBR / LoRA / register token. 향후 ingest 시 신설 검토.
- 압축: VGGT-Ω 3811줄→노트 ~70줄, OmniX 1840줄→노트 ~55줄(각 ≤200줄·직접인용 ≤3줄·cross-link 타영역 ≥1 충족). 미처리 raw 0.

## [2026-07-25] fix | VGGT-Ω sources 유니코드 정규화 교정
- 멱등성 스캔이 `raw/VGGT-Ω.md`를 미처리로 오탐 → 원인: 파일명 Ω는 **U+2126(OHM SIGN, e2 84 a6)**, 노트 `sources:`는 **U+03A9(GREEK OMEGA, ce a9)** — 시각 동일·코드포인트 상이(NFC에서 U+2126→U+03A9 분해라 불일치 발생).
- 조치: `wiki/research/VGGT-Ω.md`·source meta 2파일의 `sources:` 값을 raw 실제 파일명 코드포인트(U+2126)로 교정. 재스캔 결과 VGGT-Ω 정상 매칭. (wiki 내부 wikilink/파일명은 U+03A9로 일관 유지 — 외부 참조인 sources만 교정.)

## [2026-07-25] ingest | NoPoSplat + NeoVerse (신규 raw 2건)
- 멱등성 가드: raw/ 43개 md 중 미처리 2건(`raw/NoPoSplat.md` 21p·`raw/NeoVerse.md` 15p, sources 미등재) → 처음 ingest. 나머지 skip. 부록·References 포함 전체 통독. 둘 다 [통과]/research.
- **[[NoPoSplat]]**: pose-free generalizable 3DGS(ETH·NVIDIA, ICLR'25). 첫 뷰를 **정준공간**으로 앵커, 모든 뷰 가우시안을 그 안에서 직접 예측(transform-then-fuse 탈피)→포즈 불필요. 광도손실만 학습(GT depth 불요), intrinsic token으로 스케일 모호성 해결, 순수 ViT(기하 prior 없음). 저overlap서 pose-required([[pixelSplat]]·[[MVSplat]]) 능가, 2단계 포즈추정(PnP+광도 refine)으로 DUSt3R·MASt3R·RoMa 상회. 66fps. index "Feed-forward GS 복원(LRM 계보)"에 편입.
- cross-link: [[pixelSplat]]·[[MVSplat]]·[[GS-LRM]]/DUSt3R교차 [[DUSt3R]]·[[MASt3R]]/개념(타영역) [[ViT]]·[[SfM-COLMAP]]·[[구면조화함수-SH]]/후속 [[NeoVerse]]·[[VGGT]].
- **[[NeoVerse]]**: 복원+생성 하이브리드 4D 세계모델(CASIA·CreateAI, 2026). [[VGGT]] Gaussianize + **양방향 모션 모델링**(4DGT 단방향 대조)으로 pose-free feed-forward 4DGS 복원. **온라인 degradation 시뮬**(Gaussian culling·average geometry filter)로 단안 영상만으로 학습쌍 생성→in-the-wild 1M clip 스케일러블. degraded novel-view 렌더 조건으로 Wan-T2V+Rectified Flow 생성(control branch만 학습). 정적(VRNeRF·ScanNet++)·동적(ADT·DyCheck) 복원 + 생성(VBench) SOTA. index "Feed-forward GS 복원(LRM 계보)" 4D에 편입.
- cross-link: 백본 [[VGGT]]/4D peer [[4DGT]]·[[MoVieS]]·[[StreamSplat]]·[[C4G]]/pose-free 대조 [[NoPoSplat]]·[[MONST3R]]/표현 [[3D-Gaussian-Splatting]]/개념(타영역) [[DINO]]·[[Transformer]]·[[ViT]].
- 잔여 concepts 갭(평문, 페이지 없음): rectified flow / video diffusion(Wan) / LoRA / ControlNet식 control branch — OmniX(철회)·[[C4G]]와 공유. 향후 신설 검토.
- 압축: NoPoSplat 1876줄→노트 ~70줄, NeoVerse 2185줄→노트 ~70줄(각 ≤200줄·직접인용 ≤3줄·cross-link 타영역 ≥1 충족). 미처리 raw 0.

## [2026-07-25] ingest | C3G (컴팩트 2K 가우시안 정적 GS)
- 멱등성 가드: NoPoSplat·NeoVerse ingest 후 재스캔에서 `raw/C3G.md`(28p, 3597줄) 신규 출현(세션 중 Drive 동기화, 02:44 생성). sources 미등재 → 처음 ingest. 부록 A~F 포함 전체 통독. [통과]/research.
- **[[C3G]]**: KAIST CVLAB·ETH·Sony. per-pixel 대신 **N=2048 학습가능 query token**으로 필수 위치 컴팩트 가우시안(~2K, LSM 65×↓·메모리 4.1MB)만 예측. 광도손실만 학습해도 **각 토큰이 뷰 간 일관 영역에 attend하는 창발** → 이 attention 재활용(C3G-F, value projection만 학습)해 임의 2D 피처(LSeg·MaskCLIP·DINOv2/v3·VGGT tracking)를 view-invariant 3D로 압축 없이 lift. VGGT 인코더·SH degree 0·RAIN-GS low-pass. NVS 경쟁적(2K vs 수백만), 3D open-vocab seg·다중뷰 대응(PCK) SOTA. index "Feed-forward GS 복원(LRM 계보)"에 편입.
- **갭 해소**: [[C4G]] 노트가 평문 참조하던 "정적 선행작 C3G"(같은 KAIST CVLAB, C4G가 C3G 가중치로 초기화)를 [[C3G]] 링크로 승격. 겸사겸사 C4G 노트의 NeoVerse 평문도 [[NeoVerse]] 링크로 교정.
- cross-link: 직계후속 [[C4G]]/대조 [[NoPoSplat]]·[[pixelSplat]]·[[MVSplat]]·[[GS-LRM]]/백본 [[VGGT]]/표현 [[3D-Gaussian-Splatting]]/개념(타영역) [[DINO]]·[[구면조화함수-SH]]·[[Transformer]]·[[ViT]].
- 압축: C3G 3597줄→노트 ~75줄(≤200줄·직접인용 ≤3줄·cross-link 타영역 ≥1 충족). 미처리 raw 0.

## [2026-07-25] lint | all 영역 건강 진단 (신규 5건 ingest 후)
- 모순 0 / 미처리 raw 0 / 압축 룰 위반 0(콘텐츠 노트 전부 ≤200줄·cross-link ≥3, rulebook만 예외=거버넌스 문서) / 모호 로그 비어있음.
- **깨진 링크 1(상)**: [[OR2-온라인동적GS]]의 출처 인용이 raw 파일명(`onlinedynamic3DGS`)을 가리켜 미해결 — research 노트 37개 중 유일하게 **source-meta 노트 없음**(2026-07-01 ingest 시 누락). 조치: `sources/2026-07-01-OR2-논문.md` 신설 + OR² 인용 링크 교정 + index _sources_ 등재.
- **고립(중)**: 확립된 노트 중 peer 역링크 0 = [[OR2-온라인동적GS]](2026-07-01, 동적GS뿌리 클러스터인데 peer 무연결)·OmniX(철회)(신규 단독 하위영역). 금세션 신규(VGGT-Ω·C3G·NoPoSplat·NeoVerse)는 inbound 낮으나 정상(누적 예정).
- **데이터 갭(중)**: 생성형 확산 prior 개념군(flow matching[OmniX·C4G]·rectified flow[NeoVerse]·video diffusion/VDM[NeoVerse·C4G]·control branch·LoRA) — research 3+노트가 의존하나 concepts 페이지 없음. 후보: [[flow-matching-생성prior]] 신설. (baseline 평문 AnySplat·MegaSaM·Splatt3R·DA3·PI3는 raw 미수집이라 유지.)
- 진단만, 자동수정 X. 조치는 사용자 승인 후 별도.

## [2026-07-25] fix | lint 권고 3건 일괄 조치 (사용자 승인)
- **깨진 링크/source-meta 누락 해소**: [[2026-07-01-OR2-논문]] source-meta 신설(기존 OR² 노트·log 기반, raw 재읽기 없이) → OR² 인용 링크를 raw 파일명(onlinedynamic3DGS) 대신 이 source-meta로 교정, index _sources_ 등재. research/source-meta 37:37 일치.
- **데이터 갭 해소**: concepts [[flow-matching-생성prior]] 신설(flow matching·rectified flow·video diffusion·LoRA·control branch 앵커). OmniX(철회)·[[NeoVerse]]·[[C4G]] 3노트의 평문 생성개념을 이 페이지로 양방향 링크(각 노트 개념 line 교정). index concepts에 "생성 prior" 소섹션 추가.
- **고립 해소**: [[OR2-온라인동적GS]]에 peer 역링크 부여([[StreamSplat]]·[[NeoVerse]]→OR², 0→2). OmniX(철회)도 [[NeoVerse]]·concepts→링크로 0→2. flow-matching 페이지 inbound 3.
- **부수 정리**: [[StreamSplat]] 본문 평문 pixelSplat·MVSplat·NoPoSplat를 위키링크화. lint 로그 내 자기참조 raw 파일명 표기를 코드/평문으로 정리(broken link 재생성 방지).
- 재검: 미해결 wikilink 0(blog 리뷰·asset embed 제외), 미처리 raw 0, ≥200줄 콘텐츠 노트 0.

## [2026-07-25] system | VGGT 백본 생태계 MOC 신설 (lint C-tier 제안)
- 생성: [[VGGT-백본-생태계]] — [[VGGT]]를 백본/인코더로 쓰는 후속작을 index 클러스터 넘어 "무엇을 VGGT 위에 얹었는가" 축으로 재편한 MOC(가로지르는 지도). 뿌리 [[VGGT]] + ①스케일업 [[VGGT-Ω]] ②동적/스트리밍 [[MoRe]] ③Gaussianize [[MoVieS]]·[[C3G]]·[[C4G]]·[[NeoVerse]]. 대비군(VGGT 백본 아님) [[NoPoSplat]]·[[DUSt3R]]·[[MASt3R]] 명시.
- 등재: index research 섹션 상단에 MOC 포인터 1줄, [[VGGT]] 노트 관련에 "후속 생태계(MOC)" 링크(inbound 확보).
- 부수 효과: MOC가 6개 VGGT 의존 노트(신규 4건 포함)에 inbound 부여 → 금세션 신규 노트 고립도 추가 완화.
- 개념(타영역) [[DINO]]·[[Transformer]]·[[ViT]] 링크로 §C cross-link 규칙 충족. 미해결 wikilink 0 유지.

## [2026-07-26] ingest | Shape of Motion (단안 영상 4D 복원 + 장거리 3D 트래킹)
- 멱등성 가드: raw/ 42개 md 중 유일한 미처리 `raw/ShapeOfMotion.md`(17p, 2202줄, 세션 중 Drive 동기화 출현) → sources 미등재 → 처음 ingest. 본문 + References + Supplement A~G(전처리·학습·평가·시각화·NVIDIA·DynMF 재구현) 전체 통독. [통과]/research.
- **[[ShapeOfMotion]]**: UC Berkeley(Wang·Ye·Gao·Kanazawa), CVPR'25. 단안 영상 하나에서 **영속 장거리 3D 모션 궤적** 복원. 핵심=(1) 3D 모션을 소수 **SE(3) 모션 기저(B=10)** 선형결합으로 표현→저차원 강체 그룹 소프트 분해, (2) off-the-shelf 노이즈 prior(MegaSaM 포즈·Depth Anything 깊이·TAPIR 2D트랙·Track-Anything 마스크)를 전역 일관 4D로 융합. rigidity·시간평활 정규화. iPhone·Kubric 3D/2D 트래킹·NVS SOTA, per-scene 최적화(A100 2h·140fps). index "동적 GS 모션 표현 뿌리(최적화 기반 4D)"에 **모션 기저 분해** 패러다임으로 편입.
- cross-link: 최적화 4D 형제 [[4DGS]]·[[Deformable3DGS]](직접 baseline D-3DGS)·[[SpacetimeGS]]·[[native4DGS]]·[[OR2-온라인동적GS]] / feed-forward 트래킹 대비 [[MoVieS]]·[[StreamSplat]]·[[NeoVerse]]·[[C4G]] / 표현 [[3D-Gaussian-Splatting]]·[[NeRF]] / 개념(타영역) [[SfM-COLMAP]]·[[Radiance Field-Volume Rendering]]·[[위치인코딩-positional-encoding]].
- 잔여 concepts 갭(평문): 장거리 point tracking(TAPIR·CoTracker·TAP-Vid) — MoVieS·StreamSplat·본 논문 공유, 향후 앵커 검토. baseline 평문 MegaSaM·Depth Anything·DynMF·SpatialTracker·DELTA는 raw 미수집이라 유지.
- 압축: 2202줄→노트 ~55줄(≤200줄·직접인용 ≤3줄·cross-link 타영역 ≥1 충족). 미처리 raw 0.

## [2026-07-26] ingest | LGM + Long-LRM + BTimer (LRM 계보 확장 3건)
- 멱등성 가드: raw/ 43개 md 중 미처리 3건(`LGM.md` 20p·`Long-LRM.md` 14p·`BTimer.md` 14p, 세션 중 Drive 동기화 출현) → sources 미등재 → 처음 ingest. 부록·References 포함 전체 통독. 모두 [통과]/research, "Feed-forward GS 복원(LRM 계보)"에 편입.
- **[[LGM]]**(PKU·NTU, ECCV'24): 텍스트/이미지→3D **객체 생성** ~5초. off-the-shelf 멀티뷰 확산(MVDream·ImageDream) 4뷰 → 비대칭 U-Net per-pixel 가우시안(65,536)·512 해상도, grid distortion·camera jitter augmentation, Gaussians→NeRF→mesh 추출. [[GS-LRM]]의 생성 분파. cross-link: [[GS-LRM]]·[[pixelSplat]]·[[flow-matching-생성prior]](멀티뷰 확산)·[[3D-Gaussian-Splatting]]·[[NeRF]]·[[구면조화함수-SH]]·[[Transformer]].
- **[[Long-LRM]]**(OSU·Adobe, 2025): 32뷰 960×540 → 360° **광범위 장면** 3DGS 1초(GS-LRM 대비 토큰 60×·250K). **Mamba2+트랜스포머 하이브리드**({7M1T}×3)로 선형 복잡도 확보 + token merging(1/4) + Gaussian pruning(opacity L1). depth 정규화(DepthAnything). 최적화 3DGS 대비 800×. cross-link: [[GS-LRM]]·[[BTimer]]·[[Mamba-선형시간시퀀스]]·[[SSM]]·[[Transformer]]·[[3D-Gaussian-Splatting]]·[[Scaffold-GS]]. **개념 교차**: Mamba/SSM(원래 Hamba 손복원 전용)을 3D 장면 복원으로 확장 → 두 concepts 노트에 backlink 추가.
- **[[BTimer]]**(NVIDIA, NeurIPS'25): **bullet-time 정식화** — context에 목표 timestamp 임베딩 → 그 순간 완전한 3DGS aggregate. 정적·동적 통일·RGB 손실만·GS-LRM ViT 백본. NTE(3D-free) 빠른 모션 보강. curriculum(정적→동적 co-train +PANDA-70M→long-context). 12뷰 150ms. cross-link: [[GS-LRM]]·[[Long-LRM]]·[[ShapeOfMotion]](최적화 대비)·[[4DGT]]·[[MoVieS]]·[[StreamSplat]]·[[NeoVerse]]·[[3D-Gaussian-Splatting]]·[[Transformer]].
- index: LRM 계보 계보줄에 **스케일업 축**(뷰·범위 Long-LRM / 시간 BTimer / 객체 생성 LGM) 명시 + 항목 3줄. _sources_ 등재. Mamba 개념 index 라인에 Long-LRM 병기.
- 잔여 평문(raw 미수집): L4GM(4D LGM·BTimer 선행)·LVSM(BTimer NTE 착안)·Gamba/MVGamba(Mamba 객체)·MVDream/ImageDream·DepthAnything. 
- 압축: LGM 1045→~60줄·Long-LRM 1974→~60줄·BTimer 1223→~60줄(각 ≤200·직접인용 ≤3·cross-link 타영역 ≥1). 미처리 raw 0.

## [2026-07-26] lint | all 영역 건강 진단 (LRM 확장 3건 ingest 후)
- 규모: research 42(+MOC 1 포함)·source-meta 41·concepts 16·courses 9. 미처리 raw 0 / 미해결 wikilink 0 / ≥200줄 콘텐츠 노트 0 / cross-link <3 노트 0(rulebook 예외) / 모호 로그 비어있음.
- **모순 후보 1(상)**: [[BTimer]] "단안 동적 실시간 feed-forward **최초**"(arXiv 2412.03526, 2024-12) vs [[DGS-LRM]] "**최초의** feed-forward deformable GS LRM"(arXiv 2506.09997, 2025-06). 범위가 다르고(bullet-time 장면 복원 vs deformable GS+scene flow) 시점도 BTimer가 선행이라 양립 가능하나, **두 노트가 서로를 전혀 참조하지 않아** 교차 독해 시 충돌로 보임. 조치: 양쪽에 범위 한정어 + 상호 링크(또는 `> [!warning] 모순` 콜아웃).
- **고립(중)**: peer 역링크 0~1 = [[LGM]](0)·[[BTimer]](1)·[[ShapeOfMotion]](1)·[[VGGT-백본-생태계]](1, MOC라 inbound 적은 게 자연스러움)·[[Hermes-Agent-활용-가이드북]](0, system 문서). 앞의 3건은 금일·전일 신규라 out-link만 풍부한 상태 — LRM 계보 peer 간 상호 링크로 해소 가능.
- **데이터 갭(중)**: ① **포인트 트래킹 개념군**(TAPIR·CoTracker·SpatialTracker·TAP-Vid) — research 7노트(POMATO·NeoVerse·VGGT·MoVieS·DGS-LRM·C4G·ShapeOfMotion) 공유하나 concepts 페이지 없음. 가장 넓게 퍼진 미개설 개념. ② **L4GM** — 4노트(LGM·BTimer·4DGT·DGS-LRM) 평문 공유, 과거 `[[GS-LRM|L4GM]]` 오링크를 유발했던 이력(2026-06-17 교정). ③ MegaSaM(3)·AnySplat(2)·LVSM(2). 전부 raw 미수집이라 현행 평문 유지가 원칙.
- 진단만, 자동수정 X. 조치는 사용자 승인 후 별도.

## [2026-07-26] fix | lint 권고 3건 일괄 조치 (사용자 승인)
- **모순 후보 해소(상)**: [[BTimer]]·[[DGS-LRM]] 양쪽 "최초" 주장에 **범위 한정어** 부여(BTimer=bullet-time 장면 NVS·2024-12 선행 / DGS-LRM=deformable GS+scene flow 명시 예측·2025-06 후속) + 두 노트 관련 섹션에 **상호 링크**("최초 범위 대조") 추가 → 교차 독해 시 충돌로 읽히던 문제 제거. 콜아웃 대신 범위 명시를 택함(실제 모순이 아니라 scoping 문제이므로).
- **데이터 갭 해소(중)**: concepts [[장거리-point-tracking]] 신설 — TAP 문제 정의·난점(장거리 drift·occlusion·2.5D 리프팅 모호성)·주요 방법(TAPIR·CoTracker·SpatialTracker·TAP-Vid·RAFT-3D 지표)·3D 연구에서의 **3역할**(입력 prior / 평가 축 / 부가 출력) + frame-space↔world-space, 2.5D↔4D 대비 구도 정리. research 6노트([[ShapeOfMotion]]·[[MoVieS]]·[[POMATO]]·[[VGGT]]·[[NeoVerse]]·[[C4G]]) + [[DGS-LRM]] 개념/tracking 라인에서 양방향 링크. index concepts에 "모션·대응" 소섹션 추가.
- **고립 해소(중)**: [[LGM]] 0→1([[GS-LRM]]의 평문 "LGM(concurrent)"을 링크화 + 객체 생성 분기 설명). [[BTimer]] 1→3(GS-LRM "스케일업 후계" 라인 신설 + DGS-LRM 상호 링크). [[Long-LRM]]도 GS-LRM서 역링크 획득. [[ShapeOfMotion]] 1→2([[Deformable3DGS]]에 "직접 baseline으로 인용됨" 추가 — D-3DGS가 ShapeOfMotion의 비교군인 실제 관계).
- 재검: 미해결 wikilink 0, 미처리 raw 0, ≥200줄 콘텐츠 노트 0, cross-link <3 노트 0.

## [2026-07-27] 철회(retract) | OmniX — 동명이 논문 오박제 자료 삭제
- 사용자 확인: 2026-07-25 ingest한 OmniX는 **의도한 논문이 아니었음**(같은 이름 다른 논문을 raw에 넣은 실수). 관련 wiki 자료 전면 삭제 요청.
- **오박제된 논문**: "OmniX: From Unified Panoramic Generation and Perception To Graphics-Ready 3D Scenes" (Huang et al., HKU·Kuaishou, arXiv:2510.26800) — 파노라마 생성·인지·PBR.
- **현재 `raw/OmniX.md`(2026-07-27 교체됨)**: "OmniX: Any-view and Any-time 4D Reconstruction via Feed-forward Trajectory Fields" (Jiang et al., CAS·Tencent Hunyuan, arXiv:2607.10840, 19p/1401줄) — **별개 논문, 아직 미박제**.
- 삭제: `wiki/research/OmniX.md`, `wiki/research/sources/2026-07-25-OmniX-논문.md`.
- index: **"3D 장면 생성 (2D lifting·파노라마·inverse rendering)" 섹션 전체 제거**(OmniX 전용 섹션이었음) + _sources_ "장면생성" 항목 제거 + concepts flow-matching 설명에서 OmniX 삭제.
- 참조 정리: [[NeoVerse]](생성 이웃 링크)·[[2026-07-25-NeoVerse-논문]](갭 문구)·[[flow-matching-생성prior]](본문·frontmatter `sources`)에서 OmniX 제거. flow-matching 앵커는 [[NeoVerse]]·[[C4G]]가 여전히 근거이므로 **노트 자체는 유지**.
- raw/는 룰 §제약대로 **미수정**(`raw/OmniX.md`·`raw/assets/OmniX/` 보존) — 현재 파일은 의도한 신규 논문이므로 삭제 대상 아님.
- ⚠️ **멱등성 주의**: 본 log 엔트리와 위 과거 ingest 엔트리에 문자열 `OmniX.md`가 남아 있어, 다음 `/ingest` 스캔이 raw/OmniX.md를 "이미 처리됨"으로 오판할 수 있음. 신규 4D OmniX 박제는 **사용자가 명시 요청**해야 진행(Q0.5 예외 경로).
- 후속 정리: 과거 ingest/lint 엔트리의 OmniX 노트·source-meta 위키링크를 `OmniX(철회)` 평문으로 중립화(기록 내용은 보존, dangling link만 제거). 미해결 wikilink 0 복구.

## [2026-07-27] ingest | OmniX (4D 궤적장) — 철회 후 올바른 동명 논문 재박제
- **Q0.5 예외 경로**: log에 `OmniX.md` 문자열이 남아 스캔은 "처리됨"으로 보이나, 이는 2026-07-27 철회된 **다른 논문**(arXiv:2510.26800 파노라마)의 기록. 현재 raw는 별개 논문이고 **사용자가 명시 요청**하여 진행. 19p 전체 통독.
- **[[OmniX]]**(CASIA·Tencent Hunyuan, arXiv:2607.10840, 2026-07): any-view·any-time **feed-forward 4D 복원**. 동적 전경 모션과 정적 기하를 **명시적으로 분리**, 모션의 희소·저랭크 구조로 상위 20% **dynamic token**만 궤적 변환 기저를 예측(**SSA**) → **DTSH**의 deformable 샘플링으로 per-pixel 궤적·dynamic score 획득(토큰 선택 미분 가능). 단안/시간단절 영상쌍/이미지+영상 혼합 입력, 카메라 모션 180°까지 강건. **UE5 데이터 엔진 80K 장면·1.28M 다중뷰 영상**. dense 궤적·TAPVid-3D SOTA, depth(KITTI 0.024)·포즈(Sintel ATE 0.108) 경쟁력, 2.15s. index "Feed-forward 3D 복원(DUSt3R 계보)"에 **4D 궤적장**으로 편입.
- **핵심 교차**: [[ShapeOfMotion]]의 궤적 변환 정식화를 **명시 인용**(§3.1) → 최적화 SE(3) 모션 기저를 feed-forward 궤적장 기저로 이식. 양 노트 상호 링크로 "저차원 모션 기저"의 최적화↔feed-forward 축 형성. [[장거리-point-tracking]] 앵커에도 "반복 트래킹→dense 회귀 전환" 사례로 등재.
- cross-link: [[DUSt3R]]·[[VGGT]]·[[MONST3R]]·[[POMATO]]·[[MoRe]]·[[VGGT-Ω]] / [[ShapeOfMotion]] / 개념(타영역) [[장거리-point-tracking]]·[[Transformer]]·[[ViT]]·[[위치인코딩-positional-encoding]]·[[SfM-COLMAP]].
- source-meta에 **동명이 논문 주의 콜아웃** 명기(철회된 파노라마 OmniX와 무관함을 영구 기록).
- 잔여 평문(raw 미수집): DepthAnything3(백본)·VDPM·TraceAnything·St4RTrack·SpatialTrackerV2·π³·PAGE-4D·D4RT.
- 압축: 1401줄→노트 ~55줄(≤200·직접인용 ≤3·cross-link 타영역 ≥1). 미처리 raw 0.

## [2026-07-27] lint | all 영역 건강 진단 (OmniX 철회·재박제 후)
- 규모: research 42(MOC 1 포함)·source-meta 41·concepts 17·courses 9·system 2. 미처리 raw 0 / 미해결 wikilink 0 / ≥200줄 콘텐츠 노트 0 / cross-link <3 노트 0 / **frontmatter 필수키(area·created·sources·tags) 누락 0** / 모호 로그 비어있음.
- **모순 후보 1(상)**: [[POMATO]](2025) "TAPVid-3D 3D point tracking SOTA"(PointOdyssey·ADT·PStudio) vs [[OmniX]](2026) "TAPVid-3D 전부 SOTA"(ADT·DriveTrack·PStudio). **ADT·PStudio 두 서브셋이 겹쳐** 시점 정보 없이는 충돌로 읽힘. OmniX→POMATO 링크는 있으나 POMATO→OmniX 역참조 없음. 2026-07-26 [[BTimer]]/[[DGS-LRM]] 건과 **동일 패턴**(SOTA 주장에 시점·범위 한정어 부재).
- **고립(중)**: peer 역링크 0~1 = [[Hermes-Agent-활용-가이드북]](0, system 문서)·[[VGGT-Ω]](1)·[[VGGT-백본-생태계]](1, MOC)·[[raw-wiki-규칙]](1, 헌법)·[[블록체인]](1, 과목 허브). **[[VGGT-Ω]]는 OmniX 철회의 부작용** — 삭제된 파노라마 OmniX가 유일한 peer 인바운드("기하 인지 대조")였어서 2→1로 하락. 신규 [[OmniX]](2)는 같은 DUSt3R 계보 2026년 진전이라 연결 여지 있음.
- **데이터 갭(중)**: ① **SpatialTracker/SpatialTrackerV2** — research 5노트([[OmniX]]·[[POMATO]]·[[ShapeOfMotion]]·[[MoVieS]]·[[DGS-LRM]]) + [[장거리-point-tracking]] 앵커까지 6곳 언급, **현재 위키에서 가장 많이 인용된 미수집 연구**. ② **L4GM** 4노트([[LGM]]·[[4DGT]]·[[BTimer]]·[[DGS-LRM]]). ③ MegaSaM 3노트. 전부 raw 미수집이라 평문 유지가 원칙이나 ①②는 ingest 가치 높음.
- 진단만, 자동수정 X. 조치는 사용자 승인 후 별도.

## [2026-07-27] fix | lint 권고 3건 + 룰북 개정 (사용자 승인)
- **룰북 §E 신설(재발 방지, 상)**: [[raw-wiki-규칙]]에 **"우선권 주장 표기(SOTA·최초)"** 섹션 추가 — "최초"는 `저자 주장`+범위·기준연월 한정, "SOTA"는 **벤치마크·서브셋+연도** 명시, 선·후행 노트 **상호 링크**, 갱신 시 선행 노트에 "후속 X가 갱신" 1줄. 판정 기준(범위·시점 다르면 모순 아님 / 같은데 결과 다르면 진짜 모순→콜아웃)도 명문화. CLAUDE.md §6.5로 요약 반영. → 2026-07-26 [[BTimer]]/[[DGS-LRM]], 금일 [[POMATO]]/[[OmniX]] 두 사례의 **개별 수정이 아닌 구조적 예방**.
- **룰북 Q0.6 신설(멱등성 약점 보강)**: Q0.5에서 "이미 있음"이면 바로 skip하지 않고 **헤더 ~30줄만 읽어 제목·arXiv ID·저자·created·줄수를 대조**. 불일치(동명이 자료 교체)면 처음 보는 raw로 간주 + 기존 박제분 철회 여부 확인. 근거: 2026-07-27 OmniX 오판 사례. "파일명은 키가 아니라 힌트"로 명시. CLAUDE.md §4에도 게이트 순서(Q0→Q0.5→Q0.6) 반영.
- **모순 후보 해소(상)**: [[POMATO]] "TAPVid-3D SOTA"→**"2025년 기준 SOTA"** + "이후 [[OmniX]](2026)가 ADT·PStudio 포함 갱신" 명시 + 관련에 "후속 갱신" 항목 신설. [[OmniX]]도 **"2026년 기준 SOTA"** + 선행 POMATO와 서브셋 겹침 명시 → 신설 §E를 첫 적용.
- **고립 해소(중)**: [[VGGT-Ω]] 1→2 — [[OmniX]]에 "2026 계보 진전 대비" 추가(VGGT-Ω=**백본 축** 스케일업 vs OmniX=**출력 축** 궤적장, 상보 관계). OmniX 철회로 잃었던 인바운드를 같은 계보 신규 노트로 복구.
- **데이터 갭 보강(중)**: SpatialTracker/V2는 raw 미수집이라 페이지 신설 불가(§C 인용 원칙) → 대신 [[장거리-point-tracking]] 앵커의 해당 항목을 **박제된 5노트의 서술로 확장**([[POMATO]]·[[DGS-LRM]]·[[MoVieS]]·[[ShapeOfMotion]]·[[OmniX]] 각각이 보는 위치 + 공통 한계). raw 수집 시 **최우선 ingest 후보**로 유지.
- 재검: 미해결 wikilink 0, 미처리 raw 0, ≥200줄 노트 0, cross-link <3 노트 0, frontmatter 누락 0.

## [2026-07-31] ingest | GMD + BeyondEntropy (모호 2건 → 사용자 판정 후 박제)
- 멱등성 가드: 미처리 2건(`raw/GMD.md` 28p·`raw/BeyondEntropy.md` 30p). **둘 다 3D Vision이 아니라** 룰북 §A Q1/§B ④ **[모호]** 판정 → §D에 따라 전체 통독 전에 발췌+2옵션 제시 → 사용자 선택 후 각각 [통과]. 이후 부록·References 포함 전체 통독. 모호 사례 로그 2건 기록(룰북 §D).
- **[[Drifting-Model-원스텝생성]]** (concepts, GMD): Kaiming He 팀. 확산·flow matching이 **추론 시** 반복 갱신하는 것을 **학습 시간 pushforward 분포 진화**로 옮겨 **1-NFE** 달성. **drifting field**의 반대칭($V_{p,q}=-V_{q,p}$)이 $q=p\Rightarrow V=0$ 평형을 보장, stop-gradient 타깃으로 손실 정의(손실값=$\|V\|^2$). mean-shift식 인력/척력 + softmax 정규화 커널(InfoNCE 유사), 자기지도 피처 공간 필수(latent-MAE > MoCo·SimCLR). ImageNet 256² latent FID **1.54**·pixel **1.61** 원스텝 SOTA, Diffusion Policy 1-NFE 대체. 한계: $V\to0\Rightarrow q\to p$ 역방향 미보장.
- cross-link: [[flow-matching-생성prior]](직접 대안)·[[Transformer]]·[[ViT]]·[[DINO]] / 연구 연결 [[NeoVerse]]·[[C4G]](다단계 VDM refine을 원스텝으로 바꿀 여지 — 미검증 명시).
- **[[BeyondEntropy-ICT]]** (research, **도메인 확장**): RLVR의 엔트로피 붕괴↔폭발 딜레마를 **토큰 로짓 분포편차**로 해소. 2차 Rényi $H_2$ + **strategy purity** $\beta$ 기준 분기 이론(고확신→붕괴, 롱테일→폭발), 그룹평균과 **JS divergence** 상위 10% unique token만 갱신(Sparse-GRPO, 보상·advantage·KL 불변). Qwen2.5 0.5B~7B·7벤치서 GRPO/20-Entropy/STAPO 상회, **P@4 상승폭 > P@1**(탐색 다양성). JS > Wasserstein > KL. 한계: 1차 근사가 다토큰 결합·모멘텀 생략(저자도 "국소 진단"이라 명시).
- **도메인 확장 반영**: CLAUDE.md §1 정체성에 LLM/RL 추가 + 확장 이력 명시, index research에 "LLM/강화학습" 별도 클러스터 신설(3D 계보와 무관함을 주의로 병기). 이후 Q1 판정에서 "3D Vision 아님"만으로 반려 금지.
- **구조 신설**: `wiki/concepts/sources/` — GMD의 유일한 박제처가 concepts라 `{영역}/sources/` 관례를 concepts에도 적용(기존엔 research·courses만 보유).
- ⚠️ **raw 데이터 품질**: `raw/GMD.md`에 **null 바이트 8개**가 있어 `file`이 바이너리로 판정, `grep`이 `-a` 없이는 이 파일을 조용히 스킵함(초기 주제어 스캔이 전부 0을 반환한 원인). Read 도구는 정상. raw/ 수정 금지라 원본 유지, source-meta에 경고 기록.
- 압축: GMD 3451줄→노트 ~45줄, BeyondEntropy 2667줄→노트 ~50줄(각 ≤200·직접인용 ≤3·cross-link 타영역 ≥1). 미처리 raw 0.

## [2026-07-31] lint | all 영역 건강 진단 (GMD·BeyondEntropy ingest 후)
- 규모: research 43(MOC 1 포함)·research-sources 42·concepts 18·concepts-sources 1·courses 9·system 2. 미처리 raw 0 / 미해결 wikilink 0 / ≥200줄 0 / cross-link <3 노트 0 / frontmatter 누락 0.
- **모순 0**: §E 우선권 표기 규칙 도입 후 신규 2건 모두 SOTA 주장에 벤치마크·연도를 명시(ImageNet 256² 원스텝 SOTA / Qwen2.5 7벤치)해 충돌 없음. 규칙이 실제로 작동.
- **단방향 링크 1(중)**: [[Drifting-Model-원스텝생성]]→[[flow-matching-생성prior]]는 "**직접 대안**"으로 2곳 참조하나 **역방향 없음**. flow-matching 앵커만 읽는 독자는 대안 패러다임의 존재를 모름. §E "선·후행 노트 상호 링크" 정신과 어긋남(SOTA 주장은 아니나 같은 territory 관계).
- **고립(중)**: peer 역링크 ≤1 = [[Hermes-Agent-활용-가이드북]](0, system 문서)·[[BeyondEntropy-ICT]](1)·[[VGGT-백본-생태계]](1, MOC)·[[raw-wiki-규칙]](1, 헌법)·[[블록체인]](1, 과목 허브). **[[BeyondEntropy-ICT]]는 구조적 고립** — LLM/RL 도메인의 유일 노트라 peer가 없음(3D 노트와 계보 무관). 신규 [[Drifting-Model-원스텝생성]]은 2로 정상 안착.
- **데이터 갭(중)**: ① **SpatialTracker** 6곳(research 5 + 앵커) — 여전히 최다 인용 미수집. ② **Depth Anything** 5곳(Long-LRM·OmniX·4DGT·ShapeOfMotion·StreamSplat) — 신규 ingest로 3→5곳 증가, 여러 4D 논문의 공통 depth prior. ③ L4GM 4곳 ④ MegaSaM 3곳. ⑤ **정보이론 개념군**(KL/JS divergence·엔트로피·InfoNCE)이 이제 5노트(MoRe·MASt3R·VGGT-Ω·BeyondEntropy-ICT·Drifting)에 분산 — 도메인 확장으로 3D와 LLM을 **가로지르는** 개념이 됨.
- **모호 로그**: 첫 2건 기록됨(GMD·BeyondEntropy). 누적 패턴 판단엔 아직 표본 부족.
- 진단만, 자동수정 X. 조치는 사용자 승인 후 별도.

## [2026-08-01] fix | lint 권고 3건 조치 (사용자 승인)
- **단방향 링크 해소(중)**: [[flow-matching-생성prior]]에 "대안 패러다임" 항목 추가 → [[Drifting-Model-원스텝생성]]으로 역링크. 기존엔 Drifting→flow-matching 단방향이라 앵커만 읽는 독자가 대안의 존재를 몰랐음(§E "선·후행 상호 링크" 정신 적용).
- **정보이론 앵커 신설(중)**: concepts [[정보이론-분포거리]] — 엔트로피($H_1$·2차 Rényi $H_2$)·KL(비대칭 mode-seeking)·JS(대칭·유계)·InfoNCE의 정의와 성질 + **"같은 도구, 다른 목적" 표**(매칭 [[MASt3R]] / 자기지도·언어정렬 [[VGGT-Ω]] / 모션분리 [[MoRe]] / 탐색 [[BeyondEntropy-ICT]] / 생성 [[Drifting-Model-원스텝생성]]·[[flow-matching-생성prior]]) + 실무 선택 기준(대칭성·categorical 어휘·롱테일). 5개 노트에 양방향 링크.
- **고립 해소(중)**: [[BeyondEntropy-ICT]] 1→2. **구조적 고립**(LLM/RL 도메인 단독 노트라 peer 부재)이었으므로 억지 링크 대신 [[정보이론-분포거리]] 경유로 [[VGGT-Ω]]·[[MASt3R]]와 **수학적 간접 연결**을 명시. 도메인 확장의 다리를 개념 축으로 놓은 셈.
- index concepts에 "정보이론 (3D ↔ LLM 가로지름)" 소섹션 신설.
- 재검: 미해결 wikilink 0, 미처리 raw 0, ≥200줄 0, cross-link <3 노트 0, frontmatter 누락 0.
