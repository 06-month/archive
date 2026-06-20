---
title: 2026-06-20 Deformable 3D-GS 논문 (Yang et al. CVPR 2024)
area: research
created: 2026-06-20
sources: [Deformable3DGS.md]
tags: [research, 4DGS, dynamic-scene, deformation-field, source, paper]
---

# Deformable 3D Gaussians 논문 (출처 메타)

- **원본**: `raw/Deformable3DGS.md` (2115줄, PDF 추출본 15p, 이미지 `raw/assets/Deformable3DGS/`)
- **서지**: Ziyi Yang, Xinyu Gao, Wen Zhou, Shaohui Jiao, Yuqing Zhang, Xiaogang Jin. *Deformable 3D Gaussians for High-Fidelity Monocular Dynamic Scene Reconstruction*. CVPR 2024. arXiv:2309.13101v2 (2023.11.19). (저장성대 CAD&CG 국가중점연구실 · ByteDance)
- **진입 판정**: [통과] / **영역**: research (Radiance Field NVS — 단안 동적 deformation-field GS)
- **특이사항**: PDF 추출이라 식(1~7)·정량표(Tab.1~8)·Fig 분산. 본문(p1–8) + 부록 A~D(MLP 구조·loss·per-scene·FPS·SE(3) ablation·배경색·실패사례) 전체 통독.

## 핵심 takeaway
1. **3D-GS를 deformation field로 동적 확장한 최초** 프레임워크(저자 주장). 정준공간 3D 가우시안 + 시간조건 변형장. → [[Deformable3DGS]]
2. **순수 implicit MLP 변형장**($F_\theta$, D=8·W=256, 위치인코딩 입력): grid/plane 안 씀 — 동적 장면은 high-rank라 low-rank 격자 가정 위배(↔ [[4DGS]]의 HexPlane). 저장 +2MB.
3. **AST(Annealing Smooth Training)**: 시간 입력에 선형 감쇠 가우시안 노이즈 → 부정확 COLMAP 포즈의 시간보간 jitter 완화, 추가 오버헤드 0.
4. **[[4DGS]](Wu et al.)와 동시기(concurrent) 작업** — 4DGS가 본 논문을 concurrent로 명시 인용. 둘 다 canonical+deformation이나 인코더가 MLP vs HexPlane로 갈림.

## 후속 질문
- 부정확 포즈/희소 시점서 explicit 렌더의 overfitting → AST 외 기하 prior로 더 줄일 수 있나?
- 순수 MLP(고rank 대응) vs HexPlane([[4DGS]], 속도) — 화질·속도 trade-off 정량 비교?
- 미세 얼굴표정 등 복잡 인체 모션 한계 → [[HMR]]·[[MANO]] 류 파라메트릭 prior 결합?
