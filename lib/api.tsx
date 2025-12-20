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
import { BUCKET_NAME, getDateFromToday } from "./utils";
import { useAppSelector } from "./hooks";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import axiosApi from "./axiosConfig";

dayjs.extend(utc);
dayjs.extend(timezone);

export const useAdminProfile = () => {
  const [loading, setLoading] = useState(false);

  const getAdmin = async ({ id }: { id: string }) => {
    try {
      setLoading(true);

      const response = await axiosApi.get(`/admin/getAdmin`, {
        params: { id: id },
      });

      const profile = response?.data?.data;

      if (!profile) return null;

      setLoading(false);
      return profile;
    } catch (error) {
      setLoading(false);
    }
  };

  return { getAdmin, loading };
};

export const useSearchUser = () => {
  const [loading, setLoading] = useState(false);

  const validateEmail = async ({ email }: { email: string }) => {
    setLoading(true);

    const response = await axiosApi.get(`/user/validate-email`, {
      params: { email },
    });

    const data = response?.data?.data;

    if (!data) return null;

    setLoading(false);
    return data;
  };

  const searchClients = async ({ name }: { name?: string }) => {
    setLoading(true);

    const response = await axiosApi.get(`/user/search-clients`, {
      params: { name },
    });

    const data = response?.data?.data;

    if (!data) return null;

    setLoading(false);
    return data;
  };

  const searchInstructors = async ({ name }: { name?: string }) => {
    setLoading(true);

    const response = await axiosApi.get(`/user/search-instructors`, {
      params: { name },
    });

    const data = response?.data?.data;

    if (!data) return null;

    setLoading(false);
    return data;
  };

  return { validateEmail, searchClients, searchInstructors, loading };
};

export const useManagePassword = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const validatePassword = async ({
    email,
    currentPassword,
  }: {
    email: string;
    currentPassword: string;
  }) => {
    try {
      setLoading(true);
      const response = await axiosApi.get(`/user/validate-password`, {
        params: { email, password: currentPassword },
      });

      const data = response?.data?.data;

      if (!data) return null;

      return data;
    } catch (error) {
      console.log("error validating password: ", error);
    }
    setLoading(false);
  };

  const changePassword = async ({
    userID,
    newPassword,
  }: {
    userID: string;
    newPassword: string;
  }) => {
    try {
      setLoading(true);

      const response = await axiosApi.post(`/user/change-password`, {
        id: userID,
        password: newPassword,
      });

      const data = response?.data?.data;

      if (!data) return null;

      return data;
    } catch (error) {
      console.log("error changing password: ", error);
    }
    setLoading(false);
  };

  return { validatePassword, changePassword, loading };
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

    const response = await axiosApi.post(`/user/update-profile`, {
      id,
      values,
    });

    const data = response?.data?.data;

    if (!data) return null;

    setLoading(false);
    return data;
  };

  return { loading, updateUser };
};

