"use client";

import { useState } from "react";
import { supabase, UpdateUserProfile } from "./supabase";

export const useSearchUser = () => {
  const [loading, setLoading] = useState(false);

  const validateEmail = async ({ email }: { email: string }) => {
    setLoading(true);

    let query = supabase
      .from("user_profiles")
      .select()
      .eq("email", email)
      .single();

    const { data, error } = await query;

    if (error) return null;

    setLoading(false);
    return data;
  };

  const searchClients = async ({ name }: { name: string }) => {
    setLoading(true);
    console.log("Searching for name: ", name);

    let query = supabase.from("user_profiles").select("*").eq("is_user", true);

    if (!!name.length) {
      query = query.ilike("full_name", `%${name}%`);
    }

    const { data, error } = await query;

    if (error) return null;

    setLoading(false);
    return data;
  };

  const searchInstructors = async ({ name }: { name: string }) => {
    setLoading(true);
    console.log("Searching for name: ", name);

    let query = supabase.from("instructors").select("*");

    if (!!name.length) {
      query = query.ilike("full_name", `%${name}%`);
    }

    const { data, error } = await query;

    if (error) return null;

    setLoading(false);
    return data;
  };

  return { validateEmail, searchClients, searchInstructors, loading };
};

export const useUpdateUser = () => {
  const [loading, setLoading] = useState(false);

  const updateUser = async ({
    id,
    values,
  }: {
    id: string;
    values: UpdateUserProfile;
  }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("user_profiles")
      .update(values)
      .eq("id", id);

    if (error) return null;

    setLoading(false);
    return data;
  };

  return { loading, updateUser };
};
