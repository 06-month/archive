---
title: Drifting Model (학습시간 분포진화·원스텝 생성)
area: concepts
created: 2026-07-31
sources: [GMD.md]
tags: [concept, generative-model, one-step, drifting-field, pushforward, mean-shift, contrastive, diffusion-alternative]
---

# Drifting Model — 학습 시간에 분포를 진화시키는 원스텝 생성

> Mingyang Deng, He Li, Tianhong Li, Yilun Du, Kaiming He (MIT · Harvard). *"Generative Modeling via Drifting"*, arXiv:2602.04770 (2026.02). 프로젝트: lambertae.github.io/projects/drifting

**한 줄 요약**: 확산·flow matching이 **추론 시간에** 반복 갱신($x_{i+1}=x_i+\Delta x_i$)으로 분포를 옮기는 것과 달리, **학습 시간에** pushforward 분포를 진화시켜 **추론은 단 1스텝(1-NFE)**으로 끝내는 새 패러다임. 두 분포가 일치하면 0이 되는 **drifting field**가 손실을 정의한다. ImageNet 256² **FID 1.54**(latent)·**1.61**(pixel)로 원스텝 SOTA. (출처: [[2026-07-31-GMD-논문]])

## 왜 concepts인가
[[flow-matching-생성prior]]가 정리한 확산·rectified flow는 **추론 시 다단계 적분(ODE/SDE)**을 전제한다. Drifting Model은 그 전제 자체를 바꾸는 **대안 패러다임**이라, 특정 3D 연구에 종속되지 않는 생성 모델링 공통 개념으로 둔다(룰북 §B ③).

## 핵심 정식화
- **pushforward**: 생성 모델링 = 사전분포를 데이터분포로 옮기는 사상 $f$ 학습, $q=f_\# p_\epsilon \approx p_{data}$.
- **학습 시간 진화**: 딥러닝 학습은 본래 반복적이므로 모델 열 $\{f_i\}$가 곧 분포 열 $\{q_i\}$. 파라미터 갱신이 샘플을 "표류(drift)"시킨다: $\Delta x_i := f_{i+1}(\epsilon)-f_i(\epsilon)$.
- **drifting field $V_{p,q}$**: $x_{i+1}=x_i+V_{p,q}(x_i)$를 지배하는 장. **반대칭(anti-symmetry)** $V_{p,q}=-V_{q,p}$을 요구하면 $q=p \Rightarrow V=0$(평형)이 즉시 따라온다.
- **손실**(식 6): 평형의 부동점 관계에서 유도 — $L=\mathbb E_\epsilon\|f_\theta(\epsilon)-\mathrm{sg}(f_\theta(\epsilon)+V(f_\theta(\epsilon)))\|^2$. **stop-gradient**로 얼린 타깃을 향해 예측을 옮긴다(분포를 통한 역전파 회피). 손실값 = $\|V\|^2$.
- **장의 설계**: mean-shift 착안 — 데이터가 **끌어당기고**($V^+_p$) 생성분포가 **밀어내는**($V^-_q$) 형태, $V=V^+_p-V^-_q$. 커널 $k(x,y)=\exp(-\|x-y\|/\tau)$를 softmax로 정규화(InfoNCE와 유사). 배치 내 생성 샘플을 그대로 negative로 재사용.

## 실무 설계
- **feature space drifting**(§3.4): 원 데이터 공간이 아닌 **자기지도 인코더 $\phi$의 피처 공간**에서 drift 계산. ImageNet에서는 **인코더 없이는 학습 실패** — 커널이 유사도를 못 재기 때문. 자체 latent-MAE(ResNet, 다중 스케일)가 SimCLR·MoCo보다 우수. perceptual loss와 달리 **타깃 페어링이 불필요**.
- **CFG**: 무조건 실데이터를 추가 negative로 섞어($\tilde q=(1-\gamma)q_\theta+\gamma p_{data}(\cdot|\emptyset)$) 학습 시간에 구현 → **추론은 여전히 1-NFE**. 최적 FID가 $\alpha{=}1.0$("CFG 없음")에서 나옴.
- 생성기는 DiT 계열([[Transformer]]/[[ViT]] 백본, adaLN-zero·RoPE·QK-Norm), 노이즈 외 **style embedding** 등 임의 확률변수 허용.

## 결과·검증
- **ImageNet 256²**: latent 1-NFE FID **1.54**(L/2, 463M) — iMeanFlow 1.72·AdvFlow 2.38·MeanFlow 3.43 등 기존 원스텝 전부 능가, 250스텝 DiT-XL(2.27)보다도 우수. pixel-space **1.61**로 StyleGAN-XL(2.30, FLOPs 18×)을 앞섬.
- **반대칭이 본질**(Tab.1): $1.5V^+-V^-$ 같이 대칭을 깨면 FID 8.46→41~177로 파탄. attraction-only는 177.
- **mode collapse 강건**: 2D 토이에서 한 mode에 붕괴 초기화해도 다른 mode의 인력이 계속 작용해 회복.
- **로보틱스 전이**(Tab.7): Diffusion Policy의 다단계 생성기를 이 원스텝 모델로 교체 → 100 NFE 대비 **1 NFE로 대등~우수**.
- **한계(저자 명시)**: $q=p\Rightarrow V=0$은 증명되나 **역($V\to0 \Rightarrow q\to p$)은 일반적으로 미보장** — 부록 C.1에서 쌍선형 제약 기반 식별가능성 heuristic만 제시. 피처 인코더 없이는 실패.

## 관련
- **개념(concepts)**: [[정보이론-분포거리]] — 커널 softmax 정규화가 **InfoNCE와 동형**이고, "두 분포가 같아지는 지점($V{=}0$)"을 신호로 쓰는 구조의 앵커 / [[flow-matching-생성prior]] — **직접 대안**. flow matching/확산이 추론 시 반복 적분하는 자리를, 본 모델은 학습 시 분포 진화로 대체(둘 다 pushforward 관점 공유). / [[Transformer]]·[[ViT]] — DiT 생성기 백본 / [[DINO]] — 자기지도 피처 인코더(MoCo·SimCLR·MAE 계열)가 drift 커널의 전제.
- **연구 연결(다른 영역)**: [[NeoVerse]]·[[C4G]] — 현재 위키에서 생성 prior를 3D/4D에 쓰는 노트들. 이들이 의존하는 다단계 video diffusion을 원스텝으로 대체할 수 있다면 refine 비용이 급감하는 구조(현 시점 미검증 — 본 논문은 ImageNet·로보틱스만 검증).
- **출처 메타**: [[2026-07-31-GMD-논문]]
