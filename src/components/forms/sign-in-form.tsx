"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { signInSchema, type SignInValues } from "@/lib/validators/auth";

export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<{ title: string; message: string } | null>(
    null,
  );
  const [isRedirecting, startRedirect] = useTransition();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function submit(values: SignInValues) {
    setFormError(null);

    const { error } = await authClient.signIn.email(values);

    if (error) {
      // generic on purpose, don't reveal which field was wrong
      setFormError({
        title: "Could not sign in",
        message: "That email and password combination did not work.",
      });
      return;
    }

    startRedirect(() => {
      router.push(next);
      router.refresh();
    });
  }

  const [isOpeningDemo, setIsOpeningDemo] = useState(false);

  async function openDemo() {
    setFormError(null);
    setIsOpeningDemo(true);

    const response = await fetch("/api/demo", { method: "POST" }).catch(
      () => null,
    );

    if (!response?.ok) {
      setIsOpeningDemo(false);
      const minutes = Math.max(
        1,
        Math.ceil(Number(response?.headers.get("Retry-After") ?? 0) / 60),
      );
      setFormError({
        title: "Demo not available",
        message:
          response?.status === 429
            ? `Too many demos opened from this connection. Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`
            : "The demo could not be opened. Try again.",
      });
      return;
    }

    startRedirect(() => {
      router.push("/");
      router.refresh();
    });
  }

  const isBusy = form.formState.isSubmitting || isRedirecting;

  return (
    <form onSubmit={form.handleSubmit(submit)} noValidate>
      <FieldGroup>
        {formError ? (
          <Alert variant="destructive">
            <AlertTitle>{formError.title}</AlertTitle>
            <AlertDescription>{formError.message}</AlertDescription>
          </Alert>
        ) : null}

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            className="h-11"
            type="email"
            autoComplete="email"
            spellCheck={false}
            autoCapitalize="none"
            placeholder="you@example.com"
            aria-invalid={!!form.formState.errors.email}
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <FieldDescription>
              {form.formState.errors.email.message}
            </FieldDescription>
          ) : null}
        </Field>

        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            className="h-11"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!form.formState.errors.password}
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <FieldDescription>
              {form.formState.errors.password.message}
            </FieldDescription>
          ) : null}
        </Field>

        <Button type="submit" className="h-11" disabled={isBusy}>
          {isBusy ? <Spinner data-icon="inline-start" /> : null}
          Sign in
        </Button>

        <FieldSeparator>or</FieldSeparator>

        <Field>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={isBusy || isOpeningDemo}
            onClick={() => void openDemo()}
          >
            {isOpeningDemo ? <Spinner data-icon="inline-start" /> : null}
            Open the demo
          </Button>
          <FieldDescription>
            Your own copy of an account with a year of transactions, budgets
            and repeating payments. Change anything. No sign-up; it is removed
            after a day.
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
