---
title: NoPoSplat (Pose-free 정준공간 Feed-forward 3DGS)
area: research
created: 2026-07-25
sources: [NoPoSplat.md]
tags: [research, 3DGS, feed-forward, generalizable, pose-free, canonical-space, novel-view-synthesis, pose-estimation]
---

# NoPoSplat: 포즈 없는 sparse 이미지에서 3D 가우시안

> Botao Ye, Sifei Liu, Haofei Xu, Xueting Li, Marc Pollefeys, Ming-Hsuan Yang, Songyou Peng (ETH Zurich · NVIDIA · Microsoft · UC Merced). *"No Pose, No Problem"*, arXiv:2410.24207 (ICLR 2025). 프로젝트: noposplat.github.io

**한 줄 요약**: **포즈 없는(unposed) sparse 이미지(2장까지)**에서 feed-forward로 3D 가우시안을 복원하는 generalizable 3DGS. 핵심은 첫 뷰의 로컬 좌표계를 **정준공간(canonical space)**으로 고정하고 **모든 뷰의 가우시안을 그 안에서 직접 예측** → 로컬→월드 변환·포즈가 불필요. **광도손실(photometric loss)만으로 학습**(GT depth 불요) → 대량 영상 데이터 활용 가능. 입력 overlap이 작을 때는 **포즈를 아는 SOTA([[pixelSplat]]·[[MVSplat]])마저 능가**. (출처: [[2026-07-25-NoPoSplat-논문]])

## 문제의식
- generalizable 3DGS([[pixelSplat]]·[[MVSplat]])는 고품질이지만 **입력 뷰의 정확한 카메라 포즈를 요구** → 실세계에선 SfM(COLMAP)로 dense 영상에서 뽑아야 해 비현실적, textureless·저overlap에서 실패.
- 기존 pose-free NVS는 **2단계**(포즈 추정 → 장면 복원): 포즈 오차가 복원을 망치고, 그게 다시 포즈를 망치는 **복합 오차(compounding)**.
- NoPoSplat: 포즈 추정 단계를 **아예 제거**. 정준공간에 가우시안을 직접 예측(DUSt3R 계열의 pointmap 회귀 성공에서 착안하되, GT depth 없이 광도손실만으로).

## 정준공간 가우시안 예측 (핵심, §3.3)
- **기존 (transform-then-fuse)**: 뷰마다 로컬 좌표계 가우시안 예측 → 카메라 포즈 $[R_v|t_v]$로 월드 변환 → 융합. 문제: (a) 정확한 포즈 필요 (b) overlap 작으면 융합 시 **정렬 실패·ghosting**.
- **제안 (canonical)**: 첫 입력 뷰를 기준 좌표계로 앵커(포즈 $[I|0]$). 네트워크가 **모든 뷰 가우시안을 이 정준공간에서 직접 출력**($\mu^{v\to1}$). 변환 없이 네트워크가 융합을 학습 → 오정렬 제거 + 응집적 전역 표현 → **포즈 추정까지 가능**.

## 아키텍처 (Fig.3)
- **순수 ViT** 인코더-디코더(epipolar·cost volume 등 기하 prior 없음): 인코더 ViT-L/16(뷰별 가중치 공유), 디코더 ViT-B(cross-attention으로 뷰 간 상호작용). **기하 prior가 오히려 큰 baseline에서 걸림** — 순수 ViT가 저overlap에서 유리.
- **두 DPT 헤드**: (1) 가우시안 center head(디코더 피처만) (2) 나머지 파라미터 head(디코더 피처 + **RGB shortcut** — 다운샘플 16× 피처의 텍스처 손실 보완, 없으면 텍스처 흐림).
- 백본은 [[MASt3R]] 가중치로 초기화(단, 부록: DUSt3R·CroCoV2 init이나 depth 사전학습 없이도 유사 성능 → 정준공간 표현은 depth 감독 없이 학습 가능).

## 카메라 intrinsic 임베딩 (스케일 모호성 해결, §3.4)
- 외형만으로 복원하면 **스케일 모호** → 초점거리가 핵심. 3가지 비교: global-add / **intrinsic token(concat, 기본)** / dense(Plücker 유사 per-pixel ray). **intrinsic token이 최고**(Tab.5). intrinsic 없으면 스케일 오정렬로 흐릿.
- intrinsic은 현대 기기서 대개 이용 가능; in-the-wild는 EXIF·휴리스틱 $f=(H+W)/2$로도 강건.

## 포즈 추정 (2단계, §3.5)
- (1) 가우시안 center에 **PnP+RANSAC**(ms 단위) 초기 포즈 → (2) 가우시안 고정하고 렌더링을 입력 뷰에 **광도손실로 정합 refine**(200 step, ~2s, 카메라 Jacobian로 가속). PnP만으론 부정확, refine만으론 초기값 멀어 실패 → 2단계 필수(Tab.7).

## 결과
- **NVS**(RE10K·ACID): pose-free SOTA 전부 능가. **overlap 작을 때 pose-required([[pixelSplat]]·[[MVSplat]])마저 능가**(정준공간 융합의 이점). DUSt3R·MASt3R·Splatt3R는 per-pixel depth 손실 의존 탓에 융합 실패.
- **포즈 추정**(RE10K·ACID·ScanNet-1500 AUC): DUSt3R·MASt3R·RoMa 대폭 상회, **GT depth·매칭손실 없이**. ACID·ScanNet은 zero-shot인데도 우위.
- **일반화**: RE10K만 학습 → DTU·ScanNet++ zero-shot에서 pose-required 능가(최소 기하 prior 덕).
- **효율**: 2×256² 입력 0.015s(66fps), pixelSplat 5×·MVSplat 2× 빠름(RTX4090). in-the-wild: 폰 촬영·Sora 생성 영상에 직접 적용(text/image→3D 잠재력).

## 한계
- **known intrinsic 가정**(휴리스틱으로 완화되나 relax하면 더 강건). feed-forward non-generative라 **미관측 영역 복원 불가**(뷰 추가로 완화). 학습 데이터(RE10K·ACID·DL3DV) 한정 → 다양성 제약. **정적 장면만**(동적은 future work).

## 관련
- **계보(research)**: [[pixelSplat]]·[[MVSplat]]의 pose-free 후계 — 이들의 transform-then-fuse를 정준공간 예측으로 대체, epipolar·cost volume 기하 prior를 순수 ViT로 대체. [[GS-LRM]]과 함께 feed-forward generalizable 3DGS 3계열.
- **DUSt3R 계보 교차(research)**: [[DUSt3R]]·[[MASt3R]] — 정준공간 pointmap 회귀 아이디어 차용 + 백본 init. 단 GT depth 없이 광도손실만으로 학습하는 게 차별점.
- **개념(다른 영역)**: [[ViT]] — 기하 prior 없는 순수 백본 / [[SfM-COLMAP]] — 제거 대상인 전통 포즈 추정 / [[구면조화함수-SH]] — 가우시안 색 표현.
- **후속 활용**: [[NeoVerse]] — NoPoSplat을 정적 복원 baseline·pose-free 계보로 인용, 4D 세계모델로 확장. [[VGGT]] — 같은 pose-free feed-forward 기하 패러다임.
- **출처 메타**: [[2026-07-25-NoPoSplat-논문]]
