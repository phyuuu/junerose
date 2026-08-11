import { Check, X } from "lucide-react";
import { getCustomerOrderProgress } from "@/lib/order-progress";
import type { OrderStatus } from "@/types/order";

type CustomerOrderProgressProps = {
  status: OrderStatus;
};

const stepAppearance = {
  completed: {
    marker: "border-[#211d1b] bg-[#211d1b] text-white",
    connector: "bg-[#211d1b]",
    label: "text-[#211d1b]",
  },
  current: {
    marker: "border-[#b62568] bg-[#b62568] text-white",
    connector: "bg-[#e7e1de]",
    label: "font-medium text-[#8f1f58]",
  },
  upcoming: {
    marker: "border-[#cfc8c4] bg-white text-[#8d8581]",
    connector: "bg-[#e7e1de]",
    label: "text-[#8d8581]",
  },
} as const;

export default function CustomerOrderProgress({
  status,
}: CustomerOrderProgressProps) {
  const progress = getCustomerOrderProgress(status);

  return (
    <section
      aria-labelledby="order-progress-heading"
      className="mb-10 border-y border-[#e7e1de] py-7"
    >
      <p className="text-xs font-medium uppercase text-[#9a8558]">
        Order progress
      </p>
      <h3 id="order-progress-heading" className="mt-2 font-display text-2xl">
        {progress.isCancelled ? "Order cancelled" : "Current status"}
      </h3>

      {progress.isCancelled ? (
        <div className="mt-6 flex items-start gap-3 border-l-2 border-[#8f3434] pl-4 text-[#8f3434]">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#8f3434]">
            <X aria-hidden="true" size={15} strokeWidth={2} />
          </span>
          <p className="pt-0.5 text-sm leading-6">
            {progress.currentDescription}
          </p>
        </div>
      ) : (
        <>
          <ol
            aria-label="Order progress"
            className="mt-6 grid gap-4 sm:grid-cols-5 sm:gap-0"
          >
            {progress.steps.map((step, index) => {
              const appearance = stepAppearance[step.state];

              return (
                <li
                  key={step.status}
                  aria-current={step.state === "current" ? "step" : undefined}
                  className="min-w-0"
                >
                  <div className="flex items-center gap-3 sm:gap-0">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs ${appearance.marker}`}
                    >
                      {step.state === "completed" ? (
                        <Check aria-hidden="true" size={16} strokeWidth={2} />
                      ) : (
                        index + 1
                      )}
                    </span>

                    {index < progress.steps.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={`hidden h-px flex-1 sm:block ${appearance.connector}`}
                      />
                    )}

                    <p className={`text-sm sm:hidden ${appearance.label}`}>
                      {step.label}
                    </p>
                  </div>

                  <p
                    className={`mt-3 hidden pr-3 text-xs leading-5 sm:block ${appearance.label}`}
                  >
                    {step.label}
                  </p>
                </li>
              );
            })}
          </ol>

          <p className="mt-7 border-l-2 border-[#b62568] pl-4 text-sm leading-6 text-[#4f4946]">
            {progress.currentDescription}
          </p>
        </>
      )}
    </section>
  );
}
