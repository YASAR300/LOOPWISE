import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Table = React.forwardRef(
  ({ className, sticky = false, ...props }, ref) => (
    <div
      className={cn(
        "relative w-full overflow-auto rounded-md border border-border-hairline",
        sticky && "max-h-[500px]"
      )}
    >
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-left text-xs", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef(
  ({ className, sticky = false, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        "bg-surface-raised/80 border-b border-border-hairline backdrop-blur-sm",
        sticky && "sticky top-0 z-10",
        className
      )}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-border-hairline bg-surface-raised font-medium",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef(
  ({ className, selected = false, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "hover:bg-surface-highlight/70 data-[state=selected]:bg-accent-subtle/50 border-b border-border-hairline transition-colors duration-fast",
        selected && "bg-accent-subtle/40",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef(
  (
    {
      className,
      sortable = false,
      sortDirection = null,
      onSort,
      children,
      ...props
    },
    ref
  ) => (
    <th
      ref={ref}
      onClick={sortable ? onSort : undefined}
      className={cn(
        "h-9 select-none px-3 text-left align-middle text-2xs font-semibold uppercase tracking-wider text-text-muted",
        sortable && "cursor-pointer transition-colors hover:text-text-primary",
        className
      )}
      {...props}
    >
      <div className="inline-flex items-center gap-1.5">
        <span>{children}</span>
        {sortable && (
          <span className="text-text-muted">
            {sortDirection === "asc" ? (
              <ArrowUp className="h-3 w-3 text-accent" />
            ) : sortDirection === "desc" ? (
              <ArrowDown className="h-3 w-3 text-accent" />
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-50" />
            )}
          </span>
        )}
      </div>
    </th>
  )
);
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-3 align-middle text-text-primary", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-3 text-2xs text-text-muted", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";
