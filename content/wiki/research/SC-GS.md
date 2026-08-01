---
title: SC-GS (Sparse-Controlled GS, 편집 가능한 동적 장면)
area: research
created: 2026-08-01
sources: [SC-GSS.md]
tags: [research, 3DGS, dynamic, sparse-control-points, ARAP, motion-editing, deformation, optimization-based]
---

# SC-GS: 희소 제어점으로 구동하는 편집 가능한 동적 GS

> Yi-Hua Huang, Yang-Tian Sun, Ziyi Yang, Xiaoyang Lyu, Yan-Pei Cao, Xiaojuan Qi (HKU · VAST · 저장대). *"SC-GS: Sparse-Controlled Gaussian Splatting for Editable Dynamic Scenes"*, arXiv:2312.14937 (CVPR 2024). 프로젝트: yihua7.github.io/SC-GS-web

**한 줄 요약**: 동적 장면의 **모션과 외형을 명시적으로 분해** — 모션은 **희소 제어점(~512개)**, 외형은 **조밀 가우시안(~100K)**. 제어점마다 MLP가 시변 **6-DoF 변환**을 예측하고, 이를 학습된 보간 가중치로 **LBS 보간**해 가우시안 모션장을 만든다. 희소·명시적 모션 표현 덕분에 고품질 NVS와 **사용자 모션 편집**을 동시에 지원. (출처: [[2026-08-01-SC-GS-논문]])

## 문제의식
- [[3D-Gaussian-Splatting]]은 정적 전용. 가우시안마다 flow 벡터를 학습하는 직관적 방식은 **학습·추론 비용이 크고**, 궤적이 노이즈투성이가 되며 novel view 일반화가 나쁨(Fig.6a).
- 관찰: 실세계 모션은 **희소하고·공간적으로 연속이며·국소적으로 강체**다 → 가우시안 수보다 훨씬 적은 제어점으로 충분.

## 방법
- **희소 제어점** $P=\{(p_i, o_i)\}$: 정준공간 좌표 $p_i$ + **RBF 반경** $o_i$(제어점 영향이 거리에 따라 감쇠하는 정도, 학습 가능).
- **변형 MLP** $\Psi:(p_i,t)\to(R^t_i,T^t_i)\in SE(3)$ — 제어점별 시변 6-DoF. 회전은 안정성을 위해 쿼터니언으로 파라미터화.
- **LBS 보간**(식 6·7): 각 가우시안이 KNN으로 이웃 제어점 $K{=}4$개를 찾고, RBF 가중치 $w_{jk}\propto\exp(-d^2_{jk}/2o_k^2)$로 변환을 혼합 → $\mu^t_j=\sum_k w_{jk}(R^t_k(\mu_j-p_k)+p_k+T^t_k)$.
- **ARAP 손실**(식 9·10): 제어점 궤적으로 이웃을 정의(ball query)하고, 두 시점 간 국소 강체 회전 $\hat R_i$를 SVD로 풀어 **국소 강체성**을 강제. 없으면 팔의 가우시안이 몸통으로 새는 현상 발생(Fig.6c).
- **적응적 제어점 밀도**: 기여도 $W_i$가 0에 가까우면 prune, 가우시안 그래디언트 합 $g_i$가 크면(복원 불량) clone. 3DGS의 densification을 제어점 레벨로 옮긴 것.

## 모션 편집 (§5)
- 학습된 제어점 궤적으로 **control graph** 구성(단일 시점이 아닌 **전체 궤적 기반**으로 엣지를 연결 → 무관한 점 연결 방지).
- 사용자가 handle point를 지정하면 **ARAP 에너지 최소화**(식 13)로 그래프를 변형, 풀린 $\hat R_i,\hat T_i$를 식 6·7에 그대로 대입 → **학습 시퀀스 밖 모션도** 고품질 렌더(Fig.5).

## 결과
- **D-NeRF**(Tab.1): 평균 PSNR **43.31** — D-NeRF 31.69·TiNeuVox 33.76·K-Planes 32.32·[[4DGS|4D-GS]] 34.01 대비 큰 폭 우위. 제어점 없는 baseline(38.51)도 3DGS 덕에 높지만 **compact 모션 기저의 정규화 부재로 local minima**.
- **NeRF-DS**(Tab.2): 평균 24.1로 최고. 단 포즈 추정 오차·specular 특화 설계 부재로 이득은 제한적.
- **ablation**(Tab.3): 제어점 없음 38.51 / ARAP 없음 42.62 / full **43.31**.

## 한계
- **부정확한 카메라 포즈에 취약**(HyperNeRF류 데이터셋서 실패). specular 효과 미처리(Spec-Gaussian 결합이 future work). 동적 객체의 블러도 미고려.

## 관련
- **계보(research)**: [[3D-Gaussian-Splatting]]의 동적 확장. [[Deformable3DGS]] — 가우시안마다 MLP 변형을 거는 선행작으로, SC-GS는 이를 **제어점으로 희소화**해 속도·일반화 개선. [[4DGS]] — 동시기 HexPlane 변형장 비교군.
- **모션 기저 계열(research)**: [[ShapeOfMotion]] — SE(3) 모션 기저를 쓰는 같은 발상(SC-GS는 제어점, ShapeOfMotion은 전역 기저 $B{=}10$) / [[MoSca]] — ARAP + 희소 그래프 노드로 확장한 후속 계열.
- **개념(다른 영역)**: [[구면조화함수-SH]] — 가우시안 시점의존 색 / [[Radiance Field-Volume Rendering]] — α-blending image formation / [[SfM-COLMAP]] — 카메라 포즈(본 논문의 취약점).
- **출처 메타**: [[2026-08-01-SC-GS-논문]]
