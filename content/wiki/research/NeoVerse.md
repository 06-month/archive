---
title: NeoVerse (in-the-wild 단안 영상 4D 세계모델)
area: research
created: 2026-07-25
sources: [NeoVerse.md]
tags: [research, 4D-world-model, feed-forward, 4DGS, video-generation, VGGT, bidirectional-motion, in-the-wild, dynamic]
---

# NeoVerse: in-the-wild 단안 영상으로 강화하는 4D 세계모델

> Yuxue Yang, Lue Fan, Ziqi Shi, Junran Peng, Feng Wang, Zhaoxiang Zhang (CASIA · CreateAI). *"NeoVerse: Enhancing 4D World Model with in-the-wild Monocular Videos"*, arXiv:2601.00393 (2026). 프로젝트: neoverse-4d.github.io

**한 줄 요약**: **복원(reconstruction)+생성(generation) 하이브리드** 4D 세계모델. [[VGGT]]를 "Gaussianize"한 **pose-free feed-forward 4DGS 복원** + **온라인 degradation 시뮬레이션**으로, 값싸고 다양한 **in-the-wild 단안 영상(최대 1M clip)**까지 학습 파이프라인을 확장. 4D 복원·novel-trajectory 영상 생성·편집·안정화·초해상 등 다재다능, 복원·생성 벤치 모두 SOTA. (출처: [[2026-07-25-NeoVerse-논문]])

## 문제의식
- 기존 4D 세계모델의 **확장성 한계** 두 가지: (1) **데이터** — SynCamMaster·ReCamMaster 등은 촬영 어려운 **멀티뷰 동적 영상** 요구 → 일반화 제약. (2) **학습** — TrajectoryCrafter·FreeSim 등은 무거운 **오프라인 전처리**(video depth 추정·사전 GS 복원·3D 검출) 요구 → 계산·저장 부담, 온라인 augmentation 불가.
- NeoVerse 철학: **전 파이프라인을 in-the-wild 단안 영상에 스케일러블하게** → 4D 세계모델의 일반화·범용성 강화.

## Pose-free feed-forward 4DGS 복원 (§3.1)
- **Gaussianizing VGGT**: [[VGGT]] 백본([[DINO|DINOv2]] 피처 + Alternating-Attention)으로 frame feature 추출 → 4D 가우시안 파라미터 $(\mu,\alpha,r,s,sh,\tau,v^\pm,\omega^\pm)$ 예측. 위치는 depth·카메라 back-projection, 정적 속성은 frame feature, 동적 속성은 motion feature에서.
- **양방향 모션 모델링(핵심)**: [[4DGT]]의 단방향과 달리, frame feature를 시간축으로 슬라이스해 **forward($t{\to}t{+}1$)·backward($t{\to}t{-}1$) cross-attention**으로 선형·각속도 예측. 두 연속 시점 사이 **가우시안 보간**을 가능케 함(식 3~5, 짧은 구간 선형 모션 가정).
- **sparse keyframe 복원**: 긴 영상서 K개 키프레임만 복원 입력, 렌더링은 전 N프레임(렌더가 네트워크보다 훨씬 저렴). 비키프레임은 양방향 모션으로 보간 → 학습 효율.

## 복원-가이드 영상 생성 (§3.2, 스케일러블 학습의 핵심)
- **온라인 단안 degradation 시뮬레이션** — 단안 영상만으로 "저품질 novel-view 렌더 ↔ GT 프레임" 학습쌍 생성:
  - (1) **visibility-based Gaussian culling**: 랜덤 변환한 novel 궤적에서 가려지는 가우시안 제거 → **occlusion** 패턴.
  - (2) **average geometry filter**: 렌더 depth에 평균 필터 → 깊이 불연속 edge의 **flying pixel**·**distortion** 패턴(큰 커널일수록 넓은 왜곡).
- 이 degraded 렌더(RGB·depth·mask·Plücker)를 **control branch**로 생성모델에 조건 주입. 생성모델은 **Wan-T2V 14B + Rectified Flow**, 학습 시 **control branch만 학습·비디오 모델 동결**(효율 + distillation LoRA 가속 호환).
- **global motion tracking**: 순간속도로 못 잡는 "정적↔동적 혼재" 객체를, 전 프레임 투영·가시성 가중 최대속도로 정적/동적 분리 → 정적은 전 프레임, 동적은 인접 프레임만 aggregate(모션 drift 방지).

## 학습·결과
- 복원: 정적·동적 3D 데이터셋 18종 + 자체 1M 단안 영상. multi-task loss(rgb·camera·depth·motion·regular). 생성: 단안 영상만. 32×A800.
- **정적 복원**(VRNeRF·ScanNet++): [[NoPoSplat]]·Flare·AnySplat 능가 SOTA.
- **동적 복원**(ADT·DyCheck): [[MONST3R]]·[[4DGT]](포즈 입력) 능가 SOTA.
- **생성**(VBench): TrajectoryCrafter·ReCamMaster 대비 생성품질·궤적 제어 동시 우위 + 훨씬 빠름(11키프레임 20s). degradation 시뮬이 ghosting 억제, 미관측 영역 "맥락 기반 상상".
- **응용**: 3D tracking·video editing(SAM2+텍스트 조건)·stabilization·super-resolution·image-to-world·single→multi-view.

## 한계
- 올바른 3D 정보가 있는 데이터 필요 → **2D 만화 등엔 부적용**(잘못된 3D 프로파일). 자체 데이터(1M)가 아직 크지 않음. 비디오 확산 특성상 텍스트 렌더 실패.

## 관련
- **백본·계보(research)**: [[VGGT]] — "Gaussianize"의 토대(백본 + camera·depth loss). feed-forward GS 복원(LRM 계보) 4D 후계로, [[4DGT]](단방향 모션 대조)·[[MoVieS]]·[[StreamSplat]]·[[C4G]]와 peer.
- **pose-free 대조(research)**: [[NoPoSplat]] — 정적 pose-free 복원 baseline(NeoVerse가 능가) · [[MONST3R]] — 동적 복원 baseline.
- **표현(research)**: [[3D-Gaussian-Splatting]] — 4D 가우시안(+life span·velocity)의 뿌리.
- **개념(다른 영역)**: [[DINO]] — VGGT 내 DINOv2 피처 / [[Transformer]]·[[ViT]] — Alternating-Attention·cross-attention 모션 인코딩의 토대.
- **생성·online 이웃(research)**: [[OmniX]] — 생성 prior 재활용 peer(파노라마 생성 vs 영상 생성) / [[OR2-온라인동적GS]] — online 동적 재구성의 정적 영역 시간 일관성 문제(NeoVerse의 sparse-keyframe 렌더 조건과 상보).
- **개념(다른 영역)**: [[flow-matching-생성prior]] — rectified flow·video diffusion(Wan)·control branch·LoRA의 개념 앵커.
- **출처 메타**: [[2026-07-25-NeoVerse-논문]]
