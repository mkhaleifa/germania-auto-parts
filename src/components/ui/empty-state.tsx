import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState(
    {icon:Icon,
    title,
    description,
    actionLabel,
    actionHref}:EmptyStateProps
){
    return (
        <div className="flex flex-col items-center justify-center text-center py-16">
            <Icon className="h-16 w-16 text-muted-foreground/40" />
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
            {actionLabel && actionHref && (
            <Button
                className="mt-6"
                render={<Link href={actionHref} />}
                nativeButton={false}
            >
                {actionLabel}
            </Button>
            )}
        </div>
    )
}