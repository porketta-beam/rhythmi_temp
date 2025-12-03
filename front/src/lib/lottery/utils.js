/**
 * 경품 추첨 시스템 유틸리티 함수
 */

import { NUMBER_RANGE } from './constants';

/**
 * 3자리 숫자를 각 자릿수 배열로 변환
 * @param {number} number - 변환할 숫자 (0-999)
 * @returns {number[]} 각 자릿수 배열 [백의자리, 십의자리, 일의자리]
 * @example
 * numberToDigits(123) // [1, 2, 3]
 * numberToDigits(7)   // [0, 0, 7]
 */
export function numberToDigits(number) {
  const normalized = Math.max(0, Math.min(999, Math.floor(number)));
  return [
    Math.floor(normalized / 100),
    Math.floor((normalized % 100) / 10),
    normalized % 10,
  ];
}

/**
 * 자릿수 배열을 숫자로 변환
 * @param {number[]} digits - 자릿수 배열
 * @returns {number} 변환된 숫자
 * @example
 * digitsToNumber([1, 2, 3]) // 123
 */
export function digitsToNumber(digits) {
  return digits[0] * 100 + digits[1] * 10 + digits[2];
}

/**
 * 숫자를 0으로 패딩된 문자열로 변환
 * @param {number} number - 변환할 숫자
 * @param {number} length - 결과 문자열 길이
 * @returns {string} 패딩된 문자열
 * @example
 * padNumber(7, 3) // "007"
 */
export function padNumber(number, length = NUMBER_RANGE.DIGITS) {
  return String(number).padStart(length, '0');
}

/**
 * 유효한 참가번호 범위 내 랜덤 번호 생성
 * @returns {number} 랜덤 번호
 */
export function generateRandomNumber() {
  return Math.floor(Math.random() * (NUMBER_RANGE.MAX + 1));
}

/**
 * 숫자가 유효한 참가번호 범위 내인지 확인
 * @param {number} number - 확인할 숫자
 * @returns {boolean}
 */
export function isValidNumber(number) {
  return number >= NUMBER_RANGE.MIN && number <= NUMBER_RANGE.MAX;
}
