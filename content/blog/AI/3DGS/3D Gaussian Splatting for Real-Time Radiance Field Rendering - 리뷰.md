---
created: 2026-06-19
---

논문 주소: https://arxiv.org/abs/2308.04079 


3D Gaussian Splatting은 Novel View Synthesis(NVS) 분야에서 NeRF의 느린 학습 및 렌더링 속도를 보완하는 강력한 대안으로 등장했다. 

본 글에서는 이후 다양한 3D Gaussian Splatting 계열 연구의 토대가 된 논문인 3D Gaussian Splatting for Real-Time Radiance Field Rendering을 리뷰하고자 한다.

![[3DGS_image.png]]

---

### 전체 파이프라인
1. SfM/COLMAP을 통해 카메라 pose와 sparse point cloud 추정
2. sparse point cloud를 이용해 3D gaussian 초기화
3. 3D 가우시안들을 카메라 시점으로 투영
4. 2D 이미지 평면에 가우시안들을 splatting
5. alpha blending으로 렌더링 이미지를 생성
6. 실제 이미지와 비교하여 Loss값 계산 및 가우시안 파라미터 최적화
7. Adaptive Density Control로 Gaussian 복제/분할/삭제
8. 반복


- NeRF는 암묵적으로 MLP 안에 3차원 공간상의 물체를 저장하고 표현했다면
- 3DGS는 실제 공간 상에 가우시안들을 배치하고, 2D 이미지평면에 스플래팅하는 방식으로 속도적 측면에서 최적화를 이루어냈다.

본 글에서, 3DGS의 과정을 단계별로 설명하고자 한다.

---
### 1. SfM Points

3DGS의 입력은 기본적으로 정적 장면을 촬영한 여러 장의 이미지이다.

하지만, 이미지들만으로 각 사진의 카메라 파라미터를 알 수 없기에, 3DGS는 COLMAP과 같은 SfM 도구를 사용한다.

![[3DGS_SfM.png]]

여기서 SfM(Structure-from-Motion)은 여러 장의 이미지로부터 다음 정보를 추정하는 방법이다.

- 각 이미지의 카메라 파라미터
- 장면의 sparse 3D point cloud

즉 3DGS는 SfM에서 출력된 sparse point cloud를 초기 장면 구조로 사용한다.

따라서 입력은 다음과 같다

- 다중 시점 이미지
- 카메라 파라미터
- SfM sparse point cloud

---
### 2. 3D Gaussian 초기화

SfM을 통해 얻은 sparse point cloud는 3D 공간상 좌표들이다.

3DGS는 이 점들을 초기 가우시안의 중심 위치로 사용한다.

즉, SfM point 하나하나가 초기 가우시안 하나가 된다.

여기서 3D 가우시안이란, 가우시안 그래프를 3차원상으로 표현한 것이다.
![[3DGS_3DGaussian.png]]

여기서 중요한 점은, 가우시안은 단순한 점이 아니라는 점이다.

초기에는 point로 시작하지만, 학습 과정에서 각 가우시안들이 크기, 방향, 색, opacity를 가진 타원체 형태의 primitive로 최적화되며, 3차원 공간의 한 부분부분을 표현하게 된다.

#### 3D 가우시안이란 무엇인가

- 가우시안 하나는 다음 식으로 표현할 수 있다.$$G(\mathbf{x}) = \exp \left( -\frac{1}{2} (\mathbf{x}-\mu)^T \Sigma^{-1} (\mathbf{x}-\mu) \right)$$
	- $\mathbf{x}$: 3D 공간상의 위치
	- $\mu$: 가우시안의 중심 위치
	- $\Sigma$: 가우시안의 모양을 결정하는 공분산 행렬
		- 여기서 $\Sigma$은 가우시안이 어느 방향으로 얼마나 퍼져 있는지를 결정한다.
		- 즉 $\Sigma$가 구 형태라면 모든 방향은 비슷하게 퍼지고, $\Sigma$가 비등방적이면 특정 방향으로 길게 늘어난 타원체가 된다.
	- 해당 수식을 통해 특정 좌표 x가 주어졌을 때, 그 좌표가 그 가우시안에 얼마나 속하는지를 나타낸 값을 출력한다.

