---
title: StreamSplat (Online Dynamic 3D Reconstruction)
area: research
created: 2026-06-16
sources: [StreamSplat.md]
tags: [research, 4D-reconstruction, dynamic-scene, gaussian-splatting, feed-forward, online, streaming, uncalibrated, ICLR2026]
---

# StreamSplat: Towards Online Dynamic 3D Reconstruction From Uncalibrated Video Streams

> Wu, Yan, Yi, Wang, Liao (Univ. of British Columbia · Vector Institute · NTU). *"StreamSplat"*, ICLR 2026. arXiv:2506.08862. streamsplat3d.github.io

**한 줄 요약**: **보정 없는(uncalibrated) 영상 스트림** 을 **온라인·임의 길이** 로 동적 3DGS로 변환하는 fully feed-forward 프레임워크. ① 확률적 위치 샘플링 ② 양방향 deformation field ③ adaptive Gaussian fusion 세 혁신으로 최적화 기반 대비 **1200× 가속**, 스트리밍 지원. (출처: [[2026-06-16-StreamSplat-논문]])

## 문제의식
- 동적 3DGS 복원은 여전히 **오프라인·per-scene 최적화**: 카메라 보정 → 키프레임 정적 GS 최적화 → deformation field → temporal fusion(수 시간, 전체 시퀀스 접근 필요).
- 핵심 질문: 오프라인 품질을 유지하면서 **보정 없는 스트림에서 완전 온라인** 으로 가능한가? StreamSplat은 정적 정준 가우시안 유지 + per-Gaussian deformation + streaming fusion으로 답.

## 정준 공간 (보정 회피)
- 미지·가변 intrinsic(핀홀/fisheye)을 한 모델로 다루기 위해 **orthographic canonical space** 채택 → per-scene 보정 우회, 카메라 모션·원근 효과를 **가우시안 dynamics에 흡수**(Dynamic Decoder가 처리).

## ① Probabilistic 3D Gaussian Encoding
- 입력 프레임 + pseudo-depth(DepthAnythingV2)로 RGB-D → 8×8 patch → Transformer Static Encoder → upsampler가 2×2 patch별 가우시안 token. linear head로 3DGS 파라미터, 위치는 pixel-aligned $\mu_i=(u_i+o_{i,0}, v_i+o_{i,1}, g(o_{i,2}))$.
- **Probabilistic position sampling**(pixelSplat 영감): offset $o$ 를 직접 회귀하지 않고 **truncated normal** $o\sim N_{[-1,1]}(\mu_p,\Sigma_p)$ 로 샘플 → 초기 학습 spatial exploration, local minima 회피(ablation +6.36dB).

## ② Bidirectional Deformation Field
- 새 프레임마다 가우시안 수가 변하면 feed-forward 학습 곤란 → **forward(이전→현재) + backward(현재→이전) 양방향 모션** 을 공동 모델 → 견고한 cross-frame 연관 + emerging/vanishing 자연 처리. per-Gaussian 속도 $v$ + opacity 계수 $\gamma$. DINOv2 조건 Dynamic Decoder.

## ③ Adaptive Gaussian Fusion (opacity deformation)
- 새 가우시안 직접 결합 시 중복·redundancy. **시간 의존 opacity** $\alpha(t)=\alpha\cdot\sigma(-\gamma_0(|t-t_0|-\gamma_1))/\sigma(\gamma_0\gamma_1)$ 로 persistent·emerging·vanishing을 **하나의 life-cycle** 로(Fig. 3). reconstruction loss가 soft match를 유도 → hard assignment·iterative fusion 없이 장기 temporal coherence.

## 학습·추론
- **2단계**: ① Static Encoder(단일 프레임 + pseudo-depth → RGB·depth, scale/shift-invariant depth loss + noisy depth용 adaptive decay) ② encoder freeze 후 Dynamic Decoder(양방향 field + fusion, 중간 시각 $t\in[t_1,t_2]$ 재구성 + mask loss).
- **Online inference**(Alg. 2): 정준 가우시안 $\tilde G$ + 이전 embedding 유지, 프레임마다 forward/backward 가우시안 생성 → update·fuse·render·prune(opacity 0). 데이터: CO3Dv2·RE10K(정적, 보정 미사용) + DAVIS·YouTube-VOS(동적, mask). 8×A100 3일.

## 결과
- **동적 복원**(DAVIS): 키프레임 PSNR 37.83(최적화 DGMarbles 28.38, ~30min) — **0.049s/frame, 1200×**. 중간 프레임(5·8 frame interval)서 2D interpolation(AMT·RIFE 등)·4D 모두 능가. scene-coordinate MonST3R(키프레임만, post-opt 필요)와 키프레임 경쟁하면서 중간 프레임까지 복원.
- **정적**(RE10K): given-view서 pixelSplat·MVSplat·NoPoSplat 등 정적 baseline 능가, novel-view는 정적 모델이 우세하나 동적 baseline 중 최고(보정 부재로 인한 한계).
- **Zero-shot**(DyCheck·NVIDIA): w/o cam이 DGMarbles(w/o cam) 능가, GT intrinsic 쓰는 4DGS 수준 접근. Ablation: 확률 샘플링·pseudo-depth·양방향 field 각각 유효.

## 한계
- 외부 monocular depth estimator의 pseudo-depth 노이즈 의존. 2프레임 window라 빠른 모션·긴 occlusion서 초기 정보 손실. orthographic이라 근거리 강한 원근서 camera model 불일치(deformation이 대부분 보상).

## 관련
- **표현 기반**: [[3D-Gaussian-Splatting]] — 동적·온라인 3DGS / [[NeRF]] — 동적 NVS 계보(Omnimotion·RoDynRF 대조).
- **동적 peer**: [[4DGT]]·[[DGS-LRM]]·[[MoVieS]] — feed-forward 4D GS 클러스터(StreamSplat은 **온라인·uncalibrated** 차별) / [[MONST3R]] — scene-coordinate 동적 복원 직접 비교 / [[MoRe]] — 스트리밍 4D 대조(grouped causal vs bidirectional deformation).
- **개념(다른 영역)**: [[Transformer]] — encoder/decoder·[[DINO|DINOv2]] 조건 / [[Radiance Field-Volume Rendering]] — 3DGS α-blending image formation / [[ViT]] — patch encoder.
- **출처 메타**: [[2026-06-16-StreamSplat-논문]]
