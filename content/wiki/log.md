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
