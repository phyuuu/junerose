import type { OrderStatus } from "@/types/order";

export type CustomerOrderProgressState =
  | "completed"
  | "current"
  | "upcoming";

export type CustomerOrderProgressStep = {
  status: Exclude<OrderStatus, "cancelled">;
  label: string;
  description: string;
  state: CustomerOrderProgressState;
};

const progressSteps: Array<
  Omit<CustomerOrderProgressStep, "state">
> = [
  {
    status: "pending",
    label: "Request received",
    description:
      "JuneRose staff will review availability and contact you to confirm the order.",
  },
  {
    status: "confirmed",
    label: "Confirmed",
    description:
      "Your order is confirmed and its available stock has been reserved.",
  },
  {
    status: "preparing",
    label: "Preparing",
    description: "JuneRose staff are preparing the selected items for you.",
  },
  {
    status: "ready",
    label: "Ready",
    description:
      "Your order is ready. Staff will confirm collection or delivery details with you.",
  },
  {
    status: "completed",
    label: "Completed",
    description: "This order has been completed.",
  },
];

export function getCustomerOrderProgress(status: OrderStatus): {
  isCancelled: boolean;
  currentDescription: string;
  steps: CustomerOrderProgressStep[];
} {
  if (status === "cancelled") {
    return {
      isCancelled: true,
      currentDescription:
        "This order request was cancelled and will not be processed further.",
      steps: progressSteps.map((step) => ({
        ...step,
        state: "upcoming",
      })),
    };
  }

  const currentStepIndex = progressSteps.findIndex(
    (step) => step.status === status,
  );

  return {
    isCancelled: false,
    currentDescription: progressSteps[currentStepIndex].description,
    steps: progressSteps.map((step, index) => ({
      ...step,
      state:
        index < currentStepIndex
          ? "completed"
          : index === currentStepIndex
            ? "current"
            : "upcoming",
    })),
  };
}
