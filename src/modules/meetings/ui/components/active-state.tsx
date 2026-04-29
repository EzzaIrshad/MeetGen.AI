import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { VideoIcon } from "lucide-react"
import Link from "next/link"

interface Props {
    meetingId: string;
}

export const ActiveState = ({
    meetingId,
}: Props) => {
    return (
        <div className="bg-white rounded-lg px-4 py-5 flex flex-col items-center justify-center gap-y-8">
            <EmptyState
                image="/upcoming.svg"
                title="Meeting is active"
                description="Meeting will end once all participants have left the call"
            />

            <Button className="w-full lg:w-auto">
                <Link href={`/call/${meetingId}`}>
                    <VideoIcon />
                </Link>
                Join meeting
            </Button>
        </div>
    )
}