import bcrypt from 'bcrypt';
import { MessageRole, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@teralead.app';
  const password = 'DemoPass123!';
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash }
  });

  const patientA = await prisma.patient.upsert({
    where: {
      userId_email: {
        userId: user.id,
        email: 'sarah.lee@example.com'
      }
    },
    update: {
      name: 'Sarah Lee',
      phone: '+1-555-101-2201',
      dob: new Date('1990-05-14'),
      medicalNotes: 'Tooth sensitivity on cold drinks; no known allergies.'
    },
    create: {
      userId: user.id,
      name: 'Sarah Lee',
      email: 'sarah.lee@example.com',
      phone: '+1-555-101-2201',
      dob: new Date('1990-05-14'),
      medicalNotes: 'Tooth sensitivity on cold drinks; no known allergies.'
    }
  });

  const patientB = await prisma.patient.upsert({
    where: {
      userId_email: {
        userId: user.id,
        email: 'michael.chen@example.com'
      }
    },
    update: {
      name: 'Michael Chen',
      phone: '+1-555-101-2202',
      dob: new Date('1984-11-02'),
      medicalNotes: 'Recent root canal follow-up, mild gum irritation.'
    },
    create: {
      userId: user.id,
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+1-555-101-2202',
      dob: new Date('1984-11-02'),
      medicalNotes: 'Recent root canal follow-up, mild gum irritation.'
    }
  });

  for (const patient of [patientA, patientB]) {
    const count = await prisma.message.count({ where: { patientId: patient.id } });
    if (count === 0) {
      await prisma.message.createMany({
        data: [
          {
            patientId: patient.id,
            role: MessageRole.USER,
            content: 'Hi, I have some discomfort after my last appointment.'
          },
          {
            patientId: patient.id,
            role: MessageRole.AI,
            content:
              'Thanks for sharing. Please continue gentle brushing and warm salt-water rinses. If pain increases or swelling appears, contact the clinic promptly.'
          }
        ]
      });
    }
  }

  console.log('Seed complete');
  console.log(`Login email: ${email}`);
  console.log(`Login password: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
