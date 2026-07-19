---
created: 2026-07-17
---

논문 주소: https://arxiv.org/abs/2312.12337

![[pixelSplat_image.png]]

### 1. 배경

본 논문은 입력 이미지로부터 3D Gaussian을 직접 예측하는 초기의 대표적인 Feed-Forward 3DGS 연구이며, 이후 generlizable Gaussian Reconstruction 연구의 주요 출발점으로 볼 수 있다.

기존 3DGS는 명시적인 3D Gaussian들로 장면을 표현하여 NeRF보다 훨씬 빠른 렌더링이 가능하게 했다.

하지만, 기존 3DGS는 하나의 장면마다 Gaussian을 따로 최적화하는 scene-specific optimization 방식이기 때문에, 새로운 장면이 입력될 때마다 다시 학습해야 한다.

기존 generalizable novel view synthesis에서 이러한 문제를 해결하기 위해 여러 장면으로 신경망을 미리 학습한 뒤 신경망이 새로운 장면을 바로 복원하도록 하는 방법들이 제안되었다.

1. Generalizable NeRF
	$$  
F_\theta(x,d,f)\rightarrow(\sigma,c)  
$$
	- 입력 이미지에서 feature를 추출한 뒤, ray 위의 여러 3D point를 반복적으로 샘플링하여 density와 color를 예측한다.
	- 새로운 시점을 렌더링할 때 마다 수많은 ray sample을 평가해야 하므로 렌더링 속도가 느리다

2. Light-field Transformer
	- 입력 이미지 feature와 target ray 사이의 attention을 통해 새로운 시점의 색상을 직접 예측한다.
	- Volume rendering은 사용하지 않지만, 명시적 3D 장면 표현을 생성하지 않아 scene 편집이나 실시간 Gaussian rendering에 활용하기 어렵다.


PixelSplat은 입력 이미지로부터 직접 3D Gaussian을 예측하여 generalizable reconstruction과 3DGS의 빠른 렌더링을 동시에 달성하는 것을 목표로 한다.

하지만 이를 위해서 다음의 두 가지 문제를 해결해야 한다.

1. SfM Scale Ambiguity
	- 실제 데이터셋의 카메라 포즈는 대부분 SfM으로 복원된다.
	- 하지만 SfM은 실제 크기를 복원하지 못하므로, 장면마다 서로 다른 임의의 scale값을 갖는다.
		- 즉 동일한 장면이라도 카메라 translation, 물체의 depth, 장면 geometry 전체를 동일 비율로 확대하거나 축소한 여러 3D Reconstruction이 가능하다.
		- 이들은 3D 좌표값이 서로 다르지만, 이미지에 투영하면 동일하게 보인다.
	- 단일 이미지의 appearance만으로는 현재 장면의 scale을 알 수 없기 때문에, 이를 추론할 수 있는 구조가 필요하다.
	
2. Gaussian Position Regression
	- 가장 단순한 방법은 각 pixel에서 Gaussian들의 위치를 직접 예측하는 것이다.
		- 하지만, Gaussian은 중심 주변의 좁은 영역에만 영향을 주는 local primitive이다.
	- 잘못된 위치에 Gaussian이 생성되면 실제 물체까지 충분한 gradient가 전달되지 않아 학습이 local minimum에 빠질 수 있다.
	- 기존 3DGS는 미분 불가능한 Densification 연산을 통해 해결하기 때문에 Feed-forward network에서는 그대로 사용할 수 없다.

Pixel Splat은 이 두 문제를 다음의 method를 통해 해결한다.

---

### 2. Method

전체 파이프라인은 다음과 같다.

> 입력 이미지 2장 + SfM Camera Pose
>		       ↓
> Image Feature Encoder
> 		      ↓
> Epipolar Encoder (Scale-aware Feature 생성)
> 			  ↓     	        
> Gaussian Parameter Prediction (위치, 크기, 회전, 색상, 불투명도 예측)
> 			  ↓
> Differentiable Gaussian Sampling
> 	          ↓
> Pixel-aligned Gaussian 생성
> 	          ↓
> Gaussian Splatting
> 	          ↓
> Novel View Rendering

---
#### 2.1 Image Feature Encoder

먼저 두 입력 이미지 $I$, $\tilde{I}$를 각각 image encoder에 통과시켜 feature map $F$, $\tilde{F}$를 생성한다.

