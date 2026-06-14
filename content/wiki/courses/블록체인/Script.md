---
title: 비트코인 Script
area: courses/블록체인
created: 2026-06-13
sources: [BlockChain.md]
tags: [blockchain, bitcoin, script, smart-contract]
---

# 비트코인 Script

비트코인의 거래 잠금/해제 조건을 기술하는 **스택 기반(stack-based)·비튜링완전** 스크립트 언어. 반복문이 없어 무한루프가 불가능 → DoS 방지·검증 단순화. (출처: [[2026-06-11-블록체인-강의]])

## 구조
- **잠금 스크립트(scriptPubKey)**: 출력(UTXO)에 붙는 *조건*. "이 코인을 쓰려면 무엇을 만족해야 하나".
- **해제 스크립트(scriptSig)**: 입력에 붙는 *증거*. 잠금 조건을 푸는 데이터(서명·공개키 등).
- 검증: `scriptSig + scriptPubKey` 를 스택에 실행해 최종이 `True` 면 지출 유효.

## 대표 OP 코드·유형
- **P2PKH**(Pay-to-Public-Key-Hash): `OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG` — 가장 흔한 송금. ([[ECDSA-디지털서명|서명]]·[[해시함수-SHA256|hash160]] 검증)
- **P2SH**(Pay-to-Script-Hash): 스크립트 자체를 해시로 잠금 → 멀티시그 등 복잡 조건을 주소화.
- **Multisig**: `OP_CHECKMULTISIG` 으로 m-of-n 서명 요구.

## 스마트계약과 대비
- 비트코인 Script는 **제한적**(비튜링완전) — 의도적 단순함.
- [[스마트계약-플랫폼|이더리움]]은 **튜링완전** EVM으로 임의 로직 표현 → 표현력↑ 위험·비용(gas)↑.

## 관련
- [[비트코인-트랜잭션]] — Script가 입력/출력에 박히는 자리(UTXO 모델)
- [[스마트계약-플랫폼]] · [[지갑-채굴]] (courses/블록체인)
