import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
  } from "@react-email/components";
  import { BrainCircuit } from "lucide-react";
  import * as React from "react";
  
  interface EmailTemplateProps {
    magicLink?: string; // The magic verification link (required)
    title?: string; // Title of the email
    message?: string; // A message that could be used for additional context
  }
  
  export const DeleteUser = ({
    magicLink,
    title,
    message,
  }: EmailTemplateProps) => (
    <Html>
      <Head />
      <Body style={main}>
        {/* Preview text for the email client */}
        <Preview>Click on the link to delete your account</Preview>
  
        <Container style={container}>
          {/* Brand logo */}
          <BrainCircuit size={48} />
  
          {/* Title */}
          <Heading style={heading}>{title}</Heading>
  
          {/* Main content */}
          <Section style={body}>
            <Text style={paragraph}>
              <Link style={link} href={magicLink}>
                👉 Click the link to delete your account 👈
              </Link>
            </Text>
  
            {/* Additional instructions */}
            <Text style={paragraph}>
              If you didn’t request this request to delete your account, please ignore this email.
            </Text>
          </Section>
  
          {/* Signature */}
          <Text style={paragraph}>
            Best regards,
            <br />- Brain Wave Team
          </Text>
  
          {/* Footer line */}
          <Hr style={hr} />
  
          {/* Brand logo in footer */}
          <BrainCircuit size={24} />
  
          {/* Footer details */}
          <Text style={footer}>Brain Wave Technologies Inc.</Text>
          <Text style={footer}>
            2093 Philadelphia Pike #3222, Claymont, DE 19703
          </Text>
        </Container>
      </Body>
    </Html>
  );
  
  export default DeleteUser;
  
  export function sendDeleteUser(props: EmailTemplateProps) {
    console.log("Sending verify email", props);
    return <DeleteUser {...props} />;
  }
  
  // Styles
  const main = {
    backgroundColor: "#ffffff",
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  };
  
  const container = {
    margin: "0 auto",
    padding: "20px 25px 48px",
    boxshadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
  };
  
  const heading = {
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "48px",
  };
  
  const body = {
    margin: "24px 0",
  };
  
  const paragraph = {
    fontSize: "16px",
    lineHeight: "26px",
  };
  
  const link = {
    color: "#8E98F5", // A distinctive color for the link
  };
  
  const hr = {
    borderColor: "#dddddd",
    marginTop: "48px",
  };
  
  const footer = {
    color: "#8898aa",
    fontSize: "12px",
    marginLeft: "4px",
  };
  