"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { handleCreateEvent } from "@/lib/actions/event-action";
import { useState, useTransition } from "react";

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date and time are required"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  category: z.enum(["Sports", "Technical", "Cultural", "Workshop", "Other"]),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface CreateEventFormProps {
  onSuccess?: () => void;
}

export default function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      category: "Technical",
      capacity: 50,
    },
  });

  const onSubmit = (values: EventFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const isoDate = new Date(values.date).toISOString();
      const result = await handleCreateEvent({
        ...values,
        date: isoDate,
      });

      if (result.success) {
        setSuccessMsg("Event created successfully!");
        reset();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setErrorMsg(result.message || "Failed to create event");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMsg && (
        <div className="rounded border border-m-red/20 bg-m-red/10 p-4 text-sm text-m-red">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded border border-m-blue-light/20 bg-m-blue-light/10 p-4 text-sm text-m-blue-light">
          {successMsg}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[1.5px] text-muted">
          Event Title
        </label>
        <input
          {...register("title")}
          type="text"
          placeholder="e.g. Hackathon 2026"
          className="w-full h-12 rounded border border-hairline bg-canvas px-4 text-sm text-on-dark focus:border-on-dark focus:outline-none"
        />
        {errors.title && (
          <p className="text-xs text-m-red">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[1.5px] text-muted">
          Description
        </label>
        <textarea
          {...register("description")}
          placeholder="Describe what this event is about..."
          rows={4}
          className="w-full rounded border border-hairline bg-canvas p-4 text-sm text-on-dark focus:border-on-dark focus:outline-none resize-none"
        />
        {errors.description && (
          <p className="text-xs text-m-red">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[1.5px] text-muted">
            Date & Time
          </label>
          <input
            {...register("date")}
            type="datetime-local"
            className="w-full h-12 rounded border border-hairline bg-canvas px-4 text-sm text-on-dark focus:border-on-dark focus:outline-none"
          />
          {errors.date && (
            <p className="text-xs text-m-red">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[1.5px] text-muted">
            Location / Venue
          </label>
          <input
            {...register("location")}
            type="text"
            placeholder="e.g. Auditorium Hall B"
            className="w-full h-12 rounded border border-hairline bg-canvas px-4 text-sm text-on-dark focus:border-on-dark focus:outline-none"
          />
          {errors.location && (
            <p className="text-xs text-m-red">{errors.location.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[1.5px] text-muted">
            Category
          </label>
          <select
            {...register("category")}
            className="w-full h-12 rounded border border-hairline bg-canvas px-4 text-sm text-on-dark focus:border-on-dark focus:outline-none appearance-none"
          >
            <option value="Technical">Technical</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="Workshop">Workshop</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && (
            <p className="text-xs text-m-red">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[1.5px] text-muted">
            Capacity (Max Registrations)
          </label>
          <input
            {...register("capacity", { valueAsNumber: true })}
            type="number"
            placeholder="100"
            className="w-full h-12 rounded border border-hairline bg-canvas px-4 text-sm text-on-dark focus:border-on-dark focus:outline-none"
          />
          {errors.capacity && (
            <p className="text-xs text-m-red">{errors.capacity.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded bg-on-dark text-canvas text-sm font-semibold uppercase tracking-[1.5px] transition-all hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Creating Event..." : "Publish Event"}
      </button>
    </form>
  );
}
