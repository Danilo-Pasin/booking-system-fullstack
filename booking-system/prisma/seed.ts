import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const PASSWORD = "senha123";

const accommodations = [
  {
    id: "h-001",
    name: "Casa na Praia - Florianópolis",
    type: "house",
    pricePerNight: 350,
    description: "Linda casa com vista para o mar, 3 quartos, piscina e churrasqueira. Ideal para famílias. A 200m da praia.",
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    ownerEmail: "host@booking.com",
  },
  {
    id: "a-001",
    name: "Studio em Pinheiros - SP",
    type: "apartment",
    pricePerNight: 180,
    description: "Studio moderno e aconchegante perto do metrô. Ideal para viagens a trabalho. Wi-Fi 500mb, smart TV e café incluso.",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    ownerEmail: "host@booking.com",
  },
  {
    id: "s-001",
    name: "Hostel em Búzios - Quarto Compartilhado",
    type: "shared_room",
    pricePerNight: 60,
    description: "Cama em dormitório feminino/misto. Café da manhã incluso, área de convivência com rede e música ao vivo aos fins de semana.",
    imageUrl: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&q=80",
    ownerEmail: "host@booking.com",
  },
  {
    id: "h-002",
    name: "Chalé na Serra - Campos do Jordão",
    type: "house",
    pricePerNight: 420,
    description: "Chalé romântico com lareira, banheira de hidromassagem e vista para a serra. Perfect para casais. Perto do centro.",
    imageUrl: "https://images.unsplash.com/photo-dUws2oAdGMI?w=800&q=80",
    ownerEmail: "host2@booking.com",
  },
  {
    id: "a-002",
    name: "Cobertura em Copacabana - RJ",
    type: "apartment",
    pricePerNight: 550,
    description: "Cobertura de luxo com piscina privativa, 2 suítes e vista panorâmica. A 1 quadra da praia de Copacabana.",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    ownerEmail: "host2@booking.com",
  },
  {
    id: "s-002",
    name: "Hostel em Ouro Preto - Quarto Compartilhado",
    type: "shared_room",
    pricePerNight: 45,
    description: "Hostel histórico no centro de Ouro Preto. Café da manhã incluso, Wi-Fi gratuito e tours gratuitos pela cidade.",
    imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
    ownerEmail: "host2@booking.com",
  },
  {
    id: "a-003",
    name: "Kitnet no Centro - Belo Horizonte",
    type: "apartment",
    pricePerNight: 120,
    description: "Kitnet compacta e funcional no coração de BH. Próximo ao Mercado Central e Savassi. Ideal para 1 pessoa.",
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    ownerEmail: "host@booking.com",
  },
  {
    id: "h-003",
    name: "Sítio em Gravatá - PE",
    type: "house",
    pricePerNight: 280,
    description: "Sítio com muito verde, piscina natural, rede e área para fogueira. Clima de montanha a 1h30 do Recife.",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
    ownerEmail: "host2@booking.com",
  },
];

async function main() {
  const anna = await prisma.user.upsert({
    where: { email: "host@booking.com" },
    update: {},
    create: {
      id: "host-anna-00001",
      name: "Ana Silva",
      email: "host@booking.com",
      password: await bcrypt.hash(PASSWORD, 10),
      role: "HOST",
      bio: "Anfitriã dedicada em Florianópolis e SP. Amo receber hóspedes e compartilhar dicas da cidade.",
    },
  });

  const carlos = await prisma.user.upsert({
    where: { email: "host2@booking.com" },
    update: {},
    create: {
      id: "host-carlos-002",
      name: "Carlos Santos",
      email: "host2@booking.com",
      password: await bcrypt.hash(PASSWORD, 10),
      role: "HOST",
      bio: "Anfitrião viajante, tenho acomodações no RJ, MG e PE. Sempre disponível para ajudar!",
    },
  });

  const guest1 = await prisma.user.upsert({
    where: { email: "guest@booking.com" },
    update: {},
    create: {
      id: "guest-maria-001",
      name: "Maria Oliveira",
      email: "guest@booking.com",
      password: await bcrypt.hash(PASSWORD, 10),
      role: "GUEST",
      bio: "Viajante frequente, adoro conhecer lugares novos.",
    },
  });

  const guest2 = await prisma.user.upsert({
    where: { email: "guest2@booking.com" },
    update: {},
    create: {
      id: "guest-joao-002",
      name: "João Pereira",
      email: "guest2@booking.com",
      password: await bcrypt.hash(PASSWORD, 10),
      role: "GUEST",
    },
  });

  const ownerMap: Record<string, string> = {
    "host@booking.com": anna.id,
    "host2@booking.com": carlos.id,
  };

  let count = 0;
  for (const acc of accommodations) {
    await prisma.accommodation.upsert({
      where: { id: acc.id },
      update: {
        name: acc.name,
        type: acc.type,
        pricePerNight: acc.pricePerNight,
        description: acc.description,
        imageUrl: acc.imageUrl,
      },
      create: {
        id: acc.id,
        name: acc.name,
        type: acc.type,
        pricePerNight: acc.pricePerNight,
        description: acc.description,
        imageUrl: acc.imageUrl,
        ownerId: ownerMap[acc.ownerEmail],
      },
    });
    count++;
  }

  console.log(`Seed completed:`);
  console.log(`  Users: ${[anna, carlos, guest1, guest2].map(u => u.email).join(", ")}`);
  console.log(`  Accommodations: ${count}`);
  console.log(`  Password for all: ${PASSWORD}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
