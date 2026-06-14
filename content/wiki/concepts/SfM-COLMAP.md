---
title: SfM · COLMAP (Structure-from-Motion)
area: concepts
created: 2026-06-13
sources: [3dgs.md, NeRF.md, lighthouseGS.md]
tags: [concepts, SfM, COLMAP, camera-pose, point-cloud, 3D-vision]
---

# SfM · COLMAP (Structure-from-Motion)

**Structure-from-Motion(SfM)**: 여러 장의 2D 이미지로부터 **카메라 포즈(외부·내부 파라미터)** 와 장면의 **희소 3D 점군(sparse point cloud)** 을 동시에 추정하는 고전 컴퓨터비전 파이프라인. 방사장 NVS 연구의 **표준 전처리**.

## 파이프라인 개요
1. 특징점 검출·매칭(SIFT 등) → 이미지 간 대응.
2. 카메라 포즈 + 3D 점을 **번들 조정(bundle adjustment)** 으로 동시 최적화.
3. (선택) **MVS**(Multi-View Stereo)로 조밀 점군/메쉬까지 확장.

**COLMAP**: 가장 널리 쓰이는 오픈소스 SfM/MVS 구현체.

## 방사장 연구에서의 위치 (공통 개념인 이유)
- [[NeRF]]: 실제 장면의 카메라 포즈를 **COLMAP**으로 추정해 학습 입력으로 사용.
- [[3D-Gaussian-Splatting]]: SfM 희소 점군으로 **3D 가우시안을 초기화**(MVS 불필요).
- [[lighthouseGS]]: 파노라마형 모션에서 **SfM(COLMAP)이 실패** → ARKit 포즈+평면 사전지식으로 우회.
- [[Relaxed-Rigidity-동적GS]]: HyperNeRF 등 실제 동적 데이터의 카메라 포즈를 COLMAP으로 확보.

## 한계
- 좁은 baseline·회전 위주 모션·무텍스처 영역에서 매칭 실패 → 포즈/점군 부정확. (이를 극복하려는 SfM-free·foundation-model 기반 연구가 활발.)

## 관련
- [[NeRF]] · [[3D-Gaussian-Splatting]] · [[lighthouseGS]] · [[Relaxed-Rigidity-동적GS]] (research)
- [[방사장-볼륨렌더링]] — SfM 산출물이 방사장 최적화의 입력
