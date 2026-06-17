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
