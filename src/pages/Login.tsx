import {useLogin} from "@/hooks/useLogin.ts";
import {useEffect, useState} from "react";
import React from 'react';
import ProgressScreen from "@/components/ProgressScreen.tsx";

const EMAIL_KEY = 'login:email';     // localStorage key
const EMAIL_TTL_MS = 180 * 24 * 60 * 60 * 1000; // 180일

const Login = () => {
  const loginMutation = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (remember && email) {
      localStorage.setItem(
        EMAIL_KEY,
        JSON.stringify({value: email, exp: Date.now() + EMAIL_TTL_MS})
      );
    } else {
      localStorage.removeItem(EMAIL_KEY);
    }

    loginMutation.mutate(
      {email, password},
      {
        onSuccess: (
          // user
        ) => {
          // 여기서 전역 상태 저장 or 라우터 이동
        },
        onError: (err) => {
          console.error("로그인 실패:", err);
        },
      }
    );
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EMAIL_KEY);
      if (!raw) return;
      const {value, exp} = JSON.parse(raw);
      if (!exp || Date.now() < exp) {
        setEmail(value ?? "");
        setRemember(true);
      } else {
        localStorage.removeItem(EMAIL_KEY);
      }
    } catch {
      // 에러는 나중에 처리
    }
  }, []);

  return (
    <div className="size-full min-h-dvh flex items-center justify-center">
      {loginMutation.isPending && <ProgressScreen mention='로그인 중입니다. 잠시만 기다려주세요...'/>}
      <form onSubmit={handleSubmit} className='m-auto py-4 min-w-80'>
        <div className='border border-black p-7 flex flex-col gap-3 relative'>
          <p className='absolute top-0 bg-black text-white px-2 py-0.5 right-0 font-bold text-xs'>5MM Studio</p>
          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <input
              id="email"
              type="email"
              value={email}
              name="email"
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border text-black
            border-black focus:outline-none focus:ring-2"
            />
            <label className="inline-flex items-center gap-2 mt-2 select-none text-xs">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember E-Mail</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border text-black
            border-black focus:outline-none focus:ring-2"
            />
          </div>
        </div>
        <div className='w-full mt-3'>
          <button
            type='submit'
            disabled={loginMutation.isPending}
            className="border border-black w-full h-14 font-bold w-full
            cursor-pointer hover:bg-black hover:text-white transition-colors"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
          {loginMutation.isError && (
            <p className="text-red-500 text-sm text-center">
              - {(loginMutation.error as Error).message} -
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;