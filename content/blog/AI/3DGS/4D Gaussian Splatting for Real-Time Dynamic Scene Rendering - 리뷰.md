---
created: 2026-06-22
---

논문 주소: https://arxiv.org/abs/2310.08528

![[4D_GS_intro.png]]
### 1. 배경

3DGS는 정적 장면에서 NeRF보다 빠른 학습과 실시간 렌더링을 달성했지만, 시간에 따라 물체가 움직이는 동적 장면에는 그대로 적용하기 어렵다.

기존 Dynamic NeRF에서의 한계

1. time-conditioned / decomposed neural voxel$$F_θ​(x,d,t)→(σ,c)$$
	- 각 ray sample의 $(x, y, z, t)$를 feature gird/MLP에 쿼리해 density와 color를 계산한다.
	- 따라서 샘플 간 explicit point primitive를 공유하는 3DGS와 달리, 렌더링 시 수많은 샘플 평가가 필요하다.
	
2. canonical-mapping volume rendering$$D(x,t)→Δx,NeRF(x+Δx)→(σ,c)$$
	- deformation network로 canonical space에 매핑 후 volume rendering
	- motion과 geometry를 분리할 수 있지만 volume rendering 자체가 느림
	
- 기존 방법들의 공통 문제: real-time 렌더링 불가 혹은 메모리 폭발

기존 Dynamic 3DGS에서의 한계
- 각 타임스텝마다 Gaussian의 파라미터를 명시적 테이블에 저장하거나 갱신$$G={G_{t0}​​,G_{t1​​},...,G_{tn​​}}$$
	- 메모리 $O(t\cdot N)$
	- 시퀀스 길어질수록 메모리 폭발
	- multi-view 설정 필요
	
- Deformable 3DGS
	- canonical Gaussian 하나를 두고, MLP deformation field가 각 타임스텝마다 offset 예측$$(δx,δr,δs)=F_θ​(γ(sg(x)),γ(t))$$
	- 메모리는 효율적이지만 MLP가 모든 위치의 변형 패턴을 혼자 기억해야 함
		→ MLP가 커야 하고 학습이 느림
	- 각 Gaussian을 독립적으로 처리해서 인접 Gaussian 간 정보 공유가 없음

---

### 2. Method

전체 파이프라인은 다음과 같다.

> canonical Gaussians 𝒢 + timestamp $t$ + view matrix $M$
>    ↓
> **Spatial-Temporal Encoder $H$**
> 	   (x, y, z, t)를 두 해상도로 쪼개 6개의 2D grid에 이중선형보간으로 쿼리
> 	   동일 해상도의 6개 feature를 element-wise product로 결합
> 	   이후, coarse/fine 해상도에서 얻은 feature들을 concat하여 $fh$ 생성
> 	   tiny MLP $\phi d$ → fd
>    ↓
>    **Multi-head Decoder $D$**
> 	   $\phi(fd) → \Delta 𝒳$
> 	   $\phi(fd) → \Delta r$
> 	   $\phi(fd) → \Delta s$
>    ↓
>    $𝒢′ = (𝒳+Δ𝒳, r+Δr, s+Δs, σ, 𝒞)$ ← 불투명도, 색상은 그 변환 없음
>    ↓
>    differential splatting → 렌더링

- 메모리: O(N + F)
- N: Gaussian 수
- F: deformation network 파라미터 수
- M: 렌더링 시점

![[4D_GS_pipeline.png]]
#### 2.1 Canonical Gaussian

전체 시간 프레임의 loss를 받아 deformation field와 함께 최적화되는 공유 기준 Gaussian set이다.

각 Gaussian 파라미터
- $x$: 위치
- $r$: 회전
- $s$: 크기
- $\sigma$: 불투명도
- $c$: SH 색상 계수

불투명도와 색상은 deformation field가 예측하지 않고 위치, 회전, 크기만 변형한다.

#### 2.2 Spatial-Temporal Structure Encoder

4D 시공간 feature field$(x, y, z, t)$를 dense voxel로 직접 저장하면 메모리가 $N_x \times N_y \times N_z \times N_t$로 폭증한다. 
따라서 본 논문은 이를 6개의 2D plane로 분해한 K-Planes 구조를 사용한다.

각 $x, y, z, t$는 coarse와 fine의 두 해상도로 나누어 Plane를 구축한다.

