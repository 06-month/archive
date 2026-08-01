---
title: 4D Scaffold-GS (동적 인지 anchor growing, 저장 효율 4D GS)
area: research
created: 2026-08-01
sources: [4DScaffold-GS.md]
tags: [research, 3DGS, dynamic, 4D-gaussian, anchor, storage-efficiency, temporal-opacity, optimization-based]
---

# 4D Scaffold-GS: 동적 인지 anchor growing으로 저장비용과 품질 양립

> Woong Oh Cho, In Cho, Seoha Kim, Jeongmin Bae, Youngjung Uh, Seon Joo Kim (연세대). *"4D Scaffold Gaussian Splatting with Dynamic-Aware Anchor Growing"*, arXiv:2411.17044 (2025.08).

**한 줄 요약**: 4D 가우시안은 화질·속도가 좋지만 **10초 영상에 6GB**를 쓴다. 기존 해법은 가우시안 **수를 줄여** 저장을 아꼈고 그 대가로 동적 영역이 뭉개졌다. 본 논문은 반대로 **수는 충분히 유지**하되 격자 정렬된 **4D anchor 특징으로 압축**하고, 시간 커버리지를 반영한 **dynamic-aware anchor growing**으로 부족한 동적 영역에 anchor를 배분한다. 동적 영역 화질 SOTA를 실용적 저장비용에 달성. (출처: [[2026-08-01-4DScaffold-GS-논문]])

## 문제의식
- 동적 GS의 두 갈래: **변형 기반**([[Deformable3DGS]]·E-D3DGS·Grid4D — 저장은 작지만 느리고 화질↓) vs **4D 가우시안 직접 최적화**([[4DGS]]·STG·Ex4DGS — 화질·속도↑ but 저장 폭증).
- 기존 저장 절감(복잡한 모션 모델링·공격적 pruning·모션 보간)은 **동적 영역의 가우시안까지 제거**해 표현력을 희생.
- 게다가 [[Scaffold-GS]]의 anchor growing을 그대로 4D에 가져오면(**Scaff-naive**) 실패한다 — 원 전략은 **모든 프레임에 걸쳐 그래디언트를 평균**하는데, 4D에선 각 anchor가 **특정 시간 구간에만 활성**이라 짧게 등장하는 동적 영역이 분모 $N$에 눌려 신호를 못 받는다.

## 방법
- **4D anchor 프레임워크**: 성긴 4D 격자에 anchor $p=(x,y,z,t_0)$(SfM 점군으로 초기화) + 특징 벡터 $f$ + 학습 가능한 4D offset. **공유 MLP 4종**(Opacity·Shape·Color·Velocity)이 anchor당 $K{=}10$개 **neural 4D Gaussian**을 생성. 렌더 시점 $t_r$에서 3D 가우시안으로 투영해 기존 3DGS 파이프라인 사용.
- **compact 파라미터화**(얕은 공유 MLP의 용량 한계 고려):
  - **선형 모션** $h(t,x^t_k,u)=(t-x^t_k)u$ — 가우시안당 **3개 파라미터**로 시변 위치. 복잡한 궤적은 **선형 구간들의 조합**으로 표현.
  - **일반화 가우시안 시간 불투명도** $g=\exp(-(|t-x^t_k|/\sigma_k)^\beta)$ — 단변량 가우시안보다 **시작·끝이 가팔라** 급격한 등장/소멸을 **단일 가우시안**으로 표현(Fig.3, 부록 Fig.S2). 기존은 같은 걸 여러 가우시안의 합으로 근사해야 했음.
- **dynamic-aware anchor growing**(식 8·9) — 핵심. 그래디언트를 단순 평균이 아니라 **가중합**으로: $\nabla_g=\frac{\sum w(\alpha',\sigma)\|\nabla_{2D}\|}{\sum w(\alpha',\sigma)}$, $w=\alpha'(1/\sigma)^\gamma$.
  - 시간 불투명도가 **활성일 때만** 누적 → 짧게 등장하는 영역의 그래디언트를 정확히 수집.
  - **시간 커버리지 $\sigma$가 짧을수록 더 큰 가중치** → 짧은 등장의 페널티를 보상해 anchor가 그쪽으로 자란다.

## 결과
- **N3DV**(Tab.1): **동적 영역** PSNR **28.86** — 4DGS 27.65(하지만 **6194MB**)·Ex4DGS 26.33·STG 25.84·Scaff-naive 24.79 대비 최고를 **149MB**로 달성. 전체 영역도 32.03로 경쟁력, 129.9 FPS.
- **Technicolor**(Tab.2): 동적 31.94·전체 34.11로 전 지표 SOTA(278MB). 경량판 **Ours-light**는 108MB로 4DGS(10.7GB)와 대등.
- **ablation**(Tab.3): dynamic-aware growing 제거 시 29.57→**25.77** 급락(가장 결정적). 모션은 선형 > 다항식, 불투명도는 제안식 > 4DGS·Ex4DGS식.
- **품질-저장 trade-off**(Fig.5): 같은 저장에서 경쟁 대비 **3.37~7.0× 많은 가우시안**을 쓰면서도 화질↑ — anchor 압축의 이득.
- **부록**: $K$↑ → 화질↑·anchor 수↓(같은 영역을 고밀도로 표현). $\gamma$↑ → 동적 개선·정적 저하($\gamma{=}1$ 균형). $\beta$↑ → anchor 수↓(단 8 이상은 불안정). 4-shot 희소 시점서도 4DGS 대비 강건(28.82 vs 24.28).

## 한계 (저자 명시)
- **다시점 영상 전용** — 단안 적용은 추가 난제. 1~2 프레임만 등장하는 요소는 여전히 어려움.

## 관련
- **직접 기반(research)**: [[Scaffold-GS]] — anchor + 공유 MLP 구조를 4D로 확장한 것이 본 논문. 원 anchor growing이 4D에서 실패하는 지점(Scaff-naive)을 진단·수정한 게 핵심 기여.
- **비교군(research)**: [[4DGS]] — 직접 4D 가우시안 최적화의 대표(화질 좋으나 저장 폭증) / [[Deformable3DGS]] — 변형 기반 대안 / [[Ex4DGS]]·[[SpacetimeGS|STG]] — 저장 효율 4D 계열 경쟁자 / [[3D-4DGS]] — 정적·동적 적응 분리라는 유사 문제의식.
- **anchor 계열 교차(research)**: [[ATSplat]] — 같은 연세대 그룹(In Cho·Seon Joo Kim 공저)의 **feed-forward** anchor 확장. 본 논문이 **최적화 기반 4D anchor growing**이라면 ATSplat은 **feed-forward 불확실도 기반 token 확장** — "어디에 용량을 더 줄 것인가"라는 같은 질문의 두 답.
- **개념(다른 영역)**: [[3D-Gaussian-Splatting]] — 래스터화 파이프라인·densification 원류 / [[SfM-COLMAP]] — anchor 초기화 점군 / [[구면조화함수-SH]]·[[Radiance Field-Volume Rendering]] — 색·image formation.
- **출처 메타**: [[2026-08-01-4DScaffold-GS-논문]]
