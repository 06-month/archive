---
title: 4DGT (4D Gaussian Transformer)
area: research
created: 2026-06-16
sources: [4DGT.md]
tags: [research, 4D-reconstruction, dynamic-scene, gaussian-splatting, feed-forward, monocular-video, NeurIPS2025]
---

# 4DGT: Learning a 4D Gaussian Transformer Using Real-World Monocular Videos

> Xu, Li, Dong, Zhou, Newcombe, Lv (Reality Labs Research, Meta · Zhejiang Univ). *"4DGT: Learning a 4D Gaussian Transformer Using Real-World Monocular Videos"*, NeurIPS 2025. arXiv:2506.08015. 4dgt.github.io

**한 줄 요약**: posed 단안 영상에서 **4D Gaussian Splatting(4DGS)** 을 feed-forward로 예측하는 트랜스포머. 4DGS를 inductive bias로 써서 정적·동적을 **lifespan 차이만으로 통일**, 64프레임 rolling window로 긴 영상까지 초 단위 복원. 최적화 기반 대비 **3 orders of magnitude** 빠름. (출처: [[2026-06-16-4DGT-논문]])

## 문제의식
- 단안 동적 영상의 4D 복원은 per-video 최적화라 느림. 합성 객체 데이터 학습(L4GM 등)은 실세계 일반화 갭. 멀티뷰 동기 영상은 양·다양성 부족.
- 4DGT는 **실세계 posed 단안 영상만으로** 학습(카메라 보정·6DoF 포즈는 on-device SLAM/offline에서 가정). 핵심 난제 = 단안의 space-time ambiguity 해소 + 트랜스포머 스케일링.

## 표현: 4D Gaussian (lifespan 통일)
- [[3D-Gaussian-Splatting|3DGS]] 대신 **2DGS**(중심 $x$, scale $s\in\mathbb R^2$, opacity, 쿼터니언 $q$) 채택 — 기하 정확도↑. 여기에 **시간 속성 4종**: temporal center $c$, **life-span $l$**, 속도 $v$, 각속도 $\omega$.
- 렌더 시각 $t_s$ 에서 opacity는 temporal center 기준 가우시안 분포로 fade($l/2$ 경계서 $o_{th}=0.05$ 배), 위치·방향은 $v,\omega$ 로 보정: $x_{t_s}=x+v(t_s-c)$.
- **정적**은 $l\to\infty, v,\omega\to0$ (= 순수 3DGS), **동적**은 $l\to0$ 단명 가우시안 → 하나의 표현으로 양쪽 모두.

## 아키텍처 (Fig. 2)
- 입력: posed 프레임을 patchify → RGB + **Plücker 좌표** + timestamp + **[[DINO|DINOv2]] 피처** 융합. (Plücker+timestamp가 4D 위치를 주므로 별도 positional embedding 불필요)
- all-to-all self-attention 트랜스포머(modified [[ViT]], 12층·16헤드) → pixel-aligned 4DGS를 MLP 디코더로 디코드.

## 효율: 2단계 + Density Control + Multi-level Attention
- **Pruning**: stage 1 학습 후 패치별 opacity activation **histogram**으로 활성 채널 $S$개만 디코드(공유 패턴) → 가우시안 $S/p^2$ 배 감축.
- **Densification**: stage 2서 공간 $R_s$·시간 $R_t$ 해상도 증가. 결합 시 $R_s^2 R_t S/p^2$ → 원래의 80% 가우시안으로 **space-time 16배 샘플링**.
- **Multi-level spatiotemporal attention**: $N$ 프레임을 $M$ 청크로 나눠 temporal LoD(레벨 $l$마다 공간 $2^l$↓·시간 2↑) → self-attention $O(n^2)\to O(2n^2/M)$, 추가 2배 절감.

## 학습
- $W=128$ 연속 프레임에서 subsample해 입력(stage1 $N=16$, stage2 $N=64$), 전체 $W$ 프레임에 렌더해 self-supervision: MSE + LPIPS + SSIM.
- **정규화**: 속도·각속도·역수명 페널티($L_v,L_\omega,L_l$)로 점을 정적·장수명으로 유도 — 없으면 모든 가우시안이 transient되는 trivial local minima(순백 모션마스크).
- **Expert guidance**: DepthAnythingV2 깊이 + StableNormal 법선을 pseudo-supervision($L_D,L_N$). (optical flow expert는 cycle 불일치로 NaN 유발해 미채택)
- 데이터: Project Aria(EgoExo4D·Nymeria·Hot3D·AEA) + Epic-Fields·Cop3D(COLMAP) + ARKitTrack. 64×H100, stage1 9일 + stage2 6일.

## 결과
- **NVS+기하**(ADT·TUM·DyCheck·Aria): L4GM보다 실세계 일반화 월등, Static-LRM은 정적만 가능한데 4DGT는 양쪽 다. 깊이가 expert보다 metric 일관성↑.
- 최적화 기반 **Shape-of-Motion** 대비 NVS·기하 on-par면서 **2,400× 빠름**. 10초 finetune(Ours$_{tune10s}$)하면 SoM 능가.
- **창발 모션 분할**(mIoU 81.2): 명시적 모션 속성 덕에 flow supervision 쓰는 MegaSaM과 대등하면서 200× 빠름.
- Ablation: 데이터 스케일업·정규화·density control 모두 기여.

## 한계
- 신뢰할 보정 필요 → 학습 device(egocentric·폰)에 한정, 미지 device의 부정확 metric scale서 품질 저하. 극단 시점·빠른 모션서 블러·아티팩트(단안 공통).

## 관련
- **표현 기반**: [[3D-Gaussian-Splatting]] — 2DGS+시간속성으로 4D 확장 / [[NeRF]] — 4D NeRF(느림) 대비 GS의 빠른 렌더.
- **계보**: [[GS-LRM]](정적 LRM 백본 차용)·L4GM(합성 4D LRM)의 실세계 단안 후계. [[DGS-LRM]]·[[MoVieS]]·[[StreamSplat]] 와 같은 **feed-forward 4D GS** 클러스터.
- **동적 peer**: [[MONST3R]]·[[MoRe]]·[[Relaxed-Rigidity-동적GS]] — 동적 장면 복원 대조(4DGT는 GS·life-span, MonST3R는 pointmap).
- **개념(다른 영역)**: [[ViT]]·[[Transformer]] — 백본 / [[Radiance Field-Volume Rendering]] — GS rasterization image formation / [[위치인코딩-positional-encoding]] — Plücker+timestamp 4D 인코딩.
- **출처 메타**: [[2026-06-16-4DGT-논문]]
