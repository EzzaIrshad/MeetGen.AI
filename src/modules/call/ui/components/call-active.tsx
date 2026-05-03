import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
import Image from "next/image";
import Link from "next/link";

interface Props {
    onLeave: () => void;
    meetingName: string;
}

export const CallActive = ({ onLeave, meetingName }: Props) => {
    return (
        <div className="flex flex-col justify-between h-full p-4 text-white">
            <div className="flex bg-[#101213] p-4 items-center gap-4 rounded-full">
                <Link href="/" className="flex items-center justify-center p-1 bg-white/10 rounded-full w-fit">
                    <Image src="/logo.svg" alt="Logo" width={22} height={22} />
                </Link>
                <h4 className="text-base">
                    {meetingName}
                </h4>
            </div>
            <SpeakerLayout />
            <div className="bg-[#101213] rounded-lg px-10 w-fit self-center">
                <CallControls onLeave={onLeave}/>
            </div>
        </div>
    )}