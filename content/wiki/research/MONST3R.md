---
title: MonST3R (Motion DUSt3R)
area: research
created: 2026-06-16
sources: [MONST3R.md]
tags: [research, dynamic-scene, video-depth, camera-pose, point-map, 4D-reconstruction, DUSt3R-lineage, ICLR2025]
---

# MonST3R: Geometry Estimation in the Presence of Motion

> Zhang, Herrmann, Hur, Jampani, Darrell, Cole, Sun, Yang (UC Berkeley · Google DeepMind · Stability AI · UC Merced). *"MonST3R: A Simple Approach for Estimating Geometry in the Presence of Motion"*, ICLR 2025. arXiv:2410.03825. 프로젝트: monst3r-project.github.io

**한 줄 요약**: [[DUSt3R]]의 **포인트맵 표현을 동적 영상으로 확장**한 geometry-first 접근. **timestep마다 포인트맵을 추정**하면 동적 장면도 같은 카메라 좌표계로 표현 가능하다는 통찰. 명시적 모션 표현 없이, 소규모 동적 데이터 **fine-tuning**만으로 동영상 깊이·카메라 포즈를 예측하며 주로 feed-forward 방식으로 4D 복원까지. (출처: [[2026-06-16-MONST3R-논문]])

## 문제의식
- 동적 장면 기하 추정은 보통 깊이·광류·궤적 등 **하위문제 분해 + 전역 최적화/다단계 파이프라인** → 느리고 brittle, 단계마다 오류 누적.
- 모션은 주석 데이터 부족으로 직접 supervise 어려움 → **기하(geometry)만으로** 동적 장면을 표현하자(DUSt3R 영감).
- **핵심 통찰**: 포인트맵을 timestep별로 추정하고 같은 카메라 좌표계에 두면, 동적 물체는 움직임에 따라 **여러 위치에 나타나는 점군**으로 자연 표현됨. 정적 요소 기준으로 pairwise 정렬 → DUSt3R의 동적 일반화.

## DUSt3R의 동적 실패 (Fig. 2) — 동기
- **Issue 1**: 정적 장면만 학습 → 움직이는 **전경에 맞춰 정렬**, 정적 배경을 어긋나게 함.
- **Issue 2**: 학습 데이터가 건물·배경 위주 → **전경 물체 깊이를 잘못** 추정(배경으로 밀어냄).
- 둘 다 train/test 도메인 불일치 → **재학습으로 해결 가능**. 단, 동적·포즈·깊이 동기 데이터가 **희소**한 게 난관(COLMAP은 복잡 궤적·고동적 장면서 pseudo-GT조차 어려움).

