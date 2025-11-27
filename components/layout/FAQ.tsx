"use client";

import { Card, Typography } from "antd";

const { Title, Text, Paragraph } = Typography;

const FAQ = () => {
  return (
    <Card
      className="max-w-3xl mx-auto mt-10 rounded-2xl shadow-sm py-6 px-0 text-justify"
      title={
        <Title level={4} className="!mb-0">
          FREQUENTLY ASKED QUESTIONS
        </Title>
      }
    >
      <Text underline>How is Lagree Fitness different from Pilates?</Text>
      <Paragraph>
        While Lagree and Pilates may appear similar at first glance, they are
        fundamentally different in purpose, benefits, and equipment. Lagree uses
        the "Megaformer", built for a high-intensity yet low-impact, full-body
        workout that simultaneously develops strength, endurance, and
        flexibility. Movements are performed slowly and with control to maximize
        muscle tension and results, whereas Pilates features faster movements,
        generally focusing on smaller, faster movements, that get your core
        muscles working.{" "}
      </Paragraph>
      <Text underline>How do I purchase sessions?</Text>
      <Paragraph>
        You can purchase sessions directly through our website or via our studio
        front desk.{" "}
      </Paragraph>{" "}
      <Paragraph>
        {" "}
        If you choose to pay in-studio, our team will assist you with setting up
        your Supra8 account online to activate your class credits.{" "}
      </Paragraph>
      <Text underline>Binding Effect</Text>
      <Paragraph>
        This agreement shall be binding upon me, my heirs, executors,
        administrators, representatives, successors, and assigns. I agree that
        this waiver is intended to be as broad and inclusive as permitted by
        applicable law. If any portion of this agreement is held invalid, the
        remainder shall continue in full legal force and effect.
      </Paragraph>
      <Text underline>How often should I train?</Text>
      <Paragraph>
        For best results, we recommend at least 3 sessions per week. Lagree
        works all major muscle groups at once, so your body benefits most with
        consistency and proper recovery between classes.
      </Paragraph>
      <Text underline>Indemnification</Text>
      <Paragraph>
        {" "}
        I agree to indemnify, defend, and hold harmless Supra8 Lagree, its
        owners, instructors, employees, and agents from and against any and all
        claims, damages, costs, and expenses (including attorney&apos;s fees)
        arising from my participation in Supra8 Lagree activities or from my
        negligent or intentional acts or omissions.{" "}
      </Paragraph>
      <Text underline>How early should I come to class?</Text>
      <Paragraph>
        If it’s your first time, please arrive 15 minutes early for a short
        orientation on how to use the Megaformer safely and effectively.{" "}
      </Paragraph>
      <Paragraph>
        Regular clients should arrive 10 to 15 minutes before class to check in,
        settle, and prepare for the session.{" "}
      </Paragraph>
      <Text underline>How long does each class last?</Text>
      <Paragraph>
        Each Supra8 Lagree session lasts 45 minutes — designed to challenge your
        body efficiently within a short time frame.{" "}
      </Paragraph>{" "}
      <Text underline>What should I wear and bring to class?</Text>
      <Paragraph>
        Wear comfortable, form-fitting activewear that allows fluid movement.{" "}
      </Paragraph>{" "}
      <Paragraph>
        Grip socks are required for safety and hygiene — they help with
        stability on the Megaformer.{" "}
      </Paragraph>{" "}
      <Paragraph>
        Please avoid wearing jewelry during class and store valuables in the
        available lockers.{" "}
      </Paragraph>{" "}
      <Text underline>Are children allowed in the studio?</Text>
      <Paragraph>
        To maintain focus and safety, children are not allowed inside the
        training area.
      </Paragraph>{" "}
      <Paragraph>
        However, they may wait in the lounge area accompanied by a guardian.
      </Paragraph>{" "}
      <Text underline>Do I need experience to join a Lagree class?</Text>
      <Paragraph>
        Not at all. Lagree is suitable for all fitness levels. Our Lagree
        certified instructors will guide you through every movement and help you
        modify exercises as needed.
      </Paragraph>{" "}
      <Text underline>
        Can I join if I have an injury or physical limitation?
      </Text>
      <Paragraph>
        We recommend consulting your physician or physical therapist before
        starting.
      </Paragraph>{" "}
      <Paragraph>
        If cleared, please inform your Supra8 instructor before class so we can
        adjust movements and intensity to fit your needs safely.
      </Paragraph>{" "}
      <Text underline>Is Lagree good for everyone?</Text>
      <Paragraph>
        Absolutely. Lagree is one of the most effective workouts for building
        strength, endurance, and core stability — all while being safe and
        joint-friendly.
      </Paragraph>{" "}
    </Card>
  );
};

export default FAQ;
