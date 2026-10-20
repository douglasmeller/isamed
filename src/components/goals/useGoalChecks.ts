"use client";

import { useState, useTransition } from "react";
import { setGoalCheck } from "@/app/actions/goals";
import { checkKey, checksToMap, type GoalCheck, type GoalStatus } from "@/lib/goals";

// Marcacao aparece na hora (sem esperar o servidor); o que vem do servidor
// vale para tudo que ainda nao foi mexido aqui.
export function useGoalChecks(checks: GoalCheck[]) {
  const [overrides, setOverrides] = useState<Record<string, GoalStatus | null>>({});
  const [, startTransition] = useTransition();
  const fromServer = checksToMap(checks);

  const getStatus = (goalId: string, date: string): GoalStatus | null => {
    const key = checkKey(goalId, date);
    return key in overrides ? overrides[key] : (fromServer[key] ?? null);
  };

  const setStatus = (goalId: string, date: string, status: GoalStatus | null) => {
    setOverrides((prev) => ({ ...prev, [checkKey(goalId, date)]: status }));
    startTransition(() => {
      setGoalCheck(goalId, date, status);
    });
  };

  return { getStatus, setStatus };
}
