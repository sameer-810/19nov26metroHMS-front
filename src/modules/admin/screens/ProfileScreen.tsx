import React, { useState } from "react";
import { View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react-native";

import { palette } from "@shared/designSystem";
import { ROLES, ROLE_LABELS } from "@shared/permissions";
import { useAuthStore, type AuthUser } from "@shared/store/useAuthStore";
import {
  Screen,
  Text,
  VStack,
  HStack,
  Card,
  SectionHeader,
  Button,
  Banner,
  Avatar,
  Skeleton,
} from "@shared/ui";
import { ControlledTextField } from "@shared/form/ControlledTextField";
import { apiErrorMessage } from "@api/apiClient";
import { formatDateTime } from "@shared/format";
import { useChangePassword, useMe } from "@modules/auth/hooks/useAuth";
import {
  changePasswordSchema,
  type ChangePasswordForm,
} from "@modules/auth/auth.validation";
import { SessionsCard } from "@modules/auth/components/SessionsCard";
import { useUpdateUser } from "@modules/admin/hooks/useAdmin";
import {
  editUserSchema,
  type EditUserForm,
} from "@modules/admin/admin.validation";
import type { UpdateUserBody } from "@modules/admin/types";

/** The signed-in user's own account. Read-only except the password (role etc. are admin-managed). An administrator can also edit their own details. */
export default function ProfileScreen() {
  const stored = useAuthStore((s) => s.user);
  const hospital = useAuthStore((s) => s.hospital);
  const logout = useAuthStore((s) => s.logout);
  const me = useMe();
  const [editing, setEditing] = useState(false);

  // Prefer /auth/me: fresher than the persisted copy and includes lastLoginAt.
  const user = (me.data?.user ?? stored) as
    (AuthUser & { lastLoginAt?: string | null }) | null;

  if (!user) {
    return (
      <Screen title="My profile" testID="profile-screen">
        <Skeleton height={160} />
      </Screen>
    );
  }

  const isAdmin = user.role === ROLES.ADMIN;

  return (
    <Screen
      overline="Workspace"
      title="My profile"
      refreshing={me.isRefetching}
      onRefresh={() => me.refetch()}
      testID="profile-screen"
    >
      <VStack gap={14} style={{ maxWidth: 720 }}>
        <Card testID="profile-details">
          <HStack gap={14} align="center" wrap>
            <Avatar
              name={user.fullName}
              uri={user.avatarUrl || undefined}
              size={56}
            />
            <VStack gap={2} style={{ flex: 1, minWidth: 200 }}>
              <Text variant="h1" testID="profile-name">
                {user.fullName}
              </Text>
              <Text variant="body-sm" tone="secondary" testID="profile-role">
                {ROLE_LABELS[user.role] ?? user.role}
                {user.designation ? ` · ${user.designation}` : ""}
              </Text>
            </VStack>
            {isAdmin && !editing ? (
              <Button
                label="Edit profile"
                variant="secondary"
                size="sm"
                fullWidth={false}
                onPress={() => setEditing(true)}
                testID="profile-edit"
              />
            ) : null}
          </HStack>

          {isAdmin && editing ? (
            <AdminProfileEditForm
              key={`edit-${user.id}`}
              user={user}
              onDone={() => setEditing(false)}
            />
          ) : (
            <>
              <VStack gap={8} style={{ marginTop: 16 }}>
                <Detail
                  label="Employee ID"
                  value={user.employeeId}
                  testID="profile-employee-id"
                />
                <Detail
                  label="Department"
                  value={user.departmentName || "No department"}
                  testID="profile-department"
                />
                <Detail
                  label="Email"
                  value={user.email}
                  testID="profile-email"
                />
                {user.phone ? (
                  <Detail
                    label="Mobile"
                    value={user.phone}
                    testID="profile-phone"
                  />
                ) : null}
                {hospital ? (
                  <Detail
                    label="Hospital"
                    value={hospital.name}
                    testID="profile-hospital"
                  />
                ) : null}
                {user.lastLoginAt ? (
                  <Detail
                    label="Signed in"
                    value={formatDateTime(user.lastLoginAt)}
                    testID="profile-last-login"
                  />
                ) : null}
              </VStack>
              <Text variant="caption" tone="tertiary" style={{ marginTop: 12 }}>
                {isAdmin
                  ? "As an administrator you can edit your own name, email, mobile and designation here."
                  : "Your name, role and department are managed by your administrator."}
              </Text>
            </>
          )}
        </Card>

        <ChangePasswordCard email={user.email} />

        <SessionsCard />

        <Card>
          <SectionHeader
            title="Sign out"
            subtitle="Ends the session on this device only."
          />
          <Button
            label="Sign out"
            variant="secondary"
            fullWidth={false}
            icon={
              <LogOut size={15} color={palette.text.primary} strokeWidth={2} />
            }
            onPress={() => logout()}
            testID="profile-sign-out"
          />
        </Card>
      </VStack>
    </Screen>
  );
}

function Detail({
  label,
  value,
  testID,
}: {
  label: string;
  value: string;
  testID?: string;
}) {
  return (
    <HStack gap={12} align="flex-start" wrap>
      <Text variant="label" tone="tertiary" style={{ width: 120 }}>
        {label}
      </Text>
      <Text
        variant="body"
        style={{ flex: 1, minWidth: 180 }}
        selectable
        testID={testID}
      >
        {value}
      </Text>
    </HStack>
  );
}

/** Administrator self-edit. Uses the same PATCH /users/:id as the Users screen, sending only changed fields. */
function AdminProfileEditForm({
  user,
  onDone,
}: {
  user: AuthUser;
  onDone: () => void;
}) {
  const update = useUpdateUser(user.id);
  const updateStored = useAuthStore((s) => s.updateUser);
  const qc = useQueryClient();

  const { control, handleSubmit } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName ?? "",
      email: user.email,
      phone: user.phone ?? "",
      designation: user.designation ?? "",
    },
  });

  const submit = handleSubmit((v) => {
    const patch: UpdateUserBody = {};
    if (v.firstName !== user.firstName) patch.firstName = v.firstName;
    if ((v.lastName ?? "") !== (user.lastName ?? ""))
      patch.lastName = v.lastName ?? "";
    if (v.email.toLowerCase() !== user.email.toLowerCase())
      patch.email = v.email;
    // The API treats an empty phone as "no change", so it can be replaced but not cleared.
    if (v.phone && v.phone !== user.phone) patch.phone = v.phone;
    if ((v.designation ?? "") !== (user.designation ?? ""))
      patch.designation = v.designation ?? "";

    if (Object.keys(patch).length === 0) {
      onDone();
      return;
    }

    update.mutate(patch, {
      onSuccess: () => {
        const lastName = patch.lastName ?? user.lastName ?? "";
        const firstName = patch.firstName ?? user.firstName;
        // Keep the persisted copy and the /auth/me cache in step with the new name.
        updateStored({
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          email: patch.email ?? user.email,
          phone: patch.phone ?? user.phone,
          designation: patch.designation ?? user.designation,
        });
        void qc.invalidateQueries({ queryKey: ["me"] });
        onDone();
      },
    });
  });

  return (
    <VStack gap={14} style={{ marginTop: 16 }} testID="profile-edit-form">
      {update.isError ? (
        <View testID="profile-edit-error">
          <Banner
            tone="danger"
            message={apiErrorMessage(update.error, "Could not save your profile")}
          />
        </View>
      ) : null}
      <HStack gap={12} wrap>
        <View style={{ flex: 1, minWidth: 200 }}>
          <ControlledTextField
            control={control}
            name="firstName"
            label="First name"
            required
            testID="profile-edit-firstName"
          />
        </View>
        <View style={{ flex: 1, minWidth: 200 }}>
          <ControlledTextField
            control={control}
            name="lastName"
            label="Last name"
            testID="profile-edit-lastName"
          />
        </View>
      </HStack>
      <HStack gap={12} wrap>
        <View style={{ flex: 1, minWidth: 240 }}>
          <ControlledTextField
            control={control}
            name="email"
            label="Work email"
            required
            keyboardType="email-address"
            autoCapitalize="none"
            hint="Changing this changes what you sign in with."
            testID="profile-edit-email"
          />
        </View>
        <View style={{ flex: 1, minWidth: 200 }}>
          <ControlledTextField
            control={control}
            name="phone"
            label="Mobile"
            keyboardType="phone-pad"
            testID="profile-edit-phone"
          />
        </View>
      </HStack>
      <ControlledTextField
        control={control}
        name="designation"
        label="Designation"
        testID="profile-edit-designation"
      />
      <HStack gap={8} wrap>
        <Button
          label="Save profile"
          fullWidth={false}
          onPress={submit}
          loading={update.isPending}
          testID="profile-edit-save"
        />
        <Button
          label="Cancel"
          variant="ghost"
          fullWidth={false}
          disabled={update.isPending}
          onPress={onDone}
          testID="profile-edit-cancel"
        />
      </HStack>
    </VStack>
  );
}

