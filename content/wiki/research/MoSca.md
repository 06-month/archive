---
title: MoSca (4D Motion Scaffolds, casual 영상 동적 GS 융합)
area: research
created: 2026-08-01
sources: [MoSca.md]
tags: [research, 3DGS, dynamic, monocular, motion-scaffold, ARAP, pose-free, foundation-prior, optimization-based]
---

# MoSca: 4D Motion Scaffold로 casual 영상에서 동적 장면 융합

> Jiahui Lei, Yijia Weng, Adam W. Harley, Leonidas Guibas, Kostas Daniilidis (UPenn · Stanford). *"MoSca: Dynamic Gaussian Fusion from Casual Videos via 4D Motion Scaffolds"*, arXiv:2405.17421 (2024.11). 프로젝트: cis.upenn.edu/~leijh/projects/mosca

**한 줄 요약**: 카메라 파라미터조차 모르는 **casual 단안 영상**에서 4D 장면을 복원하는 **완전 자동 시스템**. 2D foundation model(깊이·장거리 트랙·epipolar error)의 노이즈 prior를 **MoSca**라는 희소 궤적 그래프로 3D에 lift하고, ARAP 등 물리 prior로 정련한 뒤, **전 시점의 가우시안을 전역 융합**한다. 카메라 포즈·초점거리도 tracklet BA로 자체 해결(COLMAP 불요). (출처: [[2026-08-01-MoSca-논문]])

## 문제의식
- casual 영상의 4D 복원은 **다시점 스테레오 단서 부족**으로 극심하게 ill-posed.
- 2D foundation prior는 강력하지만 **가려진 부분을 못 잡고, 노이즈·국소·부분적**이라 그 자체로 해답이 아님.
- 두 번째 통찰: 기하·외형은 복잡해도 **그것을 구동하는 변형은 compact(저랭크)하고 매끄럽다** → 기하와 모션을 분리하고 모션만 희소 그래프로.

## MoSca 표현 (§3.1)
- **노드** $v^{(m)}=([Q^{(m)}_1..Q^{(m)}_T], r^{(m)})$ — 시점별 **6-DoF 궤적** + 전역 제어 반경(RBF). 노드 수 $M$은 장면 표현에 필요한 점보다 훨씬 적음(실측 가우시안 106K vs 노드 3.2K, 비 46:1).
- **엣지**: **curve distance** $D_{curve}(m,n)=\max_t\|t^{(m)}_t-t^{(n)}_t\|$ 기반 KNN — 전 시점의 궤적 근접성을 보므로 **위상 변화**(문이 열려도 문과 벽이 안 이어짐)를 자연히 처리.
- **변형장**: **Dual Quaternion Blending(DQB)** 으로 $SE(3)$ 다양체 위에서 보간(LBS와 달리 결과가 항상 $SE(3)$에 머묾). 스키닝 가중치는 RBF.

## 시스템 4단계 (§3.2)
1. **2D prior 추론**: 깊이(Metric3D-v2·UniDepth·LiDAR), 장거리 2D 트랙(BootsTAPIR·CoTracker·SpaTracker), RAFT flow 기반 **epipolar error map**(동적 전경 가능성).
2. **카메라 초기화**: epipolar error가 작은 **confident 배경 tracklet**만 골라 재투영 오차 최소화 → 포즈·초점거리 공동 최적화. 깊이 스케일 오정렬은 per-frame scaling + per-pixel 보정으로 흡수.
3. **MoSca 기하 최적화**: 전경 트랙을 깊이로 3D lift(가려진 구간은 선형보간), 노드 초기화 후 **ARAP**(국소 거리+국소 좌표계 보존, 다단계 토폴로지 피라미드) + 속도·가속도 평활로 **보이는 정보를 안 보이는 곳으로 전파**.
4. **광도 최적화**: **모든 시점**의 back-projected 깊이에서 가우시안을 초기화하고 전부 query time으로 변형해 **전역 융합**(식 12). RGB·깊이·**track map**(XYZ 래스터화) 손실 + 정규화. 정적 배경은 별도 3DGS.
- **node control**: 트래킹 손실 그래디언트가 큰 가우시안을 새 노드로 승격, 기여 낮은 노드는 prune(3DGS densification의 노드판).

## 결과
- **DyCheck**(Tab.1): mPSNR **19.32**(w-pose) — Shape-of-Motion 17.32·Gaussian Marbles 16.72·4D-GS 13.64 대비 큰 격차. **포즈 없이도 18.84**로 대부분의 포즈 사용 기법을 상회. 저자 분석: (a) 장거리 트래커로 **전 시점 전역 융합** (b) 희소 그래프가 최적화 공간을 줄이고 ARAP로 미관측 영역에 정보 전파.
- **NVIDIA**(Tab.2): PSNR 26.72(포즈 없이 26.54)로 최고 수준. 단 forward-facing·소baseline이라 MoSca의 강점이 덜 드러남.
- **카메라 포즈**(Tab.3): Sintel ATE 0.090·TUM-dynamics 0.031로 [[MONST3R]]·DUSt3R·CasualSAM 등 전용 기법을 능가(intrinsic도 불요).
- **대응**(Tab.4): PCK-T **0.824** — 입력이던 BootsTAPIR(0.779)보다 향상, 즉 **복원이 트래커를 개선**.
- **ablation**(Tab.5): 광도 최적화 제거가 가장 치명적(19.32→13.71), 기하 최적화·DQB·다단계 토폴로지 모두 기여. **4/8 인접 프레임만 융합**하면 16.96/17.26로 급락 → 전역 융합이 핵심.

## 한계
- 2D 트랙·깊이 정확도에 의존. **한 번도 안 보인 영역은 복원 불가**(video diffusion prior 결합이 future work). 그림자·반사·액체·노출 변화 등 **변형으로 설명 안 되는 효과** 미처리.

## 관련
- **계보(research)**: [[3D-Gaussian-Splatting]] 동적 확장. [[SC-GS]] — 같은 "희소 제어점 + ARAP + LBS" 발상의 형제(SC-GS는 편집 특화·다시점 친화, MoSca는 casual 단안·foundation prior 융합·DQB). [[ShapeOfMotion]] — **직접 비교군**(Tab.1 SOM-5-1x), 둘 다 저차원 모션 기저 + off-the-shelf prior 융합이나 MoSca는 pose-free 자동 시스템.
- **포즈·기하 대비(research)**: [[MONST3R]]·[[DUSt3R]] — 카메라 포즈 비교군(MoSca가 능가) / [[VGGT]] — feed-forward 복원의 다른 축(MoSca는 per-scene 최적화).
- **개념(다른 영역)**: [[장거리-point-tracking]] — BootsTAPIR·CoTracker·SpaTracker가 **입력 prior이자 평가 대상**(복원 후 트래커보다 정확해짐) / [[SfM-COLMAP]] — 대체 대상(tracklet BA로 자체 해결) / [[Radiance Field-Volume Rendering]]·[[구면조화함수-SH]] — GS 렌더링.
- **출처 메타**: [[2026-08-01-MoSca-논문]]