- 3DGS의 각 가우시안은 다음 파라미터를 가진다.
	- 위치 $\mu$: 가우시안의 중심 위치
	- 크기 $s$: 가우시안이 각 축 방향으로 얼마나 퍼져있는지
	- 회전 $q$: 가우시안이 어느 방향으로 회전되어있는지
		- 3DGS에서 보통 quaternion $q$로 표현한다.
	- 불투명도 $\alpha$: 가우시안의 불투명도
	- 색상 $c$: RGB하나만으로 표현하지 않고, spherical harmonics 계수로 표현한다.
		- SH는 구면 위 방향에 따라 달라지는 값을 표현하는 기저함수이다.

- $\Sigma = R S S^T R^T$: 가우시안의 모양을 결정하는 공분산 파라미터

	- **왜 공분산, 즉 모양이 이러한 형태로 표현이 되는가?**
		scale 행렬 $S = \begin{bmatrix} s_x & 0 & 0 \\ 0 & s_y & 0 \\ 0 & 0 & s_z \end{bmatrix}$
		→ $S^T = S$
		→ $SS^T = \Sigma_{\text{local}} = \begin{bmatrix} s_x^2 & 0 & 0 \\ 0 & s_y^2 & 0 \\ 0 & 0 & s_z^2 \end{bmatrix}$
		→ $SS^T$는 scale값을 공분산의 분산값으로 바꾼 것
			= 회전 없는 local 좌표계에서의 공분산 
		
		- 그러나, 해당 공분산은 x, y, z축에 정렬되어있다. 따라서 회전행렬 $R$을 사용한다.

		- $\Sigma_{\text{world}} = R \Sigma_{\text{local}} R^T = RSS^TR^T$
			- 공분산은 벡터를 세로·가로로 곱한 구조이기 때문에 
			 $SS^T$ → $(RS)(RS)^T$ → $RSS^TR^T$가 된다.

	- $\Sigma$  최적화에서 공분산 행렬이 유효한 형태, 즉 positive semi-definite 조건을 만족해야 하는데, 직접 최적화하면 깨질 수 있기 때문에 scale과 rotation으로 분해하여 최적화한다.


---
### 3. 3D Gaussian을 카메라 시점으로 투영

이전까지의 과정을 통해서 3D 공간상에 가우시안들의 배치를 끝냈다.

이제, 새로운 카메라 시점에서 이미지를 만들려면 각 가우시안을 카메라 이미지 평면에 투영해야 한다.

```
3D Gaussian
→ camera coordinate로 변환
→ image plane으로 projection
→ 2D Gaussian footprint 생성
```

카메라 시점으로 투영에서 해당 과정을 수행한다.

여기서 projection은 3D 공간상의 점과 물체를 2D 이미지 평면에 대응시키는 과정이다.

여기서, 기존 3차원 좌표계 공분산 $\Sigma$를 2차원 좌표계 공분산 $\Sigma’$으로 projection한다.
$$\Sigma' = J W \Sigma W^T J^T$$
1. $\Sigma$: world 좌표계에서의 3D 가우시안 모양
2. $W \Sigma W^T$: 카메라 좌표계에서의 3D 가우시안 모양
	- $W$: 좌표계 변환 행렬
3. $J(W \Sigma W^T)J^T$: 카메라 projection을 통해 이미지 2D 평면으로 투영
	- $J$: Jacobian, 3D(X, Y, Z)를 2D(u, v)로 바꿔주는 함수
		$$\begin{bmatrix} \Delta u \\ \Delta v \end{bmatrix} \approx J \begin{bmatrix} \Delta X \\ \Delta Y \\ \Delta Z \end{bmatrix}$$ $$u = f_x \frac{X}{Z} + c_x, v = f_y \frac{Y}{Z} + c_y,  J = \begin{bmatrix} \frac{\partial u}{\partial X} & \frac{\partial u}{\partial Y} & \frac{\partial u}{\partial Z} \\ \frac{\partial v}{\partial X} & \frac{\partial v}{\partial Y} & \frac{\partial v}{\partial Z} \end{bmatrix}$$
		

---

### 4. Gaussian Splatting

3D 가우시안을 2D 평면에 투영하면, 각 가우시안은 2D 이미지 위의 타원형 영역을 가지고, 해당 가우시안을 이미지 위에 칠한다.

이 과정을 **Gaussian Splatting**이라 한다.

Splatting이란, point나 primitive를 화면에 투영한 뒤, 그 주변 픽셀에 영향을 퍼뜨려 그림을 그리는 방식이다.

여기서는 가우시안을 찍어내기에, 각 가우시안은 자신의 영역에 속하는 여러 픽셀에 영향을 준다.

#### NeRF와의 차이점

