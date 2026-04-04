"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Transaction } from "@/lib/supabase/types";

export function useTransactions(type?: "revenue" | "expense") {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    const supabase = createClient();
    setIsLoading(true);

    let query = supabase
      .from("transactions")
      .select("*, contacts(full_name), contracts(title)")
      .order("date", { ascending: false });

    if (type) {
      query = query.eq("type", type);
    }

    const { data } = await query;
    setTransactions((data as Transaction[]) ?? []);
    setIsLoading(false);
  }, [type]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = useCallback(
    async (transaction: Omit<Transaction, "id" | "created_at">) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transactions")
        .insert(transaction as never)
        .select()
        .single();

      if (error) throw new Error(error.message);
      setTransactions((prev) => [data as Transaction, ...prev]);
      return data as Transaction;
    },
    []
  );

  const totalRevenue = transactions
    .filter((t) => t.type === "revenue" && t.status === "confirmed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense" && t.status === "confirmed")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions,
    isLoading,
    totalRevenue,
    totalExpenses,
    balance: totalRevenue - totalExpenses,
    refetch: fetchTransactions,
    createTransaction,
  };
}
