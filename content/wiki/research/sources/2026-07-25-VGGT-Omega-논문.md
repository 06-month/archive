---
title: 2026-07-25 VGGT-Ω 논문 (Wang et al. Oxford VGG · Meta AI 2026)
area: research
created: 2026-07-25
sources: [VGGT-Ω.md]
tags: [research, feed-forward, 3D-reconstruction, scaling, source, paper]
---

# VGGT-Ω 논문 (출처 메타)

- **원본**: `raw/VGGT-Ω.md` (3811줄, PDF 추출본 28p, 이미지 `raw/assets/VGGT-Ω/`)
- **서지**: Jianyuan Wang, Minghao Chen, Shangzhan Zhang, Nikita Karaev, Johannes Schönberger, Patrick Labatut, Piotr Bojanowski, Andrea Vedaldi, Christian Rupprecht, David Novotny. *VGGT-Ω*. arXiv:2605.15195v1 (2026.05.14). (Oxford VGG · Meta AI)
- **진입 판정**: [통과] / **영역**: research (Feed-forward 3D 복원 — [[VGGT]] 직계 후속)
- **특이사항**: 28p 전체 통독 — 본문(§1~7) + References + Supplement A~C(학습·아키텍처 상세·positive/negative 쌍 구성·VLM 프롬프트·주석 필터 기준·언어 정렬 절차·데이터 품질 실패모드·한계) 포함.

## 핵심 takeaway
1. **스케일링 법칙 실증**: 모델 0.2B→10B, 데이터 2K→2M seq → 3D point error 거듭제곱법칙처럼 감소(Fig.1). feed-forward 복원도 언어처럼 scale-up 유효. → [[VGGT-Ω]]
2. **효율 3종**: register attention(global 25% 대체, -23% FLOPs) + 단일 dense head + pixel-shuffle → 학습 메모리 70%↓(예측기의 ~30%) → 15× 데이터 학습 가능.
3. **동적 해금**: 깊이+카메라만 예측(motion mask·ray map 없이), 40M 인터넷 영상 주석 파이프라인(VLM·Grounding DINO·COLMAP·앙상블 필터) → 0.8M seq(~1/3 동적), 총 4M.
4. **register 재활용**: 감독 없이 학습된 scene token이 VLA(LIBERO 97.1→98.5)·언어 정렬(top-1 76.8%)에 유용 → 복원이 공간이해 proxy task.
5. Sintel 카메라 AUC@3° 22.5→40.0(+77%), MegaSaM 대비 50×↑, 단일 A100 1000+ 프레임.

## 후속 질문
- register attention(정보 병목) vs FastVGGT/sparse attention([[VGGT]] 가속 계열) — 다중뷰 효율화 3계열의 정확도·속도 trade-off?
- 자기지도(teacher-student)가 벤치 이득이 소폭인 이유 — 정적엔 되는 E-RayZer식이 동적에서 실패하는 근본 원인은?
- backbone 스케일업(VGGT-Ω) vs head 모듈 추가([[MoRe]]·[[MoVieS]]) — 동적·트래킹 성능의 한계 효용?
- 4M seq 주석 파이프라인의 "질>양" 보수적 필터링이 실제로 노이즈 memorization(§B: humans-in-walls·doming) 실패모드를 얼마나 줄이나?
