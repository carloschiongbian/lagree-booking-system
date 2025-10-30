"use client";

import { useState } from "react";
import { supabase, UpdateUserProfile } from "./supabase";
import { CreateClassProps, CreateInstructorProps } from "./props";
import { Dayjs } from "dayjs";

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

  const searchInstructors = async ({ name }: { name?: string }) => {
    setLoading(true);
    console.log("Searching for name: ", name);

    let query = supabase.from("instructors").select("*");

    if (!!name?.length) {
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

export const useInstructorManagement = () => {
  const [loading, setLoading] = useState(false);

  const createInstructor = async ({
    values,
  }: {
    values: CreateInstructorProps;
  }) => {
    setLoading(true);

    const { data, error } = await supabase.from("instructors").insert(values);

    if (error) return null;

    setLoading(false);
    return data;
  };

  return { loading, createInstructor };
};

export const useClassManagement = () => {
  const [loading, setLoading] = useState(false);

  const fetchClasses = async ({ date }: { date: Dayjs }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("class_date", date.format("YYYY-MM-DD"));

    if (error) return null;

    setLoading(false);
    return data;
  };

  const createClass = async ({ values }: { values: CreateClassProps }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("classes")
      .insert(values)
      .single();

    if (error) return null;

    setLoading(false);
    return data;
  };

  const updateClass = async ({
    id,
    values,
  }: {
    id: string;
    values: CreateClassProps;
  }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("classes")
      .update(values)
      .eq("id", id);

    console.log("dataL ", data);

    if (error) return null;

    setLoading(false);
    return data;
  };

  return { loading, updateClass, fetchClasses, createClass };
};

export const usePackageManagement = () => {
  const [loading, setLoading] = useState(false);

  const createPackage = async ({ values }: { values: any }) => {
    setLoading(true);

    const { data, error } = await supabase.from("packages").insert(values);

    if (error) return null;

    setLoading(false);
    return data;
  };

  const fetchPackages = async () => {
    setLoading(true);

    const { data, error } = await supabase.from("packages").select("*");

    if (error) return null;

    setLoading(false);
    return data;
  };

  const updatePackage = async ({
    id,
    values,
  }: {
    id: string;
    values: CreateClassProps;
  }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("packages")
      .update(values)
      .eq("id", id);

    if (error) return null;

    setLoading(false);
    return data;
  };

  return { loading, updatePackage, createPackage, fetchPackages };
};
