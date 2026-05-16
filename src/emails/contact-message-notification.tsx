import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

type ContactMessageEmailProps = {
  message: {
    name: string;
    email: string;
    phone?: string | null;
    inquiryType?: string | null;
    message: string;
    sourcePage?: string | null;
  };
};

export function ContactMessageNotificationEmail({ message }: ContactMessageEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact message from {message.name}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>New contact message</Heading>
          <Text style={muted}>Someone submitted the contact form on martinmukoya.com.</Text>
          <Hr style={rule} />
          <Section>
            <Text style={label}>Name</Text>
            <Text style={value}>{message.name}</Text>
            <Text style={label}>Email</Text>
            <Text style={value}>{message.email}</Text>
            {message.phone ? (
              <>
                <Text style={label}>Phone</Text>
                <Text style={value}>{message.phone}</Text>
              </>
            ) : null}
            {message.inquiryType ? (
              <>
                <Text style={label}>Inquiry type</Text>
                <Text style={value}>{message.inquiryType}</Text>
              </>
            ) : null}
            {message.sourcePage ? (
              <>
                <Text style={label}>Source page</Text>
                <Text style={value}>{message.sourcePage}</Text>
              </>
            ) : null}
            <Text style={label}>Message</Text>
            <Text style={paragraph}>{message.message}</Text>
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
