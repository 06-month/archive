---
title: Ex4DGS (Fully Explicit Dynamic GS)
area: research
created: 2026-06-18
sources: [Ex4DGS.md]
tags: [research, 4DGS, dynamic-scene, novel-view-synthesis, keyframe-interpolation, explicit-representation, NeurIPS2024]
---

# Ex4DGS: Fully Explicit Dynamic Gaussian Splatting

> Lee, Won, Jung, Bae, Jeon (GIST). *"Fully Explicit Dynamic Gaussian Splatting"*, NeurIPS 2024. arXiv:2410.15629

**한 줄 요약**: 단안/다중뷰 동적 영상의 4D 복원을, MLP·인코딩 없이 **완전 명시적**으로 — 정적/동적 가우시안을 분리하고 동적 가우시안의 위치·회전을 **sparse 키프레임에서만 저장**한 뒤 **보간**(CHip 위치·Slerp 회전·GMM opacity)해 표현하는 per-scene 최적화 4DGS. 희소 point cloud(첫 프레임 COLMAP)에서도 동작, 2080Ti 62 fps. (출처: [[2026-06-18-Ex4DGS-논문]])

## 문제의식
- 동적 NeRF(DyNeRF·HexPlane·K-Planes)는 implicit MLP라 렌더 느림. 기존 동적 3DGS 확장(4DGS·4DGaussians 등)은 ⑴ **dense point cloud** 조건에서만 학습되거나 ⑵ MLP/implicit 표현을 빌려와 3DGS의 명시성 이점을 잃음, ⑶ 자기-가림으로 사라졌다 재등장하는 모션에 가우시안을 다수 소모(메모리↑).
- Ex4DGS: **키프레임 보간** + **정적/동적 분리** + **희소 초기화 대응**으로 명시성·메모리효율·속도를 모두 확보.

## 표현
- **정적 가우시안 $G_s$**(§4.1): 3DGS와 동일하되 위치만 **선형 이동** $\mu(t)=x+t'd$ ($t'=t/l\in[0,1]$). 대부분의 장면을 적은 비용으로.
- **동적 가우시안 $G_d$**(§4.2): 균일 간격 키프레임 $K$ 에서만 위치·회전·opacity 저장, 중간 프레임은 보간:
  - **위치 — Cubic Hermite spline(CHip)**: 3차 다항식, 접선은 **이웃 키프레임 위치**로 계산($m_n=(p_{n+1}-p_{n-1})/2I$) → 접선 별도 저장 불필요. 선형/over-smoothing 회피.
  - **회전 — Slerp**: 쿼터니언 구면 선형보간(선형보간의 각도 bias 회피).
  - **opacity — 단순화 Gaussian mixture(2개)**: appear/remain/disappear 3구간 모델 → 등장/소멸을 적은 점으로 표현(단일 Gaussian은 긴 지속에 점 多 필요).

## 정적/동적 분리 + 학습 (§4.3–4.4)
- **분리(마스크 없이)**: 전부 정적으로 초기화(선형 이동 가정) → 학습 중 **이미지 공간 이동량**(카메라 거리로 정규화 $\|d\|/\|\lambda\|^2$) 상위 **η=2%** 를 동적으로 자동 전환. 반사·시점의존 색 변화도 동적으로 식별(Coffee Martini 유리잔 속 유체 검출).
- **Progressive training**: 짧은 duration으로 시작해 interval씩 확장 → 첫 프레임 희소 point cloud만으로 긴 영상 학습, 급격한 객체 등장이 부르는 local minima 회피.
- **Point-backtracking pruning**: 가우시안별 **누적 오차**(L1+SSIM, α-blending 가중 역전파로 단일 backward에 측정)를 시간에 걸쳐 추적 → 고오차 동적 점 제거.
- 손실: L1+SSIM + 큰 모션 정규화($\|d\|$·$\|p_{n+1}-p_n\|$). 3DGS+Mip-Splatting 코드베이스, RAdam, 키프레임 간격·초기 duration=10.

## 결과
- **N3V·Technicolor**: SOTA급 화질 유지하며 저비용. N3V 평균 PSNR 32.11, **120.6 fps**(4090)·**62 fps**(2080Ti, 300프레임 1352×1014), 모델 115MB.
- **희소 조건 강건성**: 첫 프레임 point cloud만 줄 때 동시기 기법(STG·4DGS·4DGaussians)은 크게 저하(모션을 point cloud에 의존 학습)하나 Ex4DGS는 초기조건에서 자유.
- **Ablation**: CHip·Slerp(둘 다 동일 차수라야)·GMM opacity·progressive·point-backtracking·dynamic 추출 모두 기여(특히 dynamic 추출 없으면 28.58dB로 급락). 키프레임 간격 10이 대체로 최적, 동적 전환율 2%가 최적.
- **부록**: 색 변화만 있어도 동적 처리 필요, 재등장 객체는 새 객체로 취급, occlusion·신규 등장·1000프레임 장기 영상도 처리.

## 한계
- 인접 프레임에 관련 3D 가우시안이 없는 **신규 등장 객체**는 local minima(깊이 prior 초기화로 완화 가능). **단안 영상**은 scale ambiguity로 모든 점이 동적 처리됨 → object mask·optical flow 등 semantic cue 필요.

## 관련
- **직접 확장 관계**: [[Relaxed-Rigidity-동적GS]] — **같은 저자(Lee·Jeon, GIST)**. Relaxed Rigidity는 Ex4DGS(spline 기반)를 포함한 4D GS baseline에 plug-in 모션 정규화를 부착해 개선. 본 노트는 그 base model.
- **peer(최적화 기반 동적 4DGS)**: [[3D-4DGS]] — Ex4DGS를 직접 비교 baseline으로 삼아 더 빠른 학습(12분) 주장. 키프레임 보간(Ex4DGS) vs 시간축 scale 하이브리드(3D-4DGS)의 표현 차이.
- **기반(다른 영역 연결)**: [[3D-Gaussian-Splatting]] — 명시적 가우시안·rasterization 원본을 시간축으로 확장 / [[NeRF]] — 능가 대상인 implicit 동적 NVS(DyNeRF·HexPlane·K-Planes).
- **개념(다른 영역)**: [[Radiance Field-Volume Rendering]] — α-blending(point-backtracking 가중 근거) / [[구면조화함수-SH]] — 시점의존 색 / [[SfM-COLMAP]] — 첫 프레임 point cloud 초기화.
- **대조(feed-forward 4D)**: [[4DGT]]·[[DGS-LRM]]·[[MoVieS]]·[[StreamSplat]] — 이들은 학습형 feed-forward(초 단위), Ex4DGS는 **per-scene 최적화**(고화질·명시적). feed-forward 군이 비교·능가하려는 최적화 기반 4DGS 계열.
- **출처 메타**: [[2026-06-18-Ex4DGS-논문]]
