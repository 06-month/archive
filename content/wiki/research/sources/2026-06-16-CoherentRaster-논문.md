---
title: 2026-06-16 CoherentRaster 논문 (Sim et al. 2026)
area: research
created: 2026-06-16
sources: [CoherentRaster.md]
tags: [research, 3DGS, light-field-display, source, paper]
---

# CoherentRaster 논문 (출처 메타)

- **원본**: `raw/CoherentRaster.md` (1914줄, PDF 추출본 14p, 이미지 `raw/assets/CoherentRaster/extracted-images/` + `page-renders/` 14장)
- **서지**: Gyujin Sim, Seungjoo Shin, Hosung Jeon, Gwangsoon Lee, Hyon-Gon Choo, Sunghyun Cho. *CoherentRaster: Efficient 3D Gaussian Splatting for Light Field Displays*. SIGGRAPH Conference Papers '26 (LA, 2026.07). arXiv:2605.04509v1. DOI 10.1145/3799902.3811217. (POSTECH + ETRI)
- **코드**: https://github.com/sgj0402/coherent-raster
- **진입 판정**: [통과] / **영역**: research (3DGS 응용 — 라이트필드 디스플레이)
- **특이사항**: PDF 추출이라 수식(식1~11)·정량표(Table 1~6)·알고리즘 1·2가 행 단위로 흩어짐. 부록 A(알고리즘)·B(클러스터링/비트레이아웃)·C(RTX3090·시간분해·specular)는 본문 압축 시 page-renders로 교차확인.

## 핵심 takeaway
1. LFD 인터레이스 영상을 **서브픽셀 단위 3DGS 래스터화**로 직접 합성 → 풀프레임 다중뷰 렌더 불필요. → [[CoherentRaster]]
2. **Cross-view Coherent Attribute Reuse**: 시점별 μ만 따로, 공분산·깊이·[[구면조화함수-SH|SH]] 색은 클러스터 1회 계산·재사용 (중복 제거).
3. **View-coherent Remapping**: 서브픽셀을 시점 인덱스로 정렬한 룩업 $\Psi$ → warp memory coalescing 복원 (GPU 효율).

## 후속 질문
- 정적 한정 → 동적(4D) 확장 시 클러스터 재사용이 유효한가? → [[Relaxed-Rigidity-동적GS]]
- specular 아티팩트를 SH 의존 외 다른 방식으로 줄일 수 있나?
- DirectL·Ji et al.·Kim et al.(MPI) 원 논문 대비 정확 재현 격차는?