여기서 $F[u]$는 첫 번째 이미지 $I$의 pixel $u$에 대응하는 feature이고, $\tilde{F}[\tilde{u}]$는 두 번째 이미지 $\tilde{I}$의 pixel $\tilde{u}$에 대응하는 feature이다.

이 단계에서 생성된 feature에 해당하는 pixel에 대한 appearance와 semantic 정보는 알 수 있지만, SfM 좌표계에서 정확히 depth의 수치는 알 수 없다.

이 depth 정보를 feature에 기록하는 것이 2.3의 Epipolar Encoder의 역할이다.

---

#### 2.2 Resolving Scale Ambiguity

PixelSplat이 해결하고자하는 첫 번째 문제는 Scale Ambiguity, 즉 스케일 모호성이다.

이상적인 경우라면 데이터셋의 카메라 Pose와 실제 거리 단위의 metric scale을 가져야 한다.

이 때, 각 장면을 다음과 같이 표현할 수 있다.$$
C_i^m = {(I_j, T_j^m)}$$
- $I_j$: 장면의 $j$번째 이미지
- $T_j^m$: 실제 거리 단위로 표현된 metric camera pose

하지만, 실제 NVS 데이터셋의 카메라 pose는 대부분 SfM으로 복원된다.

SfM은 장면의 구조와 카메라의 위치를 절대적인 크기가 아닌 임의의 scale까지만 복원한다.

따라서 실제 데이터셋의 장면은 다음과 같이 표현된다.$$C_i = {(I_j, s_iT_j^m)}$$
- $s_i$: $i$번째 장면에만 적용되는 임의의 scale factor
- $s_iT_j^m$: translation이 $s_i$배로 조정된 camera pose

쉽게 설명하자면 다음의 두 장면이 이미지상으로 동일하게 보일수 있다는 문제이다.

> Scene A
> Camera Baseline = 1
> Object Depth = 5

> Scene B
> Camera Baseline = 10
> Object Depth = 50

카메라 간 거리와 물체의 depth가 동일한 비율로 증가하였기 때문에 두 장면은 같은 이미지를 생성한다.

즉, 단일 이미지의 appearance만으로는 현재 장면이 어느 sclae로 복원되었는지 알 수 없다.

PixelSplat은 실제 metric scale을 복원할 필요는 없지만, 제공된 SfM camera pose의 임의의 scale과 일치하는 3D geometry를 생성해야 한다. 따라서 각 pixel의 depth 역시 해당 SfM 좌표계와 일관되게 예측되어야 한다.

PixelSplat은 이를 위해 두 이미지의 카메라 관계와 epipolar geometry를 사용한다.

---

#### 2.3 Epipolar Encoder

Epipolar Encoder의 목적은 각 pixel feature에 현재 장면의 SfM scale에 일치하는 depth 정보를 기록하는 것이다.

전체 과정은 다음과 같다.

> 첫 번째 이미지의 pixel $u$ 선택
> ↓
> 두 번째 이미지에서 대응 가능한 epipolar line $l$ 계산
> ↓
> epipolar line 위의 여러 pixel $\tilde{u}_l$ 샘플링
> ↓
> 각 후보를 $u$와 삼각측량하여 depth $\tilde{d}_l$ 계산
> ↓
> 후보 image feature와 depth encoding을 concat
> ↓
> epipolar cross-attention
> ↓
> 대응점과 일치하는 depth 정보가 $F[u]$에 기록됨


##### (1) Epipolar Line 생성

![[pixelSplat_epipoarline.png]]

첫 번째 이미지 $I$에서 이미지상 pixel 위치 $u$를 선택하고, 첫 번째 카메라의 원점에서 ray를 발사한다.

단일 이미지만으로 해당 ray 위의 어느 지점에 실제로 표면이 존재하는지 알 수 없다.

이 ray를 두 번째 이미지 $\tilde{I}$의 image 평면에 투영하면 하나의 epipolar line $l$이 생성된다.

첫 번째 이미지의 pixel $u$와 같은 점을 바라보는 두 번째 이미지의 대응점은 반드시 이 epipolar line 위에 존재한다.

##### (2) Epipolar Sampling

PixelSplat은 두 번째 이미지 $\tilde{I}$ 평면의 epipolar line $l$을 샘플링한다.

즉, epipolar line을 이미지 평면 위에 여러 개의 점을 찍는다고 이해하면 편하다.

각 샘플은 $\tilde{u}_l$이라고 정의한다.

