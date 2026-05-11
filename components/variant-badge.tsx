import type { VariantType } from '@/lib/types';
import { formatTypeLabel } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function VariantBadge({
  type,
  className,
}: {
  type: VariantType;
  className?: string;
}) {
  return (
    <Badge variant={type} className={cn(className)}>
      {formatTypeLabel(type)}
    </Badge>
  );
}
