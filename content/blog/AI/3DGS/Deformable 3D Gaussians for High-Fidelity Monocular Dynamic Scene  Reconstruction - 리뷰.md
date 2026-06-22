---
created: 2026-06-21
---

논문 주소: https://arxiv.org/abs/2309.13101

3DGS는 정적 장면의 Novel View Synthesis에서 NeRF보다 빠른 학습과 실시간 렌더링을 가능하게 했다. 

하지만, 원래 3DGS는 정적 장면을 대상으로 설계되었기 때문에, 시간이 지나면서 물체가 움직이는 동적 장면에서 그대로 적용하기 어렵다.

Deformable 3D Gaussians는 이러한 문제를 해결하기 위해 3DGS의 빠른 rasterization 구조는 유지하면서 시간에 따른 장면 변형을 deformation field로 모델링한 기법이다.

---

### 1. 배경

기존의 Dynamic scene reconstruction은 주로 NeRF계열의 암묵적 표현에 의존했다.

정적 NeRF는 3D 위치와 view 방향 벡터를 입력받아 density와 색을 예측한다. $$F_\theta(x,d) \rightarrow (\sigma, c)$$
여기서, 동적 장면을 예측할 때는 시간 $t$를 추가로 입력하였다.$$F_\theta(x,d,t) \rightarrow (\sigma, c)$$
이 방식은 단순하지만, 시간 변화와 Radiance Field가 하나의 함수에 섞인다. 즉, MLP가 물체의 움직임을 명시적으로 아는 것이 아닌, 시간에 따른 장면을 예측하는 형태가 된다.

따라서 dynamic NeRF 계열에서 보통 두 방법이 사용되었다.

1. time-conditioned radiance field$$F_\theta(x,d,t) \rightarrow (\sigma,c)$$
	- 시간 $t$를 radiance field에 직접 넣는 방식이다. 
	- 구조는 단순하지만, 시간 변화와 geometry/appearance가 얽히기 쉽다.
	
2. deformation field$$D(x,t) \rightarrow x_c$$$$F_\theta(x_c,d) \rightarrow (\sigma,c)$$
	- 시간 $t$에서 좌표를 canonical space로 되돌린 뒤, 기준 공간의 radiance field를 예측하는 방식이다. 
	- 이 방식은 motion과 canonical geometry를 어느 정도 분리할 수 있다.
		- canonical space: 한 시퀀스에서 기준이 되는 좌표계


하지만, 이들 대부분은 여전히 MLP기반 implicit representation이므로 학습과 렌더링이 느리고, 디테일 표현에도 한계가 있다.

---

### 2. Deformable 3D Gaussians

본 논문에서 소개하는 기법은 다음 한 문장으로 정리할 수 있다.

>전체 시간에 공유되는 canonical 3D Gaussian set을 두고, 시간 t마다 deformation field가 각 Gaussian의 위치, 회전, 크기 offset을 예측한다.


정적 3DGS에서는 가우시안 파라미터로부터 바로 렌더링을 수행한다.$$G \rightarrow \text{render}$$
Deformable 3DGS에서는 바로 렌더링을 하지 않고, Canonical space에서 각 시간 $t$에 따른 오프셋을 예측하여 더하고 렌더링한다.$$G^c \rightarrow D(x,t) \rightarrow G(t) \rightarrow \text{render}$$
- $G^c$: canonical Gaussian
- $D(x, t)$: deformation field
- $G(t)$: 시간 $t$에서 변형된 Gaussian

즉, 시간마다 새로운 Gaussian set을 따로 만드는 것이 아니라, 하나의 기준 Gaussian set을 공유하고 시간에 따른 offset을 더한다.

#### Canonical Gaussian이란?

**전체 시간 프레임의 loss를 받아 deformation field와 함께 최적화되는 공유되는 기준 Gaussian set이다.**

---

### 3. Method

#### 3.1 입력

해당 기법의 입력은 monocular dynamic scene이다.

입력은 다음과 같다.
- monocular video frames
- 각 frame의 time label $t$
- SfM/COLMAP으로 얻은 camera pose
- SfM sparse point cloud

SfM은 정적 장면을 가정하므로 dynamic scene에서 pose가 부정확할 수 있다. 이 문제는 이후 AST section에서 다룬다.

#### 3.1 Gaussian 초기화 및 Warm-up

SfM sparse point cloud 또는 random point를 이용해 3D gaussians를 초기화한다.

각 Gaussian은 다음 파라미터를 가진다.
- $x$: 위치
- $r$: 회전
- $s$: 크기
- $\sigma$: 불투명도
- $c$: SH 색상계수

3D Gaussian의 공분산은 rotation과 scale로 표현된다.
$$\Sigma = RSS^TR^T$$
이 구조는 기존의 3DGS와 동일하다.

처음 3k iteration 동안은 deformation field를 학습하지 않고, 3D Gaussians만 학습한다. 

이는 3D Gaussians의 위치와 모양을 안정화시키기 위함이다.

---

#### 3.3 Deformation Field

Deformation Field는 MLP이다.

