---
title: 2026-06-16 StreamSplat 논문 (Wu et al. ICLR 2026)
area: research
created: 2026-06-16
sources: [StreamSplat.md]
tags: [research, 4D-reconstruction, gaussian-splatting, online, streaming, source, paper]
---

# StreamSplat 논문 (출처 메타)

- **원본**: `raw/StreamSplat.md` (2226줄, PDF 추출본 24p, 이미지 `raw/assets/StreamSplat/extracted-images/` + `page-renders/`)
- **서지**: Zike Wu, Qi Yan, Xuanyu Yi, Lele Wang, Renjie Liao. *StreamSplat: Towards Online Dynamic 3D Reconstruction From Uncalibrated Video Streams*. ICLR 2026. arXiv:2506.08862v2 (2026.03.02). (Univ. of British Columbia + Vector Institute + NTU)
- **프로젝트**: https://streamsplat3d.github.io/
- **진입 판정**: [통과] / **영역**: research (online·uncalibrated feed-forward 4D GS)
- **특이사항**: PDF 추출이라 식(1~11)·Alg.1~2·정량표(Tab.1~9)·Fig.2~16 분산. 본문(p1–9) + 부록 A(3DGS 배경·orthographic)·B(구현·아키텍처)·C(추가 실험·zero-shot)·D(orthographic vs perspective·bounded velocity·recon vs generation)·E(한계)까지 전체 통독. 참조목록은 메타만.

## 핵심 takeaway
1. **Uncalibrated·online 스트림** → 동적 3DGS feed-forward, 임의 길이. orthographic canonical space로 보정 우회. → [[StreamSplat]]
2. **Probabilistic position sampling**(truncated normal)로 feed-forward 3DGS local minima 회피(+6.36dB).
3. **Bidirectional deformation field**: forward+backward 모션으로 emerging/vanishing 자연 처리.
4. **Adaptive Gaussian fusion**: 시간 의존 opacity life-cycle로 hard assignment 없이 temporal coherence. 1200× 가속.

## 후속 질문
- pseudo-depth(DepthAnythingV2) 노이즈 의존 → 내부 depth refinement로 대체?
- 2프레임 window의 장기 occlusion 손실 → 확장 frame history fusion?
- orthographic vs perspective: 근거리 강원근서 잔여 왜곡 — 경량 intrinsic 추정 결합?
