논문주소: [https://arxiv.org/abs/2201.02610](https://arxiv.org/abs/2201.02610)


### 1. 배경

본 논문은 손과 전신을 분리하여 다루어 온 기존 모션 캡처 연구의 한계를 지적하고, 이를 해결하기 위한 통계적 3D 손 모델(MANO) 및 전신-손 통합 모델(SMPL+H)을 제안한 연구이다.

기존 연구에서는 hand pose estimation과 body pose estimation이 서로 독립적인 문제로 다루어져 왔다.

그러나 실제 인간의 움직임은 손과 전신이 동시에, 그리고 강하게 상호의존적으로 움직인다.

이러한 분리 접근은 특히 다음과 같은 문제를 야기한다

![](https://blog.kakaocdn.net/dna/dSIREV/dJMcac20fZQ/AAAAAAAAAAAAAAAAAAAAANvI6lgvHnfcG8x7EFo34ZUJvggVgkIxEvJTU8M7Xn_x/img.jpg?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1782831599&allow_ip=&allow_referer=&signature=COVqyr8zkHZm7PKdQM94hc2X6iU%3D)

---

### 2. 기존 접근의 한계
#### 2.1 관측 한계

- 전신 대비 손의 크기가 매우 작음
- 센서 해상도 한계로 손 영역이 저해상도로 관측됨
- self-collision, 빠른 움직임, 시야 이탈 빈번

#### 2.2 모델링 한계

- 손과 전신을 독립 모델로 추정
- 전신 포즈와 손 포즈 간의 기하적·운동학적 일관성 붕괴
- 관절 누락 시 손 관절 각도가 비정상적으로 폭주

이로 인해 전신 포즈는 비교적 안정적으로 추정되더라도, 손 포즈는 비현실적인 각도나 형태로 붕괴되는 문제가 반복적으로 발생한다.

---

### 3. MANO

#### 개요

MANO는 전신 캡처 환경에서 발생하는 노이즈 및 결손 데이터에 견고한 통계적 3D 손 모델이다.

SMPL의 수식적 구조를 계승하되, 손이라는 객체의 특성에 맞게 변형 모델과 포즈 공간을 손 특화 방식으로 수정한다.

#### 학습 데이터

MANO는 고해상도 3D 손 스캔 데이터를 기반으로 학습된다.

- 스캔 시스템: 3dMDhand
- 피험자 수: 31명
- 스캔 수: 약 1,000개
- 포즈 구성: 총 51종 (관절 탐색, grasp, 혼합 포즈 등)

이 데이터는 손 표면 변형과 관절 회전 간의 통계적 관계를 학습하기 위한 기반이 된다.

![](https://blog.kakaocdn.net/dna/bNCsuN/dJMcai3cXcd/AAAAAAAAAAAAAAAAAAAAADEnsfwqfIKqKCYFRRO_IOnJLD9fD3LqvFqAxkH1R2Fi/img.jpg?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1782831599&allow_ip=&allow_referer=&signature=e7eq3jfyy8GTBi92yXzSFxaR%2BEU%3D)

---

### 4. MANO의 핵심 설계 요소

#### 4.1 Geodesic 정규화

MANO는 기존 LBS 및 SMPL 기반 손 모델들이 가지는 변형 한계를 지적하고 해결책을 제시한다.

- LBS (LinearBlendSkinning)  
    - 관절 회전을 가중 평균으로 정점에 전달
    - 전역 이동에는 강함
    - 관절 접힘에서 형태 붕괴 발생
- SMPL Pose Blend Shape  
    - 관절 각도에 따른 정점 변위로 LBS 붕괴 보정
    - 영향 범위 기준이 유클리드 거리
    - 실제로 멀리 떨어져있는 피부가 공간적으로 가깝다는 이유로 변형에 영향을 받음

- MANO  
    - 정점-관절 간 영향 범위를 메시 표면 위 Geodesic 거리로 정의한다.
    - 관절과 가까운 정점은 변형 허용
    - 멀어질수록 변형 강하게 억제

이로써 MANO는 손가락과 같이 얇고 길며 접힘이 많은 구조에서 비현실적인 피부 변형을 효과적으로 억제한다.

#### 4.2 가중 템플릿 최적화

MANO는 중립 손 템플릿을 생성하는 과정에서도 기존 평균 기반 방식의 문제를 지적한다.

학습 데이터에는 강하게 구부러진 손이나 극단적인 잡기 포즈가 다수 포함되어 있으며, 이를 단순 평균할 경우 중립 템플릿 자체가 왜곡되는 현상이 발생한다.

대표적인 예로는 너클의 과도한 돌출, 관절 주변의 비정상적인 볼록 현상 등이 있다.

![](https://blog.kakaocdn.net/dna/rr6re/dJMcahccpVq/AAAAAAAAAAAAAAAAAAAAAM4ec_MMonOwbwtDvhDRP6xfsBTDnX4kKKaijt3OFcbi/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1782831599&allow_ip=&allow_referer=&signature=kp5jTmCiG22JNhIC3obpccTCpHs%3D)

MANO는 이를 해결하기 위해 템플릿 최적화 과정에서 포즈에 따른 가중치 조정을 적용한다.

- 극단적인 포즈 샘플: 낮은 가중치
- 중립에 가까운 포즈: 높은 가중치

이를 통해 중립 템플릿은 오직 중립 데이터로 결정되고, 포즈에 따른 변형은 pose blend shape가 담당하도록 역할을 분리한다.

그 결과, 템플릿은 포즈 효과를 흡수하지 않으며, 어떤 포즈 변화에서도 안정적이고 일관된 변형을 유지한다.

#### 4.3 저차원 손 포즈 임베딩

손의 관절의 개수와 차원 수는 다음과 같다.

- 손 관절 수: 약 15~16개
- 각 관절: 3DoF 회전(axis−angle)
- 원시 포즈 차원: 45~48차원

그러나, 실제 해부학적으로 모든 관절이 독립적인 3DoF 자유도를 가지는 것은 아니며, 자연스러운 손 포즈는 이 고차원 공간의 극히 일부에만 존재한다.

고차원 포즈 공간에서 직접 최적화를 수행할 경우 다음과 같은 문제가 발생한다.

- 관측 노이즈가 특정 관절 회전에 흡수됨
- self-collision 상황에서 관절 각도가 폭주함
- 비현실적인 손 형태로 수렴한다.

MANO는 이에 대해 자연스러운 손 포즈는 저차원 부분공간에 존재한다는 가정을 세운다.

이를 바탕으로 학습된 손 포즈 데이터에 PCA를 적용하여 상위 6개의 주성분만을 유지한다,

이 6차원 포즈 공간은 전체 손 포즈 분산의 약 81%를 설명하며, 최적화 과정에서 항상 사람 손이 가능한 포즈 범위 내에서 해를 탐색하도록 제약을 제공한다.

그 결과, 저해상도 및 불완전한 입력에서도 통계적으로 가장 그럴듯한 손 포즈로 안정적으로 수렴한다.

---

### 5. MANO의 수학적 모델

MANO는 SMPL과 동일한 수식적 구조를 따른다.

M(β,θ)=W(T(β,θ),J(β),θ,W)

- β: 손의 형상shape 파라미터 
- θ: 손의 포즈pose 파라미터
- T(β,θ): 형상 및 포즈에 따라 변형된 템플릿 메쉬
- J(β): 형상에 의해 결정되는 관절 위치
- W: 선형 블렌드 스키닝(LinearBlendSkinning,LBS) 가중치

---

### 6. SMPL+H: 전신-손 통합 모델

MANO는 손 모델에 국한되지 않고, 전신 모델 SMPL과 결합된 SMPL+H 형태로 확장된다.

SMPL+H는 전신과 손을 독립적으로 추정하던 기존 방식과 달리,

하나의 통계 모델 안에서 공동으로 추정함으로써 전신 동작과 손 동작 간의 일관성을 유지한다.

총 자유도는 78DoF로, 신체 66DoF, 손은 좌우 각각 6DoF로 구성된다.

전신 4D 스캐너 환경에서는 손 영역의 해상도가 낮고 노이즈 및 데이터 결손이 빈번하게 발생하므로, 상세한 전신-손 통합 모델을 불완전한 관측 데이터에도 안정적으로 피팅하는 것이 SMPL+H가 해결하고자 하는 핵심 과제이다.

---

#### 피팅 절차

1단계: 피험자별 템플릿 추정

- 초기 약 50프레임 사용
- 최적화 대상: body shape, body pose
- 강한 prior 적용: body pose prior, hand pose GMM prior

이를 통해 결손 및 노이즈가 많은 손 데이터에 대한 견고성을 확보한다.

2단계: 시간 시퀀스 최적화

- 템플릿 고정
- 자세 파라미터만 추정
- Zero-velocity temporal regularization 적용

이를 통해 시간적으로 부드러운 전신-손 동작을 추정한다.

![](https://blog.kakaocdn.net/dna/6pI4A/dJMcai3cXgV/AAAAAAAAAAAAAAAAAAAAAC7CajbNAaNMT_lm3nc8TWbxlDDOvCt8CmvKtKK-mQVx/img.png?credential=yqXZFxpELC7KVnFOS48ylbz2pIh7yKj8&expires=1782831599&allow_ip=&allow_referer=&signature=i9FPDJYXDX2YXg5rClKk2P9PDKQ%3D)

---

#### 최종 목적 함수

E=Edata+λcouplingEcoupling+λshapeEshape+λposeEpose+λrEr

- Edata: 스캔–모델 점-평면 거리
- Ecoupling: 스캔 결과와 모델 예측 간 일관성
- Eshape: 형태 정규화
- Epose: 포즈 prior
- Er: 시간 정규화

---

### 7. 결론

본 논문은 손 포착을 단순한 관절 회귀 문제가 아닌, 통계적 변형 모델, 저차원 포즈 공간, 전신과의 결합 문제로 재정의한 연구이다.

MANO와 SMPL+H는 이후 손 포즈 추정 및 전신-손 통합 포착 연구에서 사실상의 표준 모델로 자리잡게 된다.