따라서 PixelSplat은 epipolar line 위의 각 sample point $\tilde{u}_l$중에 첫 번째 이미지의 pixel $u$와 대응하는 픽셀이 존재할 것이라 가정한다.

따라서 epipolar line 위의 sample들은 모두가 대응점 및 서로 다른 depth 후보가 된다.

##### (3) 삼각측량을 통한 Depth 계산

첫 번째 이미지의 pixel $u$와 두 번째 이미지의 sample pixel $\tilde{u}_l$을 하나의 대응점이라고 가정한다.

그러면 두 카메라에서 출발하는 두 ray를 이용해 해당 3D point를 삼각측량할 수 있다.

이때 계산된 depth $\tilde{d}_l$은 제공된 두 카메라 pose를 기반으로 계산된다.

따라서 이 depth 역시 현재 장면의 임의의 SfM scale $s_i$를 그대로 반영한다.

이 과정을 통해 PixelSplat이 epipolar geometry를 이용해 scale 정보를 얻는 것이다,

##### (4) Image Feature와 Depth Encoding 결합

두 번째 이미지에서 sample pixel $\tilde{u}_l$에 대응하는 feature를 $\tilde{F}[\tilde{u}_l]$ 이라고 한다.

이후에 대응점을 찾기 위해 첫 번째 이미지의 feature와 두 번째 이미지의 feature를 cross-attention하는데, 이 때 각 $\tilde{F}[\tilde{u}_l]$에 depth 정보가 없다.

따라서 PixelSplat은 삼각측량으로 계산한 depth $\tilde{d}_l$를 positional encoding $\gamma$($\cdot$)에 통과시킨다.

이 때 사용되는 positional encoding $\gamma$($\cdot$)은 NeRF와 같은것이다.

이후 image feature와 depth encoding을 concat한다.

$$s_l = \tilde{F}[\tilde{u}_l] ⊕ \gamma(\tilde{d}_l)$$
- $s_l$: $l$번째 epipolar sample의 feature
- $\tilde{F}[\tilde{u}_l]$: 두 번째 이미지에서 샘플링한 image feature
- $\tilde{d}_l$: 삼각측량으로 계산한 첫 번째 카메라 기준 $l$번째 샘플의 depth

따라서 각 sample feature $s_l$은 해당 위치의 시각적 정보와, 해당 대응점의 depth 정보를 동시에 가진다.

##### (5) Epipolar Cross-Attention

첫 번째 이미지의 pixel feature $F[u]$를 query로 사용한다.$$q = QF[u]$$epipolar line 위의 각 sample feature $s_l$은 key와 value로 변환한다.$$k_l = Ks_l, v_l = Vs_l$$
이후 첫 번째 이미지의 pixel과 모든 epipolar sample 사이에서 cross-attention을 수행한다.$$F[u] += Att(q, {k_l}, {v_l})$$
이 과정을 통해 첫번째 이미지의 각 pixel feature과 가장 잘 대응되는 sample에 높은 가중치를 부여한다.

주의할 점은 attention이 이 단계에서 최종 depth값 하나를 직접 출력하는 것이 아닌, 해당 대응점 후보들의 depth encoding을 가중합하여 이후 Gaussian Prediction Module이 depth를 예측할 수 있도록 feature 내부에 scale-aware geometry 정보를 저장한다.

##### (6) Convolution과 Self-Attention을 통한 Depth 전파

모든 pixel이 반대 이미지에서 정확한 대응점을 가지는 것은 아니다.

다음과 같은 영역에서는 올바른 대응점을 찾기 어렵다.

- 반대 이미지에서 가려진 영역
- 한쪽 이미지에만 보이는 영역
- texture가 거의 없는 영역
- 반복적인 패턴이 존재하는 영역
- epipolar line이 이미지 밖으로 나가는 영역

이러한 pixel에는 epipolar cross-attention만으로 신뢰할 수 있는 depth 정보가 기록되지 않을 수 있다.

PixelSplat은 이를 보완하기 위해 epipolar attention 이후 per-image convolution과 self-attention을 적용한다.$$F += Conv(F)$$Convolution은 인접 pixel의 feature를 이용하여 지역적으로 depth 정보를 전파한다.

$$F += SelfAttention(F)$$
Self-Attention은 이미지 내부의 멀리 떨어진 pixel 사이에도 정보를 전달한다.

---
#### 2.4 Gaussian Parameter Prediction

앞서 생성한 scale-aware feature $F[u]$를 이용해 각 pixel에 대응하는 Gaussian을 예측한다.