6개 Plane
- 위치: $(x, y), (y, z), (z, x)$
- 시간: $(x, t), (y, t), (z, t)$

각 Plane을 learnable parameter(vector)가 저장된 grid에 이중선형보간하여 매칭한다.

이후, 6개 plane feature를 element-wise product, 즉, 해당 벡터들을 모두 곱하여 한 공간 + 시간 조건을 동시에 만족하는 feature만 살아남는다.

coarse/fine 두 해상도에서 각각 반복 후 concat한 뒤, tiny MLP에 넣는다.

위 과정으로써 인접한 Gaussian들은 공간적으로 가까운 grid 꼭짓점 벡터를 참조하기 때문에, 자연스럽게 coherent한 motion을 학습한다.


#### 2.3 Multi-head Gaussian Deformation Decoder

$fd$를 입력으로 3개의 MLP head가 독립적으로 $\Delta x, \Delta r, \Delta s$를 예측한다.$$\Delta x = \phi_x(f_d), \Delta r = \phi_r(f_d), \Delta s = \phi_s(f_d)$$
#### 2.4 Warm-up

본 논문에서 첫 3000 iteration은 deformation field 없이 canonical Gaussian만 학습한다.

canonical space 안정화 후 deformation field를 학습한다.

warm-up은 deformation field가 개입하기 전, Gaussian의 기본 위치, 크기, 색상, opacity를 안정화한다.
이를 통해 이후 deformation network가 불안정한 geometry까지 동시에 보정하지 않고, 시간에 따른 학습에 집중할 수 있게 한다.

![[4D_GS_warmup.png]]

#### 2.5 Loss

$$L = ||\hat I - I||_1 + L_{tv}$$

본 논문에서의 손실은 L1 color Loss와 Total Variation Loss로 구성된다.

- L1 color Loss: GT 이미지와 스플래팅된 이미지 사이의 차의 절댓값 합을 손실화
- Total Variation Loss: deformation grid 또는 feature gird의 값이 공간적으로 너무 급격하게 변하지 않도록 하는 regularization이다.
	- 간단히 말하자면, 근처의 grid cell끼리는 비슷한 값을 가지도록 한다.
	- 간소화 식은 아래와 같다.
	$$L_{tv} = sum |G[i+1, j] - G[i, j]| + |G[i, j+1] - G[i, j]|$$
	- 이를 통해 좌표와 좌표간(시공간 통합)의 변화를 스무스하게 규제한다.

---

### 3. 한계

본 논문에서 제시한 한계는 다음과 같다.

1. 큰 움직임에는 취약하다.
	- deformation field는 canonical Gaussian에서 offset을 더하는 방식이라, 변위가 작다는 암묵적 가정이 깔려있다.
	- 물체가 갑자기 크게 움직이거나 빠르게 변형되면, deformation field가 제대로 예측하지 못하고 artifact가 발생한다.
	
2. 배경 포인트의 부재 문제
	- SfM으로 초기화할 때 배경 포인트가 충분하지 않으면 canonical Gaussian이 동적 영역에만 몰리게 된다.
	- 배경과 전경을 함께 모델링해야 하는데, 배경 표현이 부실해져 렌더링 품질 저하가 발생할 수 있다.
	
	
3. 부정확한 카메라 포즈에 취약하다.
	- 3DGS는 explicit point-based rendering이라 카메라 포즈 오차에 민감하다.
	- 포즈가 조금만 틀려도 Gaussian의 위치가 어긋나서 렌더링이 흔들린다.
	- Deformable 3DGS의 AST와 같은 별도 보정 장치가 4D-GS에는 없다.
	
4. 단안에서 정적/동적 분리에 어려움이 있다.
	- 추가 supervision없이 monocular 입력만으로 어떤 Gaussian이 정적이고 어떤 게 동적인지 구분하기 어렵다.
	- 배경 Gaussian이 불필요하게 움직이거나, 동적 Gaussian이 제대로 변형되지 않는 문제가 발생한다.
	
5. 대규모 장면에서 쿼리(이중 선형 보간)에 부담이 있다.
	- Gaussian 수가 많아질수록 매 타임스텝마다 모든 Gaussian에 대해 grid 쿼리 + MLP 연산을 반복해야 한다.
	- urban-scale처럼 수백만개의 Gaussian이 필요한 장면에서는 deformation field 쿼리 비용이 병목이 된다.