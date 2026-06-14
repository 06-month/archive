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
- 생성: research [[3D-Gaussian-Splatting]] + source [[2026-06-13-3DGS-논문]], concepts [[방사장-볼륨렌더링]]·[[구면조화함수-SH]]
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
- research 일괄 ingest 완료: 4논문(NeRF·3DGS·lighthouseGS·동적GS) + concepts 3(방사장·SH·위치인코딩). 미처리 raw 0(Zotero 2건 제외).

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
