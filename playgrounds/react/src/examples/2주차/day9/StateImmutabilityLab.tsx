import { memo, useRef, useState } from "react";
import { PanelHeading, PracticeSummary } from "./shared";

type User = {
  name: string;
  profile: {
    nickname: string;
  };
};

const MemoizedProfilePreview = memo(function MemoizedProfilePreview({
  user,
}: {
  user: User;
}) {
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        memo child render #{renderCount.current}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-950">
        {user.profile.nickname}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        prop 참조가 같으면 memoized child는 다시 렌더링되지 않을 수 있습니다.
      </p>
    </div>
  );
});

export default function StateImmutabilityLab() {
  const [user, setUser] = useState<User>({
    name: "React",
    profile: {
      nickname: "react-user",
    },
  });
  const [mutationReport, setMutationReport] = useState(
    "아직 업데이트하지 않았습니다.",
  );
  const nextNicknameNumber = useRef(1);

  const createNickname = () => {
    const nickname = `next-user-${nextNicknameNumber.current}`;
    nextNicknameNumber.current += 1;

    return nickname;
  };

  const mutateDirectly = () => {
    const previousUser = user;
    user.profile.nickname = createNickname();
    setUser(user);
    setMutationReport(
      `직접 변경: setUser에 같은 user 참조를 전달했습니다. Object.is(previous, next) = ${Object.is(previousUser, user)}`,
    );
  };

  const updateImmutably = () => {
    const previousUser = user;
    const nextNickname = createNickname();

    setUser((previous) => ({
      ...previous,
      profile: {
        ...previous.profile,
        nickname: nextNickname,
      },
    }));
    setMutationReport(
      `불변 업데이트: 새 user와 새 profile 객체를 만들었습니다. 이전 참조와 다음 참조는 달라집니다. 이전 nickname = ${previousUser.profile.nickname}`,
    );
  };

  const reset = () => {
    setUser({
      name: "React",
      profile: {
        nickname: "react-user",
      },
    });
    setMutationReport("초기 상태로 되돌렸습니다.");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <PanelHeading
          eyebrow="Immutability"
          title="직접 변경 vs 불변 업데이트"
          description="같은 객체 참조를 재사용하면 memoized child가 변경을 놓칠 수 있습니다."
        />

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              parent render value
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {user.profile.nickname}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              부모는 다른 State 변경 때문에 다시 렌더링되면 변경된 내부 값을 읽을 수 있습니다.
            </p>
          </div>

          <MemoizedProfilePreview user={user} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
              report
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {mutationReport}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            type="button"
            onClick={mutateDirectly}
          >
            직접 변경
          </button>
          <button
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            type="button"
            onClick={updateImmutably}
          >
            불변 업데이트
          </button>
          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={reset}
          >
            초기화
          </button>
        </div>
      </section>

      <PracticeSummary
        points={[
          "기존 객체나 배열을 직접 수정하면 이전 State와 다음 State가 같은 참조를 공유할 수 있습니다.",
          "중첩 객체는 변경되는 계층마다 새 객체를 만들어야 합니다.",
          "Spread Operator는 깊은 복사가 아니라 한 단계 얕은 복사입니다.",
        ]}
      />
    </div>
  );
}
