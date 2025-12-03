'use client';

import { useState } from 'react';
import { User, Phone, ArrowRight } from 'lucide-react';

/**
 * 전화번호 자동 포맷 (010-1234-5678)
 * @param {string} value - 입력값
 * @returns {string} - 포맷된 전화번호
 */
function formatPhoneNumber(value) {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, '');

  // 최대 11자리
  const limited = numbers.slice(0, 11);

  // 포맷 적용
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 7) {
    return `${limited.slice(0, 3)}-${limited.slice(3)}`;
  } else {
    return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
  }
}

/**
 * 전화번호 유효성 검사 (010-XXXX-XXXX)
 * @param {string} phone - 전화번호
 * @returns {boolean} - 유효 여부
 */
function isValidPhone(phone) {
  const pattern = /^01[0-9]-\d{4}-\d{4}$/;
  return pattern.test(phone);
}

/**
 * PersonalInfoForm - 개인정보 입력 컴포넌트
 *
 * @param {Function} onSubmit - 제출 완료 시 호출 (name, phone 전달)
 * @param {Function} onBack - 뒤로가기 (선택)
 */
export default function PersonalInfoForm({ onSubmit, onBack }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);

    // 에러 클리어
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: null }));
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);

    // 에러 클리어
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    } else if (name.trim().length < 2) {
      newErrors.name = '이름은 2자 이상 입력해주세요';
    }

    if (!phone) {
      newErrors.phone = '연락처를 입력해주세요';
    } else if (!isValidPhone(phone)) {
      newErrors.phone = '올바른 휴대폰 번호를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate() && onSubmit) {
      onSubmit({
        name: name.trim(),
        phone: phone,
      });
    }
  };

  const isValid = name.trim().length >= 2 && isValidPhone(phone);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
            <User className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">정보 입력</h1>
          <p className="text-gray-400">당첨 시 확인을 위해 정보를 입력해주세요</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 이름 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              이름 <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="홍길동"
                className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/50'
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-400">{errors.name}</p>
            )}
          </div>

          {/* 연락처 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              연락처 <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-1234-5678"
                inputMode="numeric"
                className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-gray-700 focus:border-purple-500 focus:ring-purple-500/50'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-2 text-sm text-red-400">{errors.phone}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              자동으로 하이픈(-)이 입력됩니다
            </p>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              isValid
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/25'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            참여하기
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* 뒤로가기 */}
        {onBack && (
          <button
            onClick={onBack}
            className="w-full mt-4 py-3 text-gray-400 hover:text-white transition-colors"
          >
            ← 이전으로
          </button>
        )}

        {/* 안내 문구 */}
        <p className="text-center text-gray-500 text-xs mt-6">
          입력하신 정보는 당첨 시에만 사용되며,<br />
          행사 종료 후 즉시 파기됩니다
        </p>
      </div>
    </div>
  );
}
