import { render } from "@react-email/render";
import { env } from "../../env/server.mjs";
import nodemailer from "nodemailer";

import InviteUserEmail from "../../../emails/invite-user";
import SignInLinkEmail from "../../../emails/sign-in-link";
import EMAIL_FROM from "@/lib/emailFrom";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_SMTP_HOST,
  port: parseInt(env.EMAIL_SMTP_PORT),
  auth: {
    user: env.EMAIL_SMTP_USER,
    pass: env.EMAIL_SMTP_PASSWORD,
  },
  secure: false,
});

if (
  env.EMAIL_SMTP_HOST &&
  env.EMAIL_SMTP_PORT &&
  env.EMAIL_SMTP_PASSWORD &&
  env.EMAIL_SMTP_USER
) {
  transporter.verify(function (error, success) {
    if (error || !success) {
      console.error(
        "Error verifying email transport. Something might be wrong with your credentials!",
        error
      );
    }
  });
}

/* Add your emails here */
const EMAILS = {
  "sign-in-link": SignInLinkEmail,
  "invite-user": InviteUserEmail,
} as const;

type EmailType = keyof typeof EMAILS;
type Distribute<U extends EmailType> = U extends unknown
  ? { type: U; props: Parameters<(typeof EMAILS)[U]>[0] }
  : never;
type Email = Distribute<keyof typeof EMAILS>;

export async function send({
  type,
  to,
  subject,
  props: _props,
}: Email & { to: string; subject: string }) {
  const Component = EMAILS[type];

  // unfortunately, we have to cast props to any here,
  // unclear how to infer the props type correctly from the component
  // but the function signature is doing the heavy lifting in terms of type safety
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props = _props as any;
  const emailHTML = render(<Component {...props} toEmail={to} />);

  const data = {
    from: {
      name: "Demorepo",
      address: EMAIL_FROM,
    },
    to,
    subject,
    html: emailHTML,
  };

  // Wrap in promise so that vercel can await the result
  await new Promise((resolve, reject) => {
    transporter.sendMail(data, (err, info) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log(info);
        resolve(info);
      }
    });
  });
}
