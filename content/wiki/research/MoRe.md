---
title: MoRe (Motion-aware Feed-forward 4D Reconstruction)
area: research
created: 2026-06-16
sources: [MoRe.md]
tags: [research, 4D-reconstruction, dynamic-scene, streaming, causal-attention, motion-mask, camera-pose, VGGT-based]
---

# MoRe: Motion-aware Feed-forward 4D Reconstruction Transformer

> Fang, Chen, Zhang, Di, Zhang, Yang, Liu (Tsinghua Univ · Li Auto). *"MoRe: Motion-aware Feed-forward 4D Reconstruction Transformer"*, arXiv:2603.05078 (2026). 프로젝트: hellexf.github.io/MoRe/

**한 줄 요약**: [[VGGT]] 같은 강한 정적 백본 위에서, **attention-forcing** 전략으로 동적 모션과 정적 구조를 분리하고, **grouped causal attention + BA-like refinement** 로 스트리밍 입력을 처리하는 motion-aware 4D 복원 트랜스포머. 추론 시 모션/세그멘테이션 prior 없이(test-time-free) monocular 영상에서 카메라·깊이·포인트맵·**모션 마스크**를 공동 예측. (출처: [[2026-06-16-MoRe-논문]])

## 문제의식
- 실시간 feed-forward 복원 모델은 대부분 **정적 장면 학습** → 움직이는 물체·큰 카메라 모션이 3D 추정을 크게 저하. 하이브리드 최적화는 견고하나 다단계·반복으로 고비용, 긴/스트리밍 영상에 부적합.
- **핵심 관찰(Fig. 3)**: VGGT의 **camera token attention**이 동적 물체를 정적 배경과 혼동 — 움직이는 영역에 거의 균일 attention 분산 → 카메라 추정 피처 오염. 이를 명시적으로 교정하면 동적 강건성 확보.

## 핵심 ① Motion-aligned Attention (attention-forcing, §3.2)
- 학습 시 **GT 모션 마스크**만 사용, 추론엔 추가 출력·연산 없음(test-time-free). 마스크를 $s\times s$ 패치로 나눠 토큰별 motion score $a_i$(정적일수록 ↑).
- camera token의 image token attention 분포 $\{\alpha_i\}$ 를 **확률분포로 해석**, $a_i$ 를 penalty prior로 사용해 supervise: $L_{attn}=\frac1M\sum\max(0,a_i-C)\cdot\alpha_i$. 동적 토큰엔 강한 supervision, 정적 토큰엔 미세 — **motion-gated** 설계.
- KL divergence 대안은 attention을 강제 정규화해 정적 장면에 부적절한 inductive bias → 제안 손실이 우수(Tab. 7). 결과적으로 camera token이 정적 영역에 집중, 동적 콘텐츠 누출 억제(Fig. 10).

## 핵심 ② Grouped Causal Attention (스트리밍, §3.3)
- LLM의 upper-triangular causal mask는 이미지 토큰을 flat sequence로 취급해 **프레임 내 대응을 깨뜨림**. → **frame-wise causal mask** 로 재정식: 프레임 간엔 시간 인과성, **프레임 내엔 완전 양방향 attention**(공간 일관성 보존).
- 첫 이미지 쌍이 KV 캐시 초기화, 이후 프레임은 누적 컨텍스트에 causal attention + KV 캐싱 → 중복 재계산 없이 효율적 온라인 처리. window-sliding으로 KV 캐시 무한증가 방지.

## 핵심 ③ BA-like Refinement
- 엄격한 causal은 장기 전역 정보 교환 제한 → 긴 시퀀스서 포즈 누적 오차. 보완: 추론 중 camera query $Q^{cam}_t$ 캐시, 전체 시퀀스 처리 후 각 camera token이 **전 프레임 캐시 피처에 추가 attention pass** $C^{opt}_t=\text{Attn}(Q^{cam}_t,K_{1:T},V_{1:T})$ — BA 최적화 스텝과 유사한 전역 일관성 복원. 학습 땐 camera token을 복제(원본/복제 2경로)해 streaming·post-hoc 경로 일관성 강제.

## 학습
- VGGT·DUSt3R 따라 다중 task: confidence-weighted 회귀(깊이·포인트맵) + 상대 포즈 손실 $L_{cam}$ + 모션 마스크 **BCE**($L_{motion}$). 원본 camera token은 earlier→later 상대변환서 gradient detach(시간 chain 역전파 방지), 복제 token은 full gradient.
- 12개 정적·동적 데이터셋(Dynamic Replica·PointOdyssey·Spring·VKITTI·TartanAir·Co3Dv2·ScanNet·Waymo·OmniWorld 등). 100K iter, **64×A800 약 2일**, 해상도 518, bfloat16.
- **모션 마스크 추출 파이프라인**(부록): SAM2 세그멘테이션 + GT ego-flow vs SEA-RAFT optical flow 불일치 통계 임계($d_k>\mu+2\sigma$)로 동적 영역 라벨 생성.

## 결과
- **카메라 포즈**(Sintel·TUM-dyn·Bonn·ScanNet, Tab. 1): full-attention 변형이 SOTA π³와 대등(훨씬 적은 데이터로), 스트리밍 변형이 모든 스트리밍 baseline(Spann3R·CUT3R·StreamVGGT·Wint3R·Stream3R) 능가. 동적 셋은 **zero-shot**.
- **video depth**(Sintel·Bonn·TUM·KITTI, Tab. 2): full-attention이 VGGT 능가, 스트리밍이 스트리밍 baseline 능가.
- **정적 Co3Dv2**(Tab. 6): full-attention이 π³ 포함 전 baseline 능가 — motion-aware 설계가 정적 성능 훼손 안 함.
- **속도**(KITTI, Tab. 5): 30 FPS(window=5), VGGT 7.32·CUT3R 16.58 대비 최상위 tier.
- **Ablation**: attention-forcing·grouped causal·BA-like 각각 유효.

## 한계
- **모션 마스크 품질 의존**(노이즈가 학습에 전파) → 자기지도 방향 향후 과제. feed-forward라 매우 장기 의존·복잡 상호작용·극단적 비강체/모션블러·occlusion에 취약.

## 관련
- **직접 기반(research)**: [[VGGT]] — full-attention 백본이자 attention 혼동 관찰의 출발점. MoRe는 VGGT를 4D로 확장.
- **동적 peer**: [[MONST3R]] — 동적 4D 선행(전역 최적화 기반) / [[POMATO]] — 동적 peer(DUSt3R 매칭 헤드 vs MoRe의 attention-forcing) / [[DUSt3R]] — 계보 뿌리.
- **개념(다른 영역)**: [[Transformer]] — causal attention·KV 캐싱은 LLM에서 차용 / [[ViT]] — 이미지 인코더.
- **출처 메타**: [[2026-06-16-MoRe-논문]]
