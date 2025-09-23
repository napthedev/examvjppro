// components/LinkButton.tsx
import Link from "next/link";
import { Button, ButtonProps } from "./ui/button";
import { ReactNode } from "react";

type LinkButtonProps = ButtonProps & {
  href: string;
  children: ReactNode;
};

export default function LinkButton({
  href,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Button asChild {...props}>
      <Link href={href}>{children}</Link>
    </Button>
  );
}
