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
  } from '@react-email/components';
  import * as React from 'react';
  
  interface EmailTemplateProps {
    magicLink?: string; // The magic verification link (required)
    title?: string; // Title of the email
    message?: string; // A message that could be used for additional context
  }
  
  const baseUrl = process.env.BETTER_AUTH_URL
    ? `https://${process.env.BETTER_AUTH_URL}`
    : '';
  
  export const EmailTemplate = ({
    magicLink,
    title,
    message,
  }: EmailTemplateProps) => (
    <Html>
      <Head />
      <Body style={main}>
        {/* Preview text for the email client */}
        <Preview>Log in with this magic link to complete your verification.</Preview>
  
        <Container style={container}>
          {/* Brand logo */}
          <Img
            src={`${baseUrl}/brainwave.png`}
            width={48}
            height={48}
            alt="Brain Wave"
          />
  
          {/* Title */}
          <Heading style={heading}>{title}</Heading>
  
          {/* Main content */}
          <Section style={body}>
            <Text style={paragraph}>
              <Link style={link} href={magicLink}>
                👉 Click the link below to verify your email 👈
              </Link>
            </Text>
  
            {/* Additional instructions */}
            <Text style={paragraph}>
              If you didn’t request this verification, please ignore this email.
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
          <Img
            src={`${baseUrl}/brainwave.png`}
            width={32}
            height={32}
            style={{
              WebkitFilter: 'grayscale(100%)',
              filter: 'grayscale(100%)',
              margin: '20px 0',
            }}
          />
  
          {/* Footer details */}
          <Text style={footer}>Brain Wave Technologies Inc.</Text>
          <Text style={footer}>
            2093 Philadelphia Pike #3222, Claymont, DE 19703
          </Text>
        </Container>
      </Body>
    </Html>
  );
  
  // Default preview text for the email client (static content)
  EmailTemplate.PreviewProps = {
    magicLink: {}, // You can set a default preview link if necessary
  } as EmailTemplateProps;
  
  export default EmailTemplate;
  
  // Styles
  const main = {
    backgroundColor: '#ffffff',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  };
  
  const container = {
    margin: '0 auto',
    padding: '20px 25px 48px',
    backgroundImage: 'linear-gradient(to bottom right, #7874F2, #8E98F5, #B1CBFA, #DFE2FE)',
    backgroundPosition: 'top left',
    backgroundRepeat: 'no-repeat',
  };
  
  
  const heading = {
    fontSize: '28px',
    fontWeight: 'bold',
    marginTop: '48px',
  };
  
  const body = {
    margin: '24px 0',
  };
  
  const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
  };
  
  const link = {
    color: '#FF6363', // A distinctive color for the link
  };
  
  const hr = {
    borderColor: '#dddddd',
    marginTop: '48px',
  };
  
  const footer = {
    color: '#8898aa',
    fontSize: '12px',
    marginLeft: '4px',
  };
  