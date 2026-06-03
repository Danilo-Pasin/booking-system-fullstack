import { ShieldCheck, Receipt, Percent } from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Reservas seguras",
    description: "Autenticação JWT para proteger seus dados",
  },
  {
    icon: Receipt,
    title: "Preços transparentes",
    description: "Breakdown completo de taxas e descontos",
  },
  {
    icon: Percent,
    title: "Desconto progressivo",
    description: "10% off em estadias com mais de 7 dias",
  },
];

export default function BenefitsSection() {
  return (
    <section className="border-t py-12">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {benefits.map((b) => (
            <div key={b.title}>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-3">
                <b.icon className="size-6" />
              </div>
              <h4 className="font-semibold mb-1">{b.title}</h4>
              <p className="text-muted-foreground text-sm">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