입력은 canonical Gaussian의 위치 $x$와 시간 $t$이다.$$(\delta x, \delta r, \delta s) = \mathcal{F}_{\theta} ( \gamma(sg(x)), \gamma(t) )$$
출력은 다음 세 가지 offset이다.
- $\delta x$: 위치 변화량
- $\delta r$: 회전 변화량
- $\delta s$: 크기 변화량

따라서 시간 $t$에서 Gaussian의 파라미터들은 은 다음과 같이 만들어진다.$$G(x,r,s,\sigma, c) \rightarrow G(x+\delta x, r+\delta r, s+\delta s, \sigma, c)$$
즉, canonical Gaussian을 시간 t에 맞게 이동, 회전, 크기를 변형한 뒤 렌더링한다.

불투명도화 SH 색상계수의 offset은 deformation MLP가 예측하지 않는다.

---

#### 3.4 Stop-Gradient, positional encoding

Deformation Field의 수식에서 위치 $x$에 대한 Stop-gradient가 적용된다.$$(\delta x, \delta r, \delta s) = \mathcal{F}_{\theta} ( \gamma(sg(x)), \gamma(t) )$$
이는 deformation MLP가 $x$값을 입력으로 사용하되, MLP를 통과한 gradient가 canonical space의 $x$값에 직접 영향을 끼치지 못하게 하기 위함이다.

이후, 입력 $x$와 $t$에 positional encoding을 적용한다.$$\gamma(p) = (\sin(2^k \pi p), \cos(2^k \pi p))_{k=0}^{L-1}$$

NeRF를 공부해본 사람이라면 알겠지만, NeRF의 3차원 좌표를 각 x, y, z마다 20개의 삼각함수로 표현한 그것과 모양이 완전 일치한다.

목적은 동일하게 MLP가 더 세밀한 변화와 주파수 정보를 표현할 수 있게 하는것이다.

본 논문에서는 위치 $x$와 시간 $t$에 대해 Synthetic Scenes에서는 각각  $L = 10, L = 6$을 적용하였고, Real Scenes에서는 각각 $L = 10, L = 10$을 적용하였다.

논문에서는 deformation network 입력에 positional encoding을 적용하면 렌더링 결과의 디테일이 향상된다고 말한다.



---

#### 3.5 Annealing Smooth Training

SfM은 본래 정적 장면에 대하여 예측하도록 만들어졌기 때문에, real-world dynamic scene에서는 SfM/COLMAP camera pose가 부정확할 수 있다.

pose가 부정확하면 프레임마다 장면이 조금씩 흔들린 것처럼 보이고, time interpolation에서 temporal jitter가 생긴다.

implicit NeRF계열에서는 MLP의 smoothness때문에 pose error가 상대적으로 덜 드러날 수 있지만, 3DGS에서는 explicit point-based rendering이기 때문에 pose error가 더 치명적으로 작용한다.

이를 완화하기 위해 본 논문은 Annealing Smmoth Training(AST)을 제안한다.

기본 deformation field는 다음과 같다.$$\Delta = \mathcal{F}_{\theta} ( \gamma(sg(x)), \gamma(t) )$$
AST에서는 time positional encoding에 noise를 더한다.$$\Delta = \mathcal{F}_{\theta} ( \gamma(sg(x)), \gamma(t) + \mathcal{X}(i) )$$
noise는 iteration이 진행될수록 줄어든다.$$\mathcal{X}(i) = \mathcal{N}(0,1) \cdot \beta \cdot \Delta t \cdot \left(1-\frac{i}{\tau}\right)$$
- $\mathcal{N}(0,1)$: standard Gaussian noise
- $\beta = 0.1$: noise scale
- $\Delta t$: mean time interval
- $\tau=20k$: annealing threshold
- $i$: 현재 iteration

즉, 학습 초반에는 time input을 일부러 흔들어 deformation field가 특정 time label에 과적합하지 않게 만든다.

후반에는 noise가 줄어들기 때문에 세밀한 dynamic detail을 학습할 수 있다.

AST는 별도의 손실을 계산하기 않기 때문에, 추가적인 computational overhead가 없다고 한다.

---

### 4. 한계

본 논문에서 지정하는 한계는 다음과 같다.

1. viewpoint diversity에 민감하다.
	- 3D Gaussian들이 잘 수렴하려면 다양한 시점에서의 장면이 관측되어야 한다.
	- viewpoint가 sparse하거나 coverage가 부족하면 과적합될 수 있다.
	
2. SfM/COLMAP에서 예측된 camera pose의 정확도에 의존한다.
	- 만약 포즈가 부정확하면 렌더링 품질이 떨어질 수 있다.
	
3. Gaussian의 수가 많아지면 학습 시간과 메모리 사용량이 증가한다.
	
4. 복잡한 human motion에 대한 검증이 충분하지 않다.
	- 본 논문에서는 주로 간단한 motion dynamics를 가진 장면을 실험하였으며, 세밀한 얼굴 표정 변화나 복잡한 human motion에 대해서는 열린 문제로 남긴다.

