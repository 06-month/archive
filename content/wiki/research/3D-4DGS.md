---
title: 3D-4DGS (Hybrid 3D-4D Gaussian Splatting)
area: research
created: 2026-06-18
sources: [3D-4DGS.md]
tags: [research, 4DGS, dynamic-scene, novel-view-synthesis, hybrid-representation, fast-training]
---

# 3D-4DGS: Hybrid 3D-4D Gaussian Splatting for Fast Dynamic Scene Representation

> Oh, Lee, Jeon, Park (Sungkyunkwan Univ · Yonsei Univ). *"Hybrid 3D-4D Gaussian Splatting for Fast Dynamic Scene Representation"*, arXiv:2505.13215 (2025). ohsngjun.github.io/3D-4DGS/

**한 줄 요약**: 동적 장면을 **정적 영역은 3D 가우시안·동적 영역만 4D 가우시안**으로 적응적으로 나눠 표현하는 하이브리드 4DGS. 전부 4D로 시작해 **시간축 scale이 큰(=정적) 가우시안을 반복적으로 3D로 변환** → 중복 시간 파라미터 제거로 4DGS 대비 **3~5× 빠른 학습(12분)**·메모리 절감하면서 화질 유지. (출처: [[2026-06-18-3D-4DGS-논문]])

## 문제의식
- 직접 4D 최적화 방식(**4DGS**, Yang et al.)은 전체 spatio-temporal volume을 4D 가우시안으로 표현 → 고화질이나 메모리·연산 과부하. 특히 **정적 영역에도 4D 가우시안 다수 할당**이 비효율(이론상 시간축 scale을 크게 주면 되나 실제로는 대부분 작은 temporal scale을 가짐, Fig. 2).
- 3D-4DGS: 시간 불변 영역을 3D로 격하해 **진짜 동적인 곳에만 4D**를 집중.

## 핵심: 정적/동적 식별 + 변환 (§4)
- **식별(§4.1)**: 각 가우시안의 **시간축 scale** $\exp(s_{t,i})$ 가 임계 $\tau$ 초과면 **정적**으로 분류. flow 분석 없이 4D 좌표계의 time-axis scale만으로 판정. $\tau$ 는 학습된 4DGS의 temporal scale 분포의 "valley"에서 선택(N3V $\tau$=3).
- **반복 분류**: 일회성 전처리가 아니라 **매 densification 단계마다** 재판정 — 초기엔 4D였다가 시간축으로 커지면 3D로 전환. 최적화 내내 정적/동적을 적응 분리.
- **4D→3D 변환(§4.2)**: 4D 가우시안 $(\mu_x,\mu_t)$ 에서 **시간 성분 $\mu_t$ 폐기**, 공간 $\mu_x$ 유지. $4\times4$ 회전 $R_{4D}$ 의 좌상단 $3\times3$ → 쿼터니언 $q_{3D}$ 추출(이상적 정적은 block-diagonal). opacity·[[구면조화함수-SH|SH]] 색은 시간 무관이라 그대로. 변환 결과 = $(\mu_x, q_{3D}, s_x,s_y,s_z, \sigma, SH)$ — 순수 3DGS.

## 최적화·렌더링 (§4.3)
- **2단계**: 짧은 full-4DGS warmup(≤500 iter)으로 안정화 → 정적/동적 분리 → 3D·4D 그룹을 **각각 별도 densify/prune**(100 iter마다).
- **가속 원리**: 원 4DGS는 매 iter 소수 4D 가우시안만 갱신(나머지 cull)되나, 3D-4DGS는 정적 3D를 **매 iter 갱신** → 훨씬 빠른 수렴(10초 장면 ~6K iter vs 4DGS 20~30K).
- **opacity reset 제거**: 정적용 floater 제거 기법이나 동적 최적화를 교란(학습된 모션 cue 지움)해 폐기 → reset-free 연속 최적화로 안정. 하이브리드라 가우시안 수가 적어 opacity saturation도 완화.
- **통합 CUDA rasterization**(Alg. 1): 4D를 시각 $t$ 에서 slice해 transient 3D 생성 → 3D·4D 전부 한 리스트로 모아 tile·depth 키 정렬 → back-to-front alpha compositing. 3DGS+Taming-3DGS 백워드 기반.

## 결과
- **N3V**: 평균 PSNR **32.25 dB**, 학습 **11분 53초**(4DGS 5.5h 대비), **208 FPS**, 273MB. Ablation Table 4: 4DGS는 4D 가우시안 3.3M개 → 3D-4DGS는 4D 843K + 3D 230K로 대폭 감소하며 화질↑.
- **40초 장기 시퀀스**: 2위 PSNR(29.2)·최저 LPIPS(0.1173), **52분**(타 기법 대비 order-of-magnitude 빠름).
- **Technicolor**(sparse COLMAP): 33.22 PSNR, 29분(4DGS 4h+, [[Ex4DGS]] 1h5m 대비 절반↓).
- **Ablation**: $\tau$=3.0 균형(낮으면 동적을 정적에 병합, 높으면 4D 잔류·느림). opacity reset이 동적서 flicker·PSNR 저하 유발. 공간 분포 시각화(Fig. 7): 4DGS는 정적 영역에 4D 가우시안 과밀, 3D-4DGS는 균등 분포.

## 한계
- **휴리스틱 scale 임계** → 학습기반·데이터기반으로 개선 여지. 전용 4D densification 전략으로 추가 중복 감소 가능.

## 관련
- **직접 기반/대조**: 직접 4D 최적화 **4DGS**(Yang et al., 4D rotor)를 정적/동적 하이브리드로 개선(같은 코드베이스). deformation-field 계열(4DGaussians·4D-RotorGS·STG)과 함께 동적 GS 패러다임.
- **동적 GS peer(research)**: [[Ex4DGS]] — **직접 비교 baseline**(둘 다 최적화 기반 동적 4DGS; Ex4DGS는 키프레임 보간, 3D-4DGS는 시간축 scale 하이브리드. 3D-4DGS가 더 빠름) / [[Relaxed-Rigidity-동적GS]] — 모션 정규화 plug-in 동적 GS.
- **기반(다른 영역 연결)**: [[3D-Gaussian-Splatting]] — 정적 3DGS 원본을 시공간 하이브리드로 / [[NeRF]] — implicit 동적(D-NeRF·K-Planes·HexPlane) 대조.
- **개념(다른 영역)**: [[Radiance Field-Volume Rendering]] — alpha compositing / [[구면조화함수-SH]] — 시점의존 색(변환 시 보존) / [[SfM-COLMAP]] — 초기화.
- **대조(feed-forward 4D)**: [[4DGT]]·[[DGS-LRM]]·[[MoVieS]]·[[StreamSplat]] — feed-forward(초 단위) vs 3D-4DGS의 per-scene 최적화(분 단위 고화질).
- **출처 메타**: [[2026-06-18-3D-4DGS-논문]]
