"use client";

import { useState } from "react";
import { supabase, UpdateUserProfile } from "./supabase";
import {
  CreateClassProps,
  CreateInstructorProps,
  CreatePackageProps,
  CreateUserCredits,
} from "./props";
import dayjs, { Dayjs } from "dayjs";
import { getDateFromToday } from "./utils";
import { useAppSelector } from "./hooks";

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

  const searchClients = async ({ name }: { name?: string }) => {
    setLoading(true);

    let query = supabase
      .from("user_profiles")
      .select(
        `*,
     user_credits (
       id,
       credits
     ),
     class_bookings (
       *,
       classes (
         id,
         start_time,
         end_time,
         instructor_id,
         instructors (
           id,
           full_name,
           avatar_path
         )
       )
     ),
     client_packages (
       *,
       package_id,
       status,
       package_name,
       purchase_date, 
       package_credits,
       validity_period,
       expiration_date
     )
    `
      )
      .eq("is_user", true)
      .eq("client_packages.status", "active")
      .order("created_at", {
        ascending: false,
        foreignTable: "class_bookings",
      });

    if (!!name?.length) {
      query = query.ilike("full_name", `%${name}%`);
    }

    const { data, error } = await query;

    if (error) return null;

    setLoading(false);
    return data;
  };

  const searchInstructors = async ({ name }: { name?: string }) => {
    setLoading(true);

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

export const useManageImage = () => {
  const [loading, setLoading] = useState(false);
  const removeImage = async ({ id }: { id: string }) => {
    setLoading(true);
    const { data: existingURL } = await supabase
      .from("instructors")
      .select("avatar_path")
      .eq("id", id)
      .single();

    if (existingURL) {
      await supabase.storage
        .from("user-photos")
        .remove([existingURL?.avatar_path]);
    }

    setLoading(false);
    return;
  };

  return { removeImage, loading };
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

  const updateInstructor = async ({
    id,
    values,
  }: {
    id: string;
    values: CreateInstructorProps;
  }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("instructors")
      .update(values)
      .eq("id", id);

    if (error) {
      console.log("error: ", error);
      return null;
    }

    setLoading(false);
    return data;
  };

  return { loading, createInstructor, updateInstructor };
};

export const useClassManagement = () => {
  const [loading, setLoading] = useState(false);
  const { updateUserCredits } = useManageCredits();
  const user = useAppSelector((state) => state.auth.user);

  const markAttendance = async ({
    bookingID,
    status,
  }: {
    bookingID: string;
    status: string;
  }) => {
    let query = supabase
      .from("class_bookings")
      .update({ attendance_status: status })
      .eq("id", bookingID);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching attendees:", error);
      return null;
    }

    setLoading(false);
    return data;
  };

  const rebookAttendee = async ({
    oldClassID,
    newClassID,
    bookingID,
    oldTakenSlots,
    newTakenSlots,
  }: {
    oldTakenSlots: number;
    newTakenSlots: number;
    oldClassID: string;
    bookingID: string;
    newClassID: string;
  }) => {
    let query = supabase
      .from("class_bookings")
      .update({ class_id: newClassID })
      .eq("id", bookingID)
      .select();

    console.log({
      oldClassID,
      newClassID,
      bookingID,
      oldTakenSlots,
      newTakenSlots,
    });

    const updateOldClassResponse = await updateClass({
      id: oldClassID,
      ...(oldTakenSlots !== 0 && {
        values: { taken_slots: oldTakenSlots - 1 },
      }),
    });
    const updateNewClassResponse = await updateClass({
      id: newClassID,
      values: { taken_slots: newTakenSlots + 1 },
    });

    const { data, error } = await query;

    if (
      error ||
      updateOldClassResponse === null ||
      updateNewClassResponse === null
    ) {
      console.error("Error rebooking attendee:", error);
      return null;
    }

    setLoading(false);
    return data;
  };

  const fetchClassAttendees = async ({ classID }: { classID: string }) => {
    setLoading(true);

    let query = supabase
      .from("class_bookings")
      .select(
        `
        *, 
        user_profiles(
          full_name
        )
        `
      )
      .eq("class_id", classID);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching attendees:", error);
      return null;
    }

    setLoading(false);
    return data;
  };

  const fetchClasses = async ({
    isAdmin = false,
    userId,
    startDate,
    endDate,
    selectedDate,
  }: {
    isAdmin?: boolean;
    userId?: string;
    startDate?: Dayjs;
    endDate?: Dayjs;
    selectedDate?: Dayjs;
  }) => {
    setLoading(true);

    // now in UTC ISO (matches timestamptz stored in DB)
    const nowISO = dayjs().toISOString();
    const today = dayjs().startOf("day");

    let query = supabase.from("classes").select(`
    *,
    class_bookings (
      id,
      attendance_status,
      booker_id,
      class_id,
      user_profiles (
        id,
        full_name
      )
    ),
    instructors (
      avatar_path
    )
  `);

    if (userId) {
      query = query.eq("class_bookings.booker_id", userId);
    }

    if (startDate && endDate) {
      query = query
        .gte("class_date", startDate.format("YYYY-MM-DD"))
        .lte("class_date", endDate.format("YYYY-MM-DD"));
    }

    if (selectedDate) {
      const startOfSelectedUTC = selectedDate
        .startOf("day")
        .subtract(8, "hour")
        .toISOString();
      const endOfSelectedUTC = selectedDate
        .endOf("day")
        .subtract(8, "hour")
        .toISOString();

      query = query
        .gte("class_date", startOfSelectedUTC)
        .lte("class_date", endOfSelectedUTC);

      // If selected day is today AND caller is not admin, only show classes that haven't started yet
      if (!isAdmin && selectedDate.isSame(today, "day")) {
        query = query.gte("start_time", nowISO);
      }
    }

    query = query.order("created_at", { ascending: true });

    const { data, error } = await query;

    setLoading(false);

    if (error) {
      console.error("Error fetching classes:", error);
      return null;
    }

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
    values?: CreateClassProps;
  }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("classes")
      .update(values)
      .eq("id", id)
      .select();

    if (error) return null;

    setLoading(false);
    return data;
  };

  const cancelClass = async ({
    id,
    classID,
    takenSlots,
  }: {
    id: string;
    classID: string;
    takenSlots: number;
  }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("class_bookings")
      .update({ attendance_status: "cancelled" })
      .eq("id", id)
      .select();

    const updateClassResponse = await updateClass({
      id: classID,
      values: { taken_slots: takenSlots - 1 },
    });
    const updateCreditsResponse = await updateUserCredits({
      userID: user?.id as string,
      ...(user?.credits && {
        values: { credits: (user.credits as number) + 1 },
      }),
    });

    if (error || updateClassResponse === null || updateCreditsResponse === null)
      return null;

    setLoading(false);
    return data;
  };

  const bookClass = async ({
    classDate,
    bookerId,
    classId,
  }: {
    classDate: string;
    bookerId: string;
    classId: string;
  }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("class_bookings")
      .insert({ booker_id: bookerId, class_id: classId, class_date: classDate })
      .select();

    if (error) return null;

    setLoading(false);
    return data;
  };

  return {
    loading,
    bookClass,
    cancelClass,
    markAttendance,
    rebookAttendee,
    fetchClassAttendees,
    updateClass,
    fetchClasses,
    createClass,
  };
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
    values: CreatePackageProps;
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

  const purchasePackage = async ({
    userID,
    packageID,
    paymentMethod,
    validityPeriod,
    packageCredits,
  }: {
    userID: string;
    packageID: string;
    paymentMethod: string;
    packageCredits: number;
    validityPeriod: number;
  }) => {
    setLoading(true);

    const today = dayjs();

    const { data, error } = await supabase
      .from("client_packages")
      .insert({
        user_id: userID,
        package_id: packageID,
        status: "active",
        validity_period: validityPeriod,
        package_credits: packageCredits,
        purchase_date: today,
        payment_method: paymentMethod,
        expiration_date: getDateFromToday(validityPeriod),
      })
      .select();

    if (error) return null;

    setLoading(false);
    return data;
  };

  const updateClientPackage = async ({
    clientPackageID,
    values,
  }: {
    clientPackageID: string;
    values?: {
      status?: string;
      packageCredits?: number;
      validityPeriod?: number;
      expirationDate?: Dayjs;
    };
  }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("client_packages")
      .update({
        ...(values?.status && { status: values.status }),
        ...(values?.expirationDate && {
          expiration_date: values.expirationDate,
        }),
        ...(values?.packageCredits && {
          package_credits: values.packageCredits,
        }),
        ...(values?.validityPeriod && {
          validity_period: values.validityPeriod,
        }),
      })
      .eq("id", clientPackageID)
      .select();

    if (error) return null;

    setLoading(false);
    return data;
  };

  const fetchClientPackages = async ({ clientID }: { clientID: string }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("client_packages")
      .select(`*, packages(*)`)
      .eq("user_id", clientID)
      .order("created_at", { ascending: false });

    if (error) return null;

    setLoading(false);
    return data;
  };

  return {
    loading,
    updateClientPackage,
    fetchClientPackages,
    purchasePackage,
    updatePackage,
    createPackage,
    fetchPackages,
  };
};

