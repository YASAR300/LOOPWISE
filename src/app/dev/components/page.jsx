"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Inbox,
  AlertTriangle,
  Check,
  Send,
  MoreVertical,
  Trash2,
  Settings,
  User,
  Shield,
  FileText,
} from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
  Combobox,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Slider,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Avatar,
  AvatarGroup,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  SimpleTooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  useToast,
  Skeleton,
  EmptyState,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
  Breadcrumbs,
  Kbd,
  Separator,
  ProgressBar,
  Stepper,
  DatePicker,
  FileDropzone,
  CopyButton,
  ConfirmDialog,
} from "@/components/ui";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const INITIAL_TABLE_DATA = [
  {
    id: "agt_1",
    name: "Inbound RFP Parser",
    category: "Document AI",
    hoursSaved: 420,
    status: "Active",
  },
  {
    id: "agt_2",
    name: "SOC 2 Auditor Bot",
    category: "Security",
    hoursSaved: 280,
    status: "Active",
  },
  {
    id: "agt_3",
    name: "Lead Enricher 3.0",
    category: "RevOps",
    hoursSaved: 190,
    status: "Testing",
  },
  {
    id: "agt_4",
    name: "Billing Reconciler",
    category: "Finance",
    hoursSaved: 340,
    status: "Active",
  },
  {
    id: "agt_5",
    name: "Contract Redlining",
    category: "Legal AI",
    hoursSaved: 510,
    status: "Paused",
  },
];

