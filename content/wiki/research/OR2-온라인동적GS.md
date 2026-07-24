---
title: OR² (온라인 동적 3DGS 시간 일관성)
area: research
created: 2026-07-01
sources: [onlinedynamic3DGS.md]
tags: [research, 3DGS, dynamic, online-reconstruction, streaming, temporal-consistency, residual-map]
---

# OR² — Compensating Spatiotemporally Inconsistent Observations for Online Dynamic 3DGS

> Yun, Bae, Son, Kim, Lee, Bang, Uh (Yonsei/ETRI), **SIGGRAPH Conference Papers 2025** (arXiv:2505.01235).
> 프로젝트: https://bbangsik13.github.io/OR2. 기존 online 동적 재구성 방법의 **정적 영역 시간 비일관성(flickering)** 문제를 진단하고, **관측 오차를 분리**하는 plug-in으로 해결. (출처: [[2026-07-01-OR2-논문]])

## 한 줄 요약
관측 영상은 이상 신호가 아니라 **시변 오차(센서 노이즈 등)를 포함**하며, online 재구성은 매 순간 한 프레임에 과적합해 이 오차까지 학습 → 정적 영역이 깜빡인다. **학습 가능한 residual map**으로 오차를 따로 흡수해 가우시안이 "이상 관측"만 학습하게 만드는 baseline-무관 plug-in.

## 배경: online vs offline 재구성
- **offline** ([[Ex4DGS]]·[[SpacetimeGS]]·[[4DGS]] 등): 전체 영상에 접근, 단일 모델로 정리. 용량 한계로 프레임 간 미세차를 다 못 맞춰 **평균으로 수렴** → 정적 영역 시간 일관성 유지. 단, 스트리밍 불가·긴 영상 OOM·길이 의존 하이퍼파라미터.
- **online** (StreamRF·[[3D-Gaussian-Splatting|3DGS]] 기반 3DGStream·HiCoM·Dynamic3DG): 순차 프레임을 소비하며 한 순간의 모델을 갱신·전송. 무한 길이·live-streaming 가능. 단, 한 프레임에만 접근 → **시변 오차에 과적합** → 정적 영역 깜빡임 (Fig. 1a·3).

> [!note] 문제의 근원 (Section 3.2)
> 인접 프레임은 정적 영역에서도 색이 미세하게 다르다(대부분 8-bit로 4 미만, 거의 지각 불가). 이 오차는 센서 노이즈 등으로 **불가피**하며 시간에 따라 변한다. 합성 데이터에서 노이즈 유/무 관측으로 학습을 비교해(Fig. 5), 노이즈가 깜빡임을 유발함을 실증.

## 핵심 방법: Observation-Restoring Online Reconstruction
관측을 **이상 관측 + 오차**로 분해하고, 오차는 카메라 뷰 $v$·프레임 $t$별 **학습 가능한 residual map** $\hat{M}^v_t \in \mathbb{R}^{3\times H\times W}$로 따로 모델링한다.

> 원문 핵심 수식 (Eq. 1): $\tilde{I}_t = I_t + M_t = \hat{I}_t + \hat{M}_t$
> — 관측 $\tilde{I}_t$ = (렌더 이미지 $\hat{I}_t$) + (추정 residual $\hat{M}_t$). 최적화는 $\tilde{I}_t$와 $\hat{I}_t+\hat{M}_t$의 차를 줄이며 $G_t$·$\hat{M}_t$를 **공동 갱신** (Eq. 2, Adam).

- **왜 되나**: 다중뷰·시간 비일관 고주파 노이즈는 가우시안 한 세트를 재조정하는 것보다 **residual map으로 맞추는 게 쉽다**. 결과적으로 가우시안은 오차 없는 이상 장면(=복원된 관측)만 학습.
- **복원(restoration)**: 관측에서 residual을 빼면 GT에 가까운 이미지 복원 → Sync-NeRF에서 **PSNR +2.58** (Fig. 9).
- **부수 효과**: 오차가 유발하던 pixel-space gradient 과대 → densification 억제. 가우시안 수 감소($G_0$ 0.69×, $G^{new}_t$ 0.28×) → 학습·렌더 가속, 메모리↓. residual map은 **학습 때만** 쓰고 저장 안 함.

