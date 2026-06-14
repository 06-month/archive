---
title: ViT (Vision Transformer)
area: concepts
created: 2026-06-13
sources: [ViT.md]
tags: [concepts, ViT, vision-transformer, image-recognition, backbone, ML]
---

# ViT (Vision Transformer)

> Dosovitskiy et al. *"An Image is Worth 16×16 Words: Transformers for Image Recognition at Scale"*, ICLR 2021. arXiv:2010.11929.

**한 줄 요약**: 이미지를 **고정 크기 패치의 시퀀스**로 보고, CNN 없이 **표준 [[Transformer]] 인코더**에 그대로 넣어 분류하는 모델. 대규모 사전학습이 받쳐주면 CNN의 귀납편향 없이도 SOTA를 넘어선다 — 3D 복원 백본의 주류.

## 방법 (Fig.1)
1. 이미지 $x\in\mathbb{R}^{H\times W\times C}$ → $P{\times}P$ 패치 $N=HW/P^2$ 개로 분할 → 펼쳐서 선형사상($D$차원 패치 임베딩).
2. **[class] 토큰**(BERT식 학습형 임베딩)을 앞에 붙임 → 인코더 출력의 그 토큰 상태 $z_L^0$ 이 이미지 표현.
3. **위치 임베딩** 더함(학습형 1D) → 표준 Transformer 인코더(MSA + MLP, **LN은 블록 앞**, residual). MLP는 GELU 2층.
4. 분류 head: 사전학습 때 MLP 1은닉, 파인튜닝 때 단일 linear.
- 표기: `ViT-L/16` = Large, 패치 16×16. 패치 작을수록 시퀀스 길어져 비쌈(비용 $\propto$ 패치$^{-2}$).
- 변형: ViT-Base(86M)/Large(307M)/Huge(632M). CNN 특징맵을 패치로 쓰는 **하이브리드**도 가능.

## 핵심 발견 — "규모가 귀납편향을 이긴다"
- ViT는 CNN의 **지역성·평행이동 등변성** 같은 이미지 귀납편향이 거의 없음 → **작은 데이터(ImageNet)면 동급 ResNet보다 약간 낮음**.
- 그러나 **대규모 사전학습**(ImageNet-21k 14M, JFT-300M)에서 역전: ViT-H/14가 ImageNet **88.55%**, CIFAR-100 94.55%, VTAB 77.63% — ResNet(BiT)·Noisy Student 상회하면서 **사전학습 연산은 2–4× 적음**.
- 데이터 적으면 CNN 귀납편향이 유리, 많으면 데이터에서 직접 패턴 학습이 더 나음(Fig.3·4).

## 통독에서 건진 디테일 (부록)
- **스케일링(D.2)**: 깊이(depth) 확장이 가장 효과적(16층 후 체감, 64층까지 이득), 너비는 미미, **패치 축소(시퀀스 ↑)는 파라미터 없이 견고한 개선**. 성능 예측은 파라미터 수보다 **연산량**.
- **위치 임베딩(D.4)**: 1D/2D/상대 — **서로 거의 차이 없음**, "없음 vs 있음"만 큰 차이(패치 단위라 공간해상도가 낮아 인코딩 방식이 덜 중요). [[위치인코딩-positional-encoding]] 참조.
- **[class] 토큰 vs GAP**: 둘 다 잘 됨, LR만 다르게.
- **self-supervision**: masked patch prediction(BERT식)로 ViT-B/16 **79.9%**(scratch +2%, 지도식 -4%) — 가능성만 확인.
- 메모리: ViT가 동급 ResNet보다 **메모리 효율적**. 깊을수록 attention distance↑(저층은 일부 헤드만 전역).

## 관련
- [[Transformer]] · [[위치인코딩-positional-encoding]] (concepts) — ViT의 토대
- [[HaMeR]] · [[Hamba]] · [[WiLoR]] (research) — ViT(특히 ViT-H) 백본으로 손 복원
