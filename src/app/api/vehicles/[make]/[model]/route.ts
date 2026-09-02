import { NextResponse ,NextRequest } from "next/server";
import { db } from "@/lib/db";
import { fa } from "zod/v4/locales";

export async function GET(
    _request: NextRequest ,
    {params}: {params: Promise<{make : string , model:string}>}
) {
    try{
        const {make , model} = await params
        const decodedMake = decodeURIComponent(make);
        const decodedModel = decodeURIComponent(model);

        const vehicles = await db.vehicle.findMany({
            where: {
                make: { equals: decodedMake, mode: "insensitive" },
                model: { equals: decodedModel, mode: "insensitive" },
            },
            select: {
                yearStart:true ,
                yearEnd: true ,
                generation: true,
            },
            orderBy:{yearStart: 'desc'}
        })

        const yearsSet = new Set<number>()
        for(const v of vehicles){
            for (let y= v.yearStart ; y<= v.yearEnd ; y++){
                yearsSet.add(y)
            }
        }
            const years = Array.from(yearsSet).sort((a, b) => b - a);

        return NextResponse.json({
            data: { years, generations: vehicles },
            make: decodedMake,
            model: decodedModel,        })

    }
    catch(error){
        console.error("GET api/vehicles/[make]/[model] error: ",error)
        return NextResponse.json(
            {error: {code: "INTERNAL_ERROR",message:"Failed to fetch vehicle years"}},
            {status:500}
        )  
    }
}