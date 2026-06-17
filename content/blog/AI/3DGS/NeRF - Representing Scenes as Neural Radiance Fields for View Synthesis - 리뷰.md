논문 주소: [https://arxiv.org/abs/2308.04079 ](https://arxiv.org/abs/2003.08934)

NeRF는 Novel View Synthesis(NVS) 분야에서 2D 이미지 집합으로부터 3D 장면을 연속적인 radiance field로 표현할 수 있음을 보이며 큰 영향을 준 방법이다.

본 글에서는 이후 다양한 neural rendering 및 radiance field 계열 연구의 토대가 된 논문인 NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis를 리뷰하고자 한다.
### MLP 
함수: $F_\Theta:(\mathbf{x},\mathbf{d})\to(\mathbf{c},\sigma)$
- 입력
	- $\mathbf{x}$: 3D 위치, $(x, y, z)$
	- $\mathbf{d}$: Ray의 방향 $(\theta,\phi)$ 
		- $\theta$: 수평방향(x, z)
		- $\phi$: 수직방향(y)
- 출력
	- $\mathbf{c}$: RGB값
	- $\sigma$: volume density
		- Ray위에 물체 또는 불투명한 구조의 존재 정도라고 생각하면 된다.

- 여기에서 $\sigma$는 $\mathbf{x}$에만 의존한다. (시점과 관계없이, 물체 또는 불투명한 구조가 얼마나 존재하는지를 나타내기 때문)
- 따라서 $\mathbf{c}$는 $\mathbf{x}$와 $\mathbf{d}$에 모두 의존한다. (색은 바라보는 시야에 따른 빛의 반사정도가 반영되기 때문)
- 여기서 입력 Ray의 방향, 즉 카메라의 방향은 sfm(COLMAP)을 이용하여 추출한 $d$를 사용한다.

- **MLP 구조**: $\gamma(\mathbf{x})$ → 8×FC(256, ReLU, 5층에 skip-connection) → $\sigma$ + 256 feature → $\gamma(\mathbf{d})$ 와 concat → 1×FC(128) → $\mathbf{c}(R, G, B)$  
![[NeRF_MLP.png]]
→ 이미지상의 픽셀 하나하나가 바라보는 각도상으로 Ray를 발사하고, 해당 Ray위의 점 $\mathbf{x}$의 색과 volume density를 예측하도록 설계한 MLP이다.


### Volume Rendering

학습된 MLP를 기반으로 각 위치에 따른 실제 픽셀의 색을 출력, 즉 렌더링할 때 사용하는 방법을 설명한다.


$$C(\mathbf{r})=\int_{t_n}^{t_f} T(t)\,\sigma(\mathbf{r}(t))\,\mathbf{c}\,dt,\quad T(t)=\exp\!\Big(-\!\int_{t_n}^{t}\!\sigma(r(s))\,ds\Big)$$

- $r(t) = o + td$: Ray 수식
	- o: Ray가 시작하는 원점, t: Ray가 이동한 거리, d: 방향
	- 각 픽셀에서 발사하는 Ray의 반직선 벡터에 관한 수식이다.
		- 즉, 원점o에서 d방향으로 t만큼 이동하였을때의 좌표를 출력한다.


 - $\sigma(r(t))$: 해당 좌표의 volume density
	- r(t)해서 나온 Ray위의 좌표에 대한 $\sigma$를 MLP를 통해 출력한다.

- $T(t)$: Ray 벡터 기준 $t_n$(near bound)에서부터 $t$까지 쌓인 volume density를 더한 값을 0에서 1값 사이의 투과율로 표현한 수치
	- 그러나 컴퓨터는 모든 연속적인 수치에 대한 적분이 힘들다. 따라서 이산화한 공식을 사용한다.
	$$\hat{C}(\mathbf{r}) = \sum_{i=1}^{N} T_i\left( 1-e^{-\sigma_i\delta_i} \right) \mathbf{c}_i$$
		- $\sigma_i\delta_i$: 구간별 밀도를 근사한 값
			- Ray위의 연속적인 $t$를 이산적으로 나누고 $t_i$라고 표현한다.
			- 해당 $t$별로 $[t_i, t_{i+1}]$ 의 구간이 있을 때, $\delta_i = t_{i+1}-t_i$ 라고 표현한다.
			- 즉, $\sigma_i\delta_i$은 $[t_i, t_{i+1}]$ 구간의 밀도를 나타낸다.

		- $\alpha = 1-e^{-\sigma_i\delta_i}$ : 구간의 불투명도
			- 구간별 volume density가 클수록 불투명도가 큰 점을 식으로 표현
			
		- $T_i$: 현재 샘플 앞쪽의 투과율
			- $T_i = \prod_{j=1}^{i-1} (1-\alpha_j)$

- $C(r)$: Ray위의  $t_n$(near bound)에서부터 $t_f$(far bound)까지의 모든 r(좌표)에 대해 Transmittance와 Volume density, color를 곱한것을 적분하여 픽셀의 색을 구하는 함수

	 ~~4-1에 들은 메타버스와 디지털 공간 이론 수업에서 들은 내용이 이해에 매우 큰 도움이 됐다.~~
### 성능 향상을 위한 추가 기법

- **위치 인코딩**
	- NeRF의 MLP 구조는 비교적 부드러운(저주파) 이미지를 학습하기 쉬움.
		 →체크무늬나 나무 무늬같은 고주파 패턴에서는 뭉개질 수 있음
	- 따라서 NeRF는 모든 좌표 $p$를 다음과 같이 바꾼다	$$\gamma(p) = \big( \sin(2^0\pi p), \cos(2^0\pi p), \dots, \sin(2^{L-1}\pi p), \cos(2^{L-1}\pi p) \big)$$
	- 즉, 하나의 좌표값 $p$를 여러 주파수의 sin과 cos들의 합으로 표현한다.
	- NeRF에서 L은 10으로 지정한다. 즉, 한 좌표계의 sin과 cos 함수 각각 10개로 표현한다.
		→ x, y, z좌표를 합하여 총 60개의 삼각함수로 표현된다.

- **Hierarchical sampling**
	- NeRF는 Ray위의 점 t를 이산적으로 찍을 때, 모든 간격을 균등하게 샘플링하지 않고, coarse-to-fine으로 중요한 구간에 샘플을 집중시킨다.	
	- $w_i$: 해당 구간 $i$의 중요도$$w_i = T_i\alpha_i$$ 
	- 즉, $w_i$는 해당 구간$i$까지의 투명도를 곱한 값과 해당 구간의 불투명도를 곱한 값이다.
		- 해당 구간까지가 투명해야하고, 해당 구간이 불투명하면 해당 구간이 중요하다고 나타낸다.

	- 이렇게 추출한 $w_i$를 정규화한다.$$p_i = \frac{w_i}{\sum_j w_j}$$
	- 즉, $p_1+p_2+\cdots+p_N=1$이 된다.
	- 이후, $p_i$에 따라 fine 샘플을 추출하고, coarse 샘플과 fine 샘플에 대한 최종 $C$를 출력한다.

