---
title: VGGT-Ω (Scaling Feed-forward Reconstruction)
area: research
created: 2026-07-25
sources: [VGGT-Ω.md]
tags: [research, 3D-reconstruction, feed-forward, transformer, scaling, register-attention, dynamic, self-supervised, DUSt3R-lineage]
---

# VGGT-Ω: 피드포워드 3D 복원의 스케일링

> Jianyuan Wang, Minghao Chen, Shangzhan Zhang, Nikita Karaev, Schönberger, Labatut, Bojanowski, Vedaldi, Rupprecht, Novotny (Oxford VGG · Meta AI). *"VGGT-Ω"*, arXiv:2605.15195 (2026.05). 프로젝트: vggt-omega.github.io

**한 줄 요약**: [[VGGT]]의 직계 후속. **모델(0.2B→10B)·데이터(2K→2M seq)를 함께 키우면 3D 포인트 오차가 거듭제곱법칙처럼 일관되게 감소**함을 보인 스케일링 연구. 학습 메모리를 예측기의 ~30%로 줄이는 3가지 구조 변경(register attention·단일 dense head·pixel-shuffle) + 동적 장면 주석 파이프라인 + 자기지도 프로토콜로 15× 더 많은 데이터 학습. 정적·동적 6개 벤치 SOTA, Sintel 카메라 AUC@3° 22.5→40.0(+77%). (출처: [[2026-07-25-VGGT-Omega-논문]])

## 문제의식
- [[VGGT]] 등 feed-forward 복원이 최적화 기반(SfM·BA)을 따라잡았으나, **3D 비전에서 스케일의 역할은 미탐구**(언어 foundation model과 대조).
- 핵심 질문: "feed-forward 복원을 키울 수 있는가, 키우면 무엇을 얻는가?" → 데이터·모델 규모를 전례 없이 확장.
- 관건은 **효율**(대규모 학습을 가능케 하는 메모리 절감)과 **동적 콘텐츠 처리**(대부분의 인터넷 영상은 움직임을 포함 → 데이터 수십 배 해금).

## 세 가지 구조 변경 (학습 메모리 70%↓)
1. **Register Attention** — 프레임마다 camera token 1 + **register(scene token) 16개** 추가. global attention 층의 **25%를 register attention으로 교체**: 해당 층에선 프레임 간 정보 교환을 **register끼리만** 수행 → 이후 frame attention에서 register가 image token에 정보 재분배(bottleneck). global attention 맵이 희소하다는 관찰(Fig.3)에 근거. **-23% FLOPs·-16% backbone 메모리, 성능 저하 없음**. (전부 교체 시 FLOPs 6%까지 줄지만 성능 급락 → VGGT 수준.)
2. **단일 dense head + pixel-shuffle** — DPT의 고해상도 conv 블록(활성값 메모리 과다)을 **MLP + pixel-shuffle** 업샘플러로 대체(1/4 해상도 이상만). 단, 완전 MLP-only는 무한 범위 깊이(하늘·원거리)에서 **블록 아티팩트** → 저해상도 shallow conv는 유지(trade-off).
3. **멀티태스크 손실 유지, 헤드는 최소화** — depth용 dense head 1 + camera용 sparse head 1만. point map·track은 **손실로만 감독**(전용 head 없이 unprojection·매칭). VGGT 다중 head(0.070) 대비 근소한 손해(0.073)로 메모리 대폭 절감.

- **백본**: [[DINO|DINOv3]] 초기화(patch 16 → VGGT의 DINOv2 patch 14 대비 토큰 25%↓, 20–25% 빠름). 미동결.

## 학습 (식 1)
- $L=\lambda_{cam}L_{cam}+\lambda_{depth}L_{depth}+\lambda_{point}L_{point}+\lambda_{match}L_{match}$ ($\lambda$=5/1/0.5/0.1).
- **camera**: $\ell_1$(VGGT의 Huber보다 안정). **depth**: aleatoric uncertainty + gradient consistency + 상대 스케일. **point**: 깊이·카메라 unproject 잔차로 depth loss 재사용. **match**: 마지막 층 토큰에 positive/negative 쌍 대조(BCE).
- 카메라 head는 **단일 패스**(VGGT의 반복 refinement 제거). 4개 변종 0.2B/0.5B/1B/10B, hidden 384~4096. AdamW 240K iter(160K 지도 + 50K 자기지도 + 30K 지도), 128×H100.