- NeRF는 픽셀에서 Ray를 쏘는 방식이다.
- 3DGS는 가우시안이 화면으로 날아와 픽셀에 칠해지는 방식이다.


---

### 5. Alpha Blending을 통한 픽셀 색 계산

3DGS에서 여러 가우시안들이 같은 픽셀에 영향을 줄 수 있다.

이때, 앞쪽 가우시안과 뒷쪽 가우시안을 depth 순서에 따라 합성하고, 3DGS는 alpha blending을 사용해 구현한다.

최종 픽셀 색은 다음처럼 계산할 수 있다.$$C = \sum_{i=1}^{N} T_i \alpha_i \mathbf{c}_i, T_i = \prod_{j=1}^{i-1} (1-\alpha_j)$$
- $c_i$: $i$번째 가우시안의 색
- $\alpha_i$: $i$번째 가우시안의 불투명도
- $T_i$: $i$번째 가우시안 앞쪽까지의 transmittance

---

### 6. Loss 계산 및 최적화

#### Loss 계산

Alpha Blending을 이용해 렌더링한 이미지가 나오면, 실제 학습 이미지와 비교한다.

렌더링 이미지를 $\hat{I}$, 실제 이미지를 $I$라고 한다면, 3DGS는 두 이미지의 차이를 줄이는 방향으로 모든 가우시안 파라미터를 최적화한다.

본 논문에서는 L1 Loss와 D-SSIM Loss를 함께 사용한다.$$L = (1-\lambda)L_1 + \lambda L_{\text{D-SSIM}}$$
- L1 loss: 픽셀값 차이의 절댓값을 평균낸 loss
- SSIM: 
	- Structural Similarity Index, 두 이미지가 사람 눈으로 보기에 구조적으로(밝기, 대비, 구조) 얼마나 비슷한지 측정하는 지표이다.$$SSIM(x,y) = \frac{(2\mu_x\mu_y+C_1)(2\sigma_{xy}+C_2)} {(\mu_x^2+\mu_y^2+C_1)(\sigma_x^2+\sigma_y^2+C_2)}$$
		- $\mu_x, \mu_y$: 두 이미지 패치의 평균 밝기
		- $\sigma_x^2, \sigma_y^2$: 두 이미지 패치의 대비, 즉 분산
		- $\sigma_{xy}$: 두 이미지 패치가 구조적으로 함께 변하는 정도
		- $C_1, C_2$: 분모가 0에 가까워지는 것을 막기 위한 작은 상수
		- SSIM이 1과 비슷하면 두 이미지가 매우 비슷하다는 뜻이고, 수치가 낮을수록 구조적 유사도가 낮다는 뜻이다.

	- D-SSIM은 SSIM을 loss처럼 사용할 수 있도록 변형한 값이다.$$D\text{-}SSIM = \frac{1 - SSIM}{2}$$
#### 최적화

3DGS의 학습은 일반적인 신경망 학습과 조금 다르다.

딥러닝에서는 신경망의 weight를 학습하고, NeRF도 MLP의 weight를 학습한다.

반면 3DGS는 장면을 구성하는 모든 가우시안들의 파라미터를 직접 최적화한다.

최적화되는 값은 다음과 같다.
- $\mu$: 가우시안의 위치
- $s$: 가우시안의 크기
- $q$: 가우시안의 회전
- $\alpha$: 가우시안의 불투명도
- SH: 가우시안의 색상 계수

---

### 7. Adaptive Density Control

초기 SfM point cloud는 정교하지 않다. 즉, 처음 가우시안의 개수가 충분하지 않거나, 장면을 잘못 덮고 있을 수 있다.

따라서 3DGS는 학습 중 가우시안의 개수를 직접 조절한다.

이를 Adaptive Density Control이라고 한다.

목적은 표현이 부족한 곳에 가우시안을 늘리고, 불필요한 가우시안은 제거하는 것이다.

3DGS는 해당 목적을 수행하기 위해 일정 Iteration마다 가우시안을 검사하고 **clone, split, pruning**을 수행한다.

![[3DGS_AdaptiveDensityControl.png]]

#### Clone

Clone은 가우시안을 복제하는 작업이다.

작은 가우시안이지만 gradient가 큰 경우, 그 주변이 아직 잘 표현되지 않았다는 뜻일 수 있다.

여기서 gradient가 크다는 것은, 그 가우시안의 위치나 파라미터를 조금 바꾸면 loss가 크게 줄어들 가능성이 있다는 뜻이다.

즉, 현재 가우시안 주변에 더 많은 표현력이 필요하다는 신호이다.

