---
title: MVSplat (cost volume feed-forward sparse-view GS)
area: research
created: 2026-06-20
sources: [MVSplat.md]
tags: [research, 3DGS, feed-forward, cost-volume, MVS, generalizable]
---

# MVSplat: Efficient 3D Gaussian Splatting from Sparse Multi-View Images

> Chen, Xu, Zheng, Zhuang, Pollefeys, Geiger, Cham, Cai (Monash·ETH·Tübingen·Oxford·MS·NTU). ECCV 2024. arXiv:2403.14627. 코드: github.com/donydchen/mvsplat (출처: [[2026-06-20-MVSplat-논문]])

**한 줄 요약**: 희소(최소 2장) posed 이미지를 받아 **단일 forward pass**로 pixel-aligned [[3D-Gaussian-Splatting|3D 가우시안]]을 예측하는 generalizable 모델. 핵심은 **plane-sweep cost volume** — cross-view feature 매칭으로 깊이를 추정해 가우시안 center를 정확히 localize. pixelSplat 대비 **파라미터 10×↓·2× 빠름**이면서 화질·기하·일반화 모두 우위. ([[3D-Gaussian-Splatting]]의 feed-forward sparse-view 분기)

## 문제의식
정적 [[3D-Gaussian-Splatting]]·[[NeRF]]는 dense view(~100장) + per-scene 최적화 필요 → 비현실적. feed-forward 선행 **pixelSplat**(2뷰 회귀)은 cross-view feature를 epipolar Transformer로 학습하나, feature→**확률적 깊이 분포** 매핑이 모호해 기하 품질 낮고 floater 多. (출처: [[2026-06-20-MVSplat-논문]])

## 방법 (Fig. 2) — cost volume 기반 feed-forward
입력 $K$개 posed 이미지 → $H{\times}W{\times}K$ 개 가우시안 $\{(\mu_j,\alpha_j,\Sigma_j,c_j)\}$ 예측.
### Multi-view depth (3D conv 없이 2D만 → 경량)
- **Feature 추출**: 얕은 ResNet CNN(4×↓) + **multi-view Transformer**(Swin local window, self+cross attention) → cross-view aware feature. 임의 뷰 수 수용(각 뷰가 나머지 전체와 cross-attention).
- **Cost volume 구성**: plane sweep — 역깊이 도메인 $D{=}128$ 후보로 다른 뷰 feature를 warp 후 **dot product correlation** $C^i_{d_m}=F^i\cdot F^{j\to i}_{d_m}/\sqrt C$ → 뷰별 cost volume. (높은 유사도 = surface 가능성). 다뷰는 correlation 평균.
- **Refine + depth**: 2D U-Net(+최저해상도 **cross-view attention**)로 cost volume 정제 → softmax로 깊이 후보 가중평균 → 깊이. 추가 **depth refinement** U-Net(residual).

### Gaussian 파라미터 (깊이와 병렬)
- **center $\mu$**: 멀티뷰 깊이를 unproject → world 정렬 후 **deterministic union**(MVS의 융합 단계 불필요).
- **opacity $\alpha$**: softmax 매칭 confidence(최대값)에서 conv로 예측(표면 신뢰도 = opacity 물리적 유사). **$\Sigma$·$c$**: feature+cost volume+이미지에서 conv 예측. 학습은 **photometric만**($\ell_2$+LPIPS, GT depth 불필요).

## 결과
- **RealEstate10K 26.39 / ACID 28.25**(전 지표 SOTA, 특히 LPIPS). 추론 **0.044s**(encoder 0.043 + render ~500FPS), 22 fps.
- **vs pixelSplat**: 파라미터 12M vs 125M(**10×↓**), 2× 빠름, 1 Gaussian/pixel(vs 3). 기하: pixelSplat은 fine-tune 5만 step+depth 정규화 필요, MVSplat은 photometric만으로 floater 없는 깨끗한 가우시안(Fig.4).
- **cross-dataset 일반화 최강**(Tab.2): RE10K 학습→DTU zero-shot서 pixelSplat 압도(LPIPS 0.385 vs 0.560). cost volume이 feature **상대 유사도**(절대 scale 불변)라 OOD 강건. RE10K→ACID zero-shot이 ACID 전용 학습 pixelSplat보다 우수.
- **Ablation**: cost volume 제거 시 −3dB(가장 치명적, 두 뷰가 3D 정렬 실패), cross-view attention/U-Net/depth refine 모두 기여. cost volume은 pixelSplat에 이식해도 +0.74dB(일반성).

## 한계
- 비램버시안·**반사면**(유리·창)서 부정확(공통 난제). RE10K 단일 학습이라 in-the-wild 다양성 부족.

## 관련
- **기반**: [[3D-Gaussian-Splatting]] — 미분 splatting 토대. 본 논문은 그 **feed-forward·sparse-view** 일반화.
- **개념(다른 영역)**: [[SfM-COLMAP]] — MVS/plane-sweep는 SfM 기하의 매칭 사촌(단 GT depth 불필요·미분가능) / [[Radiance Field-Volume Rendering]] — $\alpha$-blending / [[구면조화함수-SH]] — 색 표현 / [[ViT]]·[[Transformer]] — Swin 백본.
- **feed-forward GS 계보**: [[GS-LRM]](Transformer 회귀 정적 GS) · [[DGS-LRM]](feed-forward 동적) — MVSplat은 **명시적 cost volume 매칭**으로 차별. pixelSplat·Splatter Image·latentSplat 동류.
- **기하 추정 대조**: [[DUSt3R]]·[[MASt3R]]·[[VGGT]](pointmap 직접 회귀) vs MVSplat(cost volume 매칭) — feed-forward 3D의 두 갈래.
- **구조·압축**: [[Scaffold-GS]](anchor view-adaptive) — 정적 GS 효율화 이웃.
- **출처 메타**: [[2026-06-20-MVSplat-논문]]