export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);

  const deleteUser = async ({ id }: { id: string }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", id)
      .select();

    await axiosApi.post("/user/delete", {
      id: id,
    });

    if (error) return null;

    setLoading(false);
    return data;
  };

  return { loading, deleteUser };
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

  const fetchImage = async ({ avatarPath }: { avatarPath: string }) => {
    let signedUrl: any;

    if (avatarPath === null) return null;

    const { data, error: urlError } = await supabase.storage
      .from("user-photos")
      .createSignedUrl(`${avatarPath}`, 3600);

    if (urlError) {
      console.error("Error generating signed URL:", urlError);
      signedUrl = null;
    }

    signedUrl = data?.signedUrl;

    return signedUrl;
  };

  const saveImage = async ({ file, id }: { file: any; id?: string }) => {
    let filePath: string = "";

    if (id) {
      filePath = `${id}_${dayjs().toDate().getTime()}`;
    } else {
      filePath = `${dayjs().toDate().getTime()}`;
    }
    const fileExt = (file[0] as File).name.split(".").pop();
    const fileName = `${filePath}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file[0].originFileObj as File, {
        upsert: true, // overwrite if exists
        contentType: (file[0] as File).type,
      });

    if (uploadError) throw uploadError;

    const imageURL = fileName;

    return imageURL;
  };

  return { saveImage, fetchImage, removeImage, loading };
};

export const useInstructorManagement = () => {
  const [loading, setLoading] = useState(false);

  const createInstructor = async ({
    values,
  }: {
    values: CreateInstructorProps;
  }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("instructors")
      .insert(values)
      .select();

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
      .eq("id", id)
      .select();

    if (error) {
      console.log("error: ", error);
      return null;
    }

    setLoading(false);
    return data;
  };

  const deleteInstructor = async ({ id }: { id: string }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", id)
      .select();

    await axiosApi.post("/user/delete", {
      id: id,
    });

    if (error) {
      console.log("error: ", error);
      return null;
    }

    setLoading(false);
    return data;
  };

  const deactivateInstructor = async ({ id }: { id: string }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("user_profiles")
      .update({ deactivated: true })
      .eq("id", id)
      .select();

    if (error) {
      console.log("error: ", error);
      return null;
    }

    setLoading(false);
    return data;
  };

  const reactivateInstructor = async ({ id }: { id: string }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("user_profiles")
      .update({ deactivated: false })
      .eq("id", id)
      .select();

    if (error) {
      console.log("error: ", error);
      return null;
    }

    setLoading(false);
    return data;
  };

  return {
    loading,
    reactivateInstructor,
    deactivateInstructor,
    createInstructor,
    updateInstructor,
    deleteInstructor,
  };
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
    isInstructor = false,
    userId,
    startDate,
    endDate,
    selectedDate,
    instructorId,
  }: {
    isAdmin?: boolean;
    isInstructor?: boolean;
    userId?: string;
    instructorId?: string;
    startDate?: Dayjs;
    endDate?: Dayjs;
    selectedDate?: Dayjs;
  }) => {
    setLoading(true);

    const nowISO = dayjs().toISOString();
    const today = dayjs().startOf("day");
    let query = supabase.from("classes").select(`
    *,
    instructors (
      id,
      user_id,
      full_name,
      avatar_path,
      user_profiles (
        id,
        avatar_path,
        deactivated
      )
    ),
    class_bookings (
      id,
      attendance_status,
      booker_id,
      class_id,
      walk_in_first_name,
      walk_in_last_name,
      user_profiles (
        id,
        full_name
      )
    )
  `);

    if (userId) {
      query = query.eq("class_bookings.booker_id", userId);
    }

    if (isInstructor && instructorId) {
      query = query.eq("instructor_id", instructorId);
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

      // If selected day is today, and the caller is NOT admin and NOT instructor,
      // only show classes that haven't started yet.
      if (!isAdmin && !isInstructor && selectedDate.isSame(today, "day")) {
        query = query.gte("start_time", nowISO);
      }
    }

    query = query.order("start_time", { ascending: true });

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

  const deleteClass = async ({ id }: { id: string }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("classes")
      .delete()
      .eq("id", id)
      .select();

    if (error) return null;

    setLoading(false);
    return data;
  };

  const bookClass = async ({
    classDate,
    bookerId,
    classId,
    isWalkIn,
    walkInFirstName,
    walkInLastName,
    walkInClientEmail,
    walkInClientContactNumber,
  }: {
    classDate: string;
    classId: string;
    isWalkIn: boolean;
    bookerId?: string;
    walkInFirstName?: string;
    walkInLastName?: string;
    walkInClientEmail?: string;
    walkInClientContactNumber?: string;
  }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("class_bookings")
      .insert({
        class_id: classId,
        class_date: classDate,
        is_walk_in: isWalkIn,
        attendance_status: "no-show",
        ...(bookerId && { booker_id: bookerId }),
        /**
         * walk-ins can only book classes that are on the same day
         * so we set the sent_email_reminder value to TRUE
         * meaning that an automated email does not need to be
         * sent to that client
         *
         * DEV NOTE: default value is FALSE and is configured in the DB
         */
        ...(isWalkIn === true && { sent_email_reminder: true }),
        ...(walkInFirstName && { walk_in_first_name: walkInFirstName }),
        ...(walkInLastName && { walk_in_last_name: walkInLastName }),
        ...(walkInClientEmail && { walk_in_client_email: walkInClientEmail }),
        ...(walkInClientContactNumber && {
          walk_in_client_contact_number: walkInClientContactNumber,
        }),
      })
      .select();

    if (error) return null;

    setLoading(false);
    return data;
  };

  return {
    deleteClass,
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

    const { data, error } = await supabase
      .from("packages")
      .insert({ ...values, offered_for_clients: false });

    if (error) return null;

    setLoading(false);
    return data;
  };

  const fetchPackages = async ({
    isAdmin,
  }: {
    isAdmin: boolean | undefined;
  }) => {
    setLoading(true);

    let query = supabase.from("packages").select("*");

    if (isAdmin !== true) {
      query = query.eq("offered_for_clients", true);
    }

    const { data, error } = await query;

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

  const deletePackage = async ({ id }: { id: string }) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("packages")
      .delete()
      .eq("id", id)
      .select();

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
    packageName,
  }: {
    userID: string;
    packageID: string;
    paymentMethod: string;
    packageName: string;
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
        package_name: packageName,
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

  const fetchClientPackages = async ({
    clientID,
    findExpiry,
  }: {
    clientID?: string;
    findExpiry?: boolean;
  }) => {
    setLoading(true);

    let query = supabase.from("client_packages").select(`*, packages(*)`);
    const startOfTodayUTC = dayjs().utc().startOf("day").toISOString();
    const endOfTodayUTC = dayjs().utc().endOf("day").toISOString();

    if (clientID) {
      query = query.eq("user_id", clientID);
    }

    if (clientID === undefined && findExpiry) {
      /**
       * this gets records that are active and have an expiration_date of the current date
       *
       * query = query.eq("status", "active");
       * query = query.gte("expiration_date", startOfTodayUTC);
       * query = query.lt("expiration_date", endOfTodayUTC);
       */

      /**
       * this gets potentially missed records that were active
       * of today and in the past
       */
      query = query.eq("status", "active");
      query = query.lte("expiration_date", endOfTodayUTC);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) return null;

    setLoading(false);
    return data;
  };

  return {
    loading,
    deletePackage,
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

    const nowISO = dayjs().toISOString();

    const { data, error } = await supabase
      .from("class_bookings")
      .select(
        `
          id,
          booker_id,
          class_id,
          class_date,
          attendance_status,
          classes (
            id,
            end_time,
            start_time,
            class_date,
            class_name,
            instructor_id,
            instructor_name,
            taken_slots,
            available_slots,
            instructors (
              id,
              user_id,
              full_name,
              avatar_path,
              user_profiles (
                id,
                avatar_path
              )
            )
          )
    `
      )
      .eq("booker_id", userID)
      .or(
        "attendance_status.eq.active,attendance_status.eq.no-show,attendance_status.is.null"
      );

    // .gte("classes.start_time", nowISO);

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

    if (error) return null;

    setLoading(false);
    return data;
  };

  return { loading, updateUserCredits, createUserCredits };
};

export const useManageOrders = () => {
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);

    const response = await axiosApi.get("/admin/orders/fetch");

    if (!response.data.data) return null;

    setLoading(false);
    return response.data.data;
  };

  return { loading, fetchOrders };
};
