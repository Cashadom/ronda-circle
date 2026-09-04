'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Globe } from 'lucide-react'

const CORAL = '#FF6B5A'
const CORAL_PALE = '#FFF0EB'
const BEIGE = '#FFF8F2'
const BORDER = '#E9DDD4'

export default function TermsPage() {
  const router = useRouter()
  const [language, setLanguage] = useState('en')

  const content = {
    en: {
      title: 'Terms & Privacy Policy',

      intro:
        'These Terms and this Privacy Policy explain the rules for using Ronda Club and how we collect, use and protect personal information.',

      termsTitle: 'Terms and Conditions',

      terms: [
        {
          heading: '1. Acceptance of Terms',
          content: [
            'By accessing or using Ronda Club (the "Platform"), you agree to be bound by these Terms and Conditions.',
            'If you do not agree with these Terms, you must not use the Platform.',
            'You must be at least 18 years old to create or use a Ronda Club account.',
          ],
        },

        {
          heading: '2. What is Ronda Club',
          content: [
            'Ronda Club is a social platform designed to help adults discover people, join Circles, connect, communicate and potentially meet in real life.',
            'Circles may be local or remote and may focus on friendship, dating, business, travel or other social interests.',
            'Ronda Club may provide public Circle spaces as well as direct messaging between users who connect.',
            'Circle creators are regular users of Ronda Club. Unless expressly stated otherwise, they are not employees, agents or official representatives of Ronda Club.',
          ],
        },

        {
          heading: '3. User Accounts',
          content: [
            'You are responsible for activity occurring through your account.',
            'You agree to provide accurate information and not to impersonate another person.',
            'Fake accounts, bots, spam, fraud, abusive use and attempts to manipulate the Platform are prohibited.',
            'Ronda Club may suspend or remove accounts that violate these Terms or create risks for other members.',
          ],
        },

        {
          heading: '4. Circles and Community Participation',
          content: [
            'Users may create or join Circles available on the Platform.',
            'Circle descriptions, locations, dates and other information must be accurate and must not intentionally mislead other users.',
            'Participation in a Circle does not guarantee that other members will attend an offline meetup or respond to messages.',
            'Users should communicate with other members and confirm plans directly before travelling to an offline meeting.',
            'Ronda Club may remove, restrict, archive or moderate Circles that violate these Terms or applicable law.',
          ],
        },

        {
          heading: '5. Connections and Messaging',
          content: [
            'Users may request connections with other members through Ronda Club.',
            'A connection is created only when the relevant connection process is completed or accepted.',
            'Connected users may be able to exchange private messages.',
            'Private messages are intended only for the users participating in that conversation, subject to technical processing necessary to operate, secure and moderate the service.',
            'Users must not use messaging features for harassment, spam, scams, unwanted solicitation or illegal activity.',
          ],
        },

        {
          heading: '6. Member Responsibilities',
          content: [
            'You are responsible for your messages, profile information, Circles, interactions and any content you publish.',
            'You must behave respectfully toward other users online and offline.',
            'You must not harass, threaten, stalk, discriminate against, defame, deceive or intentionally harm another user.',
            'Ronda Club does not guarantee friendship, compatibility, attendance, business opportunities, dating outcomes or any other specific result.',
          ],
        },

        {
          heading: '7. Offline Meetings and Events',
          content: [
            'Ronda Club may help users discover people who are interested in meeting offline.',
            'Unless expressly stated otherwise, Ronda Club does not supervise, host or guarantee attendance at offline meetings.',
            'The number of online RSVPs, Circle members or interested users does not guarantee the number of people who will physically attend.',
            'Users are encouraged to connect and communicate with other participants before travelling to a meeting.',
            'Meeting another person offline involves inherent risks. You are responsible for deciding whether, where and how to meet another user.',
          ],
        },

        {
          heading: '8. Safety and Assumption of Risk',
          content: [
            'You understand that interactions with people you meet through the Platform may involve risks, including personal injury, illness, theft, fraud or other unexpected situations.',
            'You should take reasonable precautions, including meeting in appropriate public places and informing someone you trust when meeting a new person.',
            'Ronda Club does not guarantee the identity, background, intentions, reliability or behaviour of any user.',
            'To the maximum extent permitted by applicable law, users voluntarily assume the risks associated with their offline interactions.',
          ],
        },

        {
          heading: '9. Prohibited Behaviour',
          content: [
            'Harassment, threats, hate speech, racism, sexism, discrimination, violence, stalking, fraud, impersonation, scams and illegal activity are prohibited.',
            'Users must not share another person’s private information without permission.',
            'Spam, automated activity, misleading Circles and unauthorised commercial solicitation are prohibited.',
            'Ronda Club may restrict or remove content and accounts that violate these rules.',
          ],
        },

        {
          heading: '10. User-Generated Content',
          content: [
            'Ronda Club contains content created by users, including profiles, Circle information and messages.',
            'You remain responsible for content you publish.',
            'You grant Ronda Club a worldwide, non-exclusive, royalty-free licence to host, store, display and process your content only as reasonably necessary to operate, secure, moderate and improve the Platform.',
            'You must have the necessary rights to any content you upload.',
          ],
        },

        {
          heading: '11. Intellectual Property',
          content: [
            'Ronda Club’s name, branding, software, interface, design and original content remain the property of Ronda Club or its licensors.',
            'Nothing in these Terms transfers ownership of Ronda Club intellectual property to users.',
          ],
        },

        {
          heading: '12. Limitation of Liability',
          content: [
            'To the maximum extent permitted by applicable law, Ronda Club shall not be liable for indirect, incidental, special, consequential or punitive damages.',
            'Ronda Club is not responsible for the acts, omissions or behaviour of users or third parties.',
            'The Platform is provided on an as-is and as-available basis without a guarantee of uninterrupted access or specific results.',
            'Nothing in these Terms excludes liability that cannot legally be excluded under applicable law.',
          ],
        },

        {
          heading: '13. Suspension and Termination',
          content: [
            'Ronda Club may suspend, restrict or terminate an account that violates these Terms, abuses the Platform or creates a safety, security or legal risk.',
            'You may stop using Ronda Club at any time.',
          ],
        },

        {
          heading: '14. Changes to These Terms',
          content: [
            'We may update these Terms when the Platform, applicable law or our practices change.',
            'Material changes may be communicated through the Platform, website or email where appropriate.',
          ],
        },

        {
          heading: '15. Governing Law',
          content: [
            'These Terms are governed by applicable French and European law, subject to mandatory consumer protection rules that may apply in your country.',
            'Users are encouraged to contact Ronda Club first in good faith to seek an amicable solution to any dispute.',
          ],
        },
      ],

      privacyTitle: 'Privacy Policy',

      privacyIntro:
        'This Privacy Policy explains what personal information Ronda Club may collect, why it is used, how it is protected and the choices available to users.',

      privacy: [
        {
          heading: '1. Information We Collect',
          content: [
            'Depending on how you use Ronda Club, we may collect account information such as your Google account identifier, email address, name, display name and profile photo.',
            'We may collect profile information you choose to provide, such as city, biography, gender, interests, intentions and profile images.',
            'We process community activity such as Circles you create or join, connection requests, accepted connections, messages, events and other activity necessary to operate the Platform.',
            'We may also process technical information required for authentication, security, troubleshooting and operation of the service.',
          ],
        },

        {
          heading: '2. Google Sign-In',
          content: [
            'Ronda Club allows users to authenticate using Google Sign-In.',
            'When you use Google Sign-In, Google may provide Ronda Club with basic account information such as your name, email address, profile image and unique account identifier.',
            'Ronda Club does not receive or store your Google password.',
          ],
        },

        {
          heading: '3. How We Use Personal Information',
          content: [
            'We use personal information to create and manage accounts, operate profiles, Circles, connections and messaging features.',
            'We use information to provide community functionality, prevent abuse, secure the Platform, troubleshoot problems and improve Ronda Club.',
            'We may use information to enforce these Terms and protect users and the Platform.',
            'Ronda Club does not sell users’ personal data.',
          ],
        },

        {
          heading: '4. Information Visible to Other Users',
          content: [
            'Ronda Club is a social platform. Information you intentionally publish through your profile, Circles or other public community features may be visible to other users.',
            'You should not publish information that you do not want other people to see.',
            'Messages in public or Circle spaces may be visible to the users who have access to those spaces.',
            'Direct messages are intended for the users participating in the relevant conversation.',
          ],
        },

        {
          heading: '5. Service Providers',
          content: [
            'Ronda Club uses third-party technical providers necessary to operate the Platform.',
            'Google Firebase is used for services including authentication, database and storage infrastructure.',
            'Google Sign-In is used for authentication.',
            'Netlify is used for application hosting and server infrastructure.',
            'These providers may process information as necessary to provide their services and according to their respective terms and privacy obligations.',
          ],
        },

        {
          heading: '6. Data Sharing',
          content: [
            'Ronda Club does not sell personal information to advertisers or data brokers.',
            'Information may be processed by our technical service providers as necessary to operate Ronda Club.',
            'We may disclose information when required by applicable law, legal process or when reasonably necessary to protect users, the Platform or the rights of others.',
          ],
        },

        {
          heading: '7. Data Security',
          content: [
            'We use reasonable technical and organisational measures designed to protect personal information.',
            'Access to administrative systems and server-side credentials is restricted.',
            'Data is transmitted using encrypted connections where supported.',
            'No internet-based service can guarantee absolute security.',
          ],
        },

        {
          heading: '8. Data Retention',
          content: [
            'We retain personal information for as long as reasonably necessary to provide Ronda Club, maintain account functionality, protect users, prevent fraud and comply with applicable legal obligations.',
            'Where information is no longer required, it may be deleted or anonymised.',
            'Certain information may be retained when reasonably necessary for security, fraud prevention, dispute resolution or legal compliance.',
          ],
        },

        {
          heading: '9. Account and Data Deletion',
          content: [
            'Users may permanently delete their Ronda Club account from their profile.',
            'Account deletion instructions are available at https://ronda-club.com/delete-account',
            'Users who cannot access their account may request assistance by contacting us at cyril.ragonet@gmail.com.',
            'When an eligible deletion request is completed, personal data associated with the account will be deleted or anonymised, except information that we are legally required or legitimately permitted to retain.',
          ],
        },

        {
          heading: '10. Your Data Protection Rights',
          content: [
            'Depending on your location, you may have rights relating to your personal information.',
            'These may include rights of access, correction, deletion, restriction, objection and data portability.',
            'Users in the European Economic Area may exercise applicable rights under the General Data Protection Regulation (GDPR).',
            'Requests may be sent to cyril.ragonet@gmail.com.',
          ],
        },

        {
          heading: '11. International Users',
          content: [
            'Ronda Club may be used by people in multiple countries.',
            'Information may therefore be processed using technical infrastructure located outside your country of residence.',
            'Where required, we rely on appropriate safeguards for international processing of personal data.',
          ],
        },

        {
          heading: '12. Adults Only',
          content: [
            'Ronda Club is intended only for users aged 18 or older.',
            'People under 18 are not permitted to create or use a Ronda Club account.',
            'We do not knowingly seek to collect personal information from children.',
          ],
        },

        {
          heading: '13. Changes to this Privacy Policy',
          content: [
            'We may update this Privacy Policy when the Platform, our practices or legal requirements change.',
            'The latest version will remain available through the Ronda Club website and application.',
          ],
        },

        {
          heading: '14. Privacy Contact',
          content: [
            'For privacy questions, data requests, complaints or account deletion requests, contact: cyril.ragonet@gmail.com.',
            'Service: Ronda Club.',
            'Website: https://ronda-club.com',
          ],
        },
      ],

      lastUpdated: 'Last updated: September 2026.',
    },

    de: {
      title: 'Nutzungsbedingungen & Datenschutz',

      intro:
        'Diese Nutzungsbedingungen und Datenschutzerklärung erläutern die Regeln für die Nutzung von Ronda Club sowie den Umgang mit personenbezogenen Daten.',

      termsTitle: 'Allgemeine Nutzungsbedingungen',

      terms: [
        {
          heading: '1. Anerkennung der Bedingungen',
          content: [
            'Durch den Zugriff auf Ronda Club oder die Nutzung der Plattform akzeptieren Sie diese Nutzungsbedingungen.',
            'Wenn Sie diesen Bedingungen nicht zustimmen, dürfen Sie die Plattform nicht nutzen.',
            'Sie müssen mindestens 18 Jahre alt sein, um ein Ronda-Club-Konto zu erstellen oder zu nutzen.',
          ],
        },

        {
          heading: '2. Was ist Ronda Club',
          content: [
            'Ronda Club ist eine soziale Plattform für Erwachsene, um Menschen zu entdecken, Circles beizutreten, Kontakte zu knüpfen, zu kommunizieren und sich möglicherweise persönlich zu treffen.',
            'Circles können lokal oder remote sein und sich auf Freundschaft, Dating, Business, Reisen oder andere soziale Interessen konzentrieren.',
            'Ronda Club kann öffentliche Circle-Bereiche sowie Direktnachrichten zwischen verbundenen Nutzern anbieten.',
            'Circle-Ersteller sind reguläre Nutzer und, sofern nicht ausdrücklich anders angegeben, keine Mitarbeiter oder offiziellen Vertreter von Ronda Club.',
          ],
        },

        {
          heading: '3. Nutzerkonten',
          content: [
            'Sie sind für die Aktivitäten unter Ihrem Konto verantwortlich.',
            'Sie verpflichten sich, korrekte Angaben zu machen und sich nicht als eine andere Person auszugeben.',
            'Fake-Accounts, Bots, Spam, Betrug, Missbrauch und Manipulationsversuche sind verboten.',
          ],
        },

        {
          heading: '4. Circles und Community',
          content: [
            'Nutzer können auf der Plattform verfügbare Circles erstellen oder ihnen beitreten.',
            'Beschreibungen, Orte, Termine und andere Angaben eines Circles müssen korrekt sein.',
            'Die Mitgliedschaft in einem Circle garantiert nicht, dass andere Mitglieder an einem Offline-Treffen teilnehmen oder auf Nachrichten antworten.',
            'Nutzer sollten Pläne direkt mit anderen Mitgliedern bestätigen, bevor sie zu einem Offline-Treffen reisen.',
          ],
        },

        {
          heading: '5. Verbindungen und Nachrichten',
          content: [
            'Nutzer können über Ronda Club Verbindungsanfragen an andere Mitglieder senden.',
            'Verbundene Nutzer können private Nachrichten austauschen.',
            'Private Nachrichten sind für die an der jeweiligen Unterhaltung beteiligten Nutzer bestimmt.',
            'Nachrichten dürfen nicht für Belästigung, Spam, Betrug oder illegale Aktivitäten genutzt werden.',
          ],
        },

        {
          heading: '6. Pflichten der Nutzer',
          content: [
            'Sie sind für Ihre Nachrichten, Profilinformationen, Circles, Interaktionen und veröffentlichten Inhalte verantwortlich.',
            'Nutzer müssen sich online und offline respektvoll verhalten.',
            'Belästigung, Bedrohung, Stalking, Diskriminierung, Täuschung oder vorsätzliche Schädigung anderer Nutzer sind verboten.',
            'Ronda Club garantiert keine Freundschaft, Kompatibilität, Teilnahme oder ein bestimmtes Ergebnis.',
          ],
        },

        {
          heading: '7. Offline-Treffen',
          content: [
            'Ronda Club kann Nutzern helfen, Personen zu entdecken, die an persönlichen Treffen interessiert sind.',
            'Sofern nicht ausdrücklich anders angegeben, organisiert oder überwacht Ronda Club solche Treffen nicht und garantiert keine Teilnahme.',
            'Online-Zusagen oder Circle-Mitgliedschaften garantieren nicht die tatsächliche Anzahl der anwesenden Personen.',
            'Nutzer sollten vor einem Treffen direkt miteinander kommunizieren.',
          ],
        },

        {
          heading: '8. Sicherheit und Risiko',
          content: [
            'Persönliche Treffen mit anderen Nutzern können Risiken beinhalten.',
            'Nutzer sollten angemessene Sicherheitsmaßnahmen treffen und neue Personen vorzugsweise an geeigneten öffentlichen Orten treffen.',
            'Ronda Club garantiert nicht die Identität, Zuverlässigkeit, Absichten oder das Verhalten eines Nutzers.',
          ],
        },

        {
          heading: '9. Verbotenes Verhalten',
          content: [
            'Belästigung, Bedrohung, Hassrede, Rassismus, Sexismus, Diskriminierung, Gewalt, Stalking, Betrug und illegale Aktivitäten sind verboten.',
            'Private Informationen anderer Personen dürfen nicht ohne Zustimmung veröffentlicht werden.',
            'Spam, automatisierte Aktivitäten und irreführende Circles sind verboten.',
          ],
        },

        {
          heading: '10. Nutzergenerierte Inhalte',
          content: [
            'Ronda Club enthält von Nutzern erstellte Inhalte wie Profile, Circle-Informationen und Nachrichten.',
            'Sie bleiben für die von Ihnen veröffentlichten Inhalte verantwortlich.',
            'Sie gewähren Ronda Club eine nicht-exklusive, gebührenfreie Lizenz, Inhalte soweit erforderlich zu speichern, anzuzeigen und zu verarbeiten, um die Plattform zu betreiben, zu sichern und zu moderieren.',
          ],
        },

        {
          heading: '11. Geistiges Eigentum',
          content: [
            'Name, Marke, Software, Benutzeroberfläche und Design von Ronda Club bleiben Eigentum von Ronda Club oder seinen Lizenzgebern.',
          ],
        },

        {
          heading: '12. Haftungsbeschränkung',
          content: [
            'Im gesetzlich zulässigen Umfang haftet Ronda Club nicht für indirekte, zufällige, besondere oder Folgeschäden.',
            'Ronda Club ist nicht für Handlungen oder Verhalten anderer Nutzer oder Dritter verantwortlich.',
            'Die Plattform wird ohne Garantie eines unterbrechungsfreien Zugangs oder bestimmter Ergebnisse bereitgestellt.',
          ],
        },

        {
          heading: '13. Sperrung und Kündigung',
          content: [
            'Ronda Club kann Konten einschränken, sperren oder kündigen, wenn diese Bedingungen verletzt werden oder ein Sicherheits- oder Rechtsrisiko besteht.',
            'Sie können die Nutzung von Ronda Club jederzeit einstellen.',
          ],
        },

        {
          heading: '14. Änderungen',
          content: [
            'Diese Bedingungen können aktualisiert werden, wenn sich die Plattform, Rechtslage oder unsere Praktiken ändern.',
          ],
        },

        {
          heading: '15. Anwendbares Recht',
          content: [
            'Diese Bedingungen unterliegen dem anwendbaren französischen und europäischen Recht, vorbehaltlich zwingender Verbraucherschutzvorschriften.',
          ],
        },
      ],

      privacyTitle: 'Datenschutzerklärung',

      privacyIntro:
        'Diese Datenschutzerklärung erläutert, welche personenbezogenen Daten Ronda Club verarbeitet, warum sie verwendet werden und welche Rechte Nutzer haben.',

      privacy: [
        {
          heading: '1. Erhobene Informationen',
          content: [
            'Je nach Nutzung können wir Google-Konto-ID, E-Mail-Adresse, Namen, Anzeigenamen und Profilbild verarbeiten.',
            'Wir können freiwillig bereitgestellte Profilinformationen wie Stadt, Biografie, Geschlecht, Interessen, Absichten und Bilder verarbeiten.',
            'Wir verarbeiten Community-Aktivitäten wie Circles, Verbindungsanfragen, akzeptierte Verbindungen, Nachrichten und Events.',
            'Technische Informationen können verarbeitet werden, soweit sie für Authentifizierung, Sicherheit und Betrieb erforderlich sind.',
          ],
        },

        {
          heading: '2. Google Sign-In',
          content: [
            'Ronda Club ermöglicht die Anmeldung über Google Sign-In.',
            'Google kann dabei grundlegende Kontoinformationen wie Name, E-Mail-Adresse, Profilbild und eine eindeutige Konto-ID bereitstellen.',
            'Ronda Club erhält oder speichert Ihr Google-Passwort nicht.',
          ],
        },

        {
          heading: '3. Verwendung der Daten',
          content: [
            'Daten werden zur Verwaltung von Konten, Profilen, Circles, Verbindungen und Nachrichten verwendet.',
            'Sie können außerdem zur Sicherheit, Missbrauchsprävention, Fehlerbehebung, Moderation und Verbesserung von Ronda Club verwendet werden.',
            'Ronda Club verkauft keine personenbezogenen Daten von Nutzern.',
          ],
        },

        {
          heading: '4. Für andere Nutzer sichtbare Informationen',
          content: [
            'Ronda Club ist eine soziale Plattform. Informationen, die Sie bewusst veröffentlichen, können für andere Nutzer sichtbar sein.',
            'Veröffentlichen Sie keine Informationen, die Sie nicht mit anderen teilen möchten.',
            'Direktnachrichten sind für die Nutzer bestimmt, die an der jeweiligen Unterhaltung beteiligt sind.',
          ],
        },

        {
          heading: '5. Dienstleister',
          content: [
            'Ronda Club verwendet Google Firebase für Authentifizierung, Datenbank- und Speicherfunktionen.',
            'Google Sign-In wird zur Anmeldung verwendet.',
            'Netlify wird für Hosting und Server-Infrastruktur verwendet.',
          ],
        },

        {
          heading: '6. Weitergabe von Daten',
          content: [
            'Ronda Club verkauft keine personenbezogenen Daten an Werbetreibende oder Datenhändler.',
            'Technische Dienstleister können Daten soweit erforderlich zur Bereitstellung ihrer Dienste verarbeiten.',
            'Informationen können offengelegt werden, wenn dies gesetzlich erforderlich oder zum Schutz der Plattform oder ihrer Nutzer notwendig ist.',
          ],
        },

        {
          heading: '7. Datensicherheit',
          content: [
            'Wir verwenden angemessene technische und organisatorische Maßnahmen zum Schutz personenbezogener Daten.',
            'Administrative Systeme und serverseitige Zugangsdaten werden geschützt.',
            'Kein Internetdienst kann absolute Sicherheit garantieren.',
          ],
        },

        {
          heading: '8. Speicherdauer',
          content: [
            'Daten werden nur so lange gespeichert, wie dies für den Betrieb, Sicherheit, Betrugsprävention oder gesetzliche Verpflichtungen erforderlich ist.',
            'Nicht mehr benötigte Daten können gelöscht oder anonymisiert werden.',
          ],
        },

        {
          heading: '9. Konto- und Datenlöschung',
          content: [
            'Nutzer können ihr Ronda-Club-Konto dauerhaft über ihr Profil löschen.',
            'Anweisungen zur Kontolöschung finden Sie unter https://ronda-club.com/delete-account',
            'Nutzer, die keinen Zugriff auf ihr Konto haben, können unter cyril.ragonet@gmail.com Unterstützung anfordern.',
            'Nach Abschluss eines berechtigten Löschvorgangs werden die mit dem Konto verbundenen personenbezogenen Daten gelöscht oder anonymisiert, soweit keine gesetzliche oder berechtigte Aufbewahrungspflicht besteht.',
          ],
        },

        {
          heading: '10. Datenschutzrechte',
          content: [
            'Je nach Wohnort können Nutzer Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Datenübertragbarkeit haben.',
            'Nutzer im Europäischen Wirtschaftsraum können ihre Rechte gemäß DSGVO ausüben.',
            'Anfragen können an cyril.ragonet@gmail.com gesendet werden.',
          ],
        },

        {
          heading: '11. Internationale Nutzer',
          content: [
            'Ronda Club wird international genutzt. Daten können daher über technische Infrastruktur außerhalb Ihres Wohnsitzlandes verarbeitet werden.',
          ],
        },

        {
          heading: '12. Nur für Erwachsene',
          content: [
            'Ronda Club ist ausschließlich für Personen ab 18 Jahren bestimmt.',
            'Personen unter 18 Jahren dürfen kein Ronda-Club-Konto erstellen oder nutzen.',
          ],
        },

        {
          heading: '13. Änderungen',
          content: [
            'Diese Datenschutzerklärung kann aktualisiert werden, wenn sich die Plattform, unsere Praktiken oder rechtliche Anforderungen ändern.',
          ],
        },

        {
          heading: '14. Kontakt',
          content: [
            'Datenschutzanfragen, Beschwerden und Löschanfragen: cyril.ragonet@gmail.com.',
            'Dienst: Ronda Club.',
            'Website: https://ronda-club.com',
          ],
        },
      ],

      lastUpdated: 'Stand: September 2026.',
    },
  }

  const current = content[language]

  const renderSections = (sections) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      {sections.map((section, idx) => (
        <div
          key={section.heading}
          style={{
            paddingBottom: '28px',
            borderBottom:
              idx < sections.length - 1
                ? `1px solid ${BORDER}`
                : 'none',
          }}
        >
          <h2
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: CORAL,
              margin: '0 0 10px',
            }}
          >
            {section.heading}
          </h2>

          {section.content.map((text) => (
            <p
              key={text}
              style={{
                fontSize: '0.88rem',
                color: '#706965',
                lineHeight: 1.65,
                margin: '0 0 7px',
              }}
            >
              {text}
            </p>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: BEIGE,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 16px 60px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '820px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: `1px solid ${BORDER}`,
          padding: '52px 48px 44px',
          boxShadow: '0 4px 24px rgba(43, 39, 37, 0.05)',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: '#F5F0EB',
            border: 'none',
            color: '#706965',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 14px',
            borderRadius: '999px',
          }}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <button
          onClick={() =>
            setLanguage(
              language === 'en'
                ? 'de'
                : 'en'
            )
          }
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: CORAL_PALE,
            border: 'none',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: CORAL,
            cursor: 'pointer',
          }}
        >
          <Globe size={13} />

          {language === 'en'
            ? 'Auf Deutsch'
            : 'English'}
        </button>

        <h1
          style={{
            fontSize: '1.7rem',
            fontWeight: 700,
            color: '#2B2725',
            textAlign: 'center',
            marginBottom: '12px',
            marginTop: '4px',
            letterSpacing: '-0.02em',
          }}
        >
          {current.title}
        </h1>

        <p
          style={{
            maxWidth: '620px',
            margin: '0 auto 42px',
            textAlign: 'center',
            color: '#817A75',
            fontSize: '0.86rem',
            lineHeight: 1.6,
          }}
        >
          {current.intro}
        </p>

        <div
          style={{
            padding: '14px 18px',
            marginBottom: '30px',
            borderRadius: '14px',
            background: CORAL_PALE,
          }}
        >
          <strong
            style={{
              color: CORAL,
              fontSize: '1rem',
            }}
          >
            {current.termsTitle}
          </strong>
        </div>

        {renderSections(current.terms)}

        <div
          style={{
            height: '1px',
            background: BORDER,
            margin: '45px 0',
          }}
        />

        <div
          style={{
            padding: '18px',
            marginBottom: '12px',
            borderRadius: '14px',
            background: '#2B2725',
          }}
        >
          <strong
            style={{
              display: 'block',
              color: '#FFFFFF',
              fontSize: '1.05rem',
              marginBottom: '6px',
            }}
          >
            {current.privacyTitle}
          </strong>

          <p
            style={{
              color: '#D8D1CC',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {current.privacyIntro}
          </p>
        </div>

        {renderSections(current.privacy)}

        <div
          style={{
            marginTop: '36px',
            padding: '18px',
            background: '#FFF8F2',
            borderRadius: '14px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: '#817A75',
              fontSize: '0.76rem',
              margin: 0,
            }}
          >
            {current.lastUpdated}
          </p>
        </div>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '18px',
            borderTop: `1px solid ${BORDER}`,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.72rem',
              color: '#B5ADA6',
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Ronda Club. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}