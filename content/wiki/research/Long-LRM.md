---
title: Long-LRM (Long-sequence LRM, 광범위 다시점 장면 GS 복원)
area: research
created: 2026-07-26
sources: [Long-LRM.md]
tags: [research, 3DGS, feed-forward, scene-level, wide-coverage, mamba, state-space-model, hybrid-architecture, token-merging, GS-LRM-lineage]
---

# Long-LRM: 긴 시퀀스 LRM으로 광범위 장면 가우시안 복원

> Chen Ziwen, Hao Tan, Kai Zhang, Sai Bi, Fujun Luan, Yicong Hong, Li Fuxin, Zexiang Xu (Oregon State · Adobe Research · Hillbot). *"Long-LRM: Long-sequence Large Reconstruction Model for Wide-coverage Gaussian Splats"*, arXiv:2410.12781 (2025.08). 프로젝트: arthurhero.github.io/projects/llrm

**한 줄 요약**: **32장 960×540 이미지 → 360° 광범위 장면 3DGS를 1초**에 복원하는 feed-forward 모델. [[GS-LRM]]이 2~4뷰(좁은 범위)에 그친 것을, **250K 토큰**(patch 8²)의 초장 시퀀스로 60× 확장. 핵심은 **Mamba2(선형 복잡도) + 트랜스포머(전역 context) 하이브리드**({7M1T}×3) + 경량 token merging + Gaussian pruning. 최적화 3DGS 대비 **800× 빠르고** 품질 대등. (출처: [[2026-07-26-Long-LRM-논문]])

## 문제의식
- generalizable feed-forward GS([[pixelSplat]]·[[MVSplat]]·[[GS-LRM]])는 **1~4 입력뷰·좁은 범위**만 처리. 큰 실세계 장면(수십 장 필요)은 여전히 **최적화 기반([[3D-Gaussian-Splatting]] 10분+)**만 가능.
- GS-LRM은 epipolar·cost volume 없는 순수 트랜스포머로 SOTA지만 **2차 복잡도** 탓에 2~4뷰 한정. 32×960×540 = **~250K 토큰**(LLama3 128K보다 김) → 트랜스포머로 감당 불가.
- 해결: **SSM(Mamba2)의 선형 복잡도**로 초장 시퀀스 처리 + 트랜스포머로 전역 추론 보존.

## 하이브리드 아키텍처 (핵심, §3)
- GS-LRM처럼 멀티뷰 이미지+**Plücker ray**를 패치화해 seq2seq per-pixel 가우시안 회귀. 24블록 = **{Mamba2 ×7 + Transformer ×1} × 3**.
- **Mamba2 블록**(§3.2): SSM $h_t=Ah_{t-1}+Bx_t,\ y_t=Ch_t$, $A,B,C$를 입력에서 계산. Mamba2는 $A$를 스칼라×단위행렬로 제한 → 블록 곱·큰 state. 이미지용 **양방향 스캔**(forward+backward 합). 트랜스포머는 in-context·장거리 추론 우위 → 하이브리드가 균형([[SSM]]·[[Mamba-선형시간시퀀스]] 참조, Jamba 착안).
- **token merging**(§3.3): 9번째 블록 앞에서 2×2 stride-2 conv로 토큰 1/4↓(patch 8→16, dim 256→1024). ultra-resolution 학습을 가능케 함(다른 변종 전부 OOM).
- **Gaussian pruning**: per-pixel 예측은 ~17M 가우시안(중복 과다). opacity L1 정규화로 불투명도 near-zero 유도(99%→40%) → opacity<0.001 pruning(품질 손실 없음).

## 학습 목표 (§3.4)
- **rendering loss**: MSE + Perceptual(λ=0.5). **depth 정규화**: DepthAnything disparity와 scale-invariant Smooth-L1 → **floater 억제·학습 안정화**. **opacity L1**: 추론 효율(sparse 가우시안).
- Curriculum 256→512→960×540(3 stage). DL3DV-10K 학습. AdamW.

## 결과
- **광범위 장면**(DL3DV-140·Tanks&Temples, Tab.1): 32뷰 960×540 → **1초**, 최적화 3DGS(13분)·Mip-Splatting·Scaffold-GS와 대등~우위(**800× speedup**). post-prediction 최적화로 추가 향상(Ours10 vs 3DGS30k PSNR +2dB). floater 대폭 감소(대규모 prior + 정규화).
- **sparse 2뷰**(RE10K 256², Tab.2): [[pixelSplat]]·[[MVSplat]] +2dB 능가, GS-LRM도 소폭 상회(하이브리드 효과).
- **2D GS 호환**(Tab.3, Fig.4): 2D GS로 fine-tune → depth·geometry 강화, 색 품질 유지. ScanNetv2 zero-shot depth.
- **ablation**(Tab.4): 트랜스포머 단독 = 32뷰 512서 50.5s/iter(너무 느림). Mamba2 단독 = -1.8~3.3 PSNR(장거리 의존성 약). 하이브리드 = 양쪽 장점. token merging이 ultra-res 학습 필수.

## 한계 (요지)
- per-pixel 예측의 근본 중복(pruning으로 완화). Mamba의 state 기반 설계가 초고해상도 장거리 의존성서 트랜스포머 대비 약함(하이브리드로 보완).

## 관련
- **계보(research)**: [[GS-LRM]]의 **many-view·wide-coverage 확장**(토큰 60×). feed-forward GS 복원(LRM 계보) 정적 분파. [[pixelSplat]]·[[MVSplat]] — 좁은 범위 feed-forward GS 대비(epipolar·cost volume 한계). [[BTimer]] — 같은 GS-LRM 계보 동적 자매(BTimer=시간 확장, Long-LRM=공간·뷰 확장).
- **개념(다른 영역, 핵심 교차)**: [[Mamba-선형시간시퀀스]] — Mamba2 블록의 직접 토대(선택적 SSM) / [[SSM]] — 상태공간모델 선형 복잡도 / [[Transformer]]·[[ViT]] — 하이브리드의 전역 attention·patch 백본. (Hamba가 손 복원에 Mamba를 쓴 것과 같은 개념을 3D 장면 복원에 적용.)
- **표현(research)**: [[3D-Gaussian-Splatting]] — per-pixel 가우시안·2D GS 변종 / [[Scaffold-GS]] — 최적화 기반 대규모 GS 비교군 / [[NeRF]] — 복원 계보 뿌리.
- **출처 메타**: [[2026-07-26-Long-LRM-논문]]
