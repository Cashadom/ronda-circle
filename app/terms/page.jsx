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

  const terms = {
    en: {
      title: "Terms and Conditions",
      sections: [
        {
          heading: "1. Acceptance of Terms",
          content: [
            "By accessing or using Ronda Club (the \"Platform\"), you agree to be bound by these Terms and Conditions.",
            "If you do not agree with these Terms, you must not use the Platform.",
            "You must be at least 18 years old to create an account, create a circle, or join a circle."
          ]
        },
        {
          heading: "2. What is Ronda Club",
          content: [
            "Ronda Club is a social platform that lets users create and join small public circles to meet people locally or remotely.",
            "Circles are limited to 6 to 12 members.",
            "Each circle includes a public chat visible to all members of that circle.",
            "Ronda Club does not provide private messaging between users.",
            "Circle creators are not official organizers or employees of Ronda Club — they are regular users who opened a circle."
          ]
        },
        {
          heading: "3. User Account",
          content: [
            "You are responsible for keeping your account credentials confidential and for all activity occurring under your account.",
            "You agree to provide accurate information and not to impersonate another person.",
            "Fake accounts, bots, spam, abusive use, or attempts to manipulate the Platform are strictly prohibited."
          ]
        },
        {
          heading: "4. Circles and Membership",
          content: [
            "Any user may create a public circle on the Platform.",
            "Circles are open and free to join — there is no participation fee.",
            "Members of a circle gain access to its public chat.",
            "The circle creator may not exclude members from the public chat once they have joined.",
            "Ronda Club may remove, archive, or moderate any circle that violates these Terms."
          ]
        },
        {
          heading: "5. Circle Creator Responsibilities",
          content: [
            "Circle creators are responsible for providing an accurate title, description, theme, and city for their circle.",
            "Creators must not create misleading, unsafe, illegal, discriminatory, fake, or spam circles.",
            "Creating a circle does not grant any special authority over other members beyond being the initiator."
          ]
        },
        {
          heading: "6. Member Responsibilities",
          content: [
            "Members are responsible for their own messages and interactions within a circle's public chat.",
            "Members must behave respectfully toward all other members, both online and offline.",
            "Members must not harass, threaten, discriminate, defame, stalk, or otherwise harm other users.",
            "Ronda Club does not guarantee compatibility, friendship, or any specific outcome from joining a circle."
          ]
        },
        {
          heading: "7. Public Chat",
          content: [
            "Each circle contains a public chat accessible to all members of that circle.",
            "Messages posted in a circle's chat are visible to all current members.",
            "Ronda Club does not offer private messaging or direct inbox features between users.",
            "Users are responsible for the content of their messages. Abusive, illegal, or harmful content is prohibited."
          ]
        },
        {
          heading: "8. Offline Interactions and Assumption of Risk",
          content: [
            "Ronda Club may connect users who then choose to meet offline. Ronda Club does not control, supervise, or take responsibility for offline interactions.",
            "You understand that meeting other users in person involves risks, including personal injury, illness, theft, or other unexpected situations.",
            "You voluntarily assume all risks related to any offline interaction resulting from your use of the Platform.",
            "Ronda Club is not responsible for the actions, omissions, or behavior of any user online or offline."
          ]
        },
        {
          heading: "9. Prohibited Behavior",
          content: [
            "The following are strictly prohibited on the Platform: harassment, threats, hate speech, racism, sexism, discrimination, violence, stalking, fraud, impersonation, illegal activity, and sharing private information without consent.",
            "Circles used for spam, advertising, political propaganda, religious recruitment, or any commercial purpose without authorization are prohibited.",
            "Ronda Club may remove unsafe, fake, abusive, discriminatory, or spam circles without prior notice."
          ]
        },
        {
          heading: "10. No Responsibility for User Behavior",
          content: [
            "Ronda Club does not guarantee the identity, background, reliability, honesty, or behavior of any user.",
            "Any interaction between users — whether online or offline — is solely between those users.",
            "Ronda Club is not liable for disputes, damages, losses, injuries, or other harm resulting from user interactions."
          ]
        },
        {
          heading: "11. Content and Intellectual Property",
          content: [
            "You remain the owner of the content you post, but you grant Ronda Club a worldwide, non-exclusive, royalty-free license to display and use your content for the operation of the Platform.",
            "Ronda Club's name, logo, design, software, and branding remain the property of Ronda Club or its licensors."
          ]
        },
        {
          heading: "12. Privacy and Data Protection",
          content: [
            "The collection and use of personal data are described in our Privacy Policy.",
            "We comply with applicable data protection laws, including the EU General Data Protection Regulation (GDPR).",
            "Users may request access, correction, deletion, or portability of their personal data by contacting us at cyril.ragonet@gmail.com.",
            "We do not sell users' personal data."
          ]
        },
        {
          heading: "13. Limitation of Liability",
          content: [
            "To the maximum extent permitted by law, Ronda Club shall not be liable for indirect, incidental, special, consequential, or punitive damages.",
            "Ronda Club shall not be liable for user behavior, offline incidents, or damages caused by third parties.",
            "The Platform is provided as-is, without any guarantee of uninterrupted access or specific results."
          ]
        },
        {
          heading: "14. Account Suspension and Termination",
          content: [
            "We may suspend or terminate your account if you violate these Terms, abuse the Platform, create unsafe circles, harass users, or damage the community.",
            "You may stop using the Platform at any time."
          ]
        },
        {
          heading: "15. Changes to These Terms",
          content: [
            "We may update these Terms from time to time. When changes are material, we may notify users through the Platform or by email.",
            "Continued use of the Platform after changes means you accept the updated Terms."
          ]
        },
        {
          heading: "16. Governing Law and Disputes",
          content: [
            "These Terms are governed by applicable French and European law, unless mandatory consumer protection rules provide otherwise.",
            "In case of dispute, users agree to first contact Ronda Club in good faith to seek an amicable resolution."
          ]
        },
        {
          heading: "17. Contact",
          content: [
            "For questions, complaints, account deletion, or legal notices, contact us at: cyril.ragonet@gmail.com.",
            "Provider: Ronda Club.",
            "Last updated: April 2026."
          ]
        }
      ]
    },
    de: {
      title: "Allgemeine Geschäftsbedingungen",
      sections: [
        {
          heading: "1. Anerkennung der Bedingungen",
          content: [
            "Mit der Nutzung von Ronda Club (der 'Plattform') akzeptieren Sie diese Allgemeinen Geschäftsbedingungen.",
            "Wenn Sie nicht zustimmen, dürfen Sie die Plattform nicht nutzen.",
            "Sie müssen mindestens 18 Jahre alt sein, um ein Konto zu erstellen, einen Circle zu erstellen oder einem Circle beizutreten."
          ]
        },
        {
          heading: "2. Was ist Ronda Club",
          content: [
            "Ronda Club ist eine soziale Plattform, auf der Nutzer kleine öffentliche Circles erstellen und beitreten können, um Menschen lokal oder remote kennenzulernen.",
            "Circles sind auf 6 bis 12 Mitglieder begrenzt.",
            "Jeder Circle enthält einen öffentlichen Chat, der für alle Mitglieder des Circles sichtbar ist.",
            "Ronda Club bietet kein privates Messaging zwischen Nutzern an.",
            "Circle-Ersteller sind keine offiziellen Veranstalter oder Mitarbeiter von Ronda Club – sie sind reguläre Nutzer, die einen Circle eröffnet haben."
          ]
        },
        {
          heading: "3. Nutzerkonto",
          content: [
            "Sie sind für die Vertraulichkeit Ihrer Zugangsdaten und alle Aktivitäten unter Ihrem Konto verantwortlich.",
            "Sie verpflichten sich, genaue Angaben zu machen und keine andere Person zu imitieren.",
            "Fake-Accounts, Bots, Spam, Missbrauch oder Manipulationsversuche sind strengstens verboten."
          ]
        },
        {
          heading: "4. Circles und Mitgliedschaft",
          content: [
            "Jeder Nutzer kann einen öffentlichen Circle auf der Plattform erstellen.",
            "Circles sind offen und kostenlos beizutreten – es gibt keine Teilnahmegebühr.",
            "Mitglieder eines Circles erhalten Zugang zu dessen öffentlichem Chat.",
            "Ronda Club kann Circles, die gegen diese Bedingungen verstoßen, entfernen, archivieren oder moderieren."
          ]
        },
        {
          heading: "5. Pflichten des Circle-Erstellers",
          content: [
            "Circle-Ersteller sind dafür verantwortlich, einen genauen Titel, eine Beschreibung, ein Thema und eine Stadt für ihren Circle anzugeben.",
            "Ersteller dürfen keine irreführenden, unsicheren, illegalen, diskriminierenden, gefälschten oder Spam-Circles erstellen.",
            "Das Erstellen eines Circles verleiht keine besondere Autorität über andere Mitglieder."
          ]
        },
        {
          heading: "6. Pflichten der Mitglieder",
          content: [
            "Mitglieder sind für ihre eigenen Nachrichten und Interaktionen im öffentlichen Chat eines Circles verantwortlich.",
            "Mitglieder müssen sich gegenüber allen anderen Mitgliedern, online und offline, respektvoll verhalten.",
            "Mitglieder dürfen andere Nutzer nicht belästigen, bedrohen, diskriminieren, verleumden, stalken oder anderweitig schädigen.",
            "Ronda Club garantiert keine Kompatibilität, Freundschaft oder ein bestimmtes Ergebnis aus dem Beitritt zu einem Circle."
          ]
        },
        {
          heading: "7. Öffentlicher Chat",
          content: [
            "Jeder Circle enthält einen öffentlichen Chat, der für alle Mitglieder des Circles zugänglich ist.",
            "Im Chat eines Circles gepostete Nachrichten sind für alle aktuellen Mitglieder sichtbar.",
            "Ronda Club bietet kein privates Messaging oder direkte Postfach-Funktionen zwischen Nutzern an.",
            "Nutzer sind für den Inhalt ihrer Nachrichten verantwortlich. Missbräuchliche, illegale oder schädliche Inhalte sind verboten."
          ]
        },
        {
          heading: "8. Offline-Interaktionen und Risikoübernahme",
          content: [
            "Ronda Club kann Nutzer verbinden, die sich dann offline treffen möchten. Ronda Club kontrolliert oder überwacht Offline-Interaktionen nicht und übernimmt dafür keine Verantwortung.",
            "Sie verstehen, dass das Treffen anderer Nutzer persönlich Risiken birgt, einschließlich Verletzungen, Krankheit, Diebstahl oder anderer unerwarteter Situationen.",
            "Sie übernehmen freiwillig alle Risiken im Zusammenhang mit einer Offline-Interaktion, die aus Ihrer Nutzung der Plattform resultiert.",
            "Ronda Club ist nicht für die Handlungen, Unterlassungen oder das Verhalten eines Nutzers online oder offline verantwortlich."
          ]
        },
        {
          heading: "9. Verbotenes Verhalten",
          content: [
            "Folgendes ist auf der Plattform strengstens verboten: Belästigung, Bedrohung, Hassrede, Rassismus, Sexismus, Diskriminierung, Gewalt, Stalking, Betrug, Identitätsmissbrauch, illegale Aktivitäten und das Teilen privater Informationen ohne Zustimmung.",
            "Circles, die für Spam, Werbung, politische Propaganda, religiöse Rekrutierung oder kommerzielle Zwecke ohne Genehmigung genutzt werden, sind verboten.",
            "Ronda Club kann unsichere, gefälschte, missbräuchliche, diskriminierende oder Spam-Circles ohne vorherige Ankündigung entfernen."
          ]
        },
        {
          heading: "10. Keine Haftung für Nutzerverhalten",
          content: [
            "Ronda Club garantiert nicht die Identität, den Hintergrund, die Zuverlässigkeit, Ehrlichkeit oder das Verhalten eines Nutzers.",
            "Jede Interaktion zwischen Nutzern – ob online oder offline – findet ausschließlich zwischen diesen Nutzern statt.",
            "Ronda Club haftet nicht für Streitigkeiten, Schäden, Verluste, Verletzungen oder andere Schäden, die aus Nutzerinteraktionen resultieren."
          ]
        },
        {
          heading: "11. Inhalte und geistiges Eigentum",
          content: [
            "Sie bleiben Eigentümer der von Ihnen geposteten Inhalte, gewähren Ronda Club jedoch eine weltweite, nicht-exklusive, gebührenfreie Lizenz zur Anzeige und Nutzung Ihrer Inhalte für den Betrieb der Plattform.",
            "Name, Logo, Design, Software und Branding von Ronda Club bleiben Eigentum von Ronda Club oder seinen Lizenzgebern."
          ]
        },
        {
          heading: "12. Datenschutz",
          content: [
            "Die Erhebung und Nutzung personenbezogener Daten sind in unserer Datenschutzerklärung beschrieben.",
            "Wir halten uns an geltende Datenschutzgesetze, einschließlich der EU-Datenschutz-Grundverordnung (DSGVO).",
            "Nutzer können Zugang, Berichtigung, Löschung oder Übertragbarkeit ihrer personenbezogenen Daten beantragen unter: cyril.ragonet@gmail.com.",
            "Wir verkaufen keine personenbezogenen Daten der Nutzer."
          ]
        },
        {
          heading: "13. Haftungsbeschränkung",
          content: [
            "Im größtmöglichen gesetzlich zulässigen Umfang haftet Ronda Club nicht für indirekte, zufällige, besondere, Folge- oder Strafschäden.",
            "Ronda Club haftet nicht für Nutzerverhalten, Offline-Vorfälle oder Schäden durch Dritte.",
            "Die Plattform wird wie besehen bereitgestellt, ohne Garantie auf unterbrechungsfreien Zugang oder bestimmte Ergebnisse."
          ]
        },
        {
          heading: "14. Kontosperrung und Kündigung",
          content: [
            "Wir können Ihr Konto sperren oder kündigen, wenn Sie gegen diese Bedingungen verstoßen, die Plattform missbrauchen, unsichere Circles erstellen, Nutzer belästigen oder der Community schaden.",
            "Sie können die Plattform jederzeit nicht mehr nutzen."
          ]
        },
        {
          heading: "15. Änderungen dieser Bedingungen",
          content: [
            "Wir können diese Bedingungen von Zeit zu Zeit aktualisieren. Bei wesentlichen Änderungen können wir Nutzer über die Plattform oder per E-Mail benachrichtigen.",
            "Die weitere Nutzung der Plattform nach Änderungen bedeutet, dass Sie die aktualisierten Bedingungen akzeptieren."
          ]
        },
        {
          heading: "16. Anwendbares Recht und Streitigkeiten",
          content: [
            "Diese Bedingungen unterliegen dem geltenden französischen und europäischen Recht, sofern nicht zwingende Verbraucherschutzregeln etwas anderes vorsehen.",
            "Im Streitfall verpflichten sich Nutzer, Ronda Club zunächst in gutem Glauben zu kontaktieren, um eine gütliche Lösung zu suchen."
          ]
        },
        {
          heading: "17. Kontakt",
          content: [
            "Für Fragen, Beschwerden, Kontolöschung oder rechtliche Hinweise kontaktieren Sie uns unter: cyril.ragonet@gmail.com.",
            "Anbieter: Ronda Club.",
            "Stand: April 2026."
          ]
        }
      ]
    }
  }

  const current = terms[language]

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: BEIGE,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '40px 16px 60px',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '820px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: `1px solid ${BORDER}`,
        padding: '52px 48px 44px',
        boxShadow: '0 4px 24px rgba(43, 39, 37, 0.05)',
      }}>
        {/* Back button */}
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
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = CORAL_PALE}
          onMouseLeave={e => e.currentTarget.style.background = '#F5F0EB'}
        >
          <ArrowLeft size={14} />
          Back
        </button>

        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
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
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#FFE0D8'}
          onMouseLeave={e => e.currentTarget.style.background = CORAL_PALE}
        >
          <Globe size={13} />
          {language === 'en' ? 'Auf Deutsch' : 'English'}
        </button>

        {/* Title */}
        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 700,
          color: '#2B2725',
          textAlign: 'center',
          marginBottom: '36px',
          marginTop: '4px',
          letterSpacing: '-0.02em',
        }}>
          {current.title}
        </h1>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {current.sections.map((section, idx) => (
            <div key={idx} style={{
              paddingBottom: '28px',
              borderBottom: idx < current.sections.length - 1 ? `1px solid ${BORDER}` : 'none',
            }}>
              <h2 style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: CORAL,
                marginBottom: '10px',
                margin: '0 0 10px',
              }}>
                {section.heading}
              </h2>
              {section.content.map((text, i) => (
                <p key={i} style={{
                  fontSize: '0.88rem',
                  color: '#706965',
                  lineHeight: 1.6,
                  margin: '0 0 6px',
                }}>
                  {text}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          paddingTop: '18px',
          borderTop: `1px solid ${BORDER}`,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.72rem', color: '#B5ADA6', margin: 0 }}>
            © {new Date().getFullYear()} Ronda Club. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}