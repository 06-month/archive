---
title: NeRF (Neural Radiance Fields)
area: research
created: 2026-06-13
sources: [NeRF.md]
cover: /raw/assets/NeRF/page-renders/page-001.png
tags: [research, NeRF, radiance-field, novel-view-synthesis, volume-rendering, MLP]
---

# NeRF (Neural Radiance Fields)

> Mildenhall, Srinivasan, Tancik, Barron, Ramamoorthi, Ng. *"NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis"*, ECCV 2020. arXiv:2003.08934.

**한 줄 요약**: 장면을 **연속 5D 함수**(위치+방향 → 색+밀도)로 보고, 이를 작은 **MLP** 하나에 통째로 인코딩한 뒤 **Volume Rendering**으로 미분가능하게 렌더링해 — RGB 사진 + 카메라 포즈만으로 사실적 신규시점합성(NVS)을 달성한 Radiance Field의 출발점. (출처: [[2026-06-13-NeRF-논문]])

## 핵심 표현: 5D 신경 Radiance Field
- 함수 $F_\Theta:(\mathbf{x},\mathbf{d})\to(\mathbf{c},\sigma)$. 입력 = 3D 위치 $\mathbf{x}=(x,y,z)$ + 2D 시선 방향 $\mathbf{d}=(\theta,\phi)$, 출력 = RGB 색 $\mathbf{c}$ + 볼륨 밀도 $\sigma$.
- **멀티뷰 일관성 강제**: $\sigma$ 는 **위치 $\mathbf{x}$ 에만** 의존(기하는 시점 불변), $\mathbf{c}$ 는 위치+방향에 의존(반사 등 시점의존 효과).
- **MLP 구조**: $\gamma(\mathbf{x})$ → 8×FC(256, ReLU, 5층에 skip-connection) → $\sigma$ + 256 feature → $\gamma(\mathbf{d})$ 와 concat → 1×FC(128) → RGB.

## Volume Rendering (미분가능)
광선 $\mathbf{r}(t)=\mathbf{o}+t\mathbf{d}$ 의 색을 적분으로:
$$C(\mathbf{r})=\int_{t_n}^{t_f} T(t)\,\sigma(\mathbf{r}(t))\,\mathbf{c}\,dt,\quad T(t)=\exp\!\Big(-\!\int_{t_n}^{t}\!\sigma\,ds\Big)$$
- **이산화**(구적법, Eq.3): $\hat C=\sum_i T_i(1-e^{-\sigma_i\delta_i})\mathbf{c}_i$ → 전통적 **alpha compositing** $\alpha_i=1-e^{-\sigma_i\delta_i}$ 과 동일. (공통식: [[Radiance Field-Volume Rendering]])
- **Stratified sampling**(Eq.2): $[t_n,t_f]$ 를 $N$ 구간으로 나눠 각 구간서 균등 1샘플 → 이산 샘플이지만 학습 전체로는 MLP가 **연속 위치**에서 평가됨.

## 두 가지 핵심 개선 (이게 없으면 SOTA 안 됨)
1. **위치 인코딩(Positional Encoding)** — MLP의 저주파 편향(spectral bias)을 깨려고 입력을 고차원으로 사상:
   $$\gamma(p)=\big(\sin(2^0\pi p),\cos(2^0\pi p),\dots,\sin(2^{L-1}\pi p),\cos(2^{L-1}\pi p)\big)$$
   $L=10$($\mathbf{x}$), $L=4$($\mathbf{d}$). 제거 시 고주파 기하·질감이 뭉개짐(over-smooth). (상세: [[위치인코딩-positional-encoding]])
2. **계층적 볼륨 샘플링(Hierarchical sampling)** — coarse/fine 두 네트워크. coarse를 $N_c{=}64$ stratified로 평가 → 가중치 $w_i=T_i(1-e^{-\sigma_i\delta_i})$ 를 정규화해 **PDF** 로 → fine을 $N_f{=}128$ 역변환 샘플 → $N_c{+}N_f$ 로 최종 색. 빈 공간·가림 영역 낭비 감소.

## 학습
- Loss(Eq.6): coarse·fine **둘 다** 의 렌더 색 vs GT **제곱오차 합** $L=\sum_r \|\hat C_c-C\|^2+\|\hat C_f-C\|^2$.
- 입력: RGB 이미지 + 카메라 포즈(실제 장면은 **COLMAP SfM**, 합성은 GT) + 장면 경계. **장면마다 별도 MLP 최적화**.
- 배치 4096 ray, Adam lr $5{\times}10^{-4}\!\to\!5{\times}10^{-5}$. **100–300k iter ≈ 1–2일**(V100 1장).
- 무경계 forward-facing 실제 장면은 **NDC(정규장치좌표)** 로 깊이를 disparity(역깊이)로 매핑해 $[-1,1]$ 에 가둠.

## 결과
- 정량(Table 1): Realistic Synthetic 360° **PSNR 31.01**, Real Forward-Facing **PSNR 26.50** — SRN·NV·LLFF 전부 상회.
- **저장 효율**: 네트워크 가중치 **5MB**(LLFF 15GB 대비 ~3000× 압축) — 입력 이미지보다도 작음.
- **단점(중요)**: 학습 1–2일, 렌더 **~30s/frame**(ray당 192 쿼리 → 프레임당 1.5–2억 쿼리). → 이 느림이 [[3D-Gaussian-Splatting|3DGS]]·InstantNGP 등 가속 연구를 촉발.

## Ablation (Table 2)
위치 인코딩(PE)·시점의존(VD)이 가장 큰 기여, 그 다음 계층 샘플링(H). $L$ 은 10이 적정($2^L$ 이 입력 최대 주파수 초과하면 이득 포화).

## 관련
- **개념 기반**: [[Radiance Field-Volume Rendering]] · [[위치인코딩-positional-encoding]] · [[SfM-COLMAP]] (concepts)
- **후속/대조**: [[3D-Gaussian-Splatting]] — 같은 image formation, MLP 대신 명시적 가우시안으로 실시간화. [[lighthouseGS]]
- **출처 메타**: [[2026-06-13-NeRF-논문]]
- **블로그 리뷰**: [[NeRF - Representing Scenes as Neural Radiance Fields for View Synthesis - 리뷰]] (한국어 정독 리뷰)
