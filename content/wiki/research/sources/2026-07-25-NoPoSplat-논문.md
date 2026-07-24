---
title: 2026-07-25 NoPoSplat 논문 (Ye et al. ETH·NVIDIA ICLR 2025)
area: research
created: 2026-07-25
sources: [NoPoSplat.md]
tags: [research, 3DGS, feed-forward, pose-free, generalizable, source, paper]
---

# NoPoSplat 논문 (출처 메타)

- **원본**: `raw/NoPoSplat.md` (1876줄, PDF 추출본 21p, 이미지 `raw/assets/NoPoSplat/`)
- **서지**: Botao Ye, Sifei Liu, Haofei Xu, Xueting Li, Marc Pollefeys, Ming-Hsuan Yang, Songyou Peng. *No Pose, No Problem: Surprisingly Simple 3D Gaussian Splats from Sparse Unposed Images*. ICLR 2025. arXiv:2410.24207v1 (2024.10.31). (ETH Zurich · NVIDIA · Microsoft · UC Merced)
- **진입 판정**: [통과] / **영역**: research (Feed-forward GS 복원 — pose-free generalizable 3DGS)
- **특이사항**: 21p 전체 통독 — 본문(§1~5) + References + 부록 A~D(학습 상세·overlap 평가셋 생성·backbone init ablation·2단계 포즈 ablation·Splatt3R 재학습 비교·3뷰 확장·한계·추가 비교) 포함.

## 핵심 takeaway
1. **정준공간(canonical space) 예측**: 첫 뷰 로컬 좌표계를 기준으로 모든 뷰 가우시안을 직접 예측 → transform-then-fuse·포즈 불필요, 저overlap 융합 실패·ghosting 해소. → [[NoPoSplat]]
2. **광도손실만으로 학습**: GT depth 불요 → RE10K·ACID·DL3DV 등 영상 데이터 활용. MASt3R init이나 depth 사전학습 없이도 유사 성능.
3. **intrinsic token**으로 스케일 모호성 해결(global-add·dense 대비 최고).
4. **순수 ViT**(epipolar·cost volume 기하 prior 없음) → 저overlap·OOD에서 오히려 유리.
5. **2단계 포즈 추정**(PnP+RANSAC → 광도 refine)으로 DUSt3R·MASt3R·RoMa 대폭 상회(GT depth·매칭손실 없이). 0.015s/66fps, pixelSplat 5×·MVSplat 2× 빠름.

## 후속 질문
- 정준공간(NoPoSplat) vs pointmap 정렬([[DUSt3R]]·[[VGGT]]) vs cost volume([[MVSplat]]) — pose-free feed-forward 3D의 표현 선택이 저overlap·일반화에 미치는 영향?
- 광도손실-only 학습이 depth 감독 대비 기하 정확도에서 어디까지 따라오나(부록 Tab.6 CroCoV2 init)?
- 정적 한정 → 동적 확장: [[NeoVerse]]가 VGGT 위에서 4D로 확장한 방식과 canonical space 아이디어의 접점?
- intrinsic token vs Plücker dense embedding — 포즈까지 필요한 태스크에서 trade-off?