export default function DevComponentsPage() {
  const { toast } = useToast();

  // Interactive component states
  const [loadingButton, setLoadingButton] = React.useState(false);
  const [inputText, setInputText] = React.useState("");
  const [hasInputError, setHasInputError] = React.useState(false);
  const [textareaText, setTextareaText] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState("caio");
  const [comboboxSingle, setComboboxSingle] = React.useState("anthropic");
  const [comboboxMulti, setComboboxMulti] = React.useState(["rag", "agentic"]);
  const [checkedBox, setCheckedBox] = React.useState(true);
  const [radioValue, setRadioValue] = React.useState("retainer");
  const [switchState, setSwitchState] = React.useState(true);
  const [sliderValue, setSliderValue] = React.useState([65]);
  const [progressVal, setProgressVal] = React.useState(45);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [currentPage, setCurrentPage] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // Table state
  const [tableData, setTableData] = React.useState(INITIAL_TABLE_DATA);
  const [sortField, setSortField] = React.useState("hoursSaved");
  const [sortDirection, setSortDirection] = React.useState("desc");
  const [selectedRows, setSelectedRows] = React.useState([]);

  const comboboxOptions = [
    { label: "Anthropic Claude 3.5 / 3.7", value: "anthropic" },
    { label: "OpenAI GPT-4o", value: "openai" },
    { label: "DeepSeek R1", value: "deepseek" },
    { label: "Llama 3.3 70B", value: "meta" },
  ];

  const skillOptions = [
    { label: "RAG & Vector Search", value: "rag" },
    { label: "Autonomous Agentic Workflows", value: "agentic" },
    { label: "NIST AI RMF Governance", value: "governance" },
    { label: "ERP / SAP Integration", value: "sap" },
  ];

  const handleSort = (field) => {
    let nextDir = "asc";
    if (sortField === field && sortDirection === "asc") nextDir = "desc";
    setSortField(field);
    setSortDirection(nextDir);

    const sorted = [...tableData].sort((a, b) => {
      if (a[field] < b[field]) return nextDir === "asc" ? -1 : 1;
      if (a[field] > b[field]) return nextDir === "asc" ? 1 : -1;
      return 0;
    });
    setTableData(sorted);
  };

  const toggleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === tableData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tableData.map((d) => d.id));
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl space-y-12 bg-background p-6 text-text-primary md:p-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-border-hairline pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Link>
            <Separator orientation="vertical" className="h-3" />
            <Badge variant="accent" size="xs">
              Dev Only
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Linear Design System & UI Primitives
          </h1>
          <p className="text-xs text-text-secondary">
            Production-grade, keyboard-accessible primitives styled with
            hairline borders, dark-first elevation, and calm transitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="secondary" size="sm" asChild>
            <Link href="/app">Enter App Shell</Link>
          </Button>
        </div>
      </div>

      {/* 1. BUTTONS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-hairline pb-2">
          <h2 className="text-sm font-semibold tracking-tight">
            1. Button Primitives
          </h2>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setLoadingButton(!loadingButton)}
          >
            Toggle Loading State: {loadingButton ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="md" isLoading={loadingButton}>
            Primary Action
          </Button>
          <Button variant="secondary" size="md" isLoading={loadingButton}>
            Secondary Action
          </Button>
          <Button variant="ghost" size="md" isLoading={loadingButton}>
            Ghost Button
          </Button>
          <Button variant="outline" size="md" isLoading={loadingButton}>
            Outline Button
          </Button>
          <Button variant="danger" size="md" isLoading={loadingButton}>
            Destructive Action
          </Button>
          <Button variant="secondary" size="icon" isLoading={loadingButton}>
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button variant="secondary" size="xs">
            Size XS
          </Button>
          <Button variant="secondary" size="sm">
            Size SM
          </Button>
          <Button variant="secondary" size="md">
            Size MD
          </Button>
          <Button variant="secondary" size="lg">
            Size LG
          </Button>
          <Button variant="secondary" size="md" disabled>
            Disabled State
          </Button>
        </div>
      </section>

      {/* 2. FORM INPUTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-hairline pb-2">
          <h2 className="text-sm font-semibold tracking-tight">
            2. Form Inputs & Textarea
          </h2>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setHasInputError(!hasInputError)}
          >
            Toggle Input Error: {hasInputError ? "ERR" : "OK"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              Standard Input with Icon
            </label>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Enter agent workflow name..."
              error={hasInputError}
              leftIcon={<Sparkles className="h-4 w-4" />}
            />
            {hasInputError && (
              <p className="text-2xs text-semantic-danger">
                Field validation failed. Name must be at least 3 characters.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              Select Dropdown (Radix)
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select target role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Executive Roles</SelectLabel>
                  <SelectItem value="caio">
                    Fractional CAIO / Head of AI
                  </SelectItem>
                  <SelectItem value="strategist">
                    Enterprise Automation Strategist
                  </SelectItem>
                  <SelectItem value="governance">
                    AI Governance & Compliance Lead
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              Textarea Primitive
            </label>
            <Textarea
              value={textareaText}
              onChange={(e) => setTextareaText(e.target.value)}
              placeholder="Describe your internal workflow SOP or automation bottleneck..."
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* 3. COMBOBOX, CHECKBOX, RADIO, SWITCH, SLIDER */}
      <section className="space-y-4">
        <h2 className="border-b border-border-hairline pb-2 text-sm font-semibold tracking-tight">
          3. Combobox, Checkbox, Radio, Switch & Slider
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-2xs font-medium uppercase tracking-wider text-text-muted">
                Searchable Combobox (Single)
              </label>
              <Combobox
                options={comboboxOptions}
                value={comboboxSingle}
                onChange={setComboboxSingle}
                placeholder="Select foundation model..."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-2xs font-medium uppercase tracking-wider text-text-muted">
                Multi-Select Combobox with Tags
              </label>
              <Combobox
                options={skillOptions}
                value={comboboxMulti}
                onChange={setComboboxMulti}
                isMulti
                placeholder="Select required strategist skills..."
              />
            </div>

            <div className="pt-2">
              <label className="mb-2 block text-2xs font-medium uppercase tracking-wider text-text-muted">
                Slider (Value: {sliderValue[0]}%)
              </label>
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                max={100}
                step={1}
              />
            </div>
          </div>

          <div className="bg-surface-raised/40 space-y-4 rounded-lg border border-border-hairline p-4">
            <Checkbox
              checked={checkedBox}
              onCheckedChange={setCheckedBox}
              label="Enable NIST AI RMF Checklists"
              description="Attach continuous compliance auditing to all deployed autonomous agents."
            />

            <Separator />

            <Switch
              checked={switchState}
              onCheckedChange={setSwitchState}
              label="Deterministic Guardrails"
              description="Reject prompts and tool calls exceeding safety latency thresholds."
            />

            <Separator />

            <div>
              <label className="mb-2 block text-2xs font-medium uppercase tracking-wider text-text-muted">
                Engagement Model
              </label>
              <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                <RadioGroupItem
                  value="retainer"
                  label="Monthly Retainer (Fractional CAIO)"
                  description="Dedicated 1-3 days per week leadership with continuous roadmap delivery."
                />
                <RadioGroupItem
                  value="project"
                  label="Sprint Project (Workflow Mapping)"
                  description="Fixed-scope automation map delivery with scored feasibility report."
                />
              </RadioGroup>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TABS, BADGES, AVATARS, TOOLTIPS */}
      <section className="space-y-4">
        <h2 className="border-b border-border-hairline pb-2 text-sm font-semibold tracking-tight">
          4. Tabs, Badges, Avatars & Tooltips
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="telemetry">Agent Telemetry</TabsTrigger>
                <TabsTrigger value="audit">Governance Audit</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <Card raised className="mt-2 p-4">
                  <p className="text-xs leading-relaxed text-text-secondary">
                    Overview Tab: Active monitoring of 4 deployed agents across
                    procurement, legal and finance departments.
                  </p>
                </Card>
              </TabsContent>
              <TabsContent value="telemetry">
                <Card raised className="mt-2 p-4">
                  <p className="text-xs leading-relaxed text-text-secondary">
                    Telemetry Tab: Real-time token consumption, p99 latency
                    (142ms), and zero execution failure in the last 24h.
                  </p>
                </Card>
              </TabsContent>
              <TabsContent value="audit">
                <Card raised className="mt-2 p-4">
                  <p className="text-xs leading-relaxed text-text-secondary">
                    Governance Tab: NIST AI RMF score: 98.4%. EU AI Act risk
                    profile categorized as Minimal Risk.
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-2xs font-medium uppercase tracking-wider text-text-muted">
                Badges & Status Indicators
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="success" dot>
                  Operational
                </Badge>
                <Badge variant="warning" dot>
                  Attention
                </Badge>
                <Badge variant="danger" dot>
                  Incident
                </Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>

            <div>
              <div className="mb-2 text-2xs font-medium uppercase tracking-wider text-text-muted">
                Avatars & Group
              </div>
              <div className="flex items-center gap-4">
                <Avatar size="sm" fallback="MV" alt="Marcus Vance" />
                <Avatar size="md" fallback="YS" alt="Yasar S." />
                <Avatar size="lg" fallback="LW" alt="Loopwise" />
                <AvatarGroup max={3}>
                  <Avatar size="md" fallback="A1" alt="Agent 1" />
                  <Avatar size="md" fallback="A2" alt="Agent 2" />
                  <Avatar size="md" fallback="A3" alt="Agent 3" />
                  <Avatar size="md" fallback="A4" alt="Agent 4" />
                </AvatarGroup>
              </div>
            </div>

            <div>
              <div className="mb-2 text-2xs font-medium uppercase tracking-wider text-text-muted">
                Accessible Tooltips
              </div>
              <div className="flex items-center gap-3">
                <SimpleTooltip
                  content="Deterministic fallback enabled"
                  side="top"
                >
                  <Button variant="secondary" size="sm">
                    Hover for Top Tooltip
                  </Button>
                </SimpleTooltip>
                <SimpleTooltip
                  content="Verified under NIST profile"
                  side="right"
                >
                  <Button variant="ghost" size="sm">
                    Hover for Right Tooltip
                  </Button>
                </SimpleTooltip>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OVERLAYS: DIALOG, SHEET, POPOVER, DROPDOWN, CONTEXT MENU, CONFIRM */}
      <section className="space-y-4">
        <h2 className="border-b border-border-hairline pb-2 text-sm font-semibold tracking-tight">
          5. Overlays (Dialog, Sheet, Popover, Menus, Confirm)
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          {/* Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="md">
                Open Dialog
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deploy New Automation Agent</DialogTitle>
                <DialogDescription>
                  Configure guardrails and execution environments for this
                  autonomous agent.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Input placeholder="Agent Identifier (e.g. agt_rfp_parser)" />
                <Select defaultValue="prod">
                  <SelectTrigger>
                    <SelectValue placeholder="Environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prod">
                      Production (Zero-Tolerance)
                    </SelectItem>
                    <SelectItem value="staging">Staging Sandbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setDialogOpen(false);
                    toast({
                      title: "Agent Created",
                      description:
                        "New autonomous agent deployed to staging sandbox.",
                      variant: "success",
                    });
                  }}
                >
                  Deploy Agent
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Sheet Drawer */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="secondary" size="md">
                Open Side Drawer (Sheet)
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Agent Runbook & Health</SheetTitle>
                <SheetDescription>
                  Live execution logs and deterministic guardrails inspect.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-4 text-xs">
                <div className="space-y-1 rounded border border-border-hairline bg-surface-base p-3 font-mono text-2xs">
                  <p className="text-text-muted">
                    [16:04:12] Agent initialized
                  </p>
                  <p className="text-semantic-info">
                    [16:04:13] Ingested 14 SOP pages
                  </p>
                  <p className="text-semantic-success">
                    [16:04:14] Guardrail: 0 violations
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSheetOpen(false);
                    toast({ title: "Runbook Synced", variant: "default" });
                  }}
                >
                  Save Runbook Changes
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="md">
                Open Popover
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold">Filter Agents</h4>
                <p className="text-2xs text-text-secondary">
                  Filter deployed workflows by department and status.
                </p>
                <Separator />
                <div className="flex justify-end pt-1">
                  <Button size="xs" variant="primary">
                    Apply Filter
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="md">
                Dropdown Menu <MoreVertical className="ml-1 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => toast({ title: "View Details clicked" })}
              >
                <FileText className="mr-2 h-3.5 w-3.5" />
                <span>View Details</span>
                <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast({ title: "Settings clicked" })}
              >
                <Settings className="mr-2 h-3.5 w-3.5" />
                <span>Configure Agent</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-semantic-danger"
                onClick={() =>
                  toast({ title: "Deactivate clicked", variant: "danger" })
                }
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                <span>Deactivate</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Confirm Dialog */}
          <ConfirmDialog
            trigger={
              <Button variant="danger" size="md">
                Destructive Confirm
              </Button>
            }
            title="Decommission Autonomous Agent?"
            description="This will permanently revoke API tokens and stop automated execution loops."
            confirmText="Yes, Decommission"
            variant="danger"
            onConfirm={() => {
              toast({
                title: "Agent Decommissioned",
                description: "Execution loops terminated safely.",
                variant: "danger",
              });
            }}
          />
        </div>

        {/* Context Menu Target Area */}
        <div className="mt-4">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="bg-surface-raised/30 flex h-24 w-full select-none items-center justify-center rounded-lg border border-dashed border-border-hairline text-xs text-text-muted">
                Right click inside this area to open Context Menu
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem
                onClick={() => toast({ title: "Inspect Node clicked" })}
              >
                Inspect Node
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => toast({ title: "Duplicate clicked" })}
              >
                Duplicate Sub-tree
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                className="text-semantic-danger"
                onClick={() =>
                  toast({ title: "Delete clicked", variant: "danger" })
                }
              >
                Delete Step
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </section>

      {/* 6. TOAST QUEUE & UNDO ACTION */}
      <section className="space-y-4">
        <h2 className="border-b border-border-hairline pb-2 text-sm font-semibold tracking-tight">
          6. Toast Notification Queue & Undo Actions
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              toast({
                title: "Agent Profile Updated",
                description: "Changes synced across all nodes.",
                variant: "success",
              })
            }
          >
            Trigger Success Toast
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              toast({
                title: "Workflow Archived",
                description: "Inbound RFP Parser moved to trash.",
                variant: "danger",
                onUndo: () => {
                  toast({
                    title: "Archival Cancelled",
                    description: "Workflow restored to active status.",
                    variant: "success",
                  });
                },
              })
            }
          >
            Trigger Toast with Undo
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              toast({
                title: "High Token Usage",
                description: "Agent exceeded 80% of daily allocated tokens.",
                variant: "warning",
              })
            }
          >
            Trigger Warning Toast
          </Button>
        </div>
      </section>

      {/* 7. DATA TABLE (SORTABLE, STICKY, ROW HOVER, SELECTION) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-hairline pb-2">
          <h2 className="text-sm font-semibold tracking-tight">
            7. Data Table (Sortable, Sticky Header, Selection, Row Hover)
          </h2>
          <span className="text-2xs text-text-muted">
            {selectedRows.length} of {tableData.length} selected
          </span>
        </div>

        <Table sticky>
          <TableHeader sticky>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === tableData.length &&
                    tableData.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-border-subtle"
                />
              </TableHead>
              <TableHead
                sortable
                sortDirection={sortField === "name" ? sortDirection : null}
                onSort={() => handleSort("name")}
              >
                Agent Workflow Name
              </TableHead>
              <TableHead
                sortable
                sortDirection={sortField === "category" ? sortDirection : null}
                onSort={() => handleSort("category")}
              >
                Category
              </TableHead>
              <TableHead
                sortable
                sortDirection={
                  sortField === "hoursSaved" ? sortDirection : null
                }
                onSort={() => handleSort("hoursSaved")}
              >
                Hours Saved (Mo)
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => {
              const isSelected = selectedRows.includes(row.id);
              return (
                <TableRow
                  key={row.id}
                  selected={isSelected}
                  onClick={() => toggleRowSelect(row.id)}
                  className="cursor-pointer"
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRowSelect(row.id)}
                      className="rounded border-border-subtle"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-text-primary">
                    {row.name}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {row.category}
                  </TableCell>
                  <TableCell className="font-mono text-accent">
                    {row.hoursSaved} hrs
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.status === "Active"
                          ? "success"
                          : row.status === "Testing"
                            ? "accent"
                            : "warning"
                      }
                      size="xs"
                      dot
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={6}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>

      {/* 8. SKELETONS, PROGRESS, STEPPER, DATEPICKER, FILEDROPZONE, COPY */}
      <section className="space-y-4">
        <h2 className="border-b border-border-hairline pb-2 text-sm font-semibold tracking-tight">
          8. Additional Primitives (Date, Files, Stepper, Progress, Skeleton,
          Copy)
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-2xs font-medium uppercase tracking-wider text-text-muted">
                DatePicker Primitive
              </label>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Choose engagement start..."
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                  Interactive Stepper
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    disabled={currentStep <= 0}
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    disabled={currentStep >= 2}
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
              <Stepper
                currentStep={currentStep}
                steps={[
                  { title: "SOP Intake", description: "Upload PDFs" },
                  { title: "AI Scored", description: "Feasibility" },
                  { title: "Deploy", description: "Autonomous" },
                ]}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                  Progress Bar ({progressVal}%)
                </label>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setProgressVal((p) => Math.max(0, p - 15))}
                  >
                    -15%
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setProgressVal((p) => Math.min(100, p + 15))}
                  >
                    +15%
                  </Button>
                </div>
              </div>
              <ProgressBar value={progressVal} color="accent" showLabel />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-text-secondary">
                Copy API Endpoint:
              </span>
              <CopyButton text="https://api.loopwise.ai/v1/agents/deploy">
                Copy Webhook
              </CopyButton>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-2xs font-medium uppercase tracking-wider text-text-muted">
                File Dropzone Primitive
              </label>
              <FileDropzone
                maxFiles={3}
                maxSizeMB={5}
                onFilesSelected={(files) =>
                  toast({
                    title: `${files.length} file(s) selected`,
                    description: "Ready for AI analysis in Workflow Mapper.",
                    variant: "info",
                  })
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-2xs font-medium uppercase tracking-wider text-text-muted">
                Skeleton Loading States
              </label>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. EMPTY STATE */}
      <section className="space-y-4">
        <h2 className="border-b border-border-hairline pb-2 text-sm font-semibold tracking-tight">
          9. Empty State Primitive
        </h2>

        <EmptyState
          icon={Inbox}
          title="No workflows mapped yet"
          description="Upload your standard operating procedures or let our AI ingest company documentation to generate scored automation roadmaps."
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                toast({
                  title: "Action clicked",
                  description: "Creating initial workflow blueprint...",
                  variant: "default",
                })
              }
            >
              Map First Workflow
            </Button>
          }
        />
      </section>
    </div>
  );
}
