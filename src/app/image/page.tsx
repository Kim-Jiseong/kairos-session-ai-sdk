"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

// 이미지 생성 폼 인터페이스
interface ImageFormData {
  prompt: string;
  count: number;
  format: "png" | "jpeg" | "webp";
  transparent: boolean;
  size: "1024x1024" | "1536x1024" | "1024x1536";
}

// 이미지 생성 응답 타입
interface ImageResponse {
  image: string;
}

export default function ImageGeneration() {
  // 폼 상태 관리
  const [formData, setFormData] = useState<ImageFormData>({
    prompt: "",
    count: 1,
    format: "png",
    transparent: false,
    size: "1024x1024",
  });

  // 이미지 및 로딩 상태 관리
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 입력 값 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    // 체크박스 처리
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      // 투명 배경이 선택되었고 형식이 jpeg인 경우 png로 변경
      if (name === "transparent" && checked && formData.format === "jpeg") {
        setFormData({
          ...formData,
          [name]: checked,
          format: "png",
        });
        return;
      }

      setFormData({
        ...formData,
        [name]: checked,
      });
      return;
    }

    // 숫자 입력 처리
    if (name === "count") {
      const count = parseInt(value);
      if (!isNaN(count) && count > 0 && count <= 10) {
        setFormData({
          ...formData,
          [name]: count,
        });
      }
      return;
    }

    // 일반 텍스트 입력 처리
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prompt.trim()) {
      setError("프롬프트를 입력해주세요");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gen-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("이미지 생성에 실패했습니다");
      }

      const data = await response.json();

      // 새로운 응답 형식에 맞춰 처리
      if (data.image) {
        // 이미지가 base64 문자열인 경우
        const imageUrl = `data:image/${formData.format};base64,${data.image}`;
        setImages([imageUrl]);
      } else {
        throw new Error("응답 형식이 올바르지 않습니다");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        이미지 생성 대시보드
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 입력 폼 */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            {/* 프롬프트 입력 */}
            <div className="mb-4">
              <label
                htmlFor="prompt"
                className="block text-sm font-medium mb-2"
              >
                프롬프트
              </label>
              <textarea
                id="prompt"
                name="prompt"
                value={formData.prompt}
                onChange={handleChange}
                placeholder="생성할 이미지를 자세히 설명해주세요"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 min-h-[120px]"
                required
              />
            </div>

            {/* 이미지 사이즈 */}
            <div className="mb-6">
              <label htmlFor="size" className="block text-sm font-medium mb-2">
                이미지 사이즈
              </label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900"
              >
                <option value="1024x1024">1024 x 1024 (정사각형)</option>
                <option value="1792x1024">1792 x 1024 (가로 방향)</option>
                <option value="1024x1792">1024 x 1792 (세로 방향)</option>
              </select>
            </div>

            {/* 오류 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  생성 중...
                </>
              ) : (
                "이미지 생성하기"
              )}
            </button>
          </form>
        </div>

        {/* 결과 이미지 표시 영역 */}
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">생성된 이미지</h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin h-12 w-12 text-blue-500 mb-4" />
              <p className="text-center text-gray-500 dark:text-gray-400">
                이미지를 생성하는 중입니다...
                <br />
                잠시만 기다려주세요.
              </p>
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((src, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-md border border-gray-200 dark:border-gray-700"
                >
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    <Image
                      src={src}
                      alt={`생성된 이미지 ${index + 1}`}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400">
              <p className="mb-2">아직 생성된 이미지가 없습니다</p>
              <p className="text-sm">
                왼쪽 폼을 작성하고 &quot;이미지 생성하기&quot; 버튼을 클릭하세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
