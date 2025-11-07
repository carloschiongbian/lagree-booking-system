"use client";

import { Card, Typography } from "antd";

const { Title, Text, Paragraph } = Typography;

const UserTermsAndConditions = () => {
  return (
    <Card
      className="max-w-3xl mx-auto mt-10 rounded-2xl shadow-sm py-6 px-0 text-justify"
      title={
        <Title level={4} className="!mb-0">
          Terms & Conditions
        </Title>
      }
    >
      <Title level={4}>
        SUPRA8 LAGREE — MEMBER&apos;S ASSUMPTION OF RISK AND RELEASE OF
        LIABILITY
      </Title>
      <Text underline>Assumption of Risk</Text>
      <Paragraph>
        I, the undersigned, understands that participation in any fitness class,
        physical training, or related activity at Supra8 Lagree involves
        inherent risks. These risks include, but are not limited to, slips or
        falls; improper use or failure of equipment; overexertion; strains,
        sprains, or other physical injuries; and, in rare cases, serious injury
        or death.{" "}
      </Paragraph>
      <Paragraph>
        I acknowledge that these risks may result from my own actions, the
        actions or negligence of others, or the condition of the facilities and
        equipment. I willingly accept and assume all such risks associated with
        my participation. I further confirm that I am in good physical condition
        and have no health condition, impairment, or injury that would endanger
        myself or others during participation.
      </Paragraph>
      <Text underline>Release of Liability</Text>
      <Paragraph>
        In consideration of being allowed to participate in any class, training,
        or activity offered by Supra8 Lagree, I hereby release, waive, and
        discharge Supra8 Lagree, its owners, partners, instructors, staff,
        agents, and representatives from any and all claims, liabilities,
        demands, or causes of action arising out of or related to any loss,
        injury, disability, death, or damage to person or property—whether
        caused by negligence or otherwise—occurring while participating in, or
        as a result of participation in, any Supra8 Lagree activity or use of
        its facilities or equipment.{" "}
      </Paragraph>{" "}
      <Paragraph>
        {" "}
        This release applies to all activities conducted at the Supra8 Lagree
        studio or any off-site location designated by the studio for fitness
        training or events.{" "}
      </Paragraph>
      <Text underline>Binding Effect</Text>
      <Paragraph>
        This agreement shall be binding upon me, my heirs, executors,
        administrators, representatives, successors, and assigns. I agree that
        this waiver is intended to be as broad and inclusive as permitted by
        applicable law. If any portion of this agreement is held invalid, the
        remainder shall continue in full legal force and effect.
      </Paragraph>
      <Text underline>Medical Emergencies</Text>
      <Paragraph>
        If I am signing on behalf of a minor participant, I grant full
        permission to any Supra8 Lagree staff member to administer first aid as
        deemed necessary, and to seek medical or surgical care, including
        transportation to a medical facility, in case of emergency.
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
      <Text underline>Acknowledgment</Text>
      <Paragraph>
        I have carefully read and fully understand this Assumption of Risk and
        Release of Liability Agreement. I voluntarily sign it, acknowledging
        that I am waiving valuable legal rights. I agree that no oral
        representations, statements, or inducements apart from this written
        agreement have been made.{" "}
      </Paragraph>
      <Title level={4}>DATA PRIVACY POLICY</Title>
      <Paragraph>
        Supra8 Lagree values and respects your privacy. We are committed to
        protecting all personal information collected from our clients in
        accordance with the Data Privacy Act of 2012 (Republic Act No. 10173)
        and other applicable laws and regulations in the Philippines.{" "}
      </Paragraph>{" "}
      <Paragraph>
        All personal data collected during registration and throughout your
        membership will be used solely for purposes related to class scheduling,
        account management, and communication regarding Supra8 Lagree updates,
        promotions, or policy changes. Your information will not be shared with
        any third party without your consent, unless required by law.{" "}
      </Paragraph>
      <Paragraph>
        {" "}
        By signing this agreement or registering for any Supra8 Lagree service,
        you consent to the collection and processing of your personal data as
        described above.{" "}
      </Paragraph>{" "}
      <Paragraph>
        {" "}
        You also grant Supra8 Lagree permission to take photos or videos during
        classes or events for documentation and promotional purposes on the
        studio&apos;s official website or social media platforms. However, the
        studio will always seek explicit consent before featuring any
        identifiable client in marketing or promotional materials.
      </Paragraph>
    </Card>
  );
};

export default UserTermsAndConditions;