function ChangePasswordCard({ email }: { email: string }) {
  const changePassword = useChangePassword();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { control, handleSubmit, reset } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const submit = handleSubmit(async (values) => {
    setError(null);
    setDone(false);
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not change your password"));
    }
  });

  return (
    <Card testID="profile-password">
      <SectionHeader title="Change password" subtitle={`For ${email}`} />
      <VStack gap={14}>
        {done ? (
          <View testID="profile-change-success">
            <Banner
              tone="success"
              message="Your password has been changed. Other devices have been signed out."
            />
          </View>
        ) : null}
        {error ? (
          <View testID="profile-change-error">
            <Banner
              tone="danger"
              message={error}
              onDismiss={() => setError(null)}
            />
          </View>
        ) : null}
        <ControlledTextField
          control={control}
          name="currentPassword"
          label="Current password"
          secureTextEntry
          autoComplete="current-password"
          testID="profile-current-password"
        />
        <ControlledTextField
          control={control}
          name="newPassword"
          label="New password"
          secureTextEntry
          autoComplete="new-password"
          hint="At least 10 characters. Longer is better than complicated."
          testID="profile-new-password"
        />
        <ControlledTextField
          control={control}
          name="confirmPassword"
          label="Confirm new password"
          secureTextEntry
          autoComplete="new-password"
          onSubmitEditing={submit}
          returnKeyType="go"
          testID="profile-confirm-password"
        />
        <Button
          label="Change password"
          fullWidth={false}
          onPress={submit}
          loading={changePassword.isPending}
          testID="profile-change-submit"
        />
        <Text variant="caption" tone="tertiary">
          Changing your password signs you out of every other device.
        </Text>
      </VStack>
    </Card>
  );
}
