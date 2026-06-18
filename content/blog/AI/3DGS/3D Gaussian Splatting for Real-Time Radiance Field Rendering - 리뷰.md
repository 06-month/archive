---
created: 2026-06-18
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

여기서 SfM(Structure-form-Motion)은 여러 장의 이미지로부터 다음 정보를 추정하는 방법이다.

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
		→ $SS^T$는 sclae값을 공분산의 분산값으로 바꾼 것
			= 회전 없는 local 좌표계에서의 공분산 
		
		- 그러나, 해당 공분산은 x, y, z축에 정렬되어있다. 따라서 회전행렬 $R$을 사용한다.

		- $\Sigma_{\text{world}} = R \Sigma_{\text{local}} R^T = RSS^TR^T$
			- 공분산은 벡터를 세로·가로로 곱한 구조이기 때문에 
			 $SS^T$ → $(RS)(RS)^T$ → $RSS^TR^T$가 된다.

	- $\Sigma$  최적화에서 공분산 행렬이 유효한 형태, 즉 positive semi-definite 조건을 만족해야 하는데, 직접 최적화하면 깨질 수 있기 때문에 scale과 rotation으로 분해하여 최적화한다.


---
### 3. 3D Gaussian을 카메라 시점으로 투영

– 작성중 –