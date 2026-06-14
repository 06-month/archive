---
title: HMR (Human Mesh Recovery)
area: research
created: 2026-06-13
sources: [hmr.md]
tags: [research, HMR, human-mesh, SMPL, end-to-end, adversarial, monocular]
---

# HMR — End-to-end Human Mesh Recovery

> Kanazawa, Black, Jacobs, Malik (UC Berkeley·MPI-IS). *"End-to-end Recovery of Human Shape and Pose"*, CVPR 2018. arXiv:1712.06584.

**한 줄 요약**: 단일 RGB 이미지에서 **이미지 픽셀→[[SMPL]] 파라미터를 직접(end-to-end) 회귀**해 전신 3D 메쉬를 실시간 복원. 2D 키포인트 재투영 손실 + **적대적 prior(adversarial prior)** 로, 짝지어진 3D 정답 없이도 in-the-wild 학습 가능. 이후 손 복원 [[HaMeR]]·[[WiLoR]]의 회귀 패러다임 원형. (출처: [[2026-06-13-HMR-논문]])

## 문제의식
- 기존: ① 다단계(2D 관절 검출→3D) — 이미지 정보 버림·비최적. ② 직접 3D 관절 회귀 — MoCap 통제환경 정답뿐이라 in-the-wild 일반화 실패.
- 또 **관절 위치만으론 부족**: 희소하고 관절 자유도·사지 방향을 제약 못함 → 메쉬(=형상+관절 회전)를 출력해야.
- 핵심 난제: ① in-the-wild 3D 정답 부재 ② 단일뷰 2D→3D 깊이 모호성(비인체적 해도 재투영 일치 가능).

## 방법 (Fig.2)
- **표현**: [[SMPL]]로 인체 인코딩. 출력 = **85차원** $\Theta=\{\theta,\beta,R,t,s\}$ (자세 $\theta\in\mathbb R^{3K}$, 형상 $\beta\in\mathbb R^{10}$, 카메라 회전·이동·스케일). 약투시 카메라.
- **인코더**: ResNet-50(ImageNet 사전학습) → $\phi\in\mathbb R^{2048}$.
- **반복 오차 피드백(IEF)**: $\Theta$ 를 한 번에 회귀하기 어려움(특히 회전) → 평균 $\bar\Theta$ 에서 시작해 $[\phi,\Theta_t]$ 로 잔차 $\Delta\Theta_t$ 를 **T=3회 반복** 누적. 회전을 분류(bin) 대신 직접 회귀.
- **재투영 손실** $L_{reproj}=\sum_i\|v_i(x_i-\hat x_i)\|_1$ ($v_i$=가시성). 3D 정답 있으면 $L_{3D}$(관절+SMPL) 추가.

## 핵심: Factorized Adversarial Prior
- 재투영만으론 비인체적·자가관통 해도 통과 → **판별자 $D$** 가 SMPL 파라미터가 "진짜 사람"인지 판정(데이터 기반 prior).
- **분해(factorized)**: SMPL의 형상/자세 분해를 미러 → 형상 판별자 1 + **관절별 판별자 K개**(각도 한계 학습) + 전체자세 판별자 1 = **K+2개**. 입력이 저차원(10D/9D/9K-D)이라 작고 안정.
- 효과: 관절 각도 한계·인체측정 제약을 **데이터로 학습**(수동 DoF 지정 불필요). adversarial 손실은 매 IEF 반복에 적용. 판별자·3D 둘 다 없으면 "괴물" 생성(Fig.5).

## 결과
- Human3.6M P2 재구성오차 **56.8mm**(SMPLify 82.3, Lassner 80.7 대폭 상회), 무짝(unpaired) 66.5mm. 3D 관절만 출력하는 방법들과 경쟁력.
- **실시간**(bbox 주어지면 0.04s), 부위분할서 최적화 기반 SMPLify oracle과 동등.
- **무짝 학습**(2D만)도 합리적 복원 — 풍부한 2D 데이터로 3D를 배울 가능성 제시.

## 관련
- [[SMPL]] · [[ViT]] (concepts) — 출력 표현 / 후속의 백본 진화(HMR=ResNet → HaMeR=ViT)
- [[HaMeR]] · [[WiLoR]] (research) — **손** 버전: 같은 "이미지→파라미터 회귀" 패러다임을 [[MANO]]로
- **출처 메타**: [[2026-06-13-HMR-논문]]
