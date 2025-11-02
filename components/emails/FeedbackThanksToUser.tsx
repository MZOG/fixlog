import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  pixelBasedPreset,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { Building } from "lucide-react";

export const FeedbackThanksToUser = () => {
  return (
    <Html lang="pl">
      <Head />
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
            <Section className="mt-[32px]">
              <Building size={30} />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
              <strong>FixLog</strong>
            </Heading>
            <Text className="text-[14px] text-black leading-[18px]">
              Dzień dobry,
            </Text>
            <Text className="text-[14px] text-black leading-[18px]">
              serdecznie dziękujemy za przesłanie opinii o aplikacji FixLog.
            </Text>
            <Text className="text-[14px] text-black leading-[18px]">
              Twoja wiadomość została przekazana do naszego zespołu i pomoże nam
              w dalszym rozwoju platformy.
            </Text>

            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#666666] text-[12px] leading-[18px]">
              Marcin Zogrodnik - CEO FixLog
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default FeedbackThanksToUser;
