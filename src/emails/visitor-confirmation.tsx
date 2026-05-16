import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";

type VisitorConfirmationEmailProps = {
  name: string;
  kind: "contact" | "lead";
};

export function VisitorConfirmationEmail({ name, kind }: VisitorConfirmationEmailProps) {
  const isLead = kind === "lead";

  return (
    <Html>
      <Head />
      <Preview>{isLead ? "I received your project request" : "I received your message"}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Thanks, {name}.</Heading>
          <Text style={paragraph}>
            {isLead
              ? "I received your project request and will review the services, budget, timeline, and notes you shared."
              : "I received your message and will read through the context you shared."}
          </Text>
          <Text style={paragraph}>
            If it looks like a good fit, I’ll reply with a practical next step. If anything is urgent, you can also reach me on WhatsApp.
          </Text>
          <Hr style={rule} />
          <Text style={muted}>Martin Mukoya</Text>
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
  maxWidth: "560px",
  borderRadius: "18px",
  backgroundColor: "#ffffff",
  padding: "32px",
  border: "1px solid #eadff0"
};

const heading = {
  margin: "0 0 16px",
  fontSize: "28px",
  lineHeight: "34px",
  color: "#24152f"
};

const paragraph = {
  color: "#24152f",
  fontSize: "16px",
  lineHeight: "26px"
};

const muted = {
  color: "#766781",
  fontSize: "14px",
  lineHeight: "22px"
};

const rule = {
  borderColor: "#eadff0",
  margin: "24px 0"
};
