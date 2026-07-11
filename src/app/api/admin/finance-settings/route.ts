import { ok, parseJson, serverError, validationError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { defaultIssuer, type IssuerSnapshot } from "@/lib/finance-service";
import type { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

const schema=z.object({name:z.string().min(1),logo:z.string().min(1),address:z.string(),phone:z.string(),email:z.string().email(),registration:z.string(),taxNumber:z.string(),bankName:z.string(),accountName:z.string(),accountNumber:z.string(),branch:z.string(),swiftCode:z.string(),companyDetails:z.string(),paymentMethods:z.array(z.string().trim().min(1)).max(12),paymentInstructions:z.string(),signerName:z.string().min(1),signerTitle:z.string().min(1),signatureMode:z.enum(["text","image"]),signatureImage:z.string(),showSignature:z.boolean()});

export async function POST(request:Request){
  try{
    const{error}=await requireAdmin(); if(error)return error; const data=await parseJson(request,schema); const snapshot:IssuerSnapshot={...defaultIssuer,...data};
    await db.$transaction(async tx=>{
      for(const[key,value]of Object.entries(data)){
        const settingKey=`finance.${key}`; const storedValue=Array.isArray(value)?JSON.stringify(value):String(value); const existing=await tx.siteSetting.findFirst({where:{siteId:null,key:settingKey}});
        if(existing)await tx.siteSetting.update({where:{id:existing.id},data:{value:storedValue}}); else await tx.siteSetting.create({data:{siteId:null,key:settingKey,value:storedValue}});
      }
      await tx.financialDocument.updateMany({where:{status:"DRAFT"},data:{issuerSnapshot:snapshot as Prisma.InputJsonValue}});
    });
    return ok({saved:true,draftsUpdated:true});
  }catch(error){if(error instanceof z.ZodError)return validationError(error);return serverError(error)}
}
