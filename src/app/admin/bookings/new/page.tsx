import { BookingForm } from "@/components/admin/booking-form";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
export default async function NewBookingPage(){const sites=await db.site.findMany({orderBy:{name:"asc"},select:{id:true,name:true}});return <div className="grid gap-8"><PageHeader title="New booking" description="Create a project order for work received outside the website."/><BookingForm sites={sites}/></div>}
