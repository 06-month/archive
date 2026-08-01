---
title: ATSplat (Adaptive Token Expansion, 컴팩트 feed-forward 3DGS)
area: research
created: 2026-08-01
sources: [ATSplat.md]
tags: [research, 3DGS, feed-forward, compact, anchor-token, adaptive-allocation, uncertainty, pixel-unaligned]
---

# ATSplat: 적응적 토큰 확장으로 되찾는 feed-forward 3DGS의 용량 배분

> In Cho, Jeonghwan Cho, Mijin Yoo, Gim Hee Lee, Seon Joo Kim (연세대 · NUS). *"ATSplat: Compact Feed-forward 3D Gaussian Splatting with Adaptive Token Expansion"*, arXiv:2607.20417 (2026.07). 프로젝트: join16.github.io/page-atsplat

**한 줄 요약**: feed-forward 3DGS가 **per-pixel 회귀**를 쓰면서 잃어버린 3DGS 최적화의 강점 — **장면 복잡도에 따른 적응적 용량 배분** — 을 복원. 성긴 **3D anchor token**에서 시작해 각 토큰을 학습 가능한 3D offset을 가진 국소 가우시안으로 디코드하고, **불확실도가 높은 토큰만 선택적으로 확장(ATE)**. 가우시안 수를 **5.7× 줄이면서** SOTA 품질. (출처: [[2026-08-01-ATSplat-논문]])

## 문제의식
- 최적화 3DGS의 힘은 (1) 성긴 초기화 (2) 3D 자유 배치 (3) **적응적 densification**에서 온다.
- 그런데 feed-forward 계열([[pixelSplat]]·[[MVSplat]]·[[GS-LRM]] 등)은 **픽셀마다 가우시안을 회귀하고 카메라 광선을 따라 lift** → primitive의 수·배치가 **장면 복잡도가 아니라 이미지 해상도·시점 수**에 종속. 단순 영역에 중복 가우시안이 쏟아지고 어려운 영역엔 용량이 부족.
- 저자 진단: 이건 튜닝 문제가 아니라 **정식화 수준의 문제**. [[C3G]]·iLRM처럼 균일하게 줄이면 **복잡한 영역까지 같이 줄어든다**는 점도 지적.

## 방법 (§4~5)
- **① 성긴 3D anchor scaffold**: DINO(동결) 백본으로 coarse patch 특징 + Plücker raymap → 멀티뷰 트랜스포머 전역 self-attention → **patch-level 깊이**를 예측해 unproject($p_i=o_v+\hat d_i r_v(x_i)$). PointNet식 kNN 집계로 국소 3D context 주입.
- **② anchor → 국소 가우시안**: 각 토큰을 MLP로 $K{=}16$개 가우시안으로 디코드하되 중심을 **anchor 기준 상대 offset**으로 배치($\mu_{i,k}=p_i+\Delta\mu_{i,k}$) → **입력 픽셀 격자에서 해방**, 카메라 광선 밖에도 배치 가능.
- **③ ATE (Adaptive Token Expansion)** — 핵심. feed-forward는 추론 중 렌더링 오차를 볼 수 없으므로, 경량 MLP가 **토큰별 불확실도** $u_i$를 예측한다. 상위 $\rho_l$(0.5/0.5/0.25)를 골라 선형 사영으로 $M$개 자식 토큰으로 확장. 확장이 **디코더 내부**에서 일어나므로 자식 토큰이 이미지에 다시 cross-attend → **표현뿐 아니라 계산도** 어려운 영역에 배분.
- **불확실도 학습**(식 8): 중간 가우시안 $G^{(l)}$의 불확실도를 스칼라 속성으로 래스터화한 2D map을 **실제 오차맵(D-SSIM)** 에 $\ell_1$로 맞춤(가우시안 쪽엔 stop-gradient). 즉 **렌더링 오차를 대리 학습**.

## 결과
- **RealEstate10K 2뷰**(Tab.1): PSNR 28.46로 iLRM(28.65)·LongLRM(28.54)과 대등하나 가우시안이 **23K vs 131K(5.7×↓)**, 시간 0.022s로 최속.
- **DL3DV**(Tab.2): 2/4/6뷰 모두 baseline 상회 — 6뷰서 **27.28** vs DepthSplat 24.19·iLRM 25.60, 가우시안 120K vs 688K.
- **고해상도**(Tab.3, 512×960·12뷰): PSNR 24.85로 iLRM(24.35)·최적화 3DGS(22.87, 10분+) 능가, **311K 가우시안·0.677초·1136 FPS**.
- **저overlap에서 강함**(Tab.7): 소overlap서 24.09로 최고이나 대overlap선 iLRM에 뒤짐 — 광선 제약 배치가 유리한 조건과 자유 배치가 유리한 조건이 갈린다는 **구조적 해석**을 저자가 명시. 외삽 시점(Tab.10)서도 22.11 vs 19.22로 우위.
- **ablation**: anchor-offset이 최선(픽셀정렬 27.35·학습가능 토큰 24.62·직접 xyz 20.87, DL3DV 대규모선 직접 xyz는 **발산**). ATE 선택은 불확실도 > STE > random·FPS > 확장 없음(27.02).
- **동적 예산**(Tab.12): 고정 비율 대신 **불확실도 임계값**을 쓰면 장면별 예산이 6.9× 변동 — 입력 구성이 아니라 **장면 복잡도를 따르게** 됨.

## 한계 (저자 명시)
- 확장만 하고 **pruning이 없음**(3DGS의 prune에 해당하는 기제 부재). 더 큰 장면·더 많은 뷰·고해상도로의 확장성, **unposed 설정** 대응이 남은 과제.

## 관련
- **계보(research)**: [[GS-LRM]]·[[pixelSplat]]·[[MVSplat]] — 본 논문이 겨냥한 **per-pixel 정식화**의 당사자들. [[Long-LRM]] — 같은 many-view 스케일업이나 Long-LRM은 per-pixel + pruning, ATSplat은 **pixel-unaligned anchor**로 접근이 다름.
- **컴팩트 계열 대비(research)**: [[C3G]] — 같은 "per-pixel 탈피" 문제의식이나 C3G는 **전역 query token(N=2048)**, ATSplat은 **장면 조건부 3D anchor + 적응 확장**. 본 논문이 C3G를 관련 연구로 인용. [[Scaffold-GS]] — anchor 기반 구조화 GS의 최적화판 원류.
- **표현·개념**: [[3D-Gaussian-Splatting]] — 복원하려는 세 원칙(성긴 초기화·자유 배치·적응 densification)의 출처 / [[DINO]] — 동결 DINOv2 coarse 백본 / [[Transformer]]·[[ViT]] — 멀티뷰 인코더·image-to-3D 디코더 / [[위치인코딩-positional-encoding]] — Plücker raymap.
- **출처 메타**: [[2026-08-01-ATSplat-논문]]