## 동적 학습 (§3.2)
- 단일 이미지 $I_t$ → 포인트맵 $X_t\in\mathbb R^{H\times W\times3}$. 쌍 $(I_t,I_{t'})$ → $X^{t;t\,t'}, X^{t';t\,t'}$ + confidence. **각 포인트맵이 단일 시점(time)에 대응**하는 게 DUSt3R와의 핵심 차이.
- **데이터(Tab.1)**: 합성 3종 PointOdyssey(동적·관절형, 가중↑)·TartanAir(다양성 but 정적)·Spring + 실사 Waymo(LiDAR, 특화 도메인 가중↓). 비대칭 샘플링.
- **학습 전략(데이터 효율)**: ① **인코더 freeze, 디코더+예측헤드만** fine-tune ([[DUSt3R|CroCo]] 기하지식 보존) ② temporal stride 1–9 쌍 샘플링(stride 9 확률 ×2, 큰 모션 강조) ③ **FoV augmentation**(center crop·다양 스케일 → intrinsic 일반화). DUSt3R와 동일 confidence-aware regression loss. 25 epoch, 2×RTX6000, 1일.

## 다운스트림 최적화 (§3.3–3.4)
- **Intrinsics**: 포인트맵이 자기 카메라 프레임 $X^{t;t\,t'}$ 이라 DUSt3R 가정 유효 → **focal length $f^t$만** 풀어 $K^t$.
- **상대 포즈**: 동적 물체가 epipolar·Procrustes 가정을 깨므로, **같은 뷰 내 per-pixel 2D-3D 대응 + PnP**(식 1) + **RANSAC**(confidence mask 임계 $\alpha$로 valid 대응 선별).
- **Confident static region (식 2,3)**: 카메라 모션만으로 유도한 흐름 $F^{t\to t'}_{cam}$ 과 off-the-shelf 광류 $F^{t\to t'}_{est}$ 를 비교, smooth-L1 임계로 **정적 마스크 $S$** 산출.
- **동적 전역 점군 + 카메라 포즈 (Fig.3, 식 4–7)**: DUSt3R의 all-pairs 대신 **sliding temporal window**(+strided sampling)로 연산 절감. 전역 포인트맵을 카메라 파라미터 $P^t,K^t,D^t$ 로 재매개화 후 3항 최적화:
  - $L_{align}$: DUSt3R 정렬항(pairwise를 세계좌표로).
  - $L_{smooth}$: **카메라 궤적 평활**(회전 Frobenius + 평행이동 L2 변화 페널티).
  - $L_{flow}$: **흐름 투영 일관성** — 정적 영역서 전역 카메라 유도 흐름 ≈ 추정 광류.
  - $\hat X=\arg\min L_{align}+w_{smooth}L_{smooth}+w_{flow}L_{flow}$ (둘 다 0.01). flow loss는 포즈가 대략 정렬됐을 때만 활성.
- **Video depth**: 전역 포인트맵이 이미 per-frame $\hat D$ 로 매개화 → **그냥 $\hat D$ 반환**하면 시간 일관 동영상 깊이.

## 결과
- **동영상 깊이**(Sintel·Bonn·KITTI, Tab.2): joint depth&pose 중 최고, 전용 기법 DepthCrafter(동시기)도 능가. scale-only 정규화에선 격차 더 큼.
- **단일프레임 깊이**(Tab.3): 동적 fine-tune 후에도 원 DUSt3R와 대등.
- **카메라 포즈**(Sintel·TUM-dyn·ScanNet, Tab.4): joint 기법 중 최고, **GT intrinsic 없이도** pose-only 기법(DROID-SLAM·DPVO·LEAP-VO)에 경쟁적. 정적 ScanNet서 DUSt3R 능가(설계 효과).
- **Ablation(Tab.5)**: 4데이터셋 모두 기여 / **디코더+헤드 fine-tune이 full·head-only보다 우수** / 3손실이 깊이 손해 거의 없이 포즈 향상.
- **Fully feed-forward(부록 C)**: 모든 프레임을 anchor 프레임에 정렬 → RTX4090 **~40 FPS** 실시간 스트리밍 가능성. 60프레임 영상 추론 ~30s(전역 최적화 포함 시 +1분).

## 한계
- 동적 intrinsic은 이론상 가능하나 실제론 hyperparameter/수동 제약 필요. 작은 sliding window라 **장기 occlusion 취약**. OOD 입력(개활지 등) 취약 → 데이터셋 확장이 관건.

## 관련
- **직접 기반(research)**: [[DUSt3R]] — 포인트맵 표현·정렬손실·CroCo 인코더를 **그대로 시작점**으로 fine-tune. MonST3R = "Motion DUSt3R".
- **정적 대조**: [[VGGT]] — 같은 pointmap 직접회귀 패러다임이나, VGGT는 정적 다중뷰를 단일 트랜스포머로 공동예측. MonST3R는 **동적 영상 + 경량 전역 최적화** 특화. 상호 보완.
- **개념(다른 영역)**: [[ViT]] — DUSt3R/MonST3R 백본 / [[SfM-COLMAP]] — 동적 장면서 실패하는 전통 SfM(MonST3R의 동기·대조군).
- **4D/응용 연결**: [[3D-Gaussian-Splatting]]·[[Relaxed-Rigidity-동적GS]] — MonST3R 추정치는 4D GS(deformation field) 최적화의 초기화/중간신호로 직교 활용 가능.
- **출처 메타**: [[2026-06-16-MONST3R-논문]]