각 Gaussian의 파라미터는 다음과 같다.$$  
g_k=(\mu_k,\Sigma_k,\alpha_k,S_k)  
$$
PixelSplat은 각 pixel $u$의 feature $F[u]$로부터 $M$개의 Gaussian을 예측한다.

논문에서는 설명을 단순하게 하기 위해 pixel 하나당 하나의 Gaussian을 예측하는 $M = 1$의 경우로 설명한다.
- 다만 실제 논문이 학습 및 평가에서 사용하는 M은 3이다.
$$  
F[u]\rightarrow(\mu,\Sigma,\alpha,S)  
$$
여기에서 이미지의 각 pixel을 기준으로 Gaussian이 생성되기 때문에 pixel-aligned Gaussian이라고 한다.

이 중 가장 중요한 것은 Gaussian의 위치 $\mu$를 예측하는 방법이다.

가장 단순한 방법은 feature에서 depth $d$를 직접 회귀한 뒤, pixel $u$의 camera ray 위에 Gaussian을 배치하는 것이다.

하지만 Gaussian의 depth를 하나의 값으로 직접 회귀하면 초기 예측이 실제 표면과 오차가 클 경우 local minimum에 빠질 수 있다는 문제점이 있다.

기존 3DGS에서는 잘못 배치된 Gaussian이 있을 때 densification을 이용하여 해결한다.

그러나 PixelSplat에서는 Gaussian이 network의 출력으로 생성되기 때문에 미분 불가능한 연산인 densification을 그대로 사용할 수 없다.

따라서 PixelSplat은 depth를 하나의 값으로 직접 회귀하지 않고, ray 위의 여러 depth 후보에 대한 확률분포를 예측한다.

![[Pasted image 20260719175211.png]]

먼저 near plane $d_{near}$와 far plane $d_{far}$ 사이를 $Z$개의 depth bucket으로 나눈다.

각 bucket의 depth는 벡터 $b\in\mathbb{R}^{Z}$로 표현하며, $z$번째 bucket의 depth $b_z$는 Disparity space에서 다음과 같이 정의한다.
- Disparity space: Disparity space는 depth 대신 `1/depth`로 거리를 표현하는 공간이다.
	- 따라서 가까운 물체는 더 촘촘하게, 먼 물체는 더 거칠게 표현된다.
$$  
b_z=  
\left(  
\left(1-\frac{z}{Z}\right)  
\left(\frac{1}{d_{near}}-\frac{1}{d_{far}}\right)  
+\frac{1}{d_{far}}  
\right)^{-1}  
$$

가까운 물체는 작은 depth 차이에도 image 투영과 시차가 크게 변하지만, 먼 물체는 같은 거리 차이가 이미지에 미치는 영향이 매우 작기 때문에 Disparity space를 사용한다.

이후 prediction network $f$는 pixel feature $F[u]$에서 다음 Gaussian parameter들을 예측한다.
$$  
(\phi,\delta,\Sigma,S)=f(F[u])  
$$

$\phi_z$는 pixel $u$가 바라보는 표면이 $z$번째 depth bucket에 존재할 확률이다.

Softmax를 적용하기 때문에 전체 확률의 합은 1이 된다.
$$  
\sum_{z=1}^{Z}\phi_z=1  
$$
예시로, 다음과 같은 분포가 예측될 수 있다.
```
Bucket 1: 0.03
Bucket 2: 0.10
Bucket 3: 0.62
Bucket 4: 0.20
Bucket 5: 0.05
```
이 경우 network는 실제 표면이 bucket 3에 존재할 가능성이 높다고 예측한 것이다.

다만, bucket 3만 사용하면 Gaussian의 위치가 bucket 단위로 양자화된다. 이를 보완하기 위해 각 bucket마다 offset $\delta_z$도 함께 예측한다.

따라서 최종 depth는 선택된 bucket의 depth $b_z$에 해당 bucket의 offset $\delta_z$를 더해 계산한다.$$  
d=b_z+\delta_z  
$$이후 확률분포 $p_\phi(z)$에서 하나의 bucket index $z$를 sampling한다.$$  
z\sim p_\phi(z)  
$$sampling된 bucket을 이용해 Gaussian의 중심 위치를 계산한다.$$  
\mu=o+(b_z+\delta_z)d_u  
$$
한편 covariance $\Sigma$와 SH coefficient $S$는 depth처럼 sampling하지 않는다.