export const useClientBookings = () => {
  const [loading, setLoading] = useState(false);

  const fetchClientBookings = async ({ userID }: { userID: string }) => {
    setLoading(true);
    const today = dayjs().startOf("day").format("YYYY-MM-DD");

    const { data, error } = await supabase
      .from("class_bookings")
      .select(
        `
    id,
    booker_id,
    class_id,
    class_date,
    classes (
      id,
      end_time,
      start_time,
      instructor_id,
      taken_slots,
      available_slots,
      instructors (
        id,
        full_name,
        avatar_path
      )
    )
  `
      )
      .eq("booker_id", userID)
      .or("attendance_status.is.null,attendance_status.neq.cancelled")
      .gte("class_date", today);

    if (error) return null;

    setLoading(false);
    return data;
  };

  return { loading, fetchClientBookings };
};

export const useManageCredits = () => {
  const [loading, setLoading] = useState(false);

  const createUserCredits = async ({
    values,
  }: {
    values: CreateUserCredits;
  }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("user_credits")
      .insert(values)
      .single();

    console.log("error: ", error);

    if (error) return null;

    setLoading(false);
    return data;
  };

  const updateUserCredits = async ({
    userID,
    values,
  }: {
    userID: string;
    values?: { credits: number };
  }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("user_credits")
      .update(values)
      .eq("user_id", userID)
      .single();

    console.log("error: ", error);

    if (error) return null;

    setLoading(false);
    return data;
  };

  return { loading, updateUserCredits, createUserCredits };
};
