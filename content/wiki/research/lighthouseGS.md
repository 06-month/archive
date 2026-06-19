---
title: LighthouseGS (실내 파노라마 모바일 3DGS)
area: research
created: 2026-06-13
sources: [lighthouseGS.md]
tags: [research, 3DGS, indoor, panorama, mobile-capture, SfM-free, novel-view-synthesis]
---

# LighthouseGS — 실내 구조 인식 3DGS (파노라마형 모바일 캡처)

> Han, Jang, Kim, Surh, Kwak, Ha, Joo (UNIST·Bucketplace). *"LighthouseGS: Indoor Structure-aware 3D Gaussian Splatting for Panorama-Style Mobile Captures"*, arXiv:2507.06109v2 (2026).

**한 줄 요약**: 비전문가가 **제자리에서 폰을 돌리는 파노라마형 모션**(등대처럼)만으로 찍은 실내 영상에서, **평면 구조 사전지식**으로 [[3D-Gaussian-Splatting|3DGS]]를 초기화·정규화해 — SfM이 실패하는 조건에서도 사실적 NVS를 달성한 **실용형** 프레임워크. (출처: [[2026-06-13-LighthouseGS-논문]])

## 문제의식
- 일반 사용자의 자연스러운 캡처 = **파노라마형 모션**(회전 위주, 좁은 baseline). 하지만 이 조건 + **무텍스처 실내**에서는 [[3D-Gaussian-Splatting|3DGS]] 초기화에 필수인 **SfM(COLMAP)이 카메라 포즈·3D점 추정에 실패**.
- 멀티카메라 리그·360° 카메라는 비싸고, 기존 모바일 방법은 수백 장 밀집 촬영 필요 → 비실용적.
- → **거친 사전지식**(ARKit 포즈 + 단안 깊이 추정)을 **평면 구조**와 결합해 안정적으로 초기화하자.

## 파이프라인 (3 구성요소)
![[raw/assets/lighthouseGS/extracted-images/page-001-image-002.png]]

### ① Plane Scaffold Assembly (초기화) — §3.1
COLMAP 대신 평면 정렬된 dense 3D점 + 법선 $\mathcal{S}=(\mathcal{X}_T,\mathcal{N}_T)$ 생성. 단안 깊이의 **스케일 모호성**을 2단계로 해소:
- **Image-wise global alignment**: 새 깊이맵을 affine $\bar D_t=\alpha_t D_t+\beta_t$ (per-view 스케일·시프트)로 전역점에 2D 정합.
- **Plane-wise local alignment**: 깊이+법선에 **mean-shift 군집화**로 평면 분할 → 평면별 $(\gamma_p,\delta_p)$ 로 국소 일관성 확보 → back-projection·merge.

### ② Plane-aware Stable Optimization — §3.2
- **Plane-guided init**: 가우시안을 법선 방향 축 스케일을 **압축**해 평면에 붙은 얇은(flat) 형태로 초기화.
- **Stable Pruning** (핵심): 기존 3DGS는 무텍스처 영역의 oversized 가우시안을 제거 → 구멍·아티팩트. LighthouseGS는 **불투명도 > 0.5** 인 큰 가우시안을 **유지** → 무텍스처 영역 기하 안정·floater 제거.
- **평면 정규화 손실 4종**: 각도 $L_{cos}=1-\cos(\hat N,N)$ · 평탄 $L_{flat}=\|\min(s_1,s_2,s_3)\|_1$ · 법선 평활 $L_{smooth}$(TV) · 깊이-법선 일관성 $L_{d2n}$(3D 위치 기울기 ⊥ 법선).

### ③ Geometric & Photometric Correction — §3.3
- **Residual Pose Refinement**: 포즈를 직접 고치지 않고 잔차 $\Delta\Pi\in SE(3)$ 최적화, $\tilde\Pi_t=\Delta\Pi_t\cdot\Pi_t$ → **모션 드리프트**(IMU 누적오차) 보정. (PoRF 영감)
- **Color Correction**: 채널별 화이트밸런스 $w$·밝기 $b$ 로 $\tilde I_t=w_t\hat I_t+b_t$ → **오토 노출/화이트밸런스** 불일치 보정.

## 목적함수
$$L=L_{color}+L_{geo},\quad L_{color}=\lambda_{l1}L_{l1}+\lambda_{DSSIM}L_{DSSIM}\ (0.8,0.2)$$
$$L_{geo}=\lambda_{normal}(L_{cos}+L_{flat}+L_{smooth})+\lambda_{d2n}L_{d2n}\ (\lambda_{normal}{=}0.05,\ \lambda_{d2n}{=}0.2)$$
색은 [[구면조화함수-SH|SH]] 계수로 표현, 렌더는 3DGS와 동일한 $\alpha$-blending([[방사장-볼륨렌더링]]).

## 결과
- 정량(Table 1): Real-world **PSNR 25.06**(3DGS† 20.60), Synthetic **28.86**(3DGS† 24.10) — 전 지표 SOTA. († = 공정비교 위해 baseline도 plane scaffold로 초기화.)
- 초기화 ablation(Table 3): ARKit+Plane Scaffold **23.52** vs ARKit+COLMAP 17.72, Spherical SfM 17.41, **COLMAP는 실패(N/A)**.
- 모듈 ablation(Table 2): full 26.80을 **0.51M 가우시안**으로(3DGS† 3.9M) — stable optim이 mis-densification 억제.
- 구현: gsplat 기반, RTX 4090. 신규 실내 데이터셋(iPhone ARKit / Blender) 구축.

## 응용
- **물체 배치(AR)**: 정확한 기하 → 가상 객체 자연스러운 삽입. **파노라마 뷰 합성**: sphere-based rasterizer로 미관측 시점 파노라마 렌더.

## 한계·관계
- 거친 단안 사전지식 의존(Table 4서 backbone 교체에 강건함은 보임). 평면 가정 — 곡면/소프트 가구도 일부 일반화.
- **기반**: [[3D-Gaussian-Splatting]] 직접 확장. **선행**: [[NeRF]]. **개념**: [[방사장-볼륨렌더링]]·[[구면조화함수-SH]]·[[SfM-COLMAP]](SfM 실패를 우회) (concepts)
- **같은 3DGS 렌더링 응용**: [[CoherentRaster]] (라이트필드 디스플레이 실시간 합성 — 본 노트는 실내 파노라마, peer 응용)
- **출처 메타**: [[2026-06-13-LighthouseGS-논문]]
