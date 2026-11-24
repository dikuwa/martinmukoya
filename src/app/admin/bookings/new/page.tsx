import { BookingForm } from "@/components/admin/booking-form";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
export default async function NewBookingPage({searchParams}:{searchParams:Promise<{customer?:string}>}){
const {customer:contactId}=await searchParams;
const [sites,contact]=await Promise.all([
  db.site.findMany({orderBy:{name:"asc"},select:{id:true,name:true,slug:true}}),
  contactId ? db.contact.findUnique({where:{id:contactId}}) : Promise.resolve(null)
]);
return <div className="grid gap-8"><PageHeader title="New booking" description="Record a project from a walk-in, referral, phone call, website enquiry, or existing customer."/>
<BookingForm sites={sites} customer={contact}/></div>}
