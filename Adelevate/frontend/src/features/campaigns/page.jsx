import { CampaignsToolbar } from "./campaigns-toolbar"
import  CampaignsTable  from "./campaigns-table"
import Search from "@/components/search-bar"

export default function Campaigns() {
  return (
    <>
    <Search />
    <main className="min-h-dvh w-full pt-[60px] ">
      <div className="mx-auto max-w-[2000px] px-4 py-4">
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-pretty">Campaigns</h1>
        <CampaignsToolbar />
        <div className="mt-3 rounded-md border bg-card">
          <CampaignsTable />
        </div>
      </div>
    </main>
    </>
  )
}
