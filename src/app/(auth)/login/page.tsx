"use client";

import { loginAction } from "@/server/actions/auth";
import { useActionState } from "react";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-950">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-3xl font-bold text-white shadow-lg shadow-emerald-500/30">
            🍊
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            POS Toko Buah
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Masuk ke sistem kasir dan pengelolaan toko buah
          </p>
        </div>

        {state?.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
            {state.error}
          </div>
        )}

        <form action={action} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Username
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                placeholder="Masukkan username"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
          >
            {isPending ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
          <p className="font-semibold text-gray-700 dark:text-gray-300">Kredensial Demo:</p>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Admin:</span> admin / password123
            </div>
            <div>
              <span className="font-medium">Kasir:</span> kasir / password123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
