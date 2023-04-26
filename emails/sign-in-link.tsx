import { Body } from "@react-email/body";
import { Button } from "@react-email/button";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Hr } from "@react-email/hr";
import { Html } from "@react-email/html";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";

import * as React from "react";

type InviteUserEmailProps = {
  url: string;
};

export default function InviteUserEmail({
  url = "https://demorepo.com",
}: InviteUserEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your magic link for Demorepo</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={"https://demo.neorepo.com/wordmark.png"}
            alt="Demorepo"
            style={logo}
          />
          <Heading style={heading}>Your magic link for Demorepo</Heading>
          <Section style={buttonContainer}>
            <Button pY={11} pX={23} style={button} href={url}>
              Login to Demorepo
            </Button>
          </Section>
          <Text style={paragraph}>
            This link and code will only be valid for a short time. If the link
            does not work, you can use the link below directly:
          </Text>
          <code style={code}>{url}</code>
          <Hr style={hr} />
          <Link href="https://demorepo.com" style={reportLink}>
            Demorepo
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

const logo = {
  // borderRadius: 21,
  // width: 150,
  height: 20,
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "560px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "15px 0 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};

const buttonContainer = {
  padding: "18px 0 27px",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "3px",
  fontWeight: "600",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
};

const reportLink = {
  fontSize: "14px",
  color: "#b4becc",
};

const hr = {
  borderColor: "#dfe1e4",
  margin: "42px 0 26px",
};

const code = {
  fontFamily: "monospace",
  fontWeight: "700",
  padding: "1px 4px",
  backgroundColor: "#dfe1e4",
  letterSpacing: "-0.3px",
  fontSize: "12px",
  borderRadius: "4px",
  color: "#3c4149",
};
