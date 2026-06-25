---
title: 2026-06-25 pixelSplat 논문 (Charatan et al. CVPR 2024)
area: research
created: 2026-06-25
sources: [PixelSplat.md]
tags: [research, 3DGS, feed-forward, generalizable, source, paper]
---

# pixelSplat 논문 (출처 메타)

- **원본**: `raw/PixelSplat.md` (1450줄, PDF 추출본 16p, 이미지 `raw/assets/PixelSplat/`)
- **서지**: David Charatan, Sizhe Lester Li, Andrea Tagliasacchi, Vincent Sitzmann. *pixelSplat: 3D Gaussian Splats from Image Pairs for Scalable Generalizable 3D Reconstruction*. CVPR 2024. arXiv:2312.12337v4 (2024.04.04). (MIT · SFU/Toronto)
- **진입 판정**: [통과] / **영역**: research (Radiance Field NVS — feed-forward generalizable 3DGS)
- **특이사항**: 16p 전체 통독 — 본문(scale ambiguity·probabilistic depth·reparameterization) + 부록 A~D(학습 상세·3뷰 확장·아키텍처·한계). lint(2026-06-20) 데이터 갭 **1순위 pixelSplat**(6노트 언급) 해소 자료.

## 핵심 takeaway
1. **feed-forward generalizable GS의 시초**: 이미지 쌍 → 단일 forward로 pixel-aligned 3D 가우시안 radiance field 예측, 실시간·메모리 효율. → [[pixelSplat]]
2. **scale ambiguity 해결**: SfM 포즈는 per-scene 임의 스케일 $s_i$. **epipolar transformer**가 epipolar 선상 대응점을 찾아 삼각측량 깊이(positional encoding)로 스케일 인지.
3. **local minima 회피**: 위치를 직접 회귀하지 않고 **깊이 확률분포**(Z 버킷) 예측 후 **샘플링**. **reparameterization trick**: opacity $\alpha=\phi_z$(샘플 버킷 확률) → 미분 가능, 그래디언트가 샘플 확률을 조정(VAE 영감).
4. RealEstate10k 26.09·ACID 28.27, light field transformer 대비 렌더 **2.5 자릿수(~650×) 빠름**. 인코더 = DINO 사전학습 ResNet-50 + ViT-B/8.

## 후속 질문
- 확률적 깊이+epipolar([[pixelSplat]]) vs cost volume 매칭([[MVSplat]]) vs self-attention 회귀([[GS-LRM]]) — feed-forward 깊이/기하 추정 3계열의 정확도·일반화 trade-off?
- union(가우시안 융합·중복제거 없음) 한계 → [[MVSplat]]의 deterministic union·1 Gaussian/pixel과 비교?
- 정적 generalizable GS → 동적([[DGS-LRM]]) 확장 시 probabilistic depth가 유효한가?
