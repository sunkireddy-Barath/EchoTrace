import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors font-mono',
  {
    variants: {
      variant: {
        default: 'bg-cyber-accent/20 text-cyber-accent2 border border-cyber-accent/30',
        high: 'bg-threat-high/20 text-threat-high border border-threat-high/40',
        medium: 'bg-threat-medium/20 text-threat-medium border border-threat-medium/40',
        low: 'bg-threat-low/20 text-threat-low border border-threat-low/40',
        outline: 'border border-cyber-border text-cyber-muted',
        secondary: 'bg-cyber-card2 text-cyber-text border border-cyber-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