이 경우 가우시안을 복제한다.

```
작은 Gaussian + 위치 gradient 큼

→ clone
```

#### Split

Split은 하나의 큰 가우시안을 여러 개의 작은 가우시안으로 나누는 작업이다.

큰 가우시안이 넓은 영역을 덮고 있는데 gradient도 크다면, 하나의 가우시안이 너무 넓은 영역을 부정확하게 표현하고 있을 수 있다.

이 경우 가우시안을 더 작은 가우시안들로 분할한다.

```
큰 Gaussian + 위치 gradient 큼

→ split
```

#### Pruning

Pruning은 불필요한 가우시안을 제거하는 작업이다.

예를 들어, 불투명도가 너무 낮은 가우시안은 실제 렌더링에 거의 기여하지 않는다.

다른 예시로는, 너무 크거나 이상하게 퍼진 가우시안은 artifact를 만들 수 있다.
- artifact: 실제 장면에 없는 얼룩이나 떠 있는 점같은 렌더링 오류

이런 가우시안은 제거한다.

```
불투명도 낮음 or 너무 큰 Gaussian

→ pruning
```

---
### 추가 기법

#### Tile-based Differentiable Rasterizer

3DGS가 빠른 핵심 이유는 custom GPU rasterizer를 사용하기 때문이다.

렌더링할 때 모든 가우시안을 모든 픽셀과 비교하면 너무 느리기 때문에, 3DGS는 화면을 작은 타일로 나눈다.

논문에서는 16 $\times$ 16 pixel tile을 사용한다.

각 가우시안을 이미지 평면에 투영한 뒤, 해당 가우시안이 영향을 줄 수 있는 타일 목록을 구하고, 타일별로 관련 가우시안만 처리한다.

예를 들어, 1024 $\times$ 1024 이미지를 16 $\times$ 16 tile로 나누면 각 tile 안에서만 관련 가우시안을 처리할 수 있기에 불필요한 가우시안-픽셀 계산을 크게 줄일 수 있다.

#### Depth Sorting

Alpha Blending을 하려면 앞쪽 가우시안부터 뒤쪽 가우시안 순서로 합성해야 한다.

따라서 각 tile안에서 가우시안들을 depth 기준으로 정렬한다.

여기서 depth는 카메라에서 가우시안까지의 거리이다.

가까운 가우시안이 먼저 합성되고, 먼 가우시안은 뒤에 합성된다.

즉, 앞쪽이 이미 거의 불투명해지면, 뒤쪽 가우시안은 픽셀 색에 거의 기여하지 않으므로 계산을 줄일 수 있다.

---

### 3DGS vs. NeRF 및 한계

3DGS가 NeRF보다 빠른 이유는 다음과 같다.

1. NeRF처럼 Ray위의 수많은 3D 샘플들을 평가하지 않는다.
	- NeRF는 한 픽셀마다 Ray를 만들고 Ray 위의 수십~수백개의 샘플을 MLP로 평가한다.
	- 반면 3DGS는 이미 존재하는 가우시안을 화면에 투영한다.
	
2. MLP forward가 없다.
	- NeRF는 각 샘플마다 MLP를 호출하지만, 3DGS는 가우시안 파라미터가 명시적으로 존재한다.
	
3. GPU rasterization에 적합하다.
	- 가우시안들을 타일 단위로 분류하고 병렬 처리할 수 있기 때문에 빠르다.

그러나, 3DGS가 마냥 장점만 있는 것은 아니다.

단점은 다음과 같다.

1. 메모리 사용량이 크다.
	- 장면 하나를 표현하기 위해 수십~수백만의 가우시안이 필요할 수 있다. 각 가우시안마다 파라미터를 저장해야 하므로 메모리 사용량이 크다.
	
2. geometry가 항상 정확하지 않다.
	- 3DGS는 사실적인 렌더링에는 강하지만, 깨끗한 mesh나 명확한 표면을 직접 제공하지 않는다.
	
3. 관측이 부족한 영역에서 artifact가 생길 수 있다.

4. 매우 큰 장면이나 동적 장면에서는 가우시안 수, 메모리, 시간적 일관성 문제가 생긴다.







---

**관련 위키**: [[3D-Gaussian-Splatting]](본 논문 정제 노트 — 계보·후속 연구 그래프) · 선행 [[NeRF]] · 개념 [[Radiance Field-Volume Rendering]]·[[구면조화함수-SH]]·[[SfM-COLMAP]].
