---
title: POMATO (Pointmap Matching + Temporal Motion)
area: research
created: 2026-06-16
sources: [POMATO.md]
tags: [research, dynamic-scene, point-tracking, pointmap-matching, video-depth, camera-pose, DUSt3R-lineage]
---

# POMATO: Marrying Pointmap Matching with Temporal Motions

> Zhang, Ge, Tian, Xu, Chen, Lv, Shen (NTU Singapore · Zhejiang Univ · Univ. of Adelaide). *"POMATO: Marrying POintmap MAtching with Temporal mOtion for Dynamic 3D Reconstruction"*, arXiv:2504.05692 (2025). 코드: github.com/wyddmw/POMATO

**한 줄 요약**: [[DUSt3R]] 포인트맵의 **동적 영역 대응 모호성**을 **명시적 pointmap matching 헤드(Head3)** 로 풀고, **temporal motion module** 로 프레임 간 스케일 일관성을 강화한 통합 동적 3D 복원 프레임워크. video depth·**3D point tracking**·pose를 단일 네트워크로. [[MONST3R]] 체크포인트에서 초기화. (출처: [[2026-06-16-POMATO-논문]])

## 문제의식
- DUSt3R 포인트맵은 **정적 매칭만** 유효(Fig. 2): 정적 영역은 동일 픽셀이 같은 3D 좌표 → 정확한 매칭. 하지만 **움직이는 영역**은 대응 픽셀의 3D 좌표가 뷰마다 불일치 → 모호한 3D 매칭.
- 기존 동적 기법은 optical flow·2D tracking 등 **별도 보조 모듈**을 붙여 도메인 갭·누적 오차. 기하 추정과 매칭을 **하나의 네트워크로 통합**하는 것이 미해결 과제.

## 핵심 ① Pointmap Matching 헤드 (Head3, §3.2)
- DUSt3R 2-디코더 구조에 **세 번째 회귀 헤드 Head3**(Head1·2와 동일 구조)를 Head2와 병렬 추가.
- $I_2$ 의 각 픽셀에 대해 **$I_1$의 대응 픽셀의 3D 좌표**를 첫 이미지 좌표계로 예측: $X^{2,1}_m(x_2,y_2)=X^{1,1}(x_1,y_1)$. 즉 rigid 변환 $X^{2,1}$ 와 달리 **명시적 대응**을 표현.
- iterative cross-attention 디코더 토큰에 매칭 정보가 풍부히 보존된다는 통찰. GT는 2D tracking 데이터셋에서 식 2로 구성. 3D 회귀 손실 $L_m$ + 매칭 confidence $L_{mconf}$.
- 1단계 손실 = DUSt3R 손실 + $L_m$ + $L_{mconf}$ (인코더 freeze).

## 핵심 ② Dynamic Mask (§3.3) — 보조모듈 없이
- $X^{j,i}$(rigid)와 $X^{j,i}_m$(매칭)의 차이로 직접 산출: $D^{j,i}=\lVert X^{j,i}_m-X^{j,i}\rVert>\alpha$, $\alpha=3\times\text{median}(\cdot)$. optical flow 모델 불필요 → 계산비용·도메인 갭 제거.
- 이 명시적 마스크를 전역 정렬에 넣어 움직이는 물체 간섭 최소화. ([[MONST3R]]가 optical flow로 만든 정적 마스크를 **포인트맵 매칭 자체로** 대체)

## 핵심 ③ Temporal Motion Module (§3.4)
- vanilla DPT 헤드에 transformer 기반 모션 모듈 삽입 → **"temporal DPT head"**. 디코더 토큰 $G\in\mathbb R^{B,T,N,C}$ 에서 토큰 차원을 batch에 합치고 **시간축 $T$ 자기-attention** 2블록 적용(저해상도 피처에만, 비용 절감).
- 자기지도 autoregressive(이전 프레임 차단)와 달리 **전 프레임 간 포괄적 상호작용**. 스케일 일관성 강화.

## 학습·추론
- **2단계**: 1단계 pairwise(기하·매칭 기초), 2단계 sequential video + 모션 모듈(Decoder1·2 freeze). 백본 = DUSt3R(ViT-L 인코더 + ViT-B 디코더), **MonST3R 체크포인트로 초기화**, Head3는 Head2 가중치 복사. 10 epoch, 4×A100, window $T=12$.
- **유연한 입력 구성(Fig. 5)**: task별 stereo 쌍 다르게 — 3D tracking(키프레임=첫 프레임), video depth(동일 쌍 $(I_t,I_t)$), 3D recon(키프레임=마지막 프레임). 각 task에 temporal consistency 손실 $L_t$. >T프레임은 overlap 4의 sliding window.
- **feed-forward**: 전역 정렬 같은 후처리 생략 가능. 6프레임 288×512를 4070 GPU서 **0.7s** (MonST3R 5.8s 대비).

## 결과
- **3D point tracking**(TAPVid-3D: PointOdyssey·ADT·PStudio, APD): SOTA. MonST3R 대비 평균 APD **+23.3%(12프레임)/+21.4%(24프레임)**. GT intrinsic 쓰는 SpatialTracker도 능가.
- **video depth**(Sintel·Bonn·KITTI): GA 기반 MonST3R와 대등, KITTI는 능가. 온라인 CUT3R 일관 능가.
- **카메라 포즈**(TUM·Bonn): 전반 SOTA, RPE-rot에서 MonST3R 대비 **TUM 55.4%·Bonn 13.3%** 개선.
- **Ablation**: 모션 모듈이 큰 향상(window 6→12 추가 향상). Head3 제거 시 in-the-wild 큰 모션·시점변화에서 포즈·기하 열화, tracking APD 급락(Tab. 5).

## 한계
- 학습은 합성 데이터셋 전용(PointOdyssey·TartanAir·DynamicReplica·ParallelDomain4D·Carla). 실내 평가셋은 모션·시점변화 작아 Head3 ATE 개선 modest. 향후 데이터 스케일업 계획.

## 관련
- **직접 기반(research)**: [[DUSt3R]] — 포인트맵·2-디코더 구조·confidence 손실 계승 / [[MONST3R]] — **초기화 체크포인트**이자 직접 비교 대상(optical flow 정적마스크를 pointmap matching으로 대체).
- **동적 peer**: [[MoRe]] — 같은 동적 4D 복원이나 MoRe는 VGGT 기반 attention-forcing, POMATO는 DUSt3R 기반 매칭 헤드. / [[VGGT]] — 정적 다중뷰 계보 형제.
- **개념(다른 영역)**: [[ViT]] — weight-sharing 인코더 / [[SfM-COLMAP]] — 대체하는 전통 매칭+삼각측량.
- **응용 연결**: [[NeRF]]·[[3D-Gaussian-Splatting]] — 동적 장면 복원의 Radiance Field 배경(Shape of Motion 등 4D GS와 대비).
- **출처 메타**: [[2026-06-16-POMATO-논문]]