두 파라미터는 prediction network $f$가 pixel feature $F[u]$로부터 직접 예측한다.

전체 과정을 정리하면 다음과 같다.

> Scale-aware feature $F[u]$  
> ↓  
> prediction network $f$
> ↓
> depth probability $\phi$와 offset $\delta$, covariance $\Sigma$, SH coefficient $S$ 예측  
> ↓  
> $z\sim p_\phi(z)$로 depth bucket sampling  
> ↓  
> $b_z+\delta_z$로 최종 depth 계산  
> ↓  
> pixel ray $d_u$를 따라 unprojection  
> ↓  
> Gaussian 위치 $\mu$ 생성

---

#### 2.5 Differentiable Depth Sampling

Depth bucket을 이산 분포에서 sampling하는 연산은 미분할 수 없다.

확률 $\phi$가 조금 변하더라도 sampling 결과인 index $z$가 연속적으로 변하는 것이 아니기 때문이다.

따라서 다음 경로를 통해서는 gradient를 직접 전파할 수 없다.

> Rendering loss
> ↓
> Gaussian 위치 $\mu$
> ↓
> sampled bucket index $z$
> ↓
> 확률 $\phi$

PixelSplat은 이를 해결하기 위해 sampling된 bucket의 확률을 해당 Gaussian의 opacity로 사용한다.$$  
\alpha=\phi_z  
$$예를 들어 bucket 3이 sampling되었고, 해당 $\phi_3 = 0.62$라면 Gaussian은 다음 파라미터를 가진다.
$$  
\mu=o+(b_3+\delta_3)d_u,\quad  
\alpha=\phi_3=0.62  
$$
Gaussian Splatting은 opacity에 대해 미분 가능하기 때문에 rendering loss에서 opacity로 gradient가 전파된다.

그리고 $\alpha = \phi_z$이므로,opacity에 대한 gradient를 sampling된 depth bucket의 확률로 전달할 수 있다.

위 과정을 통해 학습이 반복될수록 올바른 depth bucket의 확률이 상승하고, 잘못된 bucket의 확률은 감소한다.

pixelSplat은 이 구조를 reparameterization trick이라 부른다. 핵심은 gradient가 이산 index $z$를 통과하지 않는다는 점이다. 

VAE의 reparameterization이 샘플 경로 자체를 미분 가능하게 만드는 것과 달리, 여기서는 샘플된 Gaussian의 기여도를 그 위치의 확률 $\phi_z$​에 결합하여 학습 신호를 우회시킨다.

---

### 3. 한계

PixelSplat이 지닌 주요 한계는 다음과 같다.

1. feature에서 depth 분포로의 매핑이 불안정하다.
	- 명시적인 multi-view matching없이, epipolar feature에서 depth 확률분포를 직접 회귀한다.
	- 이 매핑이 본질적으로 모호하기 때문에 geometry 품질이 낮고, 렌더링에서 floating artifact가 발생한다.
2. 입력이 2-view로 제한된다.
	- epipolar geometry가 두 뷰 사이의 대응에 의존하므로, 다수 뷰를 자연스럽게 aggregation하는 구조가 아니다.
	- 뷰가 늘어나도 pairwise 처리에 머물러 multi-view 일관성을 확보하기 어렵다.
3. 정확한 SfM 카메라 포즈를 요구한다.
	- test 시에도 SfM으로 복원된 pose가 입력으로 필요하며, pose-free가 아니다.
	- pose 오차가 epipolar line과 삼각측량 depth에 직접 전파되어 복원이 흔들린다.
4. pixel-aligned 표현의 구조적 제약이 있다.
	- Gaussian 총 개수가 이미지 격자에 고정된다.
	- texture가 없는 영역에는 Gaussian이 과도하게 배분되고, 복잡한 geometry를 가진 영역에는 부족하다.
	- depth로 unprojection한 뒤 3D 공간에서 이웃 point 간 상호작용이 없어 floater가 생기기 쉽다.
5. pixel당 3개의 Gaussian을 기본적으로 예측해 rendering 비용이 크다.
6. 대응점을 찾기 어려운 영역에서 depth가 부정확하다.
	- occlusion, 저텍스처, 반복 패턴, epipolar line이 이미지 밖으로 나가는 영역에서는 신뢰할 대응점이 없다.
	- convolution과 self-attention으로 depth를 전파해 보완하지만, wide-baseline 설정에서 근본적으로 취약하다.