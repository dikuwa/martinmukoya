import "dotenv/config";
import dotenv from "dotenv";
import { getDb } from "../src/lib/db";
import { desertTechCaseStudyRefresh, obsoletePortfolioProjectSlugs, obsoletePortfolioProofNames, portfolioProjects, portfolioProofItems } from "../src/lib/portfolio-projects";

dotenv.config({ path: ".env.local", override: true });

const db = getDb();

async function main() {
  const site = await db.site.findUnique({ where: { slug: "martin-mukoya" } });
  if (!site) throw new Error("Martin Mukoya site record not found. Run the normal site bootstrap first.");

  const adminEmail = process.env.ADMIN_EMAIL ?? "info@martinmukoya.com";
  const admin =
    (await db.user.findUnique({ where: { email: adminEmail } })) ??
    (await db.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } }));

  for (const project of portfolioProjects) {
    const data = {
      title: project.title,
      summary: project.summary,
      description: project.description,
      problem: project.problem,
      solution: project.solution,
      outcome: project.outcome,
      clientType: project.clientType,
      industry: project.industry,
      eyebrow: project.eyebrow,
      role: project.role,
      deliverables: project.deliverables,
      stackSummary: project.stackSummary,
      benefits: project.benefits,
      capabilities: project.capabilities,
      coverImage: project.coverImage,
      coverImageAlt: project.coverImageAlt,
      gallery: project.gallery,
      techStack: project.techStack,
      services: project.services,
      liveUrl: project.liveUrl,
      githubUrl: project.githubUrl,
      caseStudyContent: project.caseStudyContent,
      featured: project.featured,
      published: true,
      sortOrder: project.sortOrder,
      authorId: admin?.id
    };

    await db.project.upsert({
      where: { slug: project.slug },
      update: {
        ...data,
        sites: { set: [{ id: site.id }] }
      },
      create: {
        slug: project.slug,
        ...data,
        sites: { connect: { id: site.id } }
      }
    });
  }

  const desertTech = await db.project.findUnique({
    where: { slug: desertTechCaseStudyRefresh.slug }
  });

  if (desertTech) {
    const { slug: _slug, ...refresh } = desertTechCaseStudyRefresh;
    await db.project.update({
      where: { slug: desertTechCaseStudyRefresh.slug },
      data: refresh
    });
  }

  await db.project.deleteMany({
    where: { slug: { in: obsoletePortfolioProjectSlugs } }
  });

  const proofNames = portfolioProofItems.map((item) => item.clientName);
  await db.testimonial.deleteMany({
    where: {
      sites: { some: { id: site.id } },
      clientName: { in: [...obsoletePortfolioProofNames, ...proofNames] }
    }
  });

  for (const [index, item] of portfolioProofItems.entries()) {
    await db.testimonial.create({
      data: {
        clientName: item.clientName,
        role: item.role,
        company: item.company,
        quote: item.quote,
        image: item.image,
        featured: index < 4,
        published: true,
        sortOrder: index,
        authorId: admin?.id,
        sites: { connect: { id: site.id } }
      }
    });
  }

  console.log(`Portfolio sync complete: ${portfolioProjects.length} real case studies published; project proof section refreshed; Desert Technology compacted when present.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
