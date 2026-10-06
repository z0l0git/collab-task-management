"use client";

import Image from "next/image";

import googleMark from "@/assets/google.svg";
import { Button } from "@/components/ui";

export const GoogleButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => (
  <Button
    variant="secondary"
    size="lg"
    fullWidth
    onClick={onClick}
    disabled={disabled}
    leadingIcon={
      <Image src={googleMark} alt="" width={16} height={16} unoptimized />
    }
  >
    Continue with Google
  </Button>
);
