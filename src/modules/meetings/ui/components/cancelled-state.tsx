import { EmptyState } from "@/components/empty-state"

export const CancelledState = () => {
    return (
        <div className="bg-white rounded-lg px-4 py-5 flex flex-col items-center justify-center gap-y-8">
            <EmptyState
                image="/cancelled.svg"
                title="Meeting is cancelled"
                description="This meeting was cancelled"
            />
        </div>
    )
}