import React, { useMemo, useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PassengerDetailsModal({
  open,
  onClose,
  paxCount = 1,
  onSubmit,
  defaultEmail = "",
  defaultPhone = "",
}) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const twelveYearsAgoISO = new Date(
    new Date().getFullYear() - 12,
    new Date().getMonth(),
    new Date().getDate()
  )
    .toISOString()
    .slice(0, 10);

  const initial = useMemo(
    () =>
      Array.from({ length: paxCount }).map(() => ({
        type: "adult",
        title: "mr",
        given_name: "",
        family_name: "",
        born_on: "",
        gender: "m",
        email: defaultEmail || "",
        phone_number: defaultPhone || "",
      })),
    [paxCount, defaultEmail, defaultPhone]
  );

  const [passengers, setPassengers] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const firstErrorRef = useRef(null);

  // rebuild when paxCount changes
  useEffect(() => {
    setPassengers(initial);
    setErrors({});
  }, [initial]);

  const updateField = (idx, key, val) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: val };
      return copy;
    });
  };

  const isAdultDOB = (iso) => {
    if (!iso) return false;
    // adult means <= (today - 12 years)
    return iso <= twelveYearsAgoISO && iso <= todayISO;
  };

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-zÀ-ÿ' -]{2,}$/; // allow accents, spaces, hyphens, apostrophes
    const phoneRegex = /^\+?[0-9 ()-]{7,20}$/;

    passengers.forEach((p, idx) => {
      const row = {};
      if (!["mr", "mrs", "ms"].includes(p.title)) row.title = "Choose title";
      if (!nameRegex.test(p.given_name || "")) row.given_name = "Enter a valid given name (min 2 letters).";
      if (!nameRegex.test(p.family_name || "")) row.family_name = "Enter a valid family name (min 2 letters).";

      if (!p.born_on) {
        row.born_on = "Date of birth is required.";
      } else if (p.born_on > todayISO) {
        row.born_on = "DOB cannot be in the future.";
      } else if (!isAdultDOB(p.born_on)) {
        row.born_on = "Passenger must be at least 12 years old.";
      }

      if (!["m", "f", "x"].includes(p.gender)) row.gender = "Choose gender";

      if (!emailRegex.test(p.email || "")) row.email = "Enter a valid email address.";
      if (!phoneRegex.test(p.phone_number || "")) row.phone_number = "Enter a valid phone number.";

      if (Object.keys(row).length) errs[idx] = row;
    });

    setErrors(errs);

    // scroll to first error
    setTimeout(() => {
      if (firstErrorRef.current) {
        firstErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorRef.current = null;
      }
    }, 0);

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setSubmitting(true);
      await onSubmit(passengers);
    } finally {
      setSubmitting(false);
    }
  };

  // helper to bind error refs so we can scroll to first one
  const bindErrorRef = (hasError) => (el) => {
    if (hasError && !firstErrorRef.current) firstErrorRef.current = el;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Passenger details</DialogTitle>
          <DialogDescription>Enter traveler information exactly as on ID/passport.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
          {passengers.map((p, i) => {
            const e = errors[i] || {};
            return (
              <div
                key={i}
                className="rounded-2xl border p-5 space-y-5 bg-muted/20"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium opacity-80">
                    Passenger {i + 1} <span className="opacity-60">(Adult)</span>
                  </div>
                </div>

                {/* Title / Given / Family */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div ref={bindErrorRef(!!e.title)}>
                    <Label className="flex items-center gap-1">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Select value={p.title} onValueChange={(v) => updateField(i, "title", v)}>
                      <SelectTrigger aria-invalid={!!e.title}>
                        <SelectValue placeholder="Title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mr">Mr</SelectItem>
                        <SelectItem value="mrs">Mrs</SelectItem>
                        <SelectItem value="ms">Ms</SelectItem>
                      </SelectContent>
                    </Select>
                    {e.title && <p className="text-xs text-red-500 mt-1">{e.title}</p>}
                  </div>

                  <div className="md:col-span-2" ref={bindErrorRef(!!e.given_name)}>
                    <Label className="flex items-center gap-1">
                      Given name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={p.given_name}
                      onChange={(ev) => updateField(i, "given_name", ev.target.value)}
                      aria-invalid={!!e.given_name}
                      autoCapitalize="words"
                      placeholder="e.g., John"
                    />
                    {e.given_name && <p className="text-xs text-red-500 mt-1">{e.given_name}</p>}
                  </div>

                  <div ref={bindErrorRef(!!e.family_name)}>
                    <Label className="flex items-center gap-1">
                      Family name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={p.family_name}
                      onChange={(ev) => updateField(i, "family_name", ev.target.value)}
                      aria-invalid={!!e.family_name}
                      autoCapitalize="words"
                      placeholder="e.g., Smith"
                    />
                    {e.family_name && <p className="text-xs text-red-500 mt-1">{e.family_name}</p>}
                  </div>
                </div>

                {/* DOB / Gender / Phone */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div ref={bindErrorRef(!!e.born_on)}>
                    <Label className="flex items-center gap-1">
                      Date of birth <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={p.born_on}
                      onChange={(ev) => updateField(i, "born_on", ev.target.value)}
                      max={twelveYearsAgoISO} // adult min age
                      min="1900-01-01"
                      aria-invalid={!!e.born_on}
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Passenger must be at least 12 years old.
                    </p>
                    {e.born_on && <p className="text-xs text-red-500 mt-1">{e.born_on}</p>}
                  </div>

                  <div ref={bindErrorRef(!!e.gender)}>
                    <Label className="flex items-center gap-1">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Select value={p.gender} onValueChange={(v) => updateField(i, "gender", v)}>
                      <SelectTrigger aria-invalid={!!e.gender}>
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m">Male</SelectItem>
                        <SelectItem value="f">Female</SelectItem>
                        <SelectItem value="x">Unspecified</SelectItem>
                      </SelectContent>
                    </Select>
                    {e.gender && <p className="text-xs text-red-500 mt-1">{e.gender}</p>}
                  </div>

                  <div ref={bindErrorRef(!!e.phone_number)}>
                    <Label className="flex items-center gap-1">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="+61400000000"
                      value={p.phone_number}
                      onChange={(ev) => updateField(i, "phone_number", ev.target.value)}
                      inputMode="tel"
                      aria-invalid={!!e.phone_number}
                    />
                    {e.phone_number && <p className="text-xs text-red-500 mt-1">{e.phone_number}</p>}
                  </div>
                </div>

                {/* Email */}
                <div ref={bindErrorRef(!!e.email)}>
                  <Label className="flex items-center gap-1">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="name@example.com"
                    value={p.email}
                    onChange={(ev) => updateField(i, "email", ev.target.value)}
                    type="email"
                    aria-invalid={!!e.email}
                    inputMode="email"
                    autoComplete="email"
                  />
                  {e.email && <p className="text-xs text-red-500 mt-1">{e.email}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
