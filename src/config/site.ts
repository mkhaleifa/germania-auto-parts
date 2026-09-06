export const siteConfig = {
    name: "Germania Auto Parts",
    description: "Premium German auto parts shipped worldwide. Genuine OEM and high-quality aftermarket components for Mercedes-Benz, BMW, Audi, Volkswagen, Porsche, and other leading German brands.",
    url : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ogImage: "",
    links: {
        whatsapp: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace("+", "")}`,
        email: "mohamedkhaleifa362@gmail.com"
    },
    owner: {
        name: "Mohamed Khaleifa",
        email: "mohamedkhaleifa362@gmail.com",
        whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+201070427060"
    },
    bank: {
        name:process.env.NEXT_PUBLIC_BANK_NAME || "Deutsche Bank",
        accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "123456789",
        iban: process.env.NEXT_PUBLIC_BANK_IBAN || "DE89370400440532013000",
        swift: process.env.NEXT_PUBLIC_BANK_SWIFT || "DEUTDEFF",
        holder: process.env.NEXT_PUBLIC_BANK_ACCOUNT_HOLDER || "Germania Auto Parts"
    }

}as const


