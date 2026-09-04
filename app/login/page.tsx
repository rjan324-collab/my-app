export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-[#F2F4F6] px-4 dark:bg-[#171B22]">
      <form
        action="/api/login"
        method="POST"
        className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-8 shadow-xl dark:bg-[#1F242C]"
      >
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">의료장비 업무 도우미</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          병원 내부 업무용 페이지입니다. 비밀번호를 입력해 주세요.
        </p>
        <input type="hidden" name="from" value={params.from ?? "/"} />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          required
          autoFocus
          className="rounded-xl border-none bg-[#F2F4F6] px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3182F6] dark:bg-[#171B22] dark:text-white"
        />
        {params.error && (
          <p className="text-sm text-red-500">비밀번호가 올바르지 않습니다.</p>
        )}
        <button
          type="submit"
          className="rounded-xl bg-[#3182F6] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2272eb]"
        >
          입장
        </button>
      </form>
    </div>
  );
}
