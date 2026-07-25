---
title: LGM (Large Multi-View Gaussian Model, 텍스트/이미지→3D 객체 생성)
area: research
created: 2026-07-26
sources: [LGM.md]
tags: [research, 3DGS, feed-forward, 3D-generation, multi-view-diffusion, text-to-3D, image-to-3D, U-Net, object-level]
---

# LGM: 고해상도 3D 콘텐츠 생성을 위한 대형 멀티뷰 가우시안 모델

> Jiaxiang Tang, Zhaoxi Chen, Xiaokang Chen, Tengfei Wang, Gang Zeng, Ziwei Liu (Peking Univ · NTU S-Lab · Shanghai AI Lab). *"LGM: Large Multi-View Gaussian Model for High-Resolution 3D Content Creation"*, arXiv:2402.05054 (ECCV 2024). 프로젝트: me.kiui.moe/lgm

**한 줄 요약**: **텍스트 또는 단일 이미지 → 고해상도 3D 가우시안 객체를 ~5초**에 생성하는 feed-forward 프레임워크. 핵심은 (1) off-the-shelf **멀티뷰 확산 모델**(MVDream·ImageDream)로 4개 직교 뷰를 합성하고 (2) **비대칭 U-Net**이 각 뷰에서 per-pixel 가우시안을 예측·융합(65,536개, 512 해상도 학습). LRM의 triplane NeRF(저해상도) 병목을 가우시안+U-Net으로 대체. (출처: [[2026-07-26-LGM-논문]])

## 문제의식
- 기존 3D 생성: **SDS 최적화**(DreamFusion·Magic3D·DreamGaussian) → 고품질이나 느리고 다양성 부족. **LRM 계열**(triplane NeRF 회귀) → 5초로 빠르나 **저해상도**(triplane 32·렌더 128 상한, 무거운 트랜스포머·volume rendering).
- 병목 진단: (1) 비효율적 3D 표현(triplane) (2) 과도한 파라미터 백본(트랜스포머).
- LGM: **가우시안 스플래팅**(표현력·렌더 효율)으로 고해상도 학습 가능, **U-Net**(splatter image 착안)으로 충분한 수의 가우시안을 멀티뷰 픽셀에서 생성.

## 파이프라인 (2단계, Fig.2)
- **① 멀티뷰 생성(~4s)**: 텍스트 → MVDream, 이미지 → ImageDream. 4개 직교 azimuth·고정 elevation 뷰 생성.
- **② 가우시안 생성(~1s)**: 4뷰 + 카메라 포즈 → **비대칭 U-Net** → 4세트 가우시안 → concat 융합. (③ 선택적 mesh 추출 ~1분.)

## 비대칭 U-Net (핵심, §3.3)
- 입력: 4개 이미지 + **Plücker ray 임베딩**(RGB+ray = 9채널). ResBlock + **cross-view self-attention**(깊은 층, 4뷰 flatten·concat 후 attention으로 뷰 간 정보 공유).
- **비대칭**: 입력 256² → 출력 가우시안 feature map 128²(입력보다 작음) → 고해상도 입력 쓰되 가우시안 수 제한. **각 픽셀 = 가우시안 1개**(splatter image), 14채널로 $\Theta_i=\{x,s,q,\alpha,c\}$ 디코드. 128²×4뷰 = **65,536 가우시안**. depth 예측 없이 위치 clamp·scale softplus×0.1로 안정화.

## 강건 학습 & mesh 추출
- **도메인 갭 완화**(§3.4): 학습은 Objaverse 렌더 이미지, 추론은 확산 합성 이미지 → 불일치. 두 augmentation: **grid distortion**(첫 뷰 제외 3뷰 랜덤 왜곡 → 뷰 간 불일치 모사) + **orbital camera jitter**(카메라 랜덤 회전 → 부정확 포즈 관용). 손실 = MSE + LPIPS + alpha MSE.
- **mesh 추출**(§3.5): 가우시안 → 렌더 이미지로 즉석 NeRF(hash grid) 학습 → Marching Cubes coarse mesh → 미분 렌더로 refine → texture bake(NeRF2Mesh). ~1분. DreamGaussian의 opacity→occupancy 방식(dense densification 의존)보다 sparse 가우시안에 강건.

## 결과
- Objaverse ~80K 필터 서브셋, 100뷰 512² 렌더. 32×A100 4일, effective batch 256.
- **image-to-3D**(user study, Tab.1): DreamGaussian·TriplaneGaussian 대비 image consistency·overall quality 최고(4.18/3.95 vs 3.02/2.67). LRM 대비 흐린 back view·평평한 지오메트리 개선.
- **text-to-3D**: Shap-E·DreamGaussian 대비 정합·품질 우위, 멀티뷰 확산 덕에 multi-face 문제 없음. 랜덤 시드로 **다양성**.
- **ablation**: 1뷰 모델(splatter image 유사)은 back view 실패 → 4뷰 필수. augmentation 없으면 floater↑. 512 해상도 > 256(디테일).

## 한계
- 본질이 **멀티뷰 재구성 모델** → 4 입력뷰 품질에 의존. 현 멀티뷰 확산의 (1) 3D 불일치 → floater (2) 256² 해상도 상한 (3) ImageDream 큰 elevation 실패. 더 나은 확산 모델로 완화 기대.

## 관련
- **계보(research)**: LRM 계보의 **가우시안·객체 생성** 분파. [[GS-LRM]] — 같은 per-pixel 가우시안 LRM(GS-LRM은 posed 장면 복원, LGM은 확산+객체 생성). [[pixelSplat]] — per-pixel 가우시안 예측 착안(splatter image 경유). (후속 **L4GM**=4D LGM이 이를 동적으로 확장.)
- **생성 prior(개념, 다른 영역)**: [[flow-matching-생성prior]] — MVDream·ImageDream = 멀티뷰 **확산** 생성 prior 재활용의 개념 앵커.
- **표현(research)**: [[3D-Gaussian-Splatting]] — 가우시안 표현·래스터화 / [[NeRF]] — LRM triplane NeRF(대체 대상)·mesh 추출 중간표현.
- **개념(다른 영역)**: [[구면조화함수-SH]] — 가우시안 시점의존 색 / [[Transformer]] — cross-view self-attention.
- **출처 메타**: [[2026-07-26-LGM-논문]]
