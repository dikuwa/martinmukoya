import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

type LeadEmailProps = {
  lead: {
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    serviceType: string;
    budgetRange?: string | null;
    timeline?: string | null;
    projectGoal: string;
    message: string;
    source: string;
    preferredContact: string;
  };
};

export function LeadNotificationEmail({ lead }: LeadEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New project lead from {lead.name}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>New project lead</Heading>
          <Text style={muted}>A visitor submitted the Start Project intake form.</Text>
          <Hr style={rule} />
          <Section>
            <Text style={label}>Name</Text>
            <Text style={value}>{lead.name}</Text>
            <Text style={label}>Email</Text>
            <Text style={value}>{lead.email}</Text>
            {lead.phone ? (
              <>
                <Text style={label}>Phone</Text>
                <Text style={value}>{lead.phone}</Text>
              </>
            ) : null}
            {lead.company ? (
              <>
                <Text style={label}>Company</Text>
                <Text style={value}>{lead.company}</Text>
              </>
            ) : null}
            <Text style={label}>Service type</Text>
            <Text style={value}>{lead.serviceType}</Text>
            <Text style={label}>Preferred contact</Text>
            <Text style={value}>{lead.preferredContact}</Text>
            <Text style={label}>Budget</Text>
            <Text style={value}>{lead.budgetRange || "Not specified"}</Text>
            <Text style={label}>Timeline</Text>
            <Text style={value}>{lead.timeline || "Flexible / not specified"}</Text>
            <Text style={label}>Source</Text>
            <Text style={value}>{lead.source}</Text>
            <Text style={label}>Project goal</Text>
            <Text style={paragraph}>{lead.projectGoal}</Text>
            <Text style={label}>Message</Text>
            <Text style={paragraph}>{lead.message}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  margin: 0,
  backgroundColor: "#f7f4fa",
  color: "#24152f",
  fontFamily: "Inter, Arial, sans-serif"
};

const container = {
  margin: "32px auto",
  maxWidth: "600px",
  borderRadius: "18px",
  backgroundColor: "#ffffff",
  padding: "32px",
  border: "1px solid #eadff0"
};

const heading = {
  margin: "0 0 8px",
  fontSize: "28px",
  lineHeight: "34px",
  color: "#24152f"
};

const muted = {
  color: "#766781",
  fontSize: "15px",
  lineHeight: "24px"
};

const rule = {
  borderColor: "#eadff0",
  margin: "24px 0"
};

const label = {
  margin: "18px 0 4px",
  color: "#766781",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const
};

const value = {
  margin: 0,
  color: "#24152f",
  fontSize: "16px",
  lineHeight: "24px",
  fontWeight: 700
};

const paragraph = {
  margin: 0,
  color: "#24152f",
  fontSize: "16px",
  lineHeight: "26px"
};