## 데이터 파이프라인 (핵심 기여, §3.5)
- 공개 데이터셋 다수(Aria·Co3Dv2·DL3DV·ScanNet·TartanAir·Hypersim 등) ~3M seq. (Kubric·PointOdyssey는 **가짜 배경 깊이**로 제외.)
- **40M 인터넷 영상 주석 파이프라인**: VLM 사전필터(50% 난이도·40% 저정확 탈락) → Grounding DINO 동적 마스크 → 매칭·트래킹 앙상블(SIFT·SuperPoint+SuperGlue·ALIKED+LightGlue·VGGSfM Tracker) → VGGT 초기화 + COLMAP BA·필터 → patch MVS 깊이 → **다중뷰 일관성** → **지도 기하 필터**(XGBoost+RF+CatBoost 앙상블, 손라벨 500×2로 학습). → **0.8M seq 잔존(~1/3 동적)**. 총 **4M seq = VGGT의 15×**.
- 철학: **양보다 질** — 조금이라도 모호하면 폐기(보수적). Sintel에서 자기 주석이 MegaSaM 대비 카메라 AUC@30° 96.4 vs 62.1, 깊이 δ1.25 99.3 vs 77.2.

## 동적 복원 & 자기지도
- **동적**: motion mask·ray map·dynamic point map 없이 **깊이+카메라만** 예측(카메라 정보와 픽셀 외형 변화의 얽힘 회피). 정지 카메라가 춤추는 사람을 볼 때 큰 픽셀 모션 ≠ 카메라 모션.
- **자기지도**(§3.4): [[DINO]] 영감 teacher-student. 지도 체크포인트에서 초기화, 같은 프레임에 독립 augmentation·프레임 재배열, 순서 복원 후 student가 teacher 매칭($\ell_2$ feature + 회귀), teacher는 EMA. 18M 무라벨 영상. **효과는 소폭(OOD 일반화 위주)** — 저자도 "자기지도 복원은 미해결 문제"라 명시.

## 결과
- 정적 3(7Scenes·NRGBD·ETH3D) + 동적 3(DyCheck·Sintel·TUM-Dynamic) **전부 SOTA**, DA3·PI3·MegaSaM·[[MONST3R]] 능가.
- **Sintel**: 카메라 AUC@3° 22.5→**40.0**(+77%), AUC@30° 58.3→79.1(+35%); 깊이 δ1.25 74.1→**93.5**(+26%). **MegaSaM보다 50× 빠름**.
- **효율**: 단일 A100에서 **1000+ 프레임** 처리(VGGT 캐시 수정 후 동급, DA3는 ~750에서 OOM). register-attention-only 변종: 1000프레임 240s→**11.7s**(온디바이스용, 정확도는 VGGT급으로 하락).
- **스케일링(Fig.1)**: 데이터 10× 스텝마다 point error 0.275→0.073 단조 감소, 10B > 1B.

## register의 응용 (감독 없이 학습된 전역 정보)
- **로보틱스(VLA)**: OpenVLA-OFT 입력에 **동결된 scene token** 부착 → LIBERO 평균 성공률 97.1→**98.5**.
- **언어 정렬**: CLIP식 InfoNCE로 register-유도 임베딩 ↔ VLM 텍스트 임베딩 정렬(언어 토큰은 register만 읽음). 영상 검색 top-1 76.8%·top-3 97.0%, LLM 임베딩으로 zero-shot 전이 47.5%. → register가 **의미 정보**를 담음(platonic representation hypothesis 부합).
- **추가 통찰(§5)**: model souping으로 깊이·FoV 정보가 **frame-attention FFN**에 저장됨 확인. 감독 없이 **모션 인지 표현** 창발(PCA+k-means가 움직이는 무용수 분리, 얕은 층일수록 선명).

## 관련
- **계보(research)**: [[VGGT]]의 직계 후속(같은 Oxford·Meta 팀) — register attention·단일 head·15× 데이터로 스케일업. [[DUSt3R]]·[[MASt3R]] 뿌리, [[MONST3R]] 동적 분기를 통합적으로 능가.
- **VGGT 파생과 대조**: [[MoRe]]·[[MoVieS]]가 VGGT 위에 모션 분리·splatter를 얹은 것과 달리, VGGT-Ω는 **백본 자체를 키움**(prediction head 단순화, "backbone 품질이 본질"이라는 설계 철학).
- **개념(다른 영역)**: [[DINO]] — DINOv3 백본·자기지도 teacher-student의 뿌리 / [[Transformer]]·[[ViT]] — alternating attention·register token의 토대 / [[정보이론-분포거리]] — 매칭 손실의 대조 목적과 register↔언어 **CLIP식 InfoNCE** 정렬이 속한 도구 묶음.
- **응용 연결**: [[3D-Gaussian-Splatting]]·[[NeRF]] — feed-forward 복원은 BA의 고정밀 초기화·프록시로 이들 최적화 렌더링을 보완(경쟁 아님).
- **출처 메타**: [[2026-07-25-VGGT-Omega-논문]]
