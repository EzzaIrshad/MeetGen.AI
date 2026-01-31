import { AppRouter } from "@/app/trpc/routers/_app"
import { inferRouterOutputs } from "@trpc/server"

export type MeetingGetOne = inferRouterOutputs<AppRouter>['meetings']['getOne'];