### 손실 (Eq. 3·4)
- 첫 프레임: $L_{total}=(1-\lambda)L_1+\lambda L_{\text{D-SSIM}}+\lambda_{opa}L_{opa}+\lambda_{res}L_{res}$
- **$L_{opa}=\sum_i\|\sigma^i_t\|_1$** (opacity L1): 3DGS의 opacity reset이 residual 최적화를 방해 → reset 대신 L1 정규화 (cf. [[Deformable3DGS|E-D3DGS]]·MCMC).
- **$L_{res}=\|\hat{M}^v_t\|_1$**: residual이 시점 의존 색을 흡수하는 과적합 방지.
- residual map은 densification 시작 전까지 0으로 동결(초기 지배 방지). 이후 프레임엔 $L_{opa}$ 제외(baseline 공정 비교).

### 순차 프레임: new Gaussian 재사용
3DGStream은 새 물체용 $G^{new}_t$를 한 프레임만 쓰고 버려 **동적 영역** 시간 비일관 발생. OR²는 변형·신규 가우시안을 모두 다음 프레임으로 **전파**($G_{t+1}\leftarrow(G_t,G^{new}_t)$) → 동적 영역 일관성↑ (Appendix D.2, Fig. 16: glass→coffee 왜곡 해소). 전체 알고리즘: Appendix Algorithm 1.

## 실험
- **plug-in 대상 baseline**: Dynamic3DG† (Luiten, forward-facing용 수정판), 3DGStream (Sun, iNGP residual), HiCoM (Gao, 계층 모션장). StreamRF는 재현 곤란으로 제외.
- **데이터셋**: Neural 3D Video(6 scene), MeetRoom(3), Sync-NeRF(합성 GT — 노이즈 통제 실험용, fox5).
- **지표**: PSNR·SSIM + **mTV**(masked Total Variation, 정적 영역 마스크 내 시간 변동 = 시간 일관성, 낮을수록 좋음).
- **결과** (Table 1): 세 baseline 모두 +ours로 PSNR·SSIM↑, **mTV 대폭↓**(예: 3DGStream Neural3DV mTV 0.178→0.103), 가우시안 수·학습시간↓. 10-run 분산도 낮아 안정성↑ (Fig. 8·14).
- **ablation** (Table 2·3): residual map 제거 시 mTV 0.103→0.161로 악화 / **SH degree 3** 유지(residual이 오차를 흡수해 고용량 SH가 과적합 안 함, degree 1보다 우수) / new Gaussian 재사용.
- **vs 전처리 denoising**(VRT): 시간 일관성 개선은 있으나 over-smoothing·프레임당 196초로 OR²(6초)보다 열등 (Table 2). **vs V3 temporal loss**: OR² 우세 (Table 6).

## 한계
- 빠른 모션·모션 블러·희소 시점·심한 노이즈는 baseline의 본질적 실패 → OR²가 해결 못 함(Fig. 12). 잘 복원된 장면을 전제하므로 뷰 수↓·노이즈↑에서 효과 감소 (Appendix D.4–D.5).
- online의 한계상 **offline 수준 시간 일관성엔 미달**(최고 결과도 최악 offline 대비 mTV 1.4×) — 한 순간 스냅샷만 쓰는 online 구성의 태생적 격차.

## 위키 연결
- 표현 기반: [[3D-Gaussian-Splatting]] · 계보 뿌리 [[NeRF]] / [[Radiance Field-Volume Rendering]]
- 비교 대상 offline 동적 GS: [[SpacetimeGS|STG]]·[[4DGS]]·[[Deformable3DGS|E-D3DGS]]·[[Ex4DGS]]·[[3D-4DGS]]
- 스트리밍 4D 재구성 이웃(feed-forward 계열): [[StreamSplat]]
- 개념: [[구면조화함수-SH]](SH degree ablation 핵심) · [[SfM-COLMAP]](첫 프레임 가우시안 초기화)
- 모션 정규화 plug-in 성격 유사: [[Relaxed-Rigidity-동적GS]